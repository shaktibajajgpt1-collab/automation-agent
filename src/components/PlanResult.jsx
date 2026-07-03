import { useMemo } from 'react'
import {
  riskProfile, buildAllocation, blendedReturn, equityExposure,
  sipRequired, sipFutureValue, inflate, roundUpTo, groupAllocation,
  HORIZON_LABELS,
} from '../lib/planner.js'
import { CURATED_FUNDS } from '../data/funds.js'
import { DISCLAIMER } from '../data/learn.js'
import { rupees, rupeesCompact, pct } from '../lib/format.js'
import AllocationDonut from './AllocationDonut.jsx'
import FundCard from './FundCard.jsx'
import { GOALS } from './Wizard.jsx'

const RISK_LABELS = {
  conservative: 'Conservative',
  moderate: 'Moderate',
  aggressive: 'Aggressive',
}

export default function PlanResult({ inputs, onEdit, onOpenFund }) {
  const plan = useMemo(() => {
    const risk = riskProfile(inputs.riskScores)
    const alloc = buildAllocation({
      horizonYears: inputs.horizonYears, risk, essential: inputs.essential,
    })
    const expected = blendedReturn(alloc.rows)
    const equity = equityExposure(alloc.rows)

    let target = null
    let monthly = null
    let projected = null
    if (inputs.mode === 'target') {
      target = inputs.adjustInflation
        ? inflate(inputs.amount, inputs.horizonYears)
        : inputs.amount
      monthly = roundUpTo(sipRequired(target, inputs.horizonYears, expected))
    } else {
      monthly = inputs.amount
      projected = sipFutureValue(monthly, inputs.horizonYears, expected)
    }
    const cautious = inputs.mode === 'target'
      ? roundUpTo(sipRequired(target, inputs.horizonYears, Math.max(0.02, expected - 0.02)))
      : sipFutureValue(monthly, inputs.horizonYears, Math.max(0.02, expected - 0.02))

    return { risk, alloc, expected, equity, target, monthly, projected, cautious }
  }, [inputs])

  const goalLabel = GOALS.find((g) => g.id === inputs.goal)?.label || 'Your goal'
  const groups = groupAllocation(plan.alloc.rows)
  const showTaxSaver = (inputs.goal === 'retirement' || inputs.goal === 'wealth') && inputs.horizonYears >= 5

  return (
    <div className="screen">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <h2>{goalLabel} · {inputs.horizonYears} yrs</h2>
          <button className="btn ghost" onClick={onEdit}>Edit plan</button>
        </div>
        <p className="sub">
          Risk profile: <strong>{RISK_LABELS[plan.risk]}</strong>
          {plan.alloc.riskAdjusted && (
            <> — applied as <strong>{RISK_LABELS[plan.alloc.effectiveRisk]}</strong> because this goal is essential</>
          )}
          . {HORIZON_LABELS[plan.alloc.bucket]}.
        </p>
        <AllocationDonut
          groups={groups}
          centerValue={pct(plan.equity, 0)}
          centerLabel="in equity"
        />
      </div>

      <div className="tiles">
        <div className="tile">
          <div className="t-label">{inputs.mode === 'target' ? 'Invest monthly (SIP)' : 'Your monthly SIP'}</div>
          <div className="t-value">{rupees(plan.monthly)}</div>
          <div className="t-note">assumes ~{pct(plan.expected, 1)} p.a. blended return</div>
        </div>
        <div className="tile">
          <div className="t-label">{inputs.mode === 'target' ? 'Target corpus' : 'Projected corpus'}</div>
          <div className="t-value">{rupeesCompact(inputs.mode === 'target' ? plan.target : plan.projected)}</div>
          <div className="t-note">
            {inputs.mode === 'target'
              ? (inputs.adjustInflation ? 'inflation-adjusted at 6% p.a.' : 'as entered')
              : `in ${inputs.horizonYears} years`}
          </div>
        </div>
      </div>

      <div className="banner">
        {inputs.mode === 'target'
          ? <>If markets deliver 2% less than assumed, you would need about <strong>{rupees(plan.cautious)}</strong> a month instead. Returns are assumptions, not promises — review yearly and step up your SIP with income.</>
          : <>If markets deliver 2% less than assumed, the same SIP grows to about <strong>{rupeesCompact(plan.cautious)}</strong>. Returns are assumptions, not promises — review yearly and step up your SIP with income.</>}
      </div>

      <div className="card">
        <h2>Split your SIP like this</h2>
        <p className="sub">Each category has one clear job — no overlapping funds doing the same thing.</p>
        {plan.alloc.rows.map((r) => (
          <div className="alloc-row" key={r.cat}>
            <div style={{ minWidth: 0 }}>
              <div className="a-name">{r.label}</div>
              <div className="a-role">{r.role}</div>
            </div>
            <div style={{ textAlign: 'right', flex: 'none' }}>
              <div className="a-pct">{Math.round(r.pct * 100)}%</div>
              {plan.monthly && <div className="a-amt">{rupees(Math.round(plan.monthly * r.pct))}/mo</div>}
            </div>
          </div>
        ))}
      </div>

      {plan.alloc.rows.map((r) => (
        <div className="card" key={r.cat}>
          <h3>{r.label} — example funds</h3>
          <p className="sub">{r.description}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(CURATED_FUNDS[r.cat] || []).map((f) => (
              <FundCard key={f.id} curated={f} onOpen={onOpenFund} />
            ))}
          </div>
          <p className="muted" style={{ marginTop: 10, marginBottom: 0 }}>
            Large, established schemes shown as examples of the category — compare before choosing.
            Suggested holding: {r.minHorizon}. Risk: {r.riskLabel}.
          </p>
        </div>
      ))}

      {showTaxSaver && (
        <div className="banner">
          <strong>Optional:</strong> if you use the old tax regime and haven’t exhausted the ₹1.5 lakh Section 80C limit,
          an ELSS (tax-saver) fund can replace part of the equity slice. Find examples in the Explore tab
          (search “ELSS”). Each instalment locks for 3 years.
        </div>
      )}

      <div className="card">
        <h2>How to act on this plan</h2>
        <ol className="list-plain">
          <li>Open the funds above and read the live data — returns, worst fall, consistency.</li>
          <li>Pick <strong>one</strong> fund per category. More funds in the same category adds overlap, not diversification.</li>
          <li>Always choose the <strong>Direct plan, Growth option</strong> — lower cost, better compounding.</li>
          <li>Set up SIPs on autopay so investing survives your moods and market news.</li>
          <li>Review once or twice a year. Rebalance if the mix drifts far from plan — do not react to daily noise.</li>
          <li>As the goal comes within ~3 years, shift equity gains gradually into debt/liquid funds to lock them in.</li>
        </ol>
      </div>

      <p className="muted">{DISCLAIMER}</p>
    </div>
  )
}
