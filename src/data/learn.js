// The advisory guidance note, structured for the Learn tab.

export const PRINCIPLES = [
  {
    title: 'Start with the goal',
    body: 'Every investment should be linked to a specific goal — retirement, child education, home purchase, wealth creation. The goal decides the amount needed, the time available, and the kind of fund suitable for it. Ask: What is the money for? When will I need it? Is the goal essential or optional?',
  },
  {
    title: 'Match fund type to time horizon',
    body: 'Less than 3 years: prioritise stability and liquidity (liquid and short-duration debt funds). 3 to 5 years: a cautious mix depending on risk appetite (hybrid plus debt). More than 5 years: equity-oriented funds can be considered for growth. Taking equity risk for a short-term goal is one of the most common mistakes.',
  },
  {
    title: 'Understand your risk profile',
    body: 'Invest in a fund only if you can hold it through volatility without panic-selling. Risk tolerance is not about liking high returns — it is about staying disciplined when markets fall 20–30%. The right fund is one you can remain invested in through a full market cycle.',
  },
  {
    title: 'Check the fund’s objective and strategy',
    body: 'A fund’s stated objective should align with your purpose. Review what it actually invests in, whether it is broad-based or concentrated, whether it uses complex strategies, and whether it matches the role you want it to play in your portfolio. If you cannot explain the strategy in one sentence, skip the fund.',
  },
  {
    title: 'Review performance properly',
    body: 'Never judge a fund by last year’s return. Look at 3-year, 5-year and longer performance, compare against the right benchmark and category peers, and check whether returns were steady or erratic — and how the fund behaved in bad markets, not just good ones.',
  },
  {
    title: 'Look at the cost structure',
    body: 'Lower costs leave more return in your pocket, compounded over years. Check the expense ratio (prefer Direct plans), exit load, and the tax impact based on fund type and holding period. A fund with consistent performance and reasonable costs beats one with flashy returns and high fees.',
  },
  {
    title: 'Assess the fund manager and process',
    body: 'Consistency in management, investment style and decision-making matters more than a short burst of outperformance. Has the manager been stable? Is the process clear and repeatable? Has the strategy changed often? Does the fund keep its stated style?',
  },
  {
    title: 'Check portfolio quality',
    body: 'Look inside the portfolio, not just at the headline return: number of holdings, sector concentration, the large/mid/small-cap mix, credit quality in debt funds, and overlap with your other funds. Concentration is acceptable only when it is intentional and fits your goal.',
  },
  {
    title: 'Avoid duplication across funds',
    body: 'Owning five funds that hold the same fifty stocks is not diversification. Give each fund a clear role: one core equity fund, one debt fund for stability, and a satellite fund only if you understand the extra risk it brings.',
  },
  {
    title: 'Think portfolio, not isolated funds',
    body: 'Even a good fund is wrong if it makes your overall portfolio too aggressive, too conservative, or too concentrated. A useful portfolio balances growth, stability, liquidity and goal alignment.',
  },
]

export const CHECKLIST = [
  'Does this fund match my goal?',
  'Is my time horizon long enough for this category?',
  'Can I handle the risk without panic-selling?',
  'Is the fund’s strategy simple and understandable?',
  'Are the costs (expense ratio, exit load, tax) reasonable?',
  'Has the fund been consistent across market cycles?',
  'Does it add something new to my portfolio, or duplicate what I own?',
]

export const MISTAKES = [
  'Choosing funds only because they topped last year’s charts.',
  'Buying a fund without knowing which goal it serves.',
  'Taking equity risk for a short-term goal.',
  'Ignoring expenses and tax impact.',
  'Holding multiple overlapping funds and calling it diversification.',
  'Exiting after a temporary fall in value.',
  'Following tips without understanding the strategy.',
]

export const SEQUENCE = [
  'Define the goal.',
  'Decide the time horizon.',
  'Estimate acceptable risk.',
  'Choose the right fund category.',
  'Compare a few suitable funds.',
  'Check cost, consistency and portfolio quality.',
  'Invest regularly (SIP) and review once or twice a year.',
]

export const TAX_RULES = [
  {
    type: 'Equity funds (≥65% equity), incl. index, flexi-cap, most aggressive hybrids',
    stcg: 'Held < 12 months: 20% on gains',
    ltcg: 'Held ≥ 12 months: 12.5% on gains above ₹1.25 lakh per financial year',
  },
  {
    type: 'Debt funds (liquid, short-duration, corporate bond) & conservative hybrids',
    stcg: 'All gains added to income, taxed at your slab rate',
    ltcg: 'Same — slab rate regardless of holding period (units bought after 1 Apr 2023)',
  },
]

export const TAX_CAVEAT =
  'Tax rules as generally applicable for FY 2025-26. Rules change with budgets — verify current rates before acting.'

export const GLOSSARY = [
  { term: 'NAV', def: 'Net Asset Value — the per-unit price of a fund, declared each business day.' },
  { term: 'SIP', def: 'Systematic Investment Plan — investing a fixed amount every month, which averages your purchase cost across market ups and downs.' },
  { term: 'Direct plan', def: 'Buying straight from the fund house without a distributor. Same portfolio, lower expense ratio, higher returns than the Regular plan.' },
  { term: 'Expense ratio', def: 'The annual fee the fund charges, deducted from NAV. 1% extra cost compounds into a large drag over 15–20 years.' },
  { term: 'Exit load', def: 'A charge (often 1%) if you redeem before a minimum period, usually one year for equity funds.' },
  { term: 'CAGR', def: 'Compound Annual Growth Rate — the smoothed yearly return over a period. The standard way to compare fund returns.' },
  { term: 'Max drawdown', def: 'The worst peak-to-trough fall in value over a period. Tells you how much pain you would have had to sit through.' },
  { term: 'AMC', def: 'Asset Management Company — the fund house (e.g. HDFC MF, ICICI Prudential MF) that runs the schemes.' },
]

export const DISCLAIMER =
  'MF Sarthi is an educational planning tool, not investment advice. Fund names shown are large, well-known examples of each category, not recommendations. Mutual fund investments are subject to market risks — read all scheme-related documents carefully. Past performance does not guarantee future returns. Consider consulting a SEBI-registered investment adviser before investing.'

export const DATA_ATTRIBUTION =
  'Live NAV data from api.mfapi.in (AMFI). NAVs update once per business day.'
