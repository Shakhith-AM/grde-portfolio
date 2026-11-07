import { G_CURVE, R_CURVE, D_CURVE, RISK_PROFILES, CATS, ASSET_TEMPLATE, AUXILIARY_SLEEVES } from '../constants/masterData.js';

export const round1 = (v) => Math.round(v * 10) / 10;
export const round2 = (v) => Math.round(v * 100) / 100;

export function interpolateCurve(curve, age) {
  const lo = curve[0][0];
  const hi = curve[curve.length - 1][0];
  const a = Math.max(lo, Math.min(hi, age));
  if (a <= lo) return curve[0][1];
  for (let i = 0; i < curve.length - 1; i++) {
    const [a0, v0] = curve[i];
    const [a1, v1] = curve[i + 1];
    if (a >= a0 && a <= a1) {
      return v0 + ((a - a0) / (a1 - a0)) * (v1 - v0);
    }
  }
  return curve[curve.length - 1][1];
}

export const interpolateG = (age) => interpolateCurve(G_CURVE, age);
export const interpolateR = (age) => interpolateCurve(R_CURVE, age);
export const interpolateD = (age) => interpolateCurve(D_CURVE, age);

export function getBand(age) {
  const a = Number(age) || 18;
  if (a < 25) return "18-25";
  if (a >= 100) return "95-100";
  const lo = Math.floor(a / 5) * 5;
  return `${lo}-${lo + 5}`;
}

export function getBaseAllocation(age) {
  const a = Math.max(18, Math.min(100, Number(age) || 18));
  const G = round1(interpolateG(a));
  const R = round1(interpolateR(a));
  const D = round1(interpolateD(a));
  const E = round1(100 - G - R - D);
  return { age: a, range: getBand(a), G, R, D, E };
}

export function getAllocation(age, riskProfile = "balanced") {
  const base = getBaseAllocation(age);
  const mult = RISK_PROFILES[riskProfile]?.equityMultiplier ?? 1;
  const targetE = Math.max(0, Math.min(100, base.E * mult));
  const delta = targetE - base.E;
  const stableTotal = base.G + base.R + base.D;
  const stableFactor = stableTotal > 0 ? (stableTotal - delta) / stableTotal : 1;
  
  const G = round1(base.G * stableFactor);
  const R = round1(base.R * stableFactor);
  const D = round1(base.D * stableFactor);
  const E = round1(100 - G - R - D);
  return { age: base.age, range: base.range, G, R, D, E };
}

/**
 * Calculates complete live portfolio data based on tracker store and user settings
 * Clearly distinguishes:
 * - Strategic Target
 * - Actual Holding
 * - Legacy / Transition Holding
 * - Target Shortfall / Excess
 * - Fresh Deployment Recommendation
 * - Auxiliary / Non-Strategic Holdings (G4 Foreign Currency, NPS Tier I, Tactical TATASILV)
 */
export function computePortfolioState(storedTracker, age = 52, riskProfile = "balanced") {
  const alloc = getAllocation(age, riskProfile);
  const values = storedTracker?.values || {};
  const auxiliaryValues = storedTracker?.auxiliaryValues || {};
  const customNames = storedTracker?.customNames || {};
  const invescoMomentumTicker = storedTracker?.invescoMomentumTicker || "INVESCO-MOM (Provisional)";
  const explicitTotal = Number(storedTracker?.totalPortfolio) || 0;

  const goldSplitConfig = storedTracker?.goldSplitConfig || {
    mode: "CONFIGURABLE_PENDING_CONFIRMATION",
    g_gold_pctOfG: 85,
    g_sgb_pctOfG: 0,
    g_phys_pctOfG: 0,
    gldmHistoricalOctPctOfG: 15
  };

  const rawCurrent = ASSET_TEMPLATE.map(a => Number(values[a.id]) || 0);
  const sumActual = rawCurrent.reduce((s, v) => s + v, 0);
  const effectiveTotal = explicitTotal > 0 ? explicitTotal : (sumActual > 0 ? sumActual : 4000000);

  const assets = ASSET_TEMPLATE.map((a, i) => {
    let effectiveCatFrac = a.catFrac;
    if (a.id === "g_gold" && goldSplitConfig?.g_gold_pctOfG !== undefined) {
      effectiveCatFrac = Number(goldSplitConfig.g_gold_pctOfG) / 100;
    } else if (a.id === "g_sgb" && goldSplitConfig?.g_sgb_pctOfG !== undefined) {
      effectiveCatFrac = Number(goldSplitConfig.g_sgb_pctOfG) / 100;
    } else if (a.id === "g_phys" && goldSplitConfig?.g_phys_pctOfG !== undefined) {
      effectiveCatFrac = Number(goldSplitConfig.g_phys_pctOfG) / 100;
    }

    const finalPct = round2(alloc[a.cat] * effectiveCatFrac);
    const targetVal = round2(effectiveTotal * finalPct / 100);
    const historicalOct2026Pct = a.historicalOct2026CatFrac !== undefined
      ? round2(alloc[a.cat] * a.historicalOct2026CatFrac)
      : finalPct;
    const historicalOct2026TargetVal = a.historicalOct2026Target40L !== undefined
      ? round2(effectiveTotal * historicalOct2026Pct / 100)
      : targetVal;

    const currentVal = rawCurrent[i];
    const variance = round2(currentVal - targetVal);
    // Keep G2 SGB and G3 Physical Gold as strategic configurable sleeves (even when 0% pending confirmation), while GLDM is a Transition Holding
    const isLegacyOrTransition = a.holdingType === "LEGACY" || a.holdingType === "TRANSITION";
    const shortfall = isLegacyOrTransition ? 0 : Math.max(0, round2(targetVal - currentVal));
    const excess = isLegacyOrTransition ? currentVal : Math.max(0, round2(currentVal - targetVal));

    let name = customNames[a.id] || a.name;
    if (a.id === "e2_mom" && invescoMomentumTicker && !customNames[a.id]) {
      name = `Invesco Momentum ETF (${invescoMomentumTicker})`;
    }

    let deploymentAction = "HOLD";
    if (a.id === "g_gldm") {
      deploymentAction = `GRADUAL TRANSITION HOLDING — DIRECT FRESH GOLD TO GOLDBEES (OCT CHART REF: ₹${Math.round(historicalOct2026TargetVal).toLocaleString("en-IN")})`;
    } else if (a.configurableGoldSplit && effectiveCatFrac === 0) {
      deploymentAction = "CONFIGURABLE GOLD SLEEVE — SPLIT ACROSS GOLDBEES/SGB/PHYS PENDING CONFIRMATION";
    } else if (a.holdingType === "LEGACY") {
      deploymentAction = currentVal > 0 ? "GRADUAL TAX-CONSCIOUS TRANSITION (NO FRESH SIP)" : "EXITED / LEGACY";
    } else if (a.holdingType === "TRANSITION") {
      deploymentAction = currentVal > 0 ? "TRANSITION SLEEVE — ROUTE FRESH CAPITAL TO TARGET" : "TRANSITION COMPLETE";
    } else if (shortfall > 1000) {
      deploymentAction = `FRESH DEPLOYMENT CANDIDATE (+₹${Math.round(shortfall).toLocaleString("en-IN")} SHORTFALL)`;
    } else if (excess > 5000) {
      deploymentAction = "OVERWEIGHT — PAUSE FRESH SIP / LET GROW INTO TARGET";
    }

    return {
      ...a,
      name,
      catFrac: effectiveCatFrac,
      finalPct,
      targetVal,
      historicalOct2026Pct,
      historicalOct2026TargetVal,
      currentVal,
      variance,
      shortfall,
      excess,
      isLegacyOrTransition,
      deploymentAction,
      pctOfPortfolio: effectiveTotal > 0 ? (currentVal / effectiveTotal) * 100 : 0
    };
  });

  const catSummary = {};
  CATS.forEach(cat => {
    const catAssets = assets.filter(a => a.cat === cat);
    const strategicAssets = catAssets.filter(a => !a.isLegacyOrTransition);
    const legacyTransitionAssets = catAssets.filter(a => a.isLegacyOrTransition);

    const cur = round2(catAssets.reduce((s, a) => s + a.currentVal, 0));
    const strategicActual = round2(strategicAssets.reduce((s, a) => s + a.currentVal, 0));
    const legacyActual = round2(legacyTransitionAssets.reduce((s, a) => s + a.currentVal, 0));
    const tgt = round2((effectiveTotal * alloc[cat]) / 100);
    const assignedSubTargets = round2(strategicAssets.reduce((s, a) => s + a.targetVal, 0));
    const unassignedConfigurableTarget = Math.max(0, round2(tgt - assignedSubTargets));
    const curPct = effectiveTotal > 0 ? (cur / effectiveTotal) * 100 : 0;
    const tgtPct = alloc[cat];
    catSummary[cat] = {
      cur,
      strategicActual,
      legacyActual,
      tgt,
      assignedSubTargets,
      unassignedConfigurableTarget,
      curPct,
      tgtPct,
      diff: curPct - tgtPct,
      varianceVal: round2(cur - tgt)
    };
  });

  // Detailed Gold (G) Sub-Division Summary (GoldBeES Primary Fresh Target, GLDM Gradual Transition Holding, Configurable G1/G2/G3 Split)
  const gGoldbeesAsset = assets.find(a => a.id === "g_gold");
  const gGldmAsset = assets.find(a => a.id === "g_gldm");
  const gSgbAsset = assets.find(a => a.id === "g_sgb");
  const gPhysAsset = assets.find(a => a.id === "g_phys");
  const goldBreakdown = {
    gTotalTarget: catSummary.G.tgt, // ₹4,00,000.00
    gTotalActualExclTataSilv: catSummary.G.cur, // ₹3,41,438.02
    gCoreStrategicActual: catSummary.G.strategicActual, // ₹3,00,197.02 (GoldBeES + SGB + Physical Gold)
    gGldmTransitionActual: gGldmAsset?.currentVal || 0, // ₹41,241.00
    gGoldbeesActual: gGoldbeesAsset?.currentVal || 0, // ₹3,00,197.02
    gSgbActual: gSgbAsset?.currentVal || 0, // ₹0.00
    gPhysActual: gPhysAsset?.currentVal || 0, // ₹0.00
    gGoldbeesHistoricalOctTarget: gGoldbeesAsset?.historicalOct2026TargetVal || 340000,
    gGldmHistoricalOctTarget: gGldmAsset?.historicalOct2026TargetVal || 60000,
    gGldmFreshStrategicTarget: 0,
    gAssignedStrategicTarget: catSummary.G.assignedSubTargets,
    gConfigurableUnassignedTarget: catSummary.G.unassignedConfigurableTarget, // ₹60,000 pending split confirmation across GoldBeES/SGBs/Physical Gold
    gPrimaryFreshDestination: "G1 : GoldBeES (Nippon India ETF Gold BeES)",
    goldSplitConfig
  };

  // Detailed Equity Sub-Division Summary:
  // - E1 Passive (Nifty 50, Nifty Next 50, Nifty 500, Nifty Healthcare ETF) = ₹3,48,662.35 vs ₹6,00,000.00 Target (-₹2,51,337.65)
  // - E1 Active Core (HDFC BAF, HDFC Smallcap, Motilal Midcap, PPFAS Flexicap) = ₹7,15,666.00 vs ₹6,00,000.00 Target (+₹1,15,666.00)
  // - E1 Active — Legacy / Transition (Indian MFs Active Legacy ₹4,49,992.00 + Mirae Healthcare Active Transition ₹77,918.00) = ₹5,27,910.00 vs ₹0 Target
  // - E1 Active Combined Subtotal (Core + Legacy/Transition) = ₹12,43,576.00 vs ₹6,00,000.00 Target (+₹6,43,576.00)
  // - E1 Overall Total = ₹15,92,238.35 vs ₹12,00,000.00 Target (+₹3,92,238.35)
  const sumDivision = (div, field = "currentVal") =>
    round2(assets.filter(a => a.division === div).reduce((s, a) => s + (a[field] || 0), 0));

  const e1PassiveTarget = sumDivision("E1_PASSIVE", "targetVal");
  const e1PassiveActual = sumDivision("E1_PASSIVE", "currentVal");
  const e1PassiveVariance = round2(e1PassiveActual - e1PassiveTarget);

  const e1ActiveTarget = sumDivision("E1_ACTIVE", "targetVal");
  const e1ActiveActual = sumDivision("E1_ACTIVE", "currentVal");
  const e1ActiveCoreVariance = round2(e1ActiveActual - e1ActiveTarget);

  const e1LegacyMfsActual = sumDivision("E1_LEGACY", "currentVal");
  const e1HealthcareTransitionActual = sumDivision("E1_TRANSITION", "currentVal");
  const e1LegacyActual = round2(e1LegacyMfsActual + e1HealthcareTransitionActual);

  const e1ActiveSubtotalActual = round2(e1ActiveActual + e1LegacyActual);
  const e1ActiveSubtotalVariance = round2(e1ActiveSubtotalActual - e1ActiveTarget);

  const e1TotalTarget = round2(e1PassiveTarget + e1ActiveTarget);
  const e1TotalActual = round2(e1PassiveActual + e1ActiveSubtotalActual);
  const e1TotalVariance = round2(e1TotalActual - e1TotalTarget);

  const e2TotalTarget = round2(sumDivision("E2_US", "targetVal"));
  const e2TotalActual = round2(sumDivision("E2_US", "currentVal") + sumDivision("E2_TRANSITION", "currentVal"));

  const equityBreakdown = {
    e1PassiveTarget,
    e1PassiveActual,
    e1PassiveVariance,
    e1ActiveTarget,
    e1ActiveActual,
    e1ActiveCoreVariance,
    e1LegacyMfsActual,
    e1HealthcareTransitionActual,
    e1LegacyActual,
    e1ActiveSubtotalActual,
    e1ActiveSubtotalVariance,
    e1TotalTarget,
    e1TotalActual,
    e1Variance: e1TotalVariance,
    e2StrategicTarget: sumDivision("E2_US", "targetVal"),
    e2StrategicActual: sumDivision("E2_US", "currentVal"),
    e2TransitionActual: sumDivision("E2_TRANSITION", "currentVal"),
    e2TotalTarget,
    e2TotalActual,
    e2Variance: round2(e2TotalActual - e2TotalTarget)
  };

  // Auxiliary & Tactical Holdings outside the main 10:15:25:50 GRDE allocation
  const auxiliaryHoldings = AUXILIARY_SLEEVES.map(s => ({
    ...s,
    currentVal: Number(auxiliaryValues[s.id]) || 0
  }));
  const sumAuxiliary = round2(auxiliaryHoldings.reduce((s, a) => s + a.currentVal, 0));
  const tatasilvVal = Number(auxiliaryValues.tactical_tatasilv) || 0;
  const npsVal = Number(auxiliaryValues.aux_nps) || 0;

  // 04/10/2026 Progress Chart Footer Reconciliation (shows both Strategic Gold-only and Chart Total incl. TATASILV + NPS)
  const oct2026ChartReconciliation = {
    gStrategicOnly: catSummary.G.cur,
    gWithTataSilv: round2(catSummary.G.cur + tatasilvVal),
    gTarget: catSummary.G.tgt,
    gChartVariance: round2((catSummary.G.cur + tatasilvVal) - catSummary.G.tgt),
    gStrategicVariance: round2(catSummary.G.cur - catSummary.G.tgt),
    grdePresentStrategicOnly: round2(sumActual),
    grdePresentChartWithTataSilv: round2(sumActual + tatasilvVal),
    grdeTarget: effectiveTotal,
    grdeChartVariance: round2((sumActual + tatasilvVal) - effectiveTotal),
    npsOutsideGrde: npsVal,
    grdePlusNpsChartTotal: round2(sumActual + tatasilvVal + npsVal)
  };

  const hasData = sumActual > 0;
  const isr = hasData
    ? catSummary.G.curPct + catSummary.R.curPct + catSummary.D.curPct
    : alloc.G + alloc.R + alloc.D;

  return {
    alloc,
    assets,
    catSummary,
    goldBreakdown,
    equityBreakdown,
    auxiliaryHoldings,
    sumAuxiliary,
    oct2026ChartReconciliation,
    invescoMomentumTicker,
    hasData,
    sumActual: round2(sumActual),
    effectiveTotal,
    isr
  };
}

/**
 * 8-Factor Proprietary GRDE Health Score (Updated for October 2026 Sleeves)
 */
export function computeExpandedHealth(assets, catSummary, alloc, total) {
  const byId = (id) => assets.find(a => a.id === id);
  const pctFunded = (id) => {
    const a = byId(id);
    if (!a || !a.targetVal) return 0;
    return Math.max(0, Math.min(100, (a.currentVal / a.targetVal) * 100));
  };

  const withTarget = assets.filter(a => a.targetVal > 0 && !a.isLegacyOrTransition);
  const totalWithTarget = withTarget.length;

  const diversification = totalWithTarget > 0
    ? (withTarget.filter(a => a.currentVal > 0).length / totalWithTarget) * 100
    : 0;

  // D1 Liquid + Ultra Short readiness
  const emergencyFund = pctFunded("d_liq");
  const isrDiff = Math.abs((catSummary.G.curPct + catSummary.R.curPct + catSummary.D.curPct) - (alloc.G + alloc.R + alloc.D));
  const isrBalance = Math.max(0, 100 - isrDiff * 4);
  const debtDiff = Math.abs(catSummary.D.curPct - alloc.D);
  const debtRatio = Math.max(0, 100 - debtDiff * 4);

  const redCount = withTarget.filter(a => {
    if (a.currentVal === 0 || !total) return false;
    return Math.abs(a.variance) / total * 100 >= 3;
  }).length;
  const rebalancing = totalWithTarget > 0 ? Math.max(0, 100 - (redCount / totalWithTarget) * 100) : 0;

  // E2 US Equity readiness (VOO + QQQM + SCHD + Momentum + MON100 transition vs E2 target)
  const e2Assets = assets.filter(a => a.division === "E2_US" || a.division === "E2_TRANSITION");
  const e2Target = e2Assets.reduce((s, a) => s + a.targetVal, 0);
  const e2Actual = e2Assets.reduce((s, a) => s + a.currentVal, 0);
  const international = e2Target > 0 ? Math.max(0, Math.min(100, (e2Actual / e2Target) * 100)) : 0;

  // Healthcare readiness (Passive Healthcare ETF + Mirae Transition Holding vs ₹1.5L target)
  const hcTarget = byId("e1_p_hc")?.targetVal || 0;
  const hcActual = (byId("e1_p_hc")?.currentVal || 0) + (byId("e1_hc_legacy")?.currentVal || 0);
  const healthcare = hcTarget > 0 ? Math.max(0, Math.min(100, (hcActual / hcTarget) * 100)) : 0;

  // Gold readiness across G1–G3
  const gold = catSummary.G?.tgt > 0 ? Math.max(0, Math.min(100, (catSummary.G.cur / catSummary.G.tgt) * 100)) : pctFunded("g_gold");

  const factors = [
    { key: "diversification", label: "Strategic Sleeve Breadth", score: diversification, desc: "Active strategic positions across G1–G3, R, D1–D4, E1 & E2" },
    { key: "emergency",       label: "D1 Liquidity Readiness",   score: emergencyFund,   desc: "Liquid + Ultra Short Duration reserve (₹2.0L target)" },
    { key: "isr",             label: "ISR Balance (50% Shield)", score: isrBalance,      desc: "Income Stability Ratio adherence to age band 50–55" },
    { key: "debt",            label: "D1–D4 Debt Layering",      score: debtRatio,       desc: "POMIS/FD, Wint Bonds, Liquid & Nippon Dynamic Bond weight" },
    { key: "rebalancing",     label: "Drift & Variance Control", score: rebalancing,     desc: "Adherence of strategic sleeves to target thresholds" },
    { key: "intl",            label: "E2 US Equity Engine",      score: international,   desc: "VOO, QQQM, SCHD & Momentum global compounding (20% GRDE)" },
    { key: "healthcare",      label: "Healthcare Allocation",    score: healthcare,      desc: "Healthcare ETF target + Mirae gradual transition sleeve" },
    { key: "gold",            label: "G1–G3 Gold Anchor",        score: gold,            desc: "GoldBeES, SGB & Physical Gold strategic 10% hedge" },
  ];

  const overall = Math.round(factors.reduce((s, f) => s + f.score, 0) / factors.length);
  return { overall, factors };
}

export function getHealthStatus(score) {
  if (score === null || score === undefined || isNaN(score)) {
    return { text: "No Data", color: "var(--text-dim)", bg: "rgba(255,255,255,0.05)" };
  }
  if (score >= 90) return { text: "Excellent Structure", color: "var(--good)", bg: "rgba(82,168,106,0.12)" };
  if (score >= 75) return { text: "Well Balanced", color: "#7fb86a", bg: "rgba(127,184,106,0.12)" };
  if (score >= 60) return { text: "Moderate Drift", color: "var(--gold)", bg: "rgba(212,168,67,0.12)" };
  return { text: "Action Needed", color: "var(--danger)", bg: "rgba(214,96,77,0.12)" };
}

/**
 * Smart Cash-Injection Rebalancing Algorithm:
 * Routes fresh capital ONLY into strategic target sleeves (`catFrac > 0`, excluding Legacy/Transition sleeves).
 * Accounts for transition holdings (e.g., Mirae Healthcare -> Healthcare ETF, MON100 -> QQQM) so fresh capital
 * is directed toward true net shortfalls without ever recommending fresh allocation into Legacy/Transition holdings.
 */
export function calculateSmartTopUp(assets, freshAmount, currentTotal, targetAlloc) {
  if (freshAmount <= 0) return [];
  const newTotal = (currentTotal > 0 ? currentTotal : 4000000) + freshAmount;

  const strategicAssets = assets.filter(a => a.catFrac > 0 && !a.isLegacyOrTransition);

  // Compute desired target values after new total
  const deficits = strategicAssets.map(a => {
    const finalTargetPct = (targetAlloc[a.cat] * a.catFrac) / 100;
    const newTargetVal = newTotal * finalTargetPct;
    const shortfall = Math.max(0, newTargetVal - a.currentVal);
    return {
      ...a,
      shortfall,
      newTargetVal
    };
  });

  const totalDeficit = deficits.reduce((sum, d) => sum + d.shortfall, 0);

  if (totalDeficit === 0) {
    return strategicAssets.map(a => {
      const finalTargetPct = (targetAlloc[a.cat] * a.catFrac) / 100;
      const allocated = freshAmount * finalTargetPct;
      return {
        id: a.id,
        name: a.name,
        cat: a.cat,
        sleeveCode: a.sleeveCode,
        allocatedAmount: Math.round(allocated),
        allocatedPct: round1(finalTargetPct * 100),
        reason: "Proportional Strategic Top-Up"
      };
    });
  }

  return deficits
    .filter(d => d.shortfall > 0)
    .map(d => {
      const allocated = (d.shortfall / totalDeficit) * freshAmount;
      return {
        id: d.id,
        name: d.name,
        cat: d.cat,
        sleeveCode: d.sleeveCode,
        allocatedAmount: Math.round(allocated),
        shortfall: Math.round(d.shortfall),
        allocatedPct: round1((allocated / freshAmount) * 100),
        reason: `Closes ₹${Math.round(d.shortfall).toLocaleString("en-IN")} strategic target gap`
      };
    })
    .sort((a, b) => b.allocatedAmount - a.allocatedAmount);
}

/**
 * Multi-scenario FIRE Compounding Projection
 */
export function calculateFireTrajectory({
  currentNetWorth,
  monthlySip,
  annualGrowthRate = 11,
  targetCorpus,
  currentAge = 52,
  yearsToProject = 30,
  stepUpPct = 0
}) {
  const points = [];
  const r = annualGrowthRate / 100 / 12;
  let balance = currentNetWorth;
  let currentSip = monthlySip;
  let reachedAge = null;

  for (let yr = 0; yr <= yearsToProject; yr++) {
    const age = currentAge + yr;
    points.push({
      year: yr,
      age,
      balance: Math.round(balance),
      target: targetCorpus,
      sipAnnual: Math.round(currentSip * 12)
    });

    if (balance >= targetCorpus && reachedAge === null && targetCorpus > 0) {
      reachedAge = age;
    }

    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + r) + currentSip;
    }

    if (stepUpPct > 0) {
      currentSip = currentSip * (1 + stepUpPct / 100);
    }
  }

  return {
    points,
    reachedAge,
    finalCorpus: points[points.length - 1]?.balance || balance
  };
}
