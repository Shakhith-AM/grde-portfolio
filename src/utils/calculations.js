import { G_CURVE, R_CURVE, D_CURVE, RISK_PROFILES, CATS, ASSET_TEMPLATE } from '../constants/masterData';

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
  return { range: getBand(a), G, R, D, E };
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
  return { range: base.range, G, R, D, E };
}

/**
 * Calculates complete live portfolio data based on tracker store and user settings
 */
export function computePortfolioState(storedTracker, age = 50, riskProfile = "balanced") {
  const alloc = getAllocation(age, riskProfile);
  const values = storedTracker?.values || {};
  const customNames = storedTracker?.customNames || {};
  const explicitTotal = Number(storedTracker?.totalPortfolio) || 0;

  const rawCurrent = ASSET_TEMPLATE.map(a => Number(values[a.id]) || 0);
  const sumActual = rawCurrent.reduce((s, v) => s + v, 0);
  const effectiveTotal = explicitTotal > 0 ? explicitTotal : sumActual;

  const assets = ASSET_TEMPLATE.map((a, i) => {
    const finalPct = alloc[a.cat] * a.catFrac;
    const targetVal = effectiveTotal * finalPct / 100;
    const currentVal = rawCurrent[i];
    const variance = currentVal - targetVal;
    const name = customNames[a.id] || a.name;
    return {
      ...a,
      name,
      finalPct,
      targetVal,
      currentVal,
      variance,
      pctOfPortfolio: effectiveTotal > 0 ? (currentVal / effectiveTotal) * 100 : 0
    };
  });

  const catSummary = {};
  CATS.forEach(cat => {
    const catAssets = assets.filter(a => a.cat === cat);
    const cur = catAssets.reduce((s, a) => s + a.currentVal, 0);
    const tgt = catAssets.reduce((s, a) => s + a.targetVal, 0);
    const curPct = effectiveTotal > 0 ? (cur / effectiveTotal) * 100 : 0;
    const tgtPct = alloc[cat];
    catSummary[cat] = {
      cur,
      tgt,
      curPct,
      tgtPct,
      diff: curPct - tgtPct
    };
  });

  const hasData = sumActual > 0;
  const isr = hasData
    ? catSummary.G.curPct + catSummary.R.curPct + catSummary.D.curPct
    : alloc.G + alloc.R + alloc.D;

  return {
    alloc,
    assets,
    catSummary,
    hasData,
    sumActual,
    effectiveTotal,
    isr
  };
}

/**
 * 8-Factor Proprietary GRDE Health Score
 */
export function computeExpandedHealth(assets, catSummary, alloc, total) {
  const byId = (id) => assets.find(a => a.id === id);
  const pctFunded = (id) => {
    const a = byId(id);
    if (!a || !a.targetVal) return 0;
    return Math.max(0, Math.min(100, (a.currentVal / a.targetVal) * 100));
  };

  const withTarget = assets.filter(a => a.targetVal > 0);
  const totalWithTarget = withTarget.length;

  const diversification = totalWithTarget > 0
    ? (assets.filter(a => a.currentVal > 0).length / totalWithTarget) * 100
    : 0;

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

  const international = pctFunded("e_etfus");
  const healthcare = pctFunded("e_hc");
  const gold = pctFunded("g_gold");

  const factors = [
    { key: "diversification", label: "Asset Diversification", score: diversification, desc: "Breadth of active positions vs model blueprint" },
    { key: "emergency",       label: "Emergency Liquidity",   score: emergencyFund,   desc: "Readiness of liquid cash buffer (d_liq)" },
    { key: "isr",             label: "ISR Balance",          score: isrBalance,      desc: "Income Stability Ratio adherence to age curve" },
    { key: "debt",            label: "Debt Layering",        score: debtRatio,       desc: "Fixed income & capital protection weight" },
    { key: "rebalancing",     label: "Variance Control",     score: rebalancing,     desc: "Deviation of holdings from target thresholds" },
    { key: "intl",            label: "Global Exposure",      score: international,   desc: "US/International equity hedge presence" },
    { key: "healthcare",      label: "Healthcare Thematic",  score: healthcare,      desc: "Secular defensive equity allocation" },
    { key: "gold",            label: "Gold Anchor",          score: gold,            desc: "Crisis hedge & purchasing power defense" },
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
 * Calculates optimal distribution of a fresh sum of money to close allocation shortfalls
 * without requiring selling of existing holdings.
 */
export function calculateSmartTopUp(assets, freshAmount, currentTotal, targetAlloc) {
  if (freshAmount <= 0) return [];
  const newTotal = currentTotal + freshAmount;

  // Compute desired target values after new total
  const deficits = assets.map(a => {
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
    // If fully balanced, allocate proportionally according to model %
    return assets.map(a => {
      const finalTargetPct = (targetAlloc[a.cat] * a.catFrac) / 100;
      const allocated = freshAmount * finalTargetPct;
      return {
        id: a.id,
        name: a.name,
        cat: a.cat,
        allocatedAmount: Math.round(allocated),
        allocatedPct: round1(finalTargetPct * 100),
        reason: "Proportional Top-Up"
      };
    });
  }

  // Allocate proportionally to deficits
  return deficits
    .filter(d => d.shortfall > 0)
    .map(d => {
      const allocated = (d.shortfall / totalDeficit) * freshAmount;
      return {
        id: d.id,
        name: d.name,
        cat: d.cat,
        allocatedAmount: Math.round(allocated),
        shortfall: Math.round(d.shortfall),
        allocatedPct: round1((allocated / freshAmount) * 100),
        reason: `Closes ₹${Math.round(d.shortfall).toLocaleString("en-IN")} gap`
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
  currentAge = 35,
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

    // Compound for 12 months with monthly additions
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + r) + currentSip;
    }

    // Annual SIP step-up
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
