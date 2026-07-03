// Part-to-whole donut for the recommended asset mix (≤4 segments).
// 2px surface gaps between segments; exact values live in the legend,
// so color never carries the numbers alone.

const TAU = Math.PI * 2

function arcPath(cx, cy, rOuter, rInner, a0, a1) {
  const large = a1 - a0 > Math.PI ? 1 : 0
  const p = (r, a) => `${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`
  return [
    `M ${p(rOuter, a0)}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${p(rOuter, a1)}`,
    `L ${p(rInner, a1)}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${p(rInner, a0)}`,
    'Z',
  ].join(' ')
}

export default function AllocationDonut({ groups, centerValue, centerLabel }) {
  const size = 132
  const cx = size / 2
  const cy = size / 2
  const rOuter = 62
  const rInner = 44
  const pad = 0.035 // ~2px gap at this radius

  let angle = -Math.PI / 2
  const segs = groups.map((g) => {
    const sweep = g.pct * TAU
    const a0 = angle + (groups.length > 1 ? pad / 2 : 0)
    const a1 = angle + sweep - (groups.length > 1 ? pad / 2 : 0)
    angle += sweep
    return { ...g, a0, a1: Math.max(a1, a0 + 0.01) }
  })

  return (
    <div className="donut-wrap">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Asset mix: ${groups.map((g) => `${g.label} ${Math.round(g.pct * 100)}%`).join(', ')}`}
      >
        {segs.map((s) => (
          <path key={s.id} d={arcPath(cx, cy, rOuter, rInner, s.a0, s.a1)} fill={s.color} />
        ))}
        <text
          x={cx} y={cy - 3} textAnchor="middle"
          style={{ fontSize: 22, fontWeight: 700, fill: 'var(--ink-1)' }}
        >
          {centerValue}
        </text>
        <text
          x={cx} y={cy + 15} textAnchor="middle"
          style={{ fontSize: 9, fill: 'var(--ink-muted)' }}
        >
          {centerLabel}
        </text>
      </svg>
      <div className="legend">
        {groups.map((g) => (
          <div className="legend-row" key={g.id}>
            <span className="legend-swatch" style={{ background: g.color }} />
            <span className="l-name">{g.label}</span>
            <span className="l-val">{Math.round(g.pct * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
