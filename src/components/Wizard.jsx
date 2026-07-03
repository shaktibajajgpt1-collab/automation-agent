import { useState } from 'react'
import { RISK_QUESTIONS } from '../lib/planner.js'
import { rupees } from '../lib/format.js'

export const GOALS = [
  { id: 'retirement', label: 'Retirement' },
  { id: 'education', label: 'Child education' },
  { id: 'home', label: 'Home purchase' },
  { id: 'wealth', label: 'Wealth creation' },
  { id: 'emergency', label: 'Emergency fund' },
  { id: 'purchase', label: 'Car / travel / big purchase' },
]

const TOTAL_STEPS = 6 // goal, horizon, amount, 3 risk questions

export default function Wizard({ initial, onDone }) {
  const [step, setStep] = useState(0)
  const [goal, setGoal] = useState(initial?.goal || null)
  const [essential, setEssential] = useState(initial?.essential ?? true)
  const [horizonYears, setHorizonYears] = useState(initial?.horizonYears || 10)
  const [mode, setMode] = useState(initial?.mode || 'target')
  const [amount, setAmount] = useState(initial?.amount || '')
  const [adjustInflation, setAdjustInflation] = useState(initial?.adjustInflation ?? true)
  const [riskScores, setRiskScores] = useState(initial?.riskScores || [null, null, null])

  const riskIndex = step - 3

  function next() {
    if (step === TOTAL_STEPS - 1) {
      onDone({
        goal, essential, horizonYears, mode,
        amount: Number(amount), adjustInflation, riskScores,
      })
    } else {
      setStep(step + 1)
    }
  }

  const canNext =
    step === 0 ? !!goal
    : step === 1 ? horizonYears >= 1
    : step === 2 ? Number(amount) > 0
    : riskScores[riskIndex] != null

  return (
    <div className="screen">
      <div>
        <div className="progress">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span key={i} className={`seg ${i <= step ? 'done' : ''}`} />
          ))}
        </div>
        <span className="step-label">Step {step + 1} of {TOTAL_STEPS}</span>
      </div>

      {step === 0 && (
        <div className="card">
          <h2>What is this money for?</h2>
          <p className="sub">Every investment should serve a specific goal. The goal decides the amount, the time available, and the kind of fund that fits.</p>
          <div className="chips">
            {GOALS.map((g) => (
              <button
                key={g.id}
                className={`chip ${goal === g.id ? 'selected' : ''}`}
                onClick={() => setGoal(g.id)}
              >
                {g.label}
              </button>
            ))}
          </div>
          <hr className="divider" />
          <div className="toggle-row">
            <span className="lbl">
              <strong>This goal is essential</strong>
              <div className="muted">It cannot be postponed or shrunk (e.g. education fees). Essential goals get a safer mix.</div>
            </span>
            <span className="switch">
              <input type="checkbox" checked={essential} onChange={(e) => setEssential(e.target.checked)} />
              <span className="track" /><span className="thumb" />
            </span>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="card">
          <h2>When will you need the money?</h2>
          <p className="sub">The horizon decides the category: under 3 years demands stability, 3–5 a cautious mix, beyond 5 equity can work for you.</p>
          <div className="hero-num">{horizonYears} {horizonYears === 1 ? 'year' : 'years'}</div>
          <input
            type="range" min="1" max="30" step="1"
            value={horizonYears}
            onChange={(e) => setHorizonYears(Number(e.target.value))}
            aria-label="Years until you need the money"
          />
          <div className="hero-sub">
            {horizonYears < 3 && 'Short term — protecting the money matters more than growing it.'}
            {horizonYears >= 3 && horizonYears < 5 && 'Medium term — limited, managed equity exposure.'}
            {horizonYears >= 5 && horizonYears < 7 && 'Growth tilt with a stability cushion.'}
            {horizonYears >= 7 && 'Long term — equity has time to ride out full market cycles.'}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <h2>How much?</h2>
          <p className="sub">Tell us the target you are saving toward, or the monthly amount you can comfortably invest.</p>
          <div className="chips" style={{ marginBottom: 14 }}>
            <button className={`chip ${mode === 'target' ? 'selected' : ''}`} onClick={() => setMode('target')}>
              I have a target amount
            </button>
            <button className={`chip ${mode === 'monthly' ? 'selected' : ''}`} onClick={() => setMode('monthly')}>
              I know my monthly budget
            </button>
          </div>
          <div className="field">
            <label htmlFor="amt">{mode === 'target' ? 'Target amount (₹, in today’s money)' : 'Monthly investment (₹)'}</label>
            <input
              id="amt" type="number" inputMode="numeric" min="0"
              placeholder={mode === 'target' ? 'e.g. 2500000' : 'e.g. 15000'}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {Number(amount) > 0 && <span className="muted">{rupees(Number(amount))}{mode === 'monthly' ? ' per month' : ''}</span>}
          </div>
          {mode === 'target' && (
            <div className="toggle-row">
              <span className="lbl">
                <strong>Adjust for inflation</strong>
                <div className="muted">Grows your target ~6% a year so it holds today’s purchasing power.</div>
              </span>
              <span className="switch">
                <input type="checkbox" checked={adjustInflation} onChange={(e) => setAdjustInflation(e.target.checked)} />
                <span className="track" /><span className="thumb" />
              </span>
            </div>
          )}
        </div>
      )}

      {step >= 3 && (
        <div className="card">
          <h2>{RISK_QUESTIONS[riskIndex].text}</h2>
          <p className="sub">Honest answers matter — the right fund is one you can hold through a full market cycle without panic-selling.</p>
          <div className="option-list">
            {RISK_QUESTIONS[riskIndex].options.map((o) => (
              <button
                key={o.label}
                className={`option ${riskScores[riskIndex] === o.score ? 'selected' : ''}`}
                onClick={() => {
                  const nextScores = [...riskScores]
                  nextScores[riskIndex] = o.score
                  setRiskScores(nextScores)
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="btn-row">
        <button className="btn" onClick={() => setStep(step - 1)} disabled={step === 0}>Back</button>
        <button className="btn primary" onClick={next} disabled={!canNext}>
          {step === TOTAL_STEPS - 1 ? 'See my plan' : 'Next'}
        </button>
      </div>
    </div>
  )
}
