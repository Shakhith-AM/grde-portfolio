export const GRDE_VERSION = '5.3.0';

export const AGE_BANDS = [
  { range: "18-25" },
  { range: "25-30" }, { range: "30-35" }, { range: "35-40" },
  { range: "40-45" }, { range: "45-50" }, { range: "50-55" },
  { range: "55-60" }, { range: "60-65" }, { range: "65-70" },
  { range: "70-75" }, { range: "75-80" }, { range: "80-85" },
  { range: "85-90" }, { range: "90-95" }, { range: "95-100" }
];

export const ASSET_TEMPLATE = [
  // ── G (Gold & Silver = ~10%) ──
  { id: "g_gold",   cat: "G", sub: "Gold",                name: "Gold ETFs",            desc: "Physical gold-backed ETFs",    catFrac: 0.90 },
  { id: "g_silver", cat: "G", sub: "Silver",              name: "Silver ETFs",          desc: "Silver-backed ETFs",           catFrac: 0.10 },

  // ── R (Real Estate = ~15%) ──
  { id: "r_mind",   cat: "R", sub: "REITs · Office",      name: "Mindspace REIT",       desc: "Office (25% of REIT bucket)",  catFrac: 0.60 * 0.25  },
  { id: "r_krt",    cat: "R", sub: "REITs · Office",      name: "KRT REIT",             desc: "Office (25% of REIT bucket)",  catFrac: 0.60 * 0.25  },
  { id: "r_nexus",  cat: "R", sub: "REITs · Retail",      name: "Nexus REIT",           desc: "Retail / malls (22.5%)",       catFrac: 0.60 * 0.225 },
  { id: "r_dc",     cat: "R", sub: "REITs · Data Centre", name: "Data Centre REITs",    desc: "Data-centre REITs (27.5%)",    catFrac: 0.60 * 0.275 },
  { id: "r_indi",   cat: "R", sub: "InvITs",              name: "IndiGrid InvIT",       desc: "Power transmission",           catFrac: 0.40 * 0.70  },
  { id: "r_irb",    cat: "R", sub: "InvITs",              name: "IRB InvIT",            desc: "Roads / highways",             catFrac: 0.40 * 0.30  },

  // ── D (Debt = ~25%) ──
  { id: "d_liq",    cat: "D", sub: "Liquidity",           name: "Liquid Funds",               desc: "Liquid mutual funds — instant redemption",              catFrac: 0.25 },
  { id: "d_ult",    cat: "D", sub: "Liquidity",           name: "Ultra Short Duration",       desc: "Ultra short duration funds — 3 to 6 month horizon",     catFrac: 0.20 },
  { id: "d_fd",     cat: "D", sub: "Capital Protection",  name: "Fixed Deposits",             desc: "Bank fixed deposits — locked, guaranteed return",        catFrac: 0.15 },
  { id: "d_pomis",  cat: "D", sub: "Capital Protection",  name: "POMIS / Income Instruments", desc: "Post Office MIS / income instruments — monthly income",  catFrac: 0.15 },
  { id: "d_inc",    cat: "D", sub: "Income / Duration",   name: "Bonds",                      desc: "Bonds / target maturity / WINT — duration play",        catFrac: 0.15 },
  { id: "d_nps",    cat: "D", sub: "Pension",             name: "NPS Tier I",                 desc: "National Pension System — Active Choice (50E/20C/30G)", catFrac: 0.10 },

  // ── E (Equity = ~50%) ──
  { id: "e_mf",     cat: "E", sub: "Indian Equity",       name: "Indian Mutual Funds",  desc: "Domestic equity MFs (60% × 50%)",  catFrac: 0.60 * 0.50 },
  { id: "e_etfin",  cat: "E", sub: "Indian Equity",       name: "Indian ETFs",          desc: "Domestic equity ETFs (60% × 50%)", catFrac: 0.60 * 0.50 },
  { id: "e_etfus",  cat: "E", sub: "US Equity",           name: "US ETFs",              desc: "International equity (35%)",       catFrac: 0.35 },
  { id: "e_hc",     cat: "E", sub: "Healthcare",          name: "Mirae Asset Healthcare Fund", desc: "Sector fund — healthcare (5%)", catFrac: 0.05 },
];

export const CAT_META = {
  G: { label: "GOLD & SILVER", color: "var(--g-color)", hex: "#c8a84b", tag: "The Hedge", icon: "ShieldAlert" },
  R: { label: "REAL ESTATE",   color: "var(--r-color)", hex: "#d6604d", tag: "The Rent",  icon: "Building2" },
  D: { label: "DEBT",          color: "var(--d-color)", hex: "#4a7fb8", tag: "The Defense", icon: "Shield" },
  E: { label: "EQUITY",        color: "var(--e-color)", hex: "#52a86a", tag: "The Engine", icon: "TrendingUp" },
};

export const CATS = ["G", "R", "D", "E"];

export const CAGR_META = {
  G: { range: "7–9%",   note: "Gold, 10-yr avg" },
  R: { range: "7–9%",   note: "REITs/InvITs, since listing" },
  D: { range: "6–7.5%", note: "Debt instruments, long-run" },
  E: { range: "10–12%", note: "Indian equity, long-run" },
};

export const G_CURVE = [
  [18, 5], [25, 7], [30, 8], [35, 8], [40, 9], [45, 10], [50, 10],
  [55, 10], [60, 12], [65, 14], [67.5, 15], [100, 15],
];

export const R_CURVE = [
  [18, 10], [25, 15], [30, 15], [35, 15], [40, 15], [45, 15], [50, 15],
  [55, 14], [60, 13], [65, 12], [70, 11], [75, 10], [80, 9],
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
    blurb: "Uses the GRDE age glide curve exactly as designed."
  },
  aggressive: {
    label: "Aggressive",
    equityMultiplier: 1.15,
    blurb: "Increases the age-appropriate equity weight by 15%; G/R/D retain their age glide curve."
  },
};

export const OWNER_CODE = "I3D-SHAKHITH-2026";
export const OWNER_UPI = "interactive.dimensions0007@uboi";
export const OWNER_PHONE = "919363113693";
export const MONTHLY_AMT = 299;
export const ANNUAL_AMT = 2499;

export const SHEET_ID = "2PACX-1vRpKhD5egQ1nOY2PteSvLGT10cde2GNZWKYOkP2fUiE_ZfEs1xajzJ84MiKyKzDj1jTNB8wa1U5S7Dc";
export const ALERTS_URL = `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?gid=1153377084&single=true&output=csv`;
export const CALENDAR_URL = `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?gid=674599408&single=true&output=csv`;
