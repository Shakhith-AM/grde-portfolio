export const GRDE_VERSION = '5.4.0';
export const GRDE_RELEASE_TAG = 'Oct 2026 Consolidated (04/10/2026 Snapshot)';

// Authoritative GRDE Strategic Retirement Corpus Target: ₹4,00,00,000 (₹4 Crore)
export const STRATEGIC_RETIREMENT_CORPUS_TARGET = 40000000;
export const ILLUSTRATIVE_SCENARIO_CORPUS_3_5CR = 35000000;

export const AGE_BANDS = [
  { range: "18-25" },
  { range: "25-30" }, { range: "30-35" }, { range: "35-40" },
  { range: "40-45" }, { range: "45-50" }, { range: "50-55" },
  { range: "55-60" }, { range: "60-65" }, { range: "65-70" },
  { range: "70-75" }, { range: "75-80" }, { range: "80-85" },
  { range: "85-90" }, { range: "90-95" }, { range: "95-100" }
];

/**
 * Authoritative Historical Snapshot — "GRDE Progress Chart" — OCTOBER 2026 (Dated 04/10/2026)
 * Preserved as an immutable historical record for audit, comparison, and reconciliation.
 * Note: This is a dated historical valuation snapshot (04/10/2026), NOT a live market feed.
 */
export const OCTOBER_2026_AUTHORITATIVE_SNAPSHOT = Object.freeze({
  snapshotId: "GRDE_PROGRESS_CHART_2026_10_04",
  title: "GRDE Progress Chart — OCTOBER 2026 (Dated 04/10/2026)",
  snapshotDate: "2026-10-04",
  dataStatus: "HISTORICAL_SNAPSHOT_04_OCT_2026",
  age: 52,
  activeBand: "50-55",
  strategicRatio: "10.0% : 15.0% : 25.0% : 50.0%",
  referencePortfolioTarget: 4000000.00,
  summary: Object.freeze({
    G: { presentWithTataSilv: 369832.18, presentStrategicGoldOnly: 341438.02, gGoldbeesPresent: 300197.02, gGldmTransitionPresent: 41241.00, target: 400000.00, chartVariance: -30167.82, strategicGoldVariance: -58561.98 },
    R: { present: 585189.82, target: 600000.00, variance: -14810.18 },
    D: { present: 902674.00, target: 1000000.00, variance: -97326.00 },
    E1: {
      present: 1592238.35,
      target: 1200000.00,
      variance: 392238.35,
      e1PassivePresent: 348662.35,
      e1PassiveTarget: 600000.00,
      e1PassiveVariance: -251337.65,
      e1ActiveCorePresent: 715666.00,
      e1ActiveLegacyTransitionPresent: 527910.00,
      e1ActiveSubtotalPresent: 1243576.00,
      e1ActiveTarget: 600000.00,
      e1ActiveSubtotalVariance: 643576.00
    },
    E2: { present: 404220.30, target: 800000.00, variance: -395779.70 },
    E_TOTAL: { present: 1996458.65, target: 2000000.00, variance: -3541.35 },
    GRDE_TOTAL_CHART: { present: 3854154.65, target: 4000000.00, variance: -145845.35 },
    GRDE_TOTAL_EXCL_TATASILV: { present: 3825760.49, target: 4000000.00, variance: -174239.51 },
    NPS_OUTSIDE_GRDE: 21850.00,
    GRDE_PLUS_NPS_CHART: 3876004.65
  }),
  holdings: Object.freeze({
    // G — Gold (04/10/2026 Chart + Subsequent Gradual Transition Classification for GLDM)
    g1_goldbees: { label: "G1 : GOLDBEES (8.5% Oct Chart)", present: 300197.02, chartTarget: 340000.00, subsequentRole: "PRIMARY_FRESH_GOLD_DESTINATION" },
    g1_gldm: { label: "GLDM (US) (1.5% Oct Chart · Gradual Transition Holding)", present: 41241.00, chartTarget: 60000.00, freshStrategicTarget: 0, subsequentRole: "GRADUAL_TRANSITION_HOLDING" },
    g2_sgb: { label: "G2 : SOVEREIGN GOLD BONDS (Configurable Split Pending Confirmation)", present: 0, chartTarget: 0 },
    g3_phys: { label: "G3 : PHY. GOLD (Configurable Split Pending Confirmation)", present: 0, chartTarget: 0 },
    g4_fx: { label: "G4 : USD/EUROS (Auxiliary Travel Reserve Outside G)", present: 0, chartTarget: 0 },
    tatasilv_oct04: { label: "TATSILV (IND) — LEGACY / EXIT (04/10/2026 Snapshot)", present: 28394.16, chartTarget: 0 },

    // R — REITs & InvITs (04/10/2026 Chart)
    r_mind: { label: "MINDSPACE (3%)", present: 109054.68, target: 120000.00 },
    r_krt: { label: "KRT (3%)", present: 100456.74, target: 120000.00 },
    r_nexus: { label: "NEXUS (3%)", present: 115759.40, target: 120000.00 },
    r_indi: { label: "INDIGRID (ICI) (3.6%)", present: 174345.00, target: 144000.00 },
    r_irb: { label: "IRBINV (ICI) (2.4%)", present: 85574.00, target: 96000.00 },

    // D — Debt (04/10/2026 Chart)
    d1_jio: { label: "D1 : JIO BLACKROCK", present: 100921.00 },
    d1_nippon_ultra: { label: "D1 : NIPP ULTRA SHORT", present: 101141.00 },
    d1_total: { label: "D1 : LIQUID + ULTRA SHORT TOTAL", present: 202062.00, target: 200000.00 },
    d2_pomis: { label: "D2 : POMIS/FD", present: 450000.00, target: 450000.00 },
    d3_wint: { label: "D3 : WINT BONDS", present: 132083.00, target: 200000.00 },
    d4_nippon_dyn: { label: "D4 : NIPPON DYNAMIC FUND", present: 118529.00, target: 150000.00 },

    // E1 — Indian Equity (04/10/2026 Chart · Mirae Healthcare under E1 Active — Legacy / Transition)
    e1_p_n50: { label: "NIFTY 50 (3.75%)", present: 106989.50, target: 150000.00, group: "E1_PASSIVE" },
    e1_p_nn50: { label: "NIFTY NXT 50 (3.75%)", present: 126054.24, target: 150000.00, group: "E1_PASSIVE" },
    e1_p_n500: { label: "NIFTY 500 (3.75%)", present: 95318.57, target: 150000.00, group: "E1_PASSIVE" },
    e1_p_hc: { label: "NIFTY HEALTHCARE ETF (TARGET 3.75%)", present: 20300.04, target: 150000.00, group: "E1_PASSIVE" },
    e1_legacy_mf: { label: "INDIAN MUTUAL FUNDS (ACTIVE) — LEGACY / EXIT", present: 449992.00, target: 0, group: "E1_ACTIVE_LEGACY_TRANSITION" },
    e1_hc_legacy: { label: "HEALTHCARE FUND (ACTIVE — TRANSITION: MIRAE HEALTHCARE)", present: 77918.00, target: 0, group: "E1_ACTIVE_LEGACY_TRANSITION" },
    e1_a_hbaf: { label: "HDFC BAF (1.5%)", present: 93439.00, target: 60000.00, group: "E1_ACTIVE_CORE" },
    e1_a_hsmc: { label: "HDFC SMALLCAP (2.25%)", present: 114390.00, target: 90000.00, group: "E1_ACTIVE_CORE" },
    e1_a_momc: { label: "MOTILAL MIDCAP (3.75%)", present: 175476.00, target: 150000.00, group: "E1_ACTIVE_CORE" },
    e1_a_ppfas: { label: "PPFAS FLEXICAP (7.5%)", present: 332361.00, target: 300000.00, group: "E1_ACTIVE_CORE" },

    // E2 — US ETF (04/10/2026 Chart + Approved Subsequent E2 Classification)
    e2_voo: { label: "VOO (S&P 500) (10% Revised / 12% on Oct 4 Chart with SCHD)", present: 216970.50, revisedTarget: 400000.00, chartCombinedTargetWithSchd: 480000.00 },
    e2_schd: { label: "SCHD (3% Revised E2 Dividend Equity)", present: 77948.45, revisedTarget: 120000.00 },
    e2_mon100: { label: "MON100 (IND) (Transition Holding -> QQQM)", present: 87321.20, revisedTarget: 0, chartTarget: 160000.00 },
    e2_qqqm: { label: "QQQM (US) (4% Nasdaq-100 Growth)", present: 21980.15, revisedTarget: 160000.00, chartTarget: 160000.00 },
    e2_mom: { label: "Invesco Momentum ETF (3% Revised E2 Momentum)", present: 0, revisedTarget: 120000.00 },

    // NPS Outside GRDE
    aux_nps: { label: "NPS (OUTSIDE GRDE)", present: 21850.00 }
  })
});

/**
 * October 2026 Consolidated GRDE Strategic Asset Template
 * Reflects the exact holdings and sub-categories of the 04/10/2026 GRDE Progress Chart
 * combined with the approved October 2026 strategic classifications:
 *   G = 10.0% (₹4,00,000 at ₹40L: G1 GoldBeES Oct chart target 8.5% = ₹3,40,000; GLDM 1.5% / ₹60,000 historical Oct target preserved but classified as a Gradual Transition Holding with ₹0 permanent fresh target; strategic split across GoldBeES, SGBs & Physical Gold configurable pending confirmation)
 *   R = 15.0% (₹6,00,000 at ₹40L: Mindspace 3% = ₹1.2L, KRT 3% = ₹1.2L, Nexus 3% = ₹1.2L, IndiGrid 3.6% = ₹1.44L, IRB InvIT 2.4% = ₹96k)
 *   D = 25.0% (₹10,00,000 at ₹40L: D1 Jio BlackRock + Nippon Ultra Short = ₹2.0L, D2 POMIS/FD = ₹4.5L, D3 Wint Bonds = ₹2.0L, D4 Nippon Dynamic = ₹1.5L)
 *   E = 50.0% (₹20,00,000 at ₹40L: E1 Indian Equity ₹12,00,000 + E2 US Equity ₹8,00,000)
 */
export const ASSET_TEMPLATE = [
  // ── G (Gold = 10% of GRDE · ₹4,00,000 at ₹40L · Split across GoldBeES/SGBs/Physical Gold configurable pending confirmation) ──
  {
    id: "g_gold",
    cat: "G",
    sub: "G1 · Gold ETF (India — Primary Fresh Gold Accumulation)",
    sleeveCode: "G1-IND",
    division: "G_STRATEGIC",
    holdingType: "STRATEGIC",
    isPrimaryFreshGoldTarget: true,
    name: "G1 : GoldBeES (Nippon India ETF Gold BeES)",
    desc: "Primary destination for fresh Gold accumulation (Oct 4 Chart Target: 8.5% / ₹3,40,000; 04/10/2026 Snapshot: ₹3,00,197.02 · G1/G2/G3 split configurable pending confirmation)",
    catFrac: 0.85,
    historicalOct2026CatFrac: 0.85,
    historicalOct2026Target40L: 340000,
    refTarget40L: 340000
  },
  {
    id: "g_gldm",
    cat: "G",
    sub: "G1 · Gold ETF (US — Gradual Transition Holding)",
    sleeveCode: "G1-TR",
    division: "G_TRANSITION",
    holdingType: "TRANSITION",
    transitionTargetId: "g_gold",
    name: "GLDM (US) — SPDR Gold MiniShares (Gradual Transition Holding)",
    desc: "04/10/2026 Snapshot: ₹41,241.00 (Historical Oct 4 Chart Target: 1.5% / ₹60,000 preserved historically) · Subsequent Strategy: Gradual Transition Holding (₹0 permanent fresh target; fresh Gold directed primarily to GoldBeES)",
    catFrac: 0,
    historicalOct2026CatFrac: 0.15,
    historicalOct2026Target40L: 60000,
    refTarget40L: 0
  },
  {
    id: "g_sgb",
    cat: "G",
    sub: "G2 · Sovereign Gold Bonds (Configurable Split)",
    sleeveCode: "G2",
    division: "G_STRATEGIC",
    holdingType: "STRATEGIC",
    configurableGoldSplit: true,
    name: "G2 : Sovereign Gold Bonds (SGBs)",
    desc: "Sovereign Gold Bonds sleeve (where suitable bonds are available; 04/10/2026 Snapshot: ₹0 · Strategic split across GoldBeES/SGBs/Physical Gold configurable pending confirmation)",
    catFrac: 0,
    historicalOct2026CatFrac: 0,
    historicalOct2026Target40L: 0,
    refTarget40L: 0
  },
  {
    id: "g_phys",
    cat: "G",
    sub: "G3 · Physical Gold (Configurable Split)",
    sleeveCode: "G3",
    division: "G_STRATEGIC",
    holdingType: "STRATEGIC",
    configurableGoldSplit: true,
    name: "G3 : Physical Gold (Coins / Bars)",
    desc: "Investment-grade physical gold coins/bars (04/10/2026 Snapshot: ₹0 · Strategic split across GoldBeES/SGBs/Physical Gold configurable pending confirmation)",
    catFrac: 0,
    historicalOct2026CatFrac: 0,
    historicalOct2026Target40L: 0,
    refTarget40L: 0
  },

  // ── R (REITs & InvITs = 15% of GRDE · ₹6,00,000 at ₹40L · Matches 04/10/2026 Chart Weights) ──
  {
    id: "r_mind",
    cat: "R",
    sub: "R · REITs",
    sleeveCode: "R-REIT1",
    division: "R_REIT",
    holdingType: "STRATEGIC",
    name: "Mindspace REIT (3.0% GRDE)",
    desc: "Commercial office REIT (20% of R · Target ₹1,20,000 at ₹40L; 04/10/2026 Snapshot: ₹1,09,054.68)",
    catFrac: 0.20,
    refTarget40L: 120000
  },
  {
    id: "r_krt",
    cat: "R",
    sub: "R · REITs",
    sleeveCode: "R-REIT2",
    division: "R_REIT",
    holdingType: "STRATEGIC",
    name: "KRT REIT (3.0% GRDE)",
    desc: "Commercial office REIT (20% of R · Target ₹1,20,000 at ₹40L; 04/10/2026 Snapshot: ₹1,00,456.74)",
    catFrac: 0.20,
    refTarget40L: 120000
  },
  {
    id: "r_nexus",
    cat: "R",
    sub: "R · REITs",
    sleeveCode: "R-REIT3",
    division: "R_REIT",
    holdingType: "STRATEGIC",
    name: "Nexus Select Trust REIT (3.0% GRDE)",
    desc: "Grade-A retail mall REIT (20% of R · Target ₹1,20,000 at ₹40L; 04/10/2026 Snapshot: ₹1,15,759.40)",
    catFrac: 0.20,
    refTarget40L: 120000
  },
  {
    id: "r_indi",
    cat: "R",
    sub: "R · InvITs",
    sleeveCode: "R-INV1",
    division: "R_INVIT",
    holdingType: "STRATEGIC",
    name: "IndiGrid InvIT (ICI) (3.6% GRDE)",
    desc: "Power transmission InvIT (24% of R · Target ₹1,44,000 at ₹40L; 04/10/2026 Snapshot: ₹1,74,345.00)",
    catFrac: 0.24,
    refTarget40L: 144000
  },
  {
    id: "r_irb",
    cat: "R",
    sub: "R · InvITs",
    sleeveCode: "R-INV2",
    division: "R_INVIT",
    holdingType: "STRATEGIC",
    name: "IRB InvIT (ICI) (2.4% GRDE)",
    desc: "Highway & toll road InvIT (16% of R · Target ₹96,000 at ₹40L; 04/10/2026 Snapshot: ₹85,574.00)",
    catFrac: 0.16,
    refTarget40L: 96000
  },
  {
    id: "r_dc_legacy",
    cat: "R",
    sub: "Legacy · Exited REIT",
    sleeveCode: "R-LEG",
    division: "R_LEGACY",
    holdingType: "LEGACY",
    name: "Exited Data Centre REIT (Legacy)",
    desc: "Exited prior to October 2026 snapshot — ₹0 present and ₹0 strategic target",
    catFrac: 0,
    refTarget40L: 0
  },

  // ── D (Debt = 25% of GRDE · ₹10,00,000 at ₹40L across D1–D4) ──
  {
    id: "d_liq",
    cat: "D",
    sub: "D1 · Liquid & Ultra Short",
    sleeveCode: "D1",
    division: "D1_LIQUIDITY",
    holdingType: "STRATEGIC",
    name: "D1 : Jio BlackRock Liquid (₹1,00,921) + Nippon Ultra Short (₹1,01,141)",
    desc: "Liquid + Ultra Short Duration funds (20% of D · Target ₹2,00,000; 04/10/2026 Snapshot: ₹2,02,062.00)",
    catFrac: 0.20,
    refTarget40L: 200000
  },
  {
    id: "d_pomis",
    cat: "D",
    sub: "D2 · POMIS / Fixed Deposits",
    sleeveCode: "D2",
    division: "D2_POMIS_FD",
    holdingType: "STRATEGIC",
    name: "D2 : POMIS / Fixed Deposits",
    desc: "Post Office Monthly Income Scheme / FDs (45% of D · Target ₹4,50,000; 04/10/2026 Snapshot: ₹4,50,000.00)",
    catFrac: 0.45,
    refTarget40L: 450000
  },
  {
    id: "d_inc",
    cat: "D",
    sub: "D3 · Bonds — Wint Wealth",
    sleeveCode: "D3",
    division: "D3_BONDS",
    holdingType: "STRATEGIC",
    name: "D3 : Wint Bonds (Individually Selected)",
    desc: "Wint Wealth senior secured bonds (20% of D · Target ₹2,00,000; 04/10/2026 Snapshot: ₹1,32,083.00)",
    catFrac: 0.20,
    refTarget40L: 200000
  },
  {
    id: "d_dyn",
    cat: "D",
    sub: "D4 · Dynamic Bond Funds",
    sleeveCode: "D4",
    division: "D4_DYNAMIC",
    holdingType: "STRATEGIC",
    name: "D4 : Nippon Dynamic Bond Fund",
    desc: "Dynamic duration bond fund (15% of D · Target ₹1,50,000; 04/10/2026 Snapshot: ₹1,18,529.00)",
    catFrac: 0.15,
    refTarget40L: 150000
  },

  // ── E1 — INDIAN EQUITY (60% of E = 30% of GRDE · ₹12,00,000 Target · ₹15,92,238.35 Present on 04/10/2026) ──
  // E1 Passive (₹6,00,000 Target)
  {
    id: "e1_p_n50",
    cat: "E",
    sub: "E1 · Indian ETF (Passive)",
    sleeveCode: "E1-P1",
    division: "E1_PASSIVE",
    holdingType: "STRATEGIC",
    name: "Nifty 50 ETF (3.75% GRDE)",
    desc: "E1 Passive Core (Target ₹1,50,000; 04/10/2026 Snapshot: ₹1,06,989.50)",
    catFrac: 0.075,
    refTarget40L: 150000
  },
  {
    id: "e1_p_nn50",
    cat: "E",
    sub: "E1 · Indian ETF (Passive)",
    sleeveCode: "E1-P2",
    division: "E1_PASSIVE",
    holdingType: "STRATEGIC",
    name: "Nifty Next 50 ETF (3.75% GRDE)",
    desc: "E1 Passive Core (Target ₹1,50,000; 04/10/2026 Snapshot: ₹1,26,054.24)",
    catFrac: 0.075,
    refTarget40L: 150000
  },
  {
    id: "e1_p_n500",
    cat: "E",
    sub: "E1 · Indian ETF (Passive)",
    sleeveCode: "E1-P3",
    division: "E1_PASSIVE",
    holdingType: "STRATEGIC",
    name: "Nifty 500 ETF (3.75% GRDE)",
    desc: "E1 Passive Broad Market (Target ₹1,50,000; 04/10/2026 Snapshot: ₹95,318.57)",
    catFrac: 0.075,
    refTarget40L: 150000
  },
  {
    id: "e1_p_hc",
    cat: "E",
    sub: "E1 · Indian ETF (Passive)",
    sleeveCode: "E1-P4",
    division: "E1_PASSIVE",
    holdingType: "STRATEGIC",
    name: "Nifty Healthcare ETF (Target 3.75% GRDE)",
    desc: "E1 Passive Healthcare ETF (Target ₹1,50,000; 04/10/2026 Snapshot: ₹20,300.04; Mirae Healthcare active fund ₹77,918.00 tracked under E1 Active — Legacy / Transition)",
    catFrac: 0.075,
    refTarget40L: 150000
  },

  // E1 Active (₹6,00,000 Strategic Core Target · ₹7,15,666.00 Core Present + ₹5,27,910.00 Legacy/Transition = ₹12,43,576.00 Total E1 Active Present)
  {
    id: "e1_a_hbaf",
    cat: "E",
    sub: "E1 · Indian Active MFs (Strategic Core)",
    sleeveCode: "E1-A1",
    division: "E1_ACTIVE",
    holdingType: "STRATEGIC",
    name: "HDFC Balanced Advantage Fund (BAF · 1.5% GRDE)",
    desc: "E1 Active Core (Target ₹60,000; 04/10/2026 Snapshot: ₹93,439.00 · Overweight by +₹33,439)",
    catFrac: 0.030,
    refTarget40L: 60000
  },
  {
    id: "e1_a_hsmc",
    cat: "E",
    sub: "E1 · Indian Active MFs (Strategic Core)",
    sleeveCode: "E1-A2",
    division: "E1_ACTIVE",
    holdingType: "STRATEGIC",
    name: "HDFC Small Cap Fund (2.25% GRDE)",
    desc: "E1 Active Core (Target ₹90,000; 04/10/2026 Snapshot: ₹1,14,390.00 · Overweight by +₹24,390)",
    catFrac: 0.045,
    refTarget40L: 90000
  },
  {
    id: "e1_a_momc",
    cat: "E",
    sub: "E1 · Indian Active MFs (Strategic Core)",
    sleeveCode: "E1-A3",
    division: "E1_ACTIVE",
    holdingType: "STRATEGIC",
    name: "Motilal Oswal Midcap Fund (3.75% GRDE)",
    desc: "E1 Active Core (Target ₹1,50,000; 04/10/2026 Snapshot: ₹1,75,476.00 · Overweight by +₹25,476)",
    catFrac: 0.075,
    refTarget40L: 150000
  },
  {
    id: "e1_a_ppfas",
    cat: "E",
    sub: "E1 · Indian Active MFs (Strategic Core)",
    sleeveCode: "E1-A4",
    division: "E1_ACTIVE",
    holdingType: "STRATEGIC",
    name: "PPFAS Flexicap Fund (7.5% GRDE)",
    desc: "E1 Active Core (Target ₹3,00,000; 04/10/2026 Snapshot: ₹3,32,361.00 · Overweight by +₹32,361)",
    catFrac: 0.150,
    refTarget40L: 300000
  },

  // E1 Active — Legacy / Transition (₹0 Strategic Target · ₹4,49,992.00 Legacy Active MFs + ₹77,918.00 Mirae Healthcare Active Transition = ₹5,27,910.00)
  {
    id: "e1_legacy_mf",
    cat: "E",
    sub: "E1 Active — Legacy / Transition",
    sleeveCode: "E1-LEG",
    division: "E1_LEGACY",
    holdingType: "LEGACY",
    name: "Indian Mutual Funds (Active) — Legacy / Exit",
    desc: "04/10/2026 Snapshot: ₹4,49,992.00 · Classified under E1 Active — Legacy / Transition; tracked for gradual, tax-conscious transition (₹0 fresh target)",
    catFrac: 0,
    refTarget40L: 0
  },
  {
    id: "e1_hc_legacy",
    cat: "E",
    sub: "E1 Active — Legacy / Transition",
    sleeveCode: "E1-A-TR",
    division: "E1_TRANSITION",
    holdingType: "TRANSITION",
    transitionTargetId: "e1_p_hc",
    name: "Mirae Healthcare Fund (E1 Active — Legacy / Transition)",
    desc: "04/10/2026 Snapshot: ₹77,918.00 · Classified under E1 Active — Legacy / Transition; transitioning gradually into Nifty Healthcare ETF (E1 Passive) subject to taxation & costs",
    catFrac: 0,
    refTarget40L: 0
  },

  // ── E2 — US EQUITY (40% of E = 20% of GRDE · ₹8,00,000 Target · ₹4,04,220.30 Present on 04/10/2026) ──
  {
    id: "e2_voo",
    cat: "E",
    sub: "E2 · US Equity Core",
    sleeveCode: "E2-1",
    division: "E2_US",
    holdingType: "STRATEGIC",
    name: "VOO (S&P 500 Core · 10% GRDE Revised)",
    desc: "Provisional Target: ₹4,00,000 (10% GRDE; was grouped with SCHD at 12%/₹4.8L on 04/10/2026 chart) · 04/10/2026 Snapshot: ₹2,16,970.50",
    catFrac: 0.20,
    refTarget40L: 400000
  },
  {
    id: "e2_qqqm",
    cat: "E",
    sub: "E2 · US Equity Growth",
    sleeveCode: "E2-2",
    division: "E2_US",
    holdingType: "STRATEGIC",
    name: "QQQM (US) (Nasdaq-100 Growth · 4% GRDE)",
    desc: "Provisional Target: ₹1,60,000 (4% GRDE) · Primary destination for fresh Nasdaq capital · 04/10/2026 Snapshot: ₹21,980.15",
    catFrac: 0.08,
    refTarget40L: 160000
  },
  {
    id: "e2_schd",
    cat: "E",
    sub: "E2 · US Dividend Equity",
    sleeveCode: "E2-3",
    division: "E2_US",
    holdingType: "STRATEGIC",
    name: "SCHD (Dividend US Equity · 3% GRDE Revised)",
    desc: "Provisional Target: ₹1,20,000 (3% GRDE; dividends earmarked for Invesco Momentum ETF) · 04/10/2026 Snapshot: ₹77,948.45",
    catFrac: 0.06,
    refTarget40L: 120000
  },
  {
    id: "e2_mom",
    cat: "E",
    sub: "E2 · US Momentum Strategy",
    sleeveCode: "E2-4",
    division: "E2_US",
    holdingType: "STRATEGIC",
    configurableTicker: true,
    name: "Invesco Momentum ETF (3% GRDE · Configurable Ticker)",
    desc: "Provisional Target: ₹1,20,000 (3% GRDE · Funded via fresh E2 capital & SCHD dividends; 04/10/2026 Snapshot: ₹0)",
    catFrac: 0.06,
    refTarget40L: 120000
  },
  {
    id: "e2_mon100",
    cat: "E",
    sub: "E2 · Transition Holding",
    sleeveCode: "E2-T1",
    division: "E2_TRANSITION",
    holdingType: "TRANSITION",
    transitionTargetId: "e2_qqqm",
    name: "MON100 (IND) — Motilal Oswal Nasdaq 100 ETF (Transition Holding)",
    desc: "04/10/2026 Snapshot: ₹87,321.20 (Carried ₹1.6L target on Oct 4 chart; reclassified as Transition Holding -> QQQM with ₹0 fresh target)",
    catFrac: 0,
    refTarget40L: 0
  }
];

/**
 * Auxiliary & Tactical Sleeves Tracked Outside the Main 10:15:25:50 GRDE Strategic Allocation
 */
export const AUXILIARY_SLEEVES = [
  {
    id: "aux_g4_fx",
    code: "G4",
    categoryLabel: "G4 · Auxiliary Travel Reserve (Outside Strategic Gold)",
    name: "G4 : USD / EUROS (Physical Foreign Currency Travel Reserve)",
    desc: "Listed as G4 : USD/EUROS on the 04/10/2026 chart (₹0 balance); classified outside strategic 10% Gold allocation.",
    classification: "AUXILIARY_RESERVE"
  },
  {
    id: "aux_nps",
    code: "NPS",
    categoryLabel: "NPS · Outside GRDE (04/10/2026 Snapshot: ₹21,850.00)",
    name: "NPS (Outside GRDE)",
    desc: "04/10/2026 Snapshot: ₹21,850.00 (GRDE + NPS = ₹38,76,004.65 on Oct 4 chart) · Tracked outside main ₹40L GRDE allocation.",
    classification: "SEPARATE_PENSION"
  },
  {
    id: "tactical_tatasilv",
    code: "TATASILV",
    categoryLabel: "Tactical Recovery & Exit Sleeve (Non-Strategic Silver)",
    name: "TATSILV (IND) — Legacy / Exit (Controlled Recovery)",
    desc: "04/10/2026 Snapshot: ₹28,394.16 (included in G present ₹3,69,832.18 on Oct 4 chart); 04/11/2026 Recovery Reference: ₹26,232.56 (1,544 units @ ₹26.70 avg cost). Not a permanent strategic Gold allocation.",
    classification: "TACTICAL_RECOVERY"
  }
];

export const CAT_META = {
  G: { label: "GOLD",          color: "var(--g-color)", hex: "#c8a84b", tag: "The Hedge · 10.0% (₹4,00,000)", icon: "ShieldAlert" },
  R: { label: "REITs & InvITs", color: "var(--r-color)", hex: "#d6604d", tag: "The Rent · 15.0% (₹6,00,000)",  icon: "Building2" },
  D: { label: "DEBT & DEFENSE", color: "var(--d-color)", hex: "#4a7fb8", tag: "The Defense · 25.0% (₹10,00,000)", icon: "Shield" },
  E: { label: "EQUITY (E1+E2)", color: "var(--e-color)", hex: "#52a86a", tag: "The Engine · 50.0% (₹20,00,000)", icon: "TrendingUp" },
};

export const CATS = ["G", "R", "D", "E"];

export const CAGR_META = {
  G: { range: "7–9%",   note: "Gold (G1–G3), 10-yr avg" },
  R: { range: "7–9%",   note: "REITs/InvITs, cashflow + growth" },
  D: { range: "6–7.5%", note: "D1–D4 defensive debt sleeves" },
  E: { range: "10–12%", note: "E1 India + E2 US blended long-run" },
};

export const G_CURVE = [
  [18, 5], [25, 7], [30, 8], [35, 8], [40, 9], [45, 10], [50, 10],
  [55, 10], [60, 12], [65, 14], [67.5, 15], [100, 15],
];

export const R_CURVE = [
  [18, 10], [25, 15], [30, 15], [35, 15], [40, 15], [45, 15], [50, 15],
  [55, 15], [60, 13], [65, 12], [70, 11], [75, 10], [80, 9],
  [85, 8], [90, 7], [95, 7], [100, 7],
];

export const D_CURVE = [
  [18, 10], [25, 13], [30, 17], [35, 20], [40, 21], [45, 25], [50, 25],
  [55, 25], [60, 32], [65, 40], [70, 45], [75, 49],
  [80, 53], [85, 54], [90, 55], [95, 56], [100, 56],
];

export const RISK_PROFILES = {
  conservative: {
    label: "Conservative",
    equityMultiplier: 0.85,
    blurb: "Reduces the age-appropriate equity weight by 15%; G/R/D retain their age glide curve."
  },
  balanced: {
    label: "Balanced",
    equityMultiplier: 1.00,
    blurb: "Uses the GRDE age glide curve exactly as designed (10 : 15 : 25 : 50 at Age Band 50–55)."
  },
  aggressive: {
    label: "Aggressive",
    equityMultiplier: 1.15,
    blurb: "Increases the age-appropriate equity weight by 15%; G/R/D retain their age glide curve."
  },
};

/**
 * Default October 2026 Consolidated Tracker State
 * Populated with the exact historical valuation figures from the
 * "GRDE Progress Chart — OCTOBER 2026 (Dated 04/10/2026)".
 */
export const DEFAULT_OCT_2026_TRACKER = {
  schemaVersion: "GRDE-OCT-2026-V5.4-SNAPSHOT-20261004",
  holderName: "Shakhith A.M.",
  totalPortfolio: 4000000.00,
  age: 52,
  riskProfile: "balanced",
  reportDate: "2026-10",
  snapshotReferenceDate: "2026-10-04",
  invescoMomentumTicker: "INVESCO-MOM (Provisional — Confirm Ticker)",
  // Configurable strategic Gold split across GoldBeES, SGBs, and Physical Gold (left configurable pending confirmation; no new split invented)
  goldSplitConfig: {
    mode: "CONFIGURABLE_PENDING_CONFIRMATION",
    g_gold_pctOfG: 85,   // Reflects 8.5% GRDE (₹3,40,000) from 04/10/2026 chart; primary recipient of fresh Gold accumulation
    g_sgb_pctOfG: 0,     // Configurable SGB % of Gold sleeve
    g_phys_pctOfG: 0,    // Configurable Physical Gold % of Gold sleeve
    gldmHistoricalOctPctOfG: 15 // 1.5% GRDE (₹60,000) on 04/10/2026 chart; now Gradual Transition Holding (0% fresh strategic target)
  },
  d1Breakdown: {
    jioBlackRockLiquid: 100921.00,
    nipponUltraShort: 101141.00
  },
  values: {
    // G — Gold (Strategic Gold Present = ₹3,41,438.02; +₹28,394.16 TATASILV on 04/10/2026 chart = ₹3,69,832.18)
    "g_gold": 300197.02,    // G1 : GOLDBEES (8.5% Oct Chart -> ₹3,40,000.00; primary fresh Gold target)
    "g_gldm": 41241.00,     // GLDM (US) (1.5% Oct Chart -> ₹60,000.00 historical; Gradual Transition Holding with ₹0 fresh target)
    "g_sgb": 0,             // G2 : SOVEREIGN GOLD BONDS (Configurable split pending confirmation)
    "g_phys": 0,            // G3 : PHY. GOLD (Configurable split pending confirmation)

    // R — REITs & InvITs (Present = ₹5,85,189.82 vs Target ₹6,00,000.00; Variance = -₹14,810.18)
    "r_mind": 109054.68,    // MINDSPACE (3% -> Target ₹1,20,000.00)
    "r_krt": 100456.74,     // KRT (3% -> Target ₹1,20,000.00)
    "r_nexus": 115759.40,   // NEXUS (3% -> Target ₹1,20,000.00)
    "r_indi": 174345.00,    // INDIGRID (ICI) (3.6% -> Target ₹1,44,000.00)
    "r_irb": 85574.00,      // IRBINV (ICI) (2.4% -> Target ₹96,000.00)
    "r_dc_legacy": 0,

    // D — Debt (Present = ₹9,02,674.00 vs Target ₹10,00,000.00; Variance = -₹97,326.00)
    "d_liq": 202062.00,     // D1 : JIO BLACKROCK (₹1,00,921.00) + NIPP ULTRA SHORT (₹1,01,141.00) vs Target ₹2,00,000.00
    "d_pomis": 450000.00,   // D2 : POMIS/FD vs Target ₹4,50,000.00
    "d_inc": 132083.00,     // D3 : WINT BONDS vs Target ₹2,00,000.00
    "d_dyn": 118529.00,     // D4 : NIPPON DYNAMIC FUND vs Target ₹1,50,000.00

    // E1 — IND (Present = ₹15,92,238.35 vs Target ₹12,00,000.00; Variance = +₹3,92,238.35)
    // E1 Passive (Present = ₹3,48,662.35 vs Target ₹6,00,000.00; Variance = -₹2,51,337.65)
    "e1_p_n50": 106989.50,  // NIFTY 50 (3.75% -> Target ₹1,50,000.00)
    "e1_p_nn50": 126054.24, // NIFTY NXT 50 (3.75% -> Target ₹1,50,000.00)
    "e1_p_n500": 95318.57,  // NIFTY 500 (3.75% -> Target ₹1,50,000.00)
    "e1_p_hc": 20300.04,    // NIFTY HEALTHCARE ETF (TARGET 3.75% -> Target ₹1,50,000.00)
    // E1 Active — Strategic Core (Present = ₹7,15,666.00 vs Target ₹6,00,000.00; Variance = +₹1,15,666.00)
    "e1_a_hbaf": 93439.00,  // HDFC BAF (1.5% -> Target ₹60,000.00)
    "e1_a_hsmc": 114390.00, // HDFC SMALLCAP (2.25% -> Target ₹90,000.00)
    "e1_a_momc": 175476.00, // MOTILAL MIDCAP (3.75% -> Target ₹1,50,000.00)
    "e1_a_ppfas": 332361.00, // PPFAS FLEXICAP (7.5% -> Target ₹3,00,000.00)
    // E1 Active — Legacy / Transition (Present = ₹5,27,910.00 vs Target ₹0; Total E1 Active Present = ₹12,43,576.00)
    "e1_legacy_mf": 449992.00, // INDIAN MUTUAL FUNDS (ACTIVE) — LEGACY / EXIT
    "e1_hc_legacy": 77918.00,  // MIRAE HEALTHCARE FUND (E1 ACTIVE — LEGACY / TRANSITION)

    // E2 — US ETF (Present = ₹4,04,220.30 vs Target ₹8,00,000.00; Variance = -₹3,95,779.70)
    "e2_voo": 216970.50,    // VOO (S&P 500) (Revised 10% Target ₹4,00,000.00; grouped with SCHD at 12%/₹4.8L on Oct 4 chart)
    "e2_qqqm": 21980.15,    // QQQM (US) (4% Target ₹1,60,000.00)
    "e2_schd": 77948.45,    // SCHD (Revised 3% Target ₹1,20,000.00; dividends -> Invesco Momentum ETF)
    "e2_mom": 0,            // Invesco Momentum ETF (Revised 3% Target ₹1,20,000.00)
    "e2_mon100": 87321.20   // MON100 (IND) (Transition Holding -> QQQM; ₹0 fresh target)
  },
  auxiliaryValues: {
    "aux_g4_fx": 0,               // G4 : USD/EUROS (Auxiliary Travel Reserve outside Strategic Gold)
    "aux_nps": 21850.00,          // NPS (OUTSIDE GRDE) — 04/10/2026 Snapshot: ₹21,850.00
    "tactical_tatasilv": 28394.16 // TATSILV (IND) — LEGACY / EXIT (04/10/2026 Snapshot: ₹28,394.16; 04/11/2026 Recovery Ref: ₹26,232.56)
  },
  customNames: {
    "g_gold": "G1 : GOLDBEES (8.5% Oct Chart · Primary Fresh Gold Target)",
    "g_gldm": "GLDM (US) (Gradual Transition Holding · Oct Chart Ref: 1.5% / ₹60,000)",
    "g_sgb": "G2 : SOVEREIGN GOLD BONDS (Configurable Split)",
    "g_phys": "G3 : PHY. GOLD (Configurable Split)",
    "r_mind": "MINDSPACE (3%)",
    "r_krt": "KRT (3%)",
    "r_nexus": "NEXUS (3%)",
    "r_indi": "INDIGRID (ICI) (3.6%)",
    "r_irb": "IRBINV (ICI) (2.4%)",
    "r_dc_legacy": "Exited Data Centre REIT",
    "d_liq": "D1 : JIO BLACKROCK (₹1,00,921) + NIPP ULTRA SHORT (₹1,01,141)",
    "d_pomis": "D2 : POMIS/FD",
    "d_inc": "D3 : WINT BONDS",
    "d_dyn": "D4 : NIPPON DYNAMIC FUND",
    "e1_p_n50": "NIFTY 50 (3.75%)",
    "e1_p_nn50": "NIFTY NXT 50 (3.75%)",
    "e1_p_n500": "NIFTY 500 (3.75%)",
    "e1_p_hc": "NIFTY HEALTHCARE ETF (TARGET 3.75%)",
    "e1_a_hbaf": "HDFC BAF (1.5%)",
    "e1_a_hsmc": "HDFC SMALLCAP (2.25%)",
    "e1_a_momc": "MOTILAL MIDCAP (3.75%)",
    "e1_a_ppfas": "PPFAS FLEXICAP (7.5%)",
    "e1_legacy_mf": "INDIAN MUTUAL FUNDS (ACTIVE) — LEGACY / EXIT",
    "e1_hc_legacy": "MIRAE HEALTHCARE FUND (E1 ACTIVE — LEGACY / TRANSITION)",
    "e2_voo": "VOO (S&P 500) (10% Revised Target / 12% Oct 4 Chart)",
    "e2_qqqm": "QQQM (US) (4%)",
    "e2_schd": "SCHD (3% Revised E2 Target · Divs -> Momentum)",
    "e2_mom": "Invesco Momentum ETF (3% Revised E2 Target · Configurable Ticker)",
    "e2_mon100": "MON100 (IND) (Transition Holding -> QQQM)"
  }
};

/**
 * Separate Immutable Dated Snapshot Records for TATASILV
 * Strictly preserves BOTH dated snapshots as independent records so neither overwrites the other:
 *   1. SNAPSHOT_2026_10_04 — Authoritative 04/10/2026 GRDE Progress Chart valuation record (₹28,394.16)
 *   2. SNAPSHOT_2026_11_04 — Authoritative 04/11/2026 Controlled Recovery & Exit reference record (₹26,232.56)
 */
export const TATASILV_DATED_SNAPSHOTS = Object.freeze({
  SNAPSHOT_2026_10_04: Object.freeze({
    recordId: "TATASILV_SNAPSHOT_2026_10_04",
    snapshotDate: "2026-10-04",
    sourceDocument: "GRDE Progress Chart — OCTOBER 2026 (Dated 04/10/2026)",
    label: "TATSILV (IND) — LEGACY / EXIT (04/10/2026 Valuation Snapshot)",
    units: 1544,
    averageCostPerUnit: 26.70,
    investedAmount: 41224.80,
    valuationAmount: 28394.16,
    impliedPricePerUnit: 18.39,
    unrealisedLoss: -12830.64,
    chartTarget: 0,
    roleInOct04Chart: "Included in 04/10/2026 Chart G Subtotal (₹3,69,832.18) and Chart Grand Total (₹38,54,154.65); excluded from revised Strategic Gold (₹3,41,438.02)"
  }),
  SNAPSHOT_2026_11_04: Object.freeze({
    recordId: "TATASILV_SNAPSHOT_2026_11_04",
    snapshotDate: "2026-11-04",
    sourceDocument: "GRDE Controlled Recovery & Exit Reference (Dated 04/11/2026)",
    label: "TATASILV (Tata Silver ETF) — 04/11/2026 Recovery Reference",
    units: 1544,
    averageCostPerUnit: 26.70,
    investedAmount: 41224.80,
    valuationAmount: 26232.56,
    impliedPricePerUnit: 16.99,
    unrealisedLoss: -14992.24,
    additionalCapitalCeiling: 10000.00,
    monthlyReserveTarget: 2500.00,
    roleInRecoveryPlan: "Baseline for Controlled Recovery & Exit Calculator; recovery proceeds redirected to GoldBeES (G1)"
  })
});

/**
 * TATASILV — Controlled Recovery & Exit Reference Snapshot (Calculator Config + Link to Both Dated Records)
 */
export const TATASILV_REFERENCE_SNAPSHOT = {
  asOfDate: "2026-11-04",
  october04SnapshotDate: "2026-10-04",
  october04SnapshotValue: 28394.16,
  october04IndicativePrice: 18.39, // 28394.16 / 1544 = 18.3900
  datedSnapshots: TATASILV_DATED_SNAPSHOTS,
  instrument: "TATASILV (Tata Silver ETF)",
  classification: "Tactical / Legacy Silver Recovery & Exit (Non-Strategic — Outside G)",
  exitObjective: "Recover sensibly and redirect proceeds to GoldBeES (G1)",
  units: 1544,
  averageCost: 26.70,
  investedAmount: 41224.80,
  indicativeMarketValue: 26232.56,
  indicativeMarketPrice: 16.99, // 26232.56 / 1544 = 16.9900
  unrealisedLoss: -14992.24,
  additionalCapitalCeiling: 10000,
  monthlyReserveTarget: 2500,
  fundingSource: "Separate Tactical Reserve (Strictly Outside ₹64,000 Regular GRDE SIP)",
  initialLots: [
    {
      lotId: "LOT-ORIG-01",
      purchaseDate: "2026-04-15",
      lotType: "Original Legacy Position",
      units: 1000,
      pricePerUnit: 27.10,
      amount: 27100.00,
      taxHoldingRule: "FIFO Lot #1 · Track 12-month listed ETF LTCG threshold",
      notes: "Initial silver tranche prior to October 2026 Gold-only strategic consolidation"
    },
    {
      lotId: "LOT-ORIG-02",
      purchaseDate: "2026-06-18",
      lotType: "Original Legacy Position",
      units: 544,
      pricePerUnit: 25.9647,
      amount: 14124.80,
      taxHoldingRule: "FIFO Lot #2 · Track 12-month listed ETF LTCG threshold",
      notes: "Secondary silver tranche bringing total to 1,544 units @ ₹26.70 avg cost"
    }
  ],
  dipTriggers: [
    { id: "TRIG-1", label: "Tranche 1 · -5% Dip Trigger", triggerPrice: 16.14, plannedAmount: 2500, status: "ARMED — MANUAL REVIEW" },
    { id: "TRIG-2", label: "Tranche 2 · -10% Dip Trigger", triggerPrice: 15.29, plannedAmount: 2500, status: "STANDBY" },
    { id: "TRIG-3", label: "Tranche 3 · -15% Deep Dislocation", triggerPrice: 14.44, plannedAmount: 2500, status: "STANDBY" },
    { id: "TRIG-4", label: "Tranche 4 · Final Reserve Tranche", triggerPrice: 13.59, plannedAmount: 2500, status: "STANDBY" }
  ]
};

/**
 * SIP Planner & Deployment Discipline Reference (₹64,000/month · 4 × ₹16,000 weekly cycles)
 */
export const DEFAULT_SIP_PLANNER_STATE = {
  schemaVersion: "GRDE-SIP-OCT2026-V1",
  monthlySipBudget: 64000,
  weeklyCycleAmount: 16000,
  plannedCyclesCount: 4,
  enableFifthWeekFlexibility: false,
  mandatoryFinalWeekDeployment: true,
  activeMonth: "2026-11",
  separatePools: {
    regularGrdeSip: 64000,
    tacticalRecoveryCapital: 2500,
    dividendsReceived: 1850,
    reinvestmentAmounts: 1850,
    unallocatedCash: 0
  },
  weeklyCycles: [
    {
      weekNo: 1,
      label: "Week 1 Deployment Cycle",
      plannedBase: 16000,
      dipTriggerCondition: "Standard Weekly Core / Nifty -1.0% Dip",
      dipTriggered: true,
      deployedAmount: 16000,
      status: "DEPLOYED",
      notes: "Core E2 (VOO / QQQM) & E1 Passive (Nifty 50 / Next 50 / Nifty 500)"
    },
    {
      weekNo: 2,
      label: "Week 2 Deployment Cycle",
      plannedBase: 16000,
      dipTriggerCondition: "Dip-Based Trigger (-1.5% Index Pullback or Scheduled Tranche)",
      dipTriggered: false,
      deployedAmount: 10000,
      status: "PARTIAL_CARRY_FORWARD",
      notes: "₹6,000 unspent monthly SIP carried forward to Week 3"
    },
    {
      weekNo: 3,
      label: "Week 3 Deployment Cycle",
      plannedBase: 16000,
      dipTriggerCondition: "Dip-Based Trigger (-2.0% Pullback) + Carry-Forward Pool",
      dipTriggered: false,
      deployedAmount: 16000,
      status: "PARTIAL_CARRY_FORWARD",
      notes: "Base ₹16,000 deployed into D3/D4 & E2; ₹6,000 carry-forward retained for Week 4"
    },
    {
      weekNo: 4,
      label: "Week 4 Mandatory Final-Week Deployment",
      plannedBase: 16000,
      dipTriggerCondition: "Mandatory Final-Week Sweep (Deploy all remaining monthly SIP if dip triggers did not occur)",
      dipTriggered: true,
      deployedAmount: 22000,
      status: "MANDATORY_SWEEP_READY",
      notes: "Deploys ₹16,000 Week 4 base + ₹6,000 carried-forward unspent SIP so 100% of ₹64,000 is deployed within the month"
    },
    {
      weekNo: 5,
      label: "Week 5 Optional Five-Thursday Flexibility",
      plannedBase: 0,
      dipTriggerCondition: "Optional 5th-Week Buffer (For 5-week calendar months or dividend reinvestment sweep)",
      dipTriggered: false,
      deployedAmount: 0,
      status: "OPTIONAL_STANDBY",
      notes: "Used when calendar month has 5 deployment weeks or for routing SCHD dividends to Invesco Momentum ETF"
    }
  ],
  sleeveDistributionPct: {
    "e2_us": 45,       // Prioritizes E2 US Equity (-₹3,95,779.70 shortfall on 04/10/2026 chart: VOO, QQQM, SCHD, Invesco Momentum)
    "e1_passive": 25,  // E1 Passive ETFs (Nifty 50, Nifty Next 50, Nifty 500, Healthcare ETF)
    "d_debt": 15,      // D3 Wint Bonds (-₹67,917) & D4 Nippon Dynamic Bond (-₹31,471)
    "g_gold": 10,      // G1 GoldBeES (-₹39,802.98 shortfall)
    "r_reits": 5,      // Mindspace, KRT, Nexus, IRB InvIT (-₹14,810.18 net R shortfall)
    "e1_active": 0     // 0% fresh SIP needed in E1 Active (already above ₹6,00,000 target on 04/10/2026 chart)
  }
};

/**
 * Pre-populated Podcast Journal / Idea Observatory Entries
 */
export const DEFAULT_PODCAST_JOURNAL_ENTRIES = [
  {
    id: "PJ-2026-10-28",
    title: "The Beaver Dam Portfolio: Engineering Multi-Asset Resilience at Age 50–55",
    speaker: "Shakhith A.M. · GRDE Architecture Series",
    date: "2026-10-28",
    rating: 5,
    category: "Portfolio Architecture",
    keyLessons: "A 10:15:25:50 allocation across Gold, REITs/InvITs, Debt, and Equity creates a 50% Income Stability Ratio (ISR) shield while allowing the 50% Equity engine (E1 India + E2 US) to compound uninterrupted across market cycles.",
    grdeRelevance: "Directly anchors the 04/10/2026 GRDE Progress Chart at ₹40 Lakh: G (₹4L), R (₹6L), D (₹10L across D1–D4), and E (₹20L split into ₹12L E1 and ₹8L E2).",
    actionableIdeas: "Maintain strict separation between strategic G1–G3 Gold (₹4L target) and auxiliary reserves (G4 Foreign Currency travel reserve, NPS Tier I at ₹21,850, and tactical TATASILV recovery)."
  },
  {
    id: "PJ-2026-10-21",
    title: "Passive Core Meets High-Conviction Active: Structuring Indian Equity (E1)",
    speaker: "GRDE Research Observatory · Episode #14",
    date: "2026-10-21",
    rating: 5,
    category: "E1 — Indian Equity",
    keyLessons: "Splitting Indian Equity 50:50 between low-cost Passive index building blocks (Nifty 50, Nifty Next 50, Nifty 500, Healthcare ETF) and 4 high-conviction Active managers (PPFAS Flexicap, Motilal Oswal Midcap, HDFC Small Cap, HDFC BAF) eliminates closet indexing.",
    grdeRelevance: "On the 04/10/2026 snapshot, the 4 strategic active funds already total ₹7,15,666 (above their ₹6,00,000 target) plus ₹4,49,992 in Legacy Active MFs, whereas E1 Passive is at ₹3,48,662.35 (+₹77,918 Mirae transition) vs ₹6,00,000 target.",
    actionableIdeas: "Pause fresh SIPs into overweight E1 Active funds; direct Indian Equity deployments into E1 Passive ETFs and transition Legacy Active MFs (₹4,49,992) gradually in a tax-conscious manner."
  },
  {
    id: "PJ-2026-10-14",
    title: "Global Dollar Compounding & Dividend Flywheels in E2 US Equity",
    speaker: "Global Macro & Factor Roundtable · Episode #11",
    date: "2026-10-14",
    rating: 5,
    category: "E2 — US Equity",
    keyLessons: "Cash-flow-generating US dividend equities (SCHD) belong in the Equity growth bucket rather than fixed income, while Nasdaq-100 exposure should avoid domestic ETF iNAV premium distortions.",
    grdeRelevance: "In the 04/10/2026 snapshot, E2 stands at ₹4,04,220.30 against the ₹8,00,000 target (-₹3,95,779.70 shortfall) — making E2 (VOO ₹4.0L, QQQM ₹1.6L, SCHD ₹1.2L, Invesco Momentum ₹1.2L) the #1 priority for fresh capital.",
    actionableIdeas: "Treat MON100 (₹87,321.20) as a Transition Holding; route fresh Nasdaq capital to QQQM (₹21,980.15 -> ₹1,60,000) and reinvest SCHD dividends into Invesco Momentum ETF."
  },
  {
    id: "PJ-2026-10-07",
    title: "Weekly SIP Deployment Discipline & Controlled Tactical Recovery",
    speaker: "Behavioral Finance & Execution Notes · Episode #09",
    date: "2026-10-07",
    rating: 4,
    category: "SIP & Tactical Discipline",
    keyLessons: "Splitting a ₹64,000 monthly SIP into four ₹16,000 weekly cycles allows capturing intra-month volatility via dip triggers while guaranteeing 100% monthly capital deployment through a mandatory Week 4 sweep.",
    grdeRelevance: "Prevents cash drag in the ₹64,000/month GRDE SIP while ring-fencing the TATASILV recovery plan (₹28,394.16 on 04/10/2026 -> ₹26,232.56 on 04/11/2026; ₹2,500/month reserve, ₹10,000 ceiling).",
    actionableIdeas: "Track every TATASILV purchase lot by date for FIFO tax compliance and redirect recovery exit proceeds into GoldBeES (G1)."
  }
];

export const SHEET_ID = "2PACX-1vRpKhD5egQ1nOY2PteSvLGT10cde2GNZWKYOkP2fUiE_ZfEs1xajzJ84MiKyKzDj1jTNB8wa1U5S7Dc";
export const ALERTS_URL = `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?gid=1153377084&single=true&output=csv`;
export const CALENDAR_URL = `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?gid=674599408&single=true&output=csv`;
