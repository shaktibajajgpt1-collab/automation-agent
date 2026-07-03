// Client for api.mfapi.in — free live NAV data for Indian mutual funds
// (sourced from AMFI). Responses are cached in localStorage with a TTL so
// the app is fast and works offline with the last-seen data.

const BASE = 'https://api.mfapi.in'
const TTL_MS = 12 * 60 * 60 * 1000 // 12h — NAVs update once per business day
const CACHE_PREFIX = 'mfsarthi.api.'

let liveStatus = { online: null, lastSuccess: null }
const statusListeners = new Set()

export function onLiveStatus(fn) {
  statusListeners.add(fn)
  fn(liveStatus)
  return () => statusListeners.delete(fn)
}

function setStatus(online) {
  liveStatus = { online, lastSuccess: online ? Date.now() : liveStatus.lastSuccess }
  statusListeners.forEach((fn) => fn(liveStatus))
}

function cacheGet(key, ttl = TTL_MS) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const { t, v } = JSON.parse(raw)
    if (Date.now() - t > ttl) return null
    return v
  } catch {
    return null
  }
}

function cacheSet(key, v) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ t: Date.now(), v }))
  } catch {
    // Storage full — drop oldest API entries and retry once.
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith(CACHE_PREFIX))
      keys.sort((a, b) => (JSON.parse(localStorage.getItem(a)).t || 0) - (JSON.parse(localStorage.getItem(b)).t || 0))
      keys.slice(0, Math.ceil(keys.length / 2)).forEach((k) => localStorage.removeItem(k))
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ t: Date.now(), v }))
    } catch { /* give up silently */ }
  }
}

// Stale cache (ignore TTL) — used as an offline fallback.
function cacheGetStale(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    return raw ? JSON.parse(raw).v : null
  } catch {
    return null
  }
}

async function jget(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function searchFunds(q) {
  const key = `search:${q.toLowerCase()}`
  const hit = cacheGet(key)
  if (hit) return hit
  try {
    const data = await jget(`${BASE}/mf/search?q=${encodeURIComponent(q)}`)
    setStatus(true)
    const list = Array.isArray(data) ? data : []
    cacheSet(key, list)
    return list
  } catch (e) {
    setStatus(false)
    const stale = cacheGetStale(key)
    if (stale) return stale
    throw e
  }
}

function parseNavDate(s) {
  // "dd-mm-yyyy" → UTC ms
  const [d, m, y] = s.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

const YEAR_MS = 365.25 * 24 * 3600 * 1000

// series: ascending [[ts, nav], ...]
function navAtOrBefore(series, ts) {
  let lo = 0, hi = series.length - 1, ans = null
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (series[mid][0] <= ts) { ans = series[mid]; lo = mid + 1 } else hi = mid - 1
  }
  return ans
}

function cagr(series, years) {
  if (!series.length) return null
  const [lastTs, lastNav] = series[series.length - 1]
  const cutoff = lastTs - years * YEAR_MS
  if (series[0][0] > cutoff + 20 * 24 * 3600 * 1000) return null // fund too young
  const then = navAtOrBefore(series, cutoff)
  if (!then || then[1] <= 0) return null
  return Math.pow(lastNav / then[1], 1 / years) - 1
}

function maxDrawdown(series, years) {
  if (!series.length) return null
  const lastTs = series[series.length - 1][0]
  const from = lastTs - years * YEAR_MS
  let peak = -Infinity, worst = 0
  for (const [ts, nav] of series) {
    if (ts < from) continue
    if (nav > peak) peak = nav
    else worst = Math.min(worst, nav / peak - 1)
  }
  return worst === 0 ? 0 : worst
}

// Share of rolling 1-year windows (monthly starts) with a positive return —
// a simple consistency measure across the fund's full history.
function rollingConsistency(series) {
  if (series.length < 2) return null
  const start = series[0][0]
  const end = series[series.length - 1][0]
  const MONTH = YEAR_MS / 12
  let wins = 0, total = 0
  for (let t = start; t + YEAR_MS <= end; t += MONTH) {
    const a = navAtOrBefore(series, t + MONTH / 2)
    const b = navAtOrBefore(series, t + YEAR_MS + MONTH / 2)
    if (!a || !b || a === b) continue
    total++
    if (b[1] > a[1]) wins++
  }
  return total >= 12 ? wins / total : null
}

function computeMetrics(meta, series) {
  const last = series[series.length - 1]
  return {
    schemeName: meta.scheme_name,
    fundHouse: meta.fund_house,
    schemeCategory: meta.scheme_category,
    schemeType: meta.scheme_type,
    latestNav: last ? last[1] : null,
    latestDate: last ? last[0] : null,
    startDate: series.length ? series[0][0] : null,
    ageYears: series.length ? (last[0] - series[0][0]) / YEAR_MS : null,
    ret1y: cagr(series, 1),
    ret3y: cagr(series, 3),
    ret5y: cagr(series, 5),
    maxDD3y: maxDrawdown(series, 3),
    consistency: rollingConsistency(series),
  }
}

// Fetch a fund's full NAV history and return { code, meta, metrics, series }
// with the series trimmed to ~5 years for charting/caching.
export async function getFund(code) {
  const key = `fund:${code}`
  const hit = cacheGet(key)
  if (hit) return hit
  try {
    const raw = await jget(`${BASE}/mf/${code}`)
    setStatus(true)
    if (!raw || raw.status === '404' || !Array.isArray(raw.data) || !raw.data.length) {
      throw new Error('Scheme not found')
    }
    const series = raw.data
      .map((r) => [parseNavDate(r.date), parseFloat(r.nav)])
      .filter(([, nav]) => Number.isFinite(nav) && nav > 0)
      .sort((a, b) => a[0] - b[0])
    const metrics = computeMetrics(raw.meta || {}, series)
    const cutoff = series.length ? series[series.length - 1][0] - 5.2 * YEAR_MS : 0
    const trimmed = series.filter(([ts]) => ts >= cutoff)
    const result = { code, meta: raw.meta || {}, metrics, series: trimmed }
    cacheSet(key, result)
    return result
  } catch (e) {
    if (e.message !== 'Scheme not found') setStatus(false)
    const stale = cacheGetStale(key)
    if (stale) return stale
    throw e
  }
}

const BAD_PLAN = /regular|idcw|dividend|bonus/i

function pickDirectGrowth(results) {
  const direct = results.filter(
    (r) => /direct/i.test(r.schemeName) && /growth/i.test(r.schemeName) && !BAD_PLAN.test(r.schemeName),
  )
  const pool = direct.length ? direct : results
  if (!pool.length) return null
  // Shortest matching name is almost always the plain vanilla plan.
  return pool.reduce((a, b) => (a.schemeName.length <= b.schemeName.length ? a : b))
}

// Resolve a curated fund entry to a live scheme code by name search,
// falling back to the hard-coded hint. Resolution is cached for 7 days.
export async function resolveFund(curated) {
  const key = `resolve:${curated.id}`
  const hit = cacheGet(key, 7 * 24 * 3600 * 1000)
  if (hit) return hit
  let resolved = null
  try {
    const results = await searchFunds(curated.query)
    const best = pickDirectGrowth(results)
    if (best) resolved = { code: best.schemeCode, schemeName: best.schemeName }
  } catch { /* fall through to code hint */ }
  if (!resolved && curated.code) resolved = { code: curated.code, schemeName: curated.name }
  if (!resolved) throw new Error(`Could not resolve ${curated.name}`)
  cacheSet(key, resolved)
  return resolved
}

export async function getCuratedFund(curated) {
  const { code } = await resolveFund(curated)
  return getFund(code)
}
