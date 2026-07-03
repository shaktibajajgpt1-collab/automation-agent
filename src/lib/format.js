const inr0 = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
})
const inr2 = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2,
})
const num = new Intl.NumberFormat('en-IN')

export function rupees(v) {
  if (v == null || Number.isNaN(v)) return '—'
  return inr0.format(v)
}

export function rupeesExact(v) {
  if (v == null || Number.isNaN(v)) return '—'
  return inr2.format(v)
}

// Compact Indian style: 1.2 L, 3.4 Cr
export function rupeesCompact(v) {
  if (v == null || Number.isNaN(v)) return '—'
  const abs = Math.abs(v)
  if (abs >= 1e7) return `₹${(v / 1e7).toFixed(abs >= 1e8 ? 1 : 2)} Cr`
  if (abs >= 1e5) return `₹${(v / 1e5).toFixed(abs >= 1e6 ? 1 : 2)} L`
  return inr0.format(v)
}

export function pct(v, digits = 1) {
  if (v == null || Number.isNaN(v)) return '—'
  return `${(v * 100).toFixed(digits)}%`
}

export function signedPct(v, digits = 1) {
  if (v == null || Number.isNaN(v)) return '—'
  const s = v > 0 ? '+' : ''
  return `${s}${(v * 100).toFixed(digits)}%`
}

export function formatDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function plural(n, one, many) {
  return `${num.format(n)} ${n === 1 ? one : many}`
}
