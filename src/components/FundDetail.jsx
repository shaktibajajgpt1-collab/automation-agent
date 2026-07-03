import { useEffect, useMemo, useState } from 'react'
import { getFund } from '../lib/mfapi.js'
import { CATEGORIES } from '../data/categories.js'
import { DATA_ATTRIBUTION } from '../data/learn.js'
import { rupeesExact, signedPct, pct, formatDate } from '../lib/format.js'
import NavChart from './NavChart.jsx'

const RANGES = [
  { label: '1Y', years: 1 },
  { label: '3Y', years: 3 },
  { label: '5Y', years: 5 },
]

// Best-effort mapping from AMFI scheme_category text to our category
// knowledge base, so the "know before you invest" panel fits the fund.
function matchCategory(schemeCategory = '', schemeName = '') {
  const s = `${schemeCategory} ${schemeName}`.toLowerCase()
  if (/elss|tax saver/.test(s)) return 'elss'
  if (/index|etf/.test(s)) return 'index_large'
  if (/small cap/.test(s)) return 'mid_small'
  if (/mid cap|mid-cap/.test(s)) return 'mid_small'
  if (/flexi cap|multi cap|focused|large & mid|value fund|contra/.test(s)) return 'flexi'
  if (/large cap/.test(s)) return 'index_large'
  if (/balanced advantage|dynamic asset/.test(s)) return 'bal_adv'
  if (/aggressive hybrid|equity & debt|balanced hybrid/.test(s)) return 'agg_hybrid'
  if (/conservative hybrid|equity savings|regular savings/.test(s)) return 'cons_hybrid'
  if (/liquid|overnight|money market|ultra short/.test(s)) return 'liquid'
  if (/corporate bond|banking and psu|banking & psu/.test(s)) return 'corp_bond'
  if (/short duration|low duration|debt|bond|gilt|income/.test(s)) return 'short_debt'
  if (/hybrid/.test(s)) return 'bal_adv'
  return null
}

export default function FundDetail({ code, onBack }) {
  const [fund, setFund] = useState(null)
  const [error, setError] = useState(null)
  const [range, setRange] = useState(3)
  const [showTable, setShowTable] = useState(false)

  useEffect(() => {
    let alive = true
    setFund(null)
    setError(null)
    getFund(code)
      .then((f) => { if (alive) setFund(f) })
      .catch(() => { if (alive) setError('Could not load live data for this fund. Check your connection and try again.') })
    return () => { alive = false }
  }, [code])

  const m = fund?.metrics
  const catId = m ? matchCategory(m.schemeCategory, m.schemeName) : null
  const cat = catId ? CATEGORIES[catId] : null

  const chartSeries = useMemo(() => {
    if (!fund?.series?.length) return []
    const last = fund.series[fund.series.length - 1][0]
    const from = last - range * 365.25 * 24 * 3600 * 1000
    return fund.series.filter(([ts]) => ts >= from)
  }, [fund, range])

  // Month-end rows for the accessible table view of the chart.
  const tableRows = useMemo(() => {
    if (!chartSeries.length) return []
    const rows = []
    let lastMonth = null
    for (let i = chartSeries.length - 1; i >= 0 && rows.length < 13; i--) {
      const [ts, nav] = chartSeries[i]
      const d = new Date(ts)
      const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`
      if (key !== lastMonth) { rows.push([ts, nav]); lastMonth = key }
    }
    return rows
  }, [chartSeries])

  return (
    <div className="overlay">
      <div className="overlay-inner">
        <div className="overlay-head">
          <button className="back" onClick={onBack}>‹ Back</button>
          <div className="oh-title">{m?.schemeName || 'Fund details'}</div>
        </div>

        {error && <div className="card" style={{ marginTop: 14 }}><p className="error-note">{error}</p></div>}
        {!fund && !error && <div className="card" style={{ marginTop: 14 }}><p className="skeleton">Fetching live NAV history…</p></div>}

        {m && (
          <>
            <div className="tiles" style={{ marginTop: 14 }}>
              <div className="tile">
                <div className="t-label">Latest NAV</div>
                <div className="t-value">{rupeesExact(m.latestNav)}</div>
                <div className="t-note">as of {formatDate(m.latestDate)}</div>
              </div>
              <div className="tile">
                <div className="t-label">Fund age</div>
                <div className="t-value">{m.ageYears ? `${m.ageYears.toFixed(1)} yrs` : '—'}</div>
                <div className="t-note">since {formatDate(m.startDate)}</div>
              </div>
            </div>

            <div className="card" style={{ marginTop: 10 }}>
              <h3>NAV history</h3>
              <div className="range-tabs" role="tablist" aria-label="Chart range">
                {RANGES.map((r) => (
                  <button
                    key={r.label}
                    role="tab"
                    aria-selected={range === r.years}
                    className={`range-tab ${range === r.years ? 'active' : ''}`}
                    onClick={() => setRange(r.years)}
                  >
                    {r.label}
                  </button>
                ))}
                <button
                  className={`range-tab ${showTable ? 'active' : ''}`}
                  style={{ marginLeft: 'auto' }}
                  onClick={() => setShowTable((v) => !v)}
                >
                  Table
                </button>
              </div>
              {chartSeries.length > 1
                ? (showTable
                  ? (
                    <div className="table-scroll">
                      <table className="data-table">
                        <thead><tr><th>Month-end</th><th>NAV (₹)</th></tr></thead>
                        <tbody>
                          {tableRows.map(([ts, nav]) => (
                            <tr key={ts}><td>{formatDate(ts)}</td><td>{nav.toFixed(2)}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                  : <NavChart series={chartSeries} />)
                : <p className="muted">Not enough history for this range.</p>}
              <p className="muted" style={{ marginBottom: 0 }}>{DATA_ATTRIBUTION}</p>
            </div>

            <div className="card" style={{ marginTop: 10 }}>
              <h3>Returns & risk</h3>
              <div className="kv"><span className="k">1-year return</span><span className={`v ${m.ret1y >= 0 ? 'pos' : 'neg'}`}>{signedPct(m.ret1y)}</span></div>
              <div className="kv"><span className="k">3-year return (p.a.)</span><span className={`v ${m.ret3y >= 0 ? 'pos' : 'neg'}`}>{signedPct(m.ret3y)}</span></div>
              <div className="kv"><span className="k">5-year return (p.a.)</span><span className={`v ${m.ret5y >= 0 ? 'pos' : 'neg'}`}>{signedPct(m.ret5y)}</span></div>
              <div className="kv"><span className="k">Worst fall (3 yrs)</span><span className="v">{m.maxDD3y == null ? '—' : pct(m.maxDD3y)}</span></div>
              <div className="kv"><span className="k">1-yr periods positive</span><span className="v">{m.consistency == null ? '—' : pct(m.consistency, 0)}</span></div>
              <p className="muted" style={{ marginTop: 8, marginBottom: 0 }}>
                “Worst fall” is the largest peak-to-trough drop in the last 3 years — the pain you must be able to sit through.
                “1-yr periods positive” is the share of all rolling one-year windows with a gain, a simple consistency check.
              </p>
            </div>

            <div className="card" style={{ marginTop: 10 }}>
              <h3>About this fund</h3>
              <div className="kv"><span className="k">Fund house</span><span className="v">{m.fundHouse || '—'}</span></div>
              <div className="kv"><span className="k">Category</span><span className="v" style={{ maxWidth: '60%' }}>{m.schemeCategory || '—'}</span></div>
              <div className="kv"><span className="k">Type</span><span className="v">{m.schemeType || '—'}</span></div>
            </div>

            {cat && (
              <div className="card" style={{ marginTop: 10 }}>
                <h3>Know before you invest</h3>
                <p className="sub">{cat.description}</p>
                <div className="kv"><span className="k">Risk level</span><span className="v">{cat.riskLabel}</span></div>
                <div className="kv"><span className="k">Sensible horizon</span><span className="v">{cat.minHorizon}</span></div>
                <hr className="divider" />
                <div className="section-title">Check in the scheme document</div>
                <ul className="list-plain">
                  {cat.watchFor.map((w) => <li key={w}>{w}</li>)}
                  <li>Exit load: {cat.exitLoadNote}</li>
                  <li>Tax: {cat.taxNote}</li>
                  <li>Expense ratio and latest portfolio — on the AMC website or the scheme factsheet.</li>
                </ul>
              </div>
            )}

            <p className="muted" style={{ marginTop: 12 }}>
              Past performance does not guarantee future returns. This is information, not investment advice.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
