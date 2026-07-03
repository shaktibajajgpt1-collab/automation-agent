import {
  PRINCIPLES, CHECKLIST, MISTAKES, SEQUENCE,
  TAX_RULES, TAX_CAVEAT, GLOSSARY, DISCLAIMER,
} from '../data/learn.js'

export default function Learn() {
  return (
    <div className="screen">
      <div className="card">
        <h2>How to choose a mutual fund</h2>
        <p className="sub">
          A fund should not be chosen because it is popular or recently gave high returns.
          It should be chosen because it matches your <strong>goal</strong>, <strong>time horizon</strong>,
          and your ability to <strong>stay invested</strong> through market ups and downs.
        </p>
      </div>

      <div>
        <div className="section-title">The ten principles</div>
        {PRINCIPLES.map((p, i) => (
          <details className="accordion" key={p.title}>
            <summary>{i + 1}. {p.title}</summary>
            <div className="acc-body">{p.body}</div>
          </details>
        ))}
      </div>

      <div className="card">
        <h3>The disciplined sequence</h3>
        <ol className="list-plain">
          {SEQUENCE.map((s) => <li key={s}>{s}</li>)}
        </ol>
      </div>

      <div className="card">
        <h3>Checklist before buying any fund</h3>
        <ul className="list-plain">
          {CHECKLIST.map((c) => <li key={c}>{c}</li>)}
        </ul>
        <p className="muted" style={{ marginBottom: 0 }}>If the answer to most of these is no, skip the fund.</p>
      </div>

      <div className="card">
        <h3>Common mistakes to avoid</h3>
        <ul className="list-plain">
          {MISTAKES.map((m) => <li key={m}>{m}</li>)}
        </ul>
      </div>

      <div className="card">
        <h3>How mutual funds are taxed</h3>
        {TAX_RULES.map((t) => (
          <div key={t.type} style={{ marginBottom: 12 }}>
            <div className="small" style={{ fontWeight: 700, color: 'var(--ink-1)' }}>{t.type}</div>
            <ul className="list-plain">
              <li>{t.stcg}</li>
              <li>{t.ltcg}</li>
            </ul>
          </div>
        ))}
        <p className="muted" style={{ marginBottom: 0 }}>{TAX_CAVEAT}</p>
      </div>

      <div>
        <div className="section-title">Glossary</div>
        {GLOSSARY.map((g) => (
          <details className="accordion" key={g.term}>
            <summary>{g.term}</summary>
            <div className="acc-body">{g.def}</div>
          </details>
        ))}
      </div>

      <p className="muted">{DISCLAIMER}</p>
    </div>
  )
}
