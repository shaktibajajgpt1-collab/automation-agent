// Curated example funds per category — large, well-established schemes used
// as *illustrations* of each category, not as recommendations. Live NAV and
// returns are fetched from api.mfapi.in (AMFI data). Scheme codes are hints;
// the app resolves each fund by name search at runtime so codes self-heal.

export const CURATED_FUNDS = {
  index_large: [
    { id: 'uti-nifty50', name: 'UTI Nifty 50 Index Fund', query: 'UTI Nifty 50 Index', code: 120716 },
    { id: 'hdfc-nifty50', name: 'HDFC Index Fund — Nifty 50 Plan', query: 'HDFC Index Nifty 50', code: 119063 },
    { id: 'icici-nifty50', name: 'ICICI Prudential Nifty 50 Index Fund', query: 'ICICI Prudential Nifty 50 Index', code: null },
  ],
  flexi: [
    { id: 'ppfas-flexi', name: 'Parag Parikh Flexi Cap Fund', query: 'Parag Parikh Flexi Cap', code: 122639 },
    { id: 'hdfc-flexi', name: 'HDFC Flexi Cap Fund', query: 'HDFC Flexi Cap', code: null },
    { id: 'franklin-flexi', name: 'Franklin India Flexi Cap Fund', query: 'Franklin India Flexi Cap', code: null },
  ],
  mid_small: [
    { id: 'hdfc-midcap', name: 'HDFC Mid-Cap Opportunities Fund', query: 'HDFC Mid-Cap Opportunities', code: 118989 },
    { id: 'nippon-smallcap', name: 'Nippon India Small Cap Fund', query: 'Nippon India Small Cap', code: 118778 },
    { id: 'kotak-emerging', name: 'Kotak Emerging Equity Fund', query: 'Kotak Emerging Equity', code: null },
  ],
  agg_hybrid: [
    { id: 'icici-eqdebt', name: 'ICICI Prudential Equity & Debt Fund', query: 'ICICI Prudential Equity & Debt', code: null },
    { id: 'canara-hybrid', name: 'Canara Robeco Equity Hybrid Fund', query: 'Canara Robeco Equity Hybrid', code: null },
  ],
  bal_adv: [
    { id: 'hdfc-baf', name: 'HDFC Balanced Advantage Fund', query: 'HDFC Balanced Advantage', code: null },
    { id: 'icici-baf', name: 'ICICI Prudential Balanced Advantage Fund', query: 'ICICI Prudential Balanced Advantage', code: null },
  ],
  cons_hybrid: [
    { id: 'sbi-cons', name: 'SBI Conservative Hybrid Fund', query: 'SBI Conservative Hybrid', code: null },
    { id: 'hdfc-hybrid-debt', name: 'HDFC Hybrid Debt Fund', query: 'HDFC Hybrid Debt', code: null },
  ],
  short_debt: [
    { id: 'hdfc-short', name: 'HDFC Short Term Debt Fund', query: 'HDFC Short Term Debt', code: null },
    { id: 'icici-short', name: 'ICICI Prudential Short Term Fund', query: 'ICICI Prudential Short Term', code: null },
  ],
  corp_bond: [
    { id: 'icici-corp', name: 'ICICI Prudential Corporate Bond Fund', query: 'ICICI Prudential Corporate Bond', code: null },
    { id: 'hdfc-corp', name: 'HDFC Corporate Bond Fund', query: 'HDFC Corporate Bond', code: null },
  ],
  liquid: [
    { id: 'hdfc-liquid', name: 'HDFC Liquid Fund', query: 'HDFC Liquid', code: null },
    { id: 'icici-liquid', name: 'ICICI Prudential Liquid Fund', query: 'ICICI Prudential Liquid', code: null },
  ],
  elss: [
    { id: 'mirae-elss', name: 'Mirae Asset ELSS Tax Saver Fund', query: 'Mirae Asset ELSS Tax Saver', code: null },
    { id: 'dsp-elss', name: 'DSP ELSS Tax Saver Fund', query: 'DSP ELSS Tax Saver', code: null },
  ],
}
