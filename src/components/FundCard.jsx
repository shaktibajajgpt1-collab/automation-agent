import { useEffect, useState } from 'react'
import { getCuratedFund } from '../lib/mfapi.js'
import { rupeesExact, signedPct, formatDate } from '../lib/format.js'

function Ret({ label, value }) {
  return (
    <div className="fr">
      <span className="fr-label">{label}</span>
      <span className={`fr-val ${value == null ? '' : value >= 0 ? 'pos' : 'neg'}`}>
        {value == null ? '—' : signedPct(value)}
      </span>
    </div>
  )
}

// A curated fund entry: resolves the scheme by name, fetches live NAV
// history and shows headline returns. Tapping opens the full detail view.
export default function FundCard({ curated, onOpen }) {
  const [fund, setFund] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    setFund(null)
    setError(null)
    getCuratedFund(curated)
      .then((f) => { if (alive) setFund(f) })
      .catch(() => { if (alive) setError('Live data unavailable — check connection and retry.') })
    return () => { alive = false }
  }, [curated])

  const m = fund?.metrics

  return (
    <button className="fund-card" onClick={() => fund && onOpen(fund.code)} disabled={!fund}>
      <div>
        <div className="f-name">{m?.schemeName || curated.name}</div>
        <div className="f-meta">
          {m
            ? `${m.fundHouse || ''} · NAV ${rupeesExact(m.latestNav)} (${formatDate(m.latestDate)})`
            : error || 'Fetching live NAV…'}
        </div>
      </div>
      {m && (
        <div className="fund-returns">
          <Ret label="1Y" value={m.ret1y} />
          <Ret label="3Y p.a." value={m.ret3y} />
          <Ret label="5Y p.a." value={m.ret5y} />
        </div>
      )}
    </button>
  )
}
