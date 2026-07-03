import { useEffect, useState } from 'react'
import Wizard from './components/Wizard.jsx'
import PlanResult from './components/PlanResult.jsx'
import Explore from './components/Explore.jsx'
import Learn from './components/Learn.jsx'
import FundDetail from './components/FundDetail.jsx'
import { onLiveStatus } from './lib/mfapi.js'

const PLAN_KEY = 'mfsarthi.plan'

function loadPlan() {
  try {
    return JSON.parse(localStorage.getItem(PLAN_KEY))
  } catch {
    return null
  }
}

const TABS = [
  {
    id: 'plan', label: 'Plan',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.5" /></svg>,
  },
  {
    id: 'explore', label: 'Explore',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>,
  },
  {
    id: 'learn', label: 'Learn',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5V5.5" /></svg>,
  },
]

export default function App() {
  const [tab, setTab] = useState('plan')
  const [plan, setPlan] = useState(loadPlan)
  const [editing, setEditing] = useState(false)
  const [fundCode, setFundCode] = useState(null)
  const [live, setLive] = useState({ online: null })

  useEffect(() => onLiveStatus(setLive), [])

  function savePlan(inputs) {
    setPlan(inputs)
    setEditing(false)
    try { localStorage.setItem(PLAN_KEY, JSON.stringify(inputs)) } catch { /* ignore */ }
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>MF Sarthi</h1>
          <div className="tagline">Goal-first mutual fund guide</div>
        </div>
        <span className="live-pill">
          <span className={`live-dot ${live.online === true ? 'on' : live.online === false ? 'off' : ''}`} />
          {live.online === true ? 'Live NAV' : live.online === false ? 'Offline' : 'AMFI data'}
        </span>
      </header>

      {tab === 'plan' && (
        plan && !editing
          ? <PlanResult inputs={plan} onEdit={() => setEditing(true)} onOpenFund={setFundCode} />
          : <Wizard initial={plan} onDone={savePlan} />
      )}
      {tab === 'explore' && <Explore onOpenFund={setFundCode} />}
      {tab === 'learn' && <Learn />}

      {fundCode && <FundDetail code={fundCode} onBack={() => setFundCode(null)} />}

      <nav className="tabbar" aria-label="Main">
        <div className="tabbar-inner">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab-btn ${tab === t.id ? 'active' : ''}`}
              onClick={() => { setTab(t.id); setFundCode(null) }}
              aria-current={tab === t.id ? 'page' : undefined}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
