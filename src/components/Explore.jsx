import { useEffect, useRef, useState } from 'react'
import { searchFunds } from '../lib/mfapi.js'

// Live search over every AMFI-listed scheme via api.mfapi.in.
export default function Explore({ onOpenFund }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const timer = useRef(null)

  useEffect(() => {
    clearTimeout(timer.current)
    if (q.trim().length < 3) { setResults(null); setError(null); return }
    timer.current = setTimeout(async () => {
      setBusy(true)
      setError(null)
      try {
        const list = await searchFunds(q.trim())
        setResults(list.slice(0, 40))
      } catch {
        setError('Search failed — check your connection and try again.')
      } finally {
        setBusy(false)
      }
    }, 350)
    return () => clearTimeout(timer.current)
  }, [q])

  return (
    <div className="screen">
      <div className="card">
        <h2>Explore any fund</h2>
        <p className="sub">Search across all Indian mutual fund schemes (live AMFI data) — check NAV history, returns, worst falls and what to verify before investing.</p>
        <input
          type="search"
          placeholder="e.g. Parag Parikh Flexi Cap, HDFC Liquid, ELSS…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search mutual funds"
        />
        <p className="muted" style={{ marginTop: 8, marginBottom: 0 }}>
          Tip: add “Direct” and “Growth” to find the low-cost direct plan.
        </p>
      </div>

      {busy && <p className="skeleton">Searching live…</p>}
      {error && <p className="error-note">{error}</p>}
      {results && !results.length && !busy && <p className="muted">No schemes matched “{q}”.</p>}

      {results?.map((r) => (
        <button key={r.schemeCode} className="fund-card" onClick={() => onOpenFund(r.schemeCode)}>
          <div>
            <div className="f-name">{r.schemeName}</div>
            <div className="f-meta">Scheme code {r.schemeCode} · tap for live NAV & returns</div>
          </div>
        </button>
      ))}
    </div>
  )
}
