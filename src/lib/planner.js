// Goal → horizon → risk → allocation engine.
// Encodes the advisory guidance: category must fit the goal duration,
// risk capacity decides equity exposure, essential goals get a safety notch.

import { CATEGORIES } from '../data/categories.js'

export const RISK_LEVELS = ['conservative', 'moderate', 'aggressive']

export const RISK_QUESTIONS = [
  {
    id: 'drawdown',
    text: 'If your investment fell 20% in a bad year, what would you most likely do?',
    options: [
      { label: 'Sell everything — I cannot watch losses', score: 1 },
      { label: 'Stop investing more and wait anxiously', score: 2 },
      { label: 'Stay invested and continue my SIP', score: 3 },
      { label: 'Invest more while prices are down', score: 4 },
    ],
  },
  {
    id: 'source',
    text: 'Where is this money coming from?',
    options: [
      { label: 'Money I may need soon (or borrowed)', score: 1 },
      { label: 'Savings I might dip into occasionally', score: 2 },
      { label: 'Genuine long-term surplus I will not touch', score: 3 },
    ],
  },
  {
    id: 'experience',
    text: 'Your experience with market-linked investments?',
    options: [
      { label: 'None — this is my first time', score: 1 },
      { label: 'Some — a few SIPs or stocks', score: 2 },
      { label: 'Comfortable — I have held through a full market cycle', score: 3 },
    ],
  },
]

// Total score range: 3–10
export function riskProfile(scores) {
  const total = scores.reduce((a, b) => a + b, 0)
  if (total <= 5) return 'conservative'
  if (total <= 8) return 'moderate'
  return 'aggressive'
}

function downgrade(risk) {
  const i = RISK_LEVELS.indexOf(risk)
  return RISK_LEVELS[Math.max(0, i - 1)]
}

// Allocation tables: horizon bucket × risk profile → [{cat, pct}]
// Categories are ids in src/data/categories.js. Percentages sum to 100.
const ALLOCATIONS = {
  under3: {
    conservative: [ ['liquid', 50], ['short_debt', 50] ],
    moderate:     [ ['liquid', 30], ['short_debt', 70] ],
    aggressive:   [ ['liquid', 20], ['short_debt', 60], ['corp_bond', 20] ],
  },
  y3to5: {
    conservative: [ ['cons_hybrid', 25], ['short_debt', 55], ['liquid', 20] ],
    moderate:     [ ['bal_adv', 35], ['short_debt', 45], ['corp_bond', 20] ],
    aggressive:   [ ['agg_hybrid', 35], ['bal_adv', 20], ['short_debt', 45] ],
  },
  y5to7: {
    conservative: [ ['index_large', 20], ['bal_adv', 25], ['corp_bond', 40], ['short_debt', 15] ],
    moderate:     [ ['index_large', 30], ['flexi', 15], ['bal_adv', 20], ['corp_bond', 35] ],
    aggressive:   [ ['index_large', 35], ['flexi', 25], ['agg_hybrid', 15], ['corp_bond', 25] ],
  },
  over7: {
    conservative: [ ['index_large', 25], ['flexi', 10], ['bal_adv', 25], ['corp_bond', 40] ],
    moderate:     [ ['index_large', 35], ['flexi', 25], ['agg_hybrid', 10], ['corp_bond', 30] ],
    aggressive:   [ ['index_large', 40], ['flexi', 25], ['mid_small', 15], ['corp_bond', 20] ],
  },
}

export function horizonBucket(years) {
  if (years < 3) return 'under3'
  if (years < 5) return 'y3to5'
  if (years < 7) return 'y5to7'
  return 'over7'
}

export const HORIZON_LABELS = {
  under3: 'Under 3 years — protect the money; stability and liquidity first',
  y3to5: '3–5 years — a cautious mix; limited, managed equity exposure',
  y5to7: '5–7 years — growth tilt with a stability cushion',
  over7: '7+ years — equity-oriented; time is on your side',
}

export function buildAllocation({ horizonYears, risk, essential }) {
  // An essential goal (cannot be postponed or shrunk) gets one notch safer.
  const effectiveRisk = essential && horizonYears >= 3 ? downgrade(risk) : risk
  const bucket = horizonBucket(horizonYears)
  const rows = ALLOCATIONS[bucket][effectiveRisk].map(([cat, pctVal]) => ({
    cat, pct: pctVal / 100, ...CATEGORIES[cat],
  }))
  return { bucket, effectiveRisk, riskAdjusted: effectiveRisk !== risk, rows }
}

export function blendedReturn(rows) {
  return rows.reduce((a, r) => a + r.pct * r.expReturn, 0)
}

export function equityExposure(rows) {
  return rows.reduce((a, r) => a + r.pct * r.equityWeight, 0)
}

// ---- SIP / corpus math (monthly compounding) ----

function monthlyRate(annual) {
  return Math.pow(1 + annual, 1 / 12) - 1
}

// Future value of a monthly SIP of `p` for `years` at `annual` return (SIP at start of month).
export function sipFutureValue(p, years, annual) {
  const i = monthlyRate(annual)
  const n = Math.round(years * 12)
  if (i === 0) return p * n
  return p * ((Math.pow(1 + i, n) - 1) / i) * (1 + i)
}

// Monthly SIP needed to reach `target` in `years` at `annual` return.
export function sipRequired(target, years, annual) {
  const fvOfOne = sipFutureValue(1, years, annual)
  return target / fvOfOne
}

export function lumpsumFutureValue(l, years, annual) {
  return l * Math.pow(1 + annual, years)
}

export function inflate(amount, years, inflation = 0.06) {
  return amount * Math.pow(1 + inflation, years)
}

export function roundUpTo(v, step = 100) {
  return Math.ceil(v / step) * step
}

// High-level grouping for the allocation donut.
export const GROUPS = [
  { id: 'equity', label: 'Equity', color: 'var(--series-1)' },
  { id: 'hybrid', label: 'Hybrid', color: 'var(--series-2)' },
  { id: 'debt',   label: 'Debt',   color: 'var(--series-3)' },
  { id: 'liquid', label: 'Liquid', color: 'var(--series-4)' },
]

export function groupAllocation(rows) {
  const totals = {}
  for (const r of rows) totals[r.group] = (totals[r.group] || 0) + r.pct
  return GROUPS.filter((g) => totals[g.id] > 0).map((g) => ({ ...g, pct: totals[g.id] }))
}
