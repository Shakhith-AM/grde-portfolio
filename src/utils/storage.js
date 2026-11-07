import { DEFAULT_OCT_2026_TRACKER } from '../constants/masterData.js';

export const STORAGE_KEYS = {
  TRACKER: "grde_tracker_v3",
  TRACKER_BACKUP_PRE_OCT2026: "grde_tracker_v3_backup_pre_oct2026",
  SIP_PLANNER: "grde_sip_planner_v1",
  TATASILV_RECOVERY: "grde_tatasilv_recovery_v1",
  PODCAST_JOURNAL: "grde_podcast_journal_v1",
  UNLOCK: "grde_unlocked_v4",
  LEGACY_UNLOCK: "grde_unlocked_v3",
  ISSUED_CODES: "grde_issued_codes_v1",
  FIRE_GOALS: "grde_fire_goals_v1",
  ONBOARDED: "grde_onboarded_v1",
  CCY: "grde_ccy_v1",
  DEV_RESEARCH_MODE: "grde_dev_research_mode",
};

export const GRDE_STORAGE = {
  get(key, fallback = null) {
    try {
      if (typeof localStorage === 'undefined') return fallback;
      const item = localStorage.getItem(key);
      return item !== null ? item : fallback;
    } catch (e) {
      console.warn(`[GRDE Storage] Failed to read ${key}:`, e);
      return fallback;
    }
  },
  
  getJSON(key, fallback = null) {
    try {
      if (typeof localStorage === 'undefined') return fallback;
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      console.warn(`[GRDE Storage] Failed to parse JSON for ${key}:`, e);
      return fallback;
    }
  },
  
  set(key, value) {
    try {
      if (typeof localStorage === 'undefined') return false;
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn(`[GRDE Storage] Failed to set ${key}:`, e);
      return false;
    }
  },
  
  remove(key) {
    try {
      if (typeof localStorage === 'undefined') return false;
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn(`[GRDE Storage] Failed to remove ${key}:`, e);
      return false;
    }
  }
};

/**
 * Safe, non-destructive migration to the October 2026 Consolidated Snapshot (`04/10/2026`).
 *
 * - Preserves a full backup of any prior record in `grde_tracker_v3_backup_pre_oct2026`.
 * - If the saved record was the unmodified July 2026 default (`3872833.00`, `reportDate: "2026-07"`, `g_gold: 366659.93`)
 *   or our earlier interim v5.4 default before the 04/10/2026 Progress Chart was provided, upgrades it to the
 *   authoritative 04/10/2026 GRDE Progress Chart snapshot while keeping the July 2026 backup intact in localStorage.
 * - If the user has custom-entered v5.3 values, maps them non-destructively into the October 2026 sleeves.
 */
export function migrateTrackerToOct2026(rawTracker) {
  if (!rawTracker || typeof rawTracker !== "object") {
    return JSON.parse(JSON.stringify(DEFAULT_OCT_2026_TRACKER));
  }

  // Already on the authoritative 04/10/2026 snapshot schema
  if (rawTracker.schemaVersion === "GRDE-OCT-2026-V5.4-SNAPSHOT-20261004") {
    return {
      ...DEFAULT_OCT_2026_TRACKER,
      ...rawTracker,
      values: { ...DEFAULT_OCT_2026_TRACKER.values, ...(rawTracker.values || {}) },
      auxiliaryValues: { ...DEFAULT_OCT_2026_TRACKER.auxiliaryValues, ...(rawTracker.auxiliaryValues || {}) },
      customNames: { ...DEFAULT_OCT_2026_TRACKER.customNames, ...(rawTracker.customNames || {}) }
    };
  }

  // Backup legacy record before migration
  try {
    const existingBackup = GRDE_STORAGE.get(STORAGE_KEYS.TRACKER_BACKUP_PRE_OCT2026);
    if (!existingBackup) {
      GRDE_STORAGE.set(STORAGE_KEYS.TRACKER_BACKUP_PRE_OCT2026, rawTracker);
    }
  } catch (e) {}

  const oldVals = rawTracker.values || {};

  // Detect if the saved record is the stock July 2026 default (`g_gold: 366659.93`, `e_mf: 1277399.36`)
  const isUnmodifiedJuly2026Default =
    Number(oldVals.g_gold) === 366659.93 &&
    Number(oldVals.r_mind) === 112862.28 &&
    (Number(oldVals.e_mf) === 1277399.36 || Number(oldVals.e1_legacy_mf) === 677399.36) &&
    !rawTracker.isCustomUserEntry;

  if (isUnmodifiedJuly2026Default) {
    return {
      ...JSON.parse(JSON.stringify(DEFAULT_OCT_2026_TRACKER)),
      holderName: rawTracker.holderName || DEFAULT_OCT_2026_TRACKER.holderName,
      migratedFromJuly2026BaselineAt: new Date().toISOString()
    };
  }

  // Custom user-entered v5.3 data migration (preserves exact custom user numbers)
  const d1Combined = (Number(oldVals.d_liq) || 0) + (Number(oldVals.d_ult) || 0);
  const d2Combined = (Number(oldVals.d_pomis) || 0) + (Number(oldVals.d_fd) || 0);
  const d3Bonds = Number(oldVals.d_inc) || 0;

  const oldEtfin = Number(oldVals.e_etfin) || 0;
  const n50Val = oldEtfin > 0 ? Number((oldEtfin * 0.45).toFixed(2)) : (Number(oldVals.e1_p_n50) || 0);
  const nn50Val = oldEtfin > 0 ? Number((oldEtfin - n50Val).toFixed(2)) : (Number(oldVals.e1_p_nn50) || 0);

  const oldMf = Number(oldVals.e_mf) || 0;
  let hbaf = Number(oldVals.e1_a_hbaf) || 0;
  let hsmc = Number(oldVals.e1_a_hsmc) || 0;
  let momc = Number(oldVals.e1_a_momc) || 0;
  let ppfas = Number(oldVals.e1_a_ppfas) || 0;
  let legacyMf = Number(oldVals.e1_legacy_mf) || 0;

  if (oldMf > 0) {
    if (oldMf >= 600000) {
      hbaf = 60000;
      hsmc = 90000;
      momc = 150000;
      ppfas = 300000;
      legacyMf = Number((oldMf - 600000).toFixed(2));
    } else {
      ppfas = Number((oldMf * 0.50).toFixed(2));
      momc = Number((oldMf * 0.25).toFixed(2));
      hsmc = Number((oldMf * 0.15).toFixed(2));
      hbaf = Number((oldMf - ppfas - momc - hsmc).toFixed(2));
    }
  }

  const oldEtfus = Number(oldVals.e_etfus) || 0;
  let vooVal = Number(oldVals.e2_voo) || 0;
  let schdVal = Number(oldVals.e2_schd) || 0;
  let mon100Val = Number(oldVals.e2_mon100) || 0;
  let qqqmVal = Number(oldVals.e2_qqqm) || 0;

  if (oldEtfus > 0) {
    vooVal = Number((oldEtfus * 0.60).toFixed(2));
    mon100Val = Number((oldEtfus * 0.25).toFixed(2));
    schdVal = Number((oldEtfus - vooVal - mon100Val).toFixed(2));
  }

  const migratedValues = {
    "g_gold": Number(oldVals.g_gold) || 0,
    "g_gldm": Number(oldVals.g_gldm) || 0,
    "g_sgb": Number(oldVals.g_sgb) || 0,
    "g_phys": Number(oldVals.g_phys) || 0,

    "r_mind": Number(oldVals.r_mind) || 0,
    "r_krt": Number(oldVals.r_krt) || 0,
    "r_nexus": Number(oldVals.r_nexus) || 0,
    "r_indi": Number(oldVals.r_indi) || 0,
    "r_irb": Number(oldVals.r_irb) || 0,
    "r_dc_legacy": Number(oldVals.r_dc) || Number(oldVals.r_dc_legacy) || 0,

    "d_liq": d1Combined,
    "d_pomis": d2Combined,
    "d_inc": d3Bonds,
    "d_dyn": Number(oldVals.d_dyn) || 0,

    "e1_p_n50": n50Val,
    "e1_p_nn50": nn50Val,
    "e1_p_n500": Number(oldVals.e1_p_n500) || 0,
    "e1_p_hc": Number(oldVals.e1_p_hc) || 0,
    "e1_hc_legacy": Number(oldVals.e_hc) || Number(oldVals.e1_hc_legacy) || 0,

    "e1_a_hbaf": hbaf,
    "e1_a_hsmc": hsmc,
    "e1_a_momc": momc,
    "e1_a_ppfas": ppfas,
    "e1_legacy_mf": legacyMf,

    "e2_voo": vooVal,
    "e2_qqqm": qqqmVal,
    "e2_schd": schdVal,
    "e2_mom": Number(oldVals.e2_mom) || 0,
    "e2_mon100": mon100Val
  };

  const migratedAux = {
    "aux_g4_fx": Number(rawTracker?.auxiliaryValues?.aux_g4_fx) || 0,
    "aux_nps": Number(oldVals.d_nps) || Number(rawTracker?.auxiliaryValues?.aux_nps) || 21850,
    "tactical_tatasilv": Number(oldVals.g_silver) || Number(rawTracker?.auxiliaryValues?.tactical_tatasilv) || 28394.16
  };

  const migratedAge = (!rawTracker.age || rawTracker.age === 45 || rawTracker.age === 35) ? 52 : Number(rawTracker.age);
  const migratedTotal = (!rawTracker.totalPortfolio || Number(rawTracker.totalPortfolio) === 3872833)
    ? 4000000
    : Number(rawTracker.totalPortfolio);

  return {
    schemaVersion: "GRDE-OCT-2026-V5.4-SNAPSHOT-20261004",
    holderName: rawTracker.holderName || DEFAULT_OCT_2026_TRACKER.holderName,
    totalPortfolio: migratedTotal,
    age: migratedAge,
    riskProfile: rawTracker.riskProfile || "balanced",
    reportDate: "2026-10",
    snapshotReferenceDate: "2026-10-04",
    invescoMomentumTicker: rawTracker.invescoMomentumTicker || DEFAULT_OCT_2026_TRACKER.invescoMomentumTicker,
    values: migratedValues,
    auxiliaryValues: migratedAux,
    customNames: {
      ...DEFAULT_OCT_2026_TRACKER.customNames
    },
    migratedFromLegacyAt: new Date().toISOString()
  };
}

/**
 * Sanitizes persisted TATASILV recovery state so that simulated/test entries
 * (such as the 155-unit @ ₹16.14 dated 2026-11-12 demonstration scenario)
 * are never stored or displayed as actual holdings or FIFO transactions.
 */
export function sanitizeTataSilvRecoveryState(rawState, referenceSnapshot) {
  const defaultState = {
    schemaVersion: "GRDE-TATASILV-V2-VERIFIED-LOTS-ONLY",
    indicativeMarketPrice: referenceSnapshot?.indicativeMarketPrice ?? 16.99,
    targetExitMarginPct: 2.0,
    monthlyReserveBudget: referenceSnapshot?.monthlyReserveTarget ?? 2500,
    additionalCapitalCeiling: referenceSnapshot?.additionalCapitalCeiling ?? 10000,
    additionalLots: []
  };

  if (!rawState || typeof rawState !== "object") {
    return defaultState;
  }

  const rawLots = Array.isArray(rawState.additionalLots) ? rawState.additionalLots : [];

  // Filter out any unconfirmed simulation/test entries (specifically 155 units @ ₹16.14 / 2026-11-12 or any lot without explicit confirmation)
  const verifiedActualLots = rawLots.filter((lot) => {
    if (!lot || typeof lot !== "object") return false;
    const isSimulatedDemoLot =
      lot.purchaseDate === "2026-11-12" ||
      (Number(lot.units) === 155 && Math.abs(Number(lot.pricePerUnit) - 16.14) < 0.01);
    if (isSimulatedDemoLot) return false;
    return lot.confirmedActualTransaction === true;
  });

  return {
    ...defaultState,
    indicativeMarketPrice: Number(rawState.indicativeMarketPrice) || defaultState.indicativeMarketPrice,
    targetExitMarginPct: Number(rawState.targetExitMarginPct) ?? defaultState.targetExitMarginPct,
    monthlyReserveBudget: Number(rawState.monthlyReserveBudget) || defaultState.monthlyReserveBudget,
    additionalCapitalCeiling: Number(rawState.additionalCapitalCeiling) || defaultState.additionalCapitalCeiling,
    additionalLots: verifiedActualLots
  };
}
