import { useMemo, useRef, useState } from 'react'
import { formatDate } from '../lib/format.js'

// Single-series NAV line chart: 2px line, hairline solid grid, muted axes,
// selective direct label on the endpoint, crosshair + tooltip on hover/touch.

const W = 448
const PLOT_H = 190
const AXIS_H = 24
const H = PLOT_H + AXIS_H
const M = { top: 14, right: 8, bottom: 4, left: 44 }

function niceTicks(min, max, count = 4) {
  if (min === max) { min *= 0.95; max *= 1.05 }
  const span = max - min
  const step = Math.pow(10, Math.floor(Math.log10(span / count)))
  const err = span / count / step
  const mult = err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1
  const s = step * mult
  const ticks = []
  for (let v = Math.ceil(min / s) * s; v <= max + 1e-9; v += s) ticks.push(v)
  return ticks
}

export default function NavChart({ series }) {
  const boxRef = useRef(null)
  const [hover, setHover] = useState(null) // index into series

  const geom = useMemo(() => {
    if (!series || series.length < 2) return null
    const t0 = series[0][0]
    const t1 = series[series.length - 1][0]
    let navMin = Infinity, navMax = -Infinity
    for (const [, nav] of series) {
      if (nav < navMin) navMin = nav
      if (nav > navMax) navMax = nav
    }
    const padY = (navMax - navMin) * 0.08 || navMax * 0.05
    const yMin = navMin - padY
    const yMax = navMax + padY
    const x = (t) => M.left + ((t - t0) / (t1 - t0 || 1)) * (W - M.left - M.right)
    const y = (v) => M.top + (1 - (v - yMin) / (yMax - yMin || 1)) * (PLOT_H - M.top - M.bottom)
    const path = series
      .map(([t, v], i) => `${i === 0 ? 'M' : 'L'}${x(t).toFixed(1)},${y(v).toFixed(1)}`)
      .join('')
    const ticks = niceTicks(yMin, yMax).filter((v) => v >= yMin && v <= yMax)
    const mid = series[Math.floor(series.length / 2)][0]
    return { t0, t1, mid, x, y, path, ticks }
  }, [series])

  if (!geom) return null
  const { x, y, path, ticks, t0, t1, mid } = geom
  const last = series[series.length - 1]

  function locate(clientX) {
    const rect = boxRef.current.getBoundingClientRect()
    const px = ((clientX - rect.left) / rect.width) * W
    const frac = (px - M.left) / (W - M.left - M.right)
    const t = t0 + Math.min(1, Math.max(0, frac)) * (t1 - t0)
    // nearest point by time (series is dense & sorted)
    let lo = 0, hi = series.length - 1
    while (hi - lo > 1) {
      const m2 = (lo + hi) >> 1
      if (series[m2][0] < t) lo = m2; else hi = m2
    }
    setHover(t - series[lo][0] <= series[hi][0] - t ? lo : hi)
  }

  const hoverPt = hover != null ? series[hover] : null
  const ttLeftPct = hoverPt ? (x(hoverPt[0]) / W) * 100 : 0

  return (
    <div className="chart-box" ref={boxRef}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block', touchAction: 'pan-y' }}
        role="img"
        aria-label="NAV history line chart"
        onPointerMove={(e) => locate(e.clientX)}
        onPointerDown={(e) => locate(e.clientX)}
        onPointerLeave={() => setHover(null)}
      >
        {ticks.map((v) => (
          <g key={v}>
            <line x1={M.left} x2={W - M.right} y1={y(v)} y2={y(v)} stroke="var(--grid)" strokeWidth="1" />
            <text x={M.left - 6} y={y(v) + 3} textAnchor="end" style={{ fontSize: 10, fill: 'var(--ink-muted)', fontVariantNumeric: 'tabular-nums' }}>
              {v >= 1000 ? Math.round(v) : v.toFixed(v < 100 ? 1 : 0)}
            </text>
          </g>
        ))}
        <line x1={M.left} x2={W - M.right} y1={PLOT_H} y2={PLOT_H} stroke="var(--axis)" strokeWidth="1" />
        <path d={path} fill="none" stroke="var(--series-1)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {/* endpoint: direct label */}
        <circle cx={x(last[0])} cy={y(last[1])} r="3.5" fill="var(--series-1)" stroke="var(--surface-1)" strokeWidth="2" />
        <text
          x={Math.min(x(last[0]), W - M.right - 2)} y={y(last[1]) - 8} textAnchor="end"
          style={{ fontSize: 11, fontWeight: 700, fill: 'var(--ink-1)' }}
        >
          ₹{last[1].toFixed(2)}
        </text>
        {/* x axis labels */}
        {[[t0, 'start'], [mid, 'middle'], [t1, 'end']].map(([t, anchor]) => (
          <text
            key={anchor}
            x={x(t)} y={PLOT_H + 16}
            textAnchor={anchor === 'start' ? 'start' : anchor === 'end' ? 'end' : 'middle'}
            style={{ fontSize: 10, fill: 'var(--ink-muted)' }}
          >
            {formatDate(t)}
          </text>
        ))}
        {/* crosshair */}
        {hoverPt && (
          <g>
            <line x1={x(hoverPt[0])} x2={x(hoverPt[0])} y1={M.top} y2={PLOT_H} stroke="var(--axis)" strokeWidth="1" />
            <circle cx={x(hoverPt[0])} cy={y(hoverPt[1])} r="4" fill="var(--series-1)" stroke="var(--surface-1)" strokeWidth="2" />
          </g>
        )}
      </svg>
      {hoverPt && (
        <div
          className="chart-tooltip"
          style={{
            left: `${ttLeftPct}%`,
            top: 0,
            transform: ttLeftPct > 60 ? 'translateX(-105%)' : 'translateX(8px)',
          }}
        >
          <div className="tt-date">{formatDate(hoverPt[0])}</div>
          <div className="tt-val">₹{hoverPt[1].toFixed(2)}</div>
        </div>
      )}
    </div>
  )
}
