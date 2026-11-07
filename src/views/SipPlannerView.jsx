import React, { useState, useMemo } from 'react';
import { DEFAULT_SIP_PLANNER_STATE, CAT_META } from '../constants/masterData';
import { GRDE_STORAGE, STORAGE_KEYS } from '../utils/storage';
import { calculateSmartTopUp } from '../utils/calculations';
import { formatCurrency } from '../constants/currencies';
import {
  Calendar,
  RotateCcw,
  Sliders,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Layers
} from 'lucide-react';

export function SipPlannerView({ portfolioState, currency = "INR" }) {
  const { assets, alloc, sumActual } = portfolioState;
  const [showPoolsDrawer, setShowPoolsDrawer] = useState(false);
  const [showRoutingDrawer, setShowRoutingDrawer] = useState(false);

  const [sipState, setSipState] = useState(() => {
    const saved = GRDE_STORAGE.getJSON(STORAGE_KEYS.SIP_PLANNER, null);
    if (saved && saved.weeklyCycles) {
      return {
        ...DEFAULT_SIP_PLANNER_STATE,
        ...saved,
        separatePools: {
          ...DEFAULT_SIP_PLANNER_STATE.separatePools,
          ...(saved.separatePools || {})
        },
        sleeveDistributionPct: {
          ...DEFAULT_SIP_PLANNER_STATE.sleeveDistributionPct,
          ...(saved.sleeveDistributionPct || {})
        }
      };
    }
    return DEFAULT_SIP_PLANNER_STATE;
  });

  const persist = (next) => {
    setSipState(next);
    GRDE_STORAGE.set(STORAGE_KEYS.SIP_PLANNER, next);
  };

  const monthlyBudget = Number(sipState.monthlySipBudget) || 64000;
  const baseWeeklyCycle = Math.round(monthlyBudget / 4);

  // Compute weekly carry-forward and mandatory Week 4 sweep math
  const cycleLedger = useMemo(() => {
    let carryForward = 0;
    const rows = [];
    const activeWeeks = sipState.enableFifthWeekFlexibility ? 5 : 4;

    for (let i = 0; i < activeWeeks; i++) {
      const c = sipState.weeklyCycles[i] || {
        weekNo: i + 1,
        label: `Week ${i + 1}`,
        plannedBase: i < 4 ? baseWeeklyCycle : 0,
        dipTriggered: false,
        deployedAmount: 0,
        notes: ""
      };

      const plannedForWeek = i < 4 ? baseWeeklyCycle : 0;
      const availablePool = plannedForWeek + carryForward;

      let effectiveDeployed = Number(c.deployedAmount) || 0;
      const isMandatorySweepWeek =
        sipState.mandatoryFinalWeekDeployment &&
        ((!sipState.enableFifthWeekFlexibility && i === 3) || (sipState.enableFifthWeekFlexibility && i === 4));

      const recommendedFinalSweep = isMandatorySweepWeek ? availablePool : effectiveDeployed;
      const unspentAfterWeek = Math.max(0, availablePool - effectiveDeployed);

      rows.push({
        ...c,
        plannedForWeek,
        carryIn: carryForward,
        availablePool,
        effectiveDeployed,
        unspentAfterWeek,
        isMandatorySweepWeek,
        recommendedFinalSweep
      });

      carryForward = unspentAfterWeek;
    }

    const totalDeployed = rows.reduce((s, r) => s + r.effectiveDeployed, 0);
    const remainingUnspent = Math.max(0, monthlyBudget - totalDeployed);

    return {
      rows,
      totalDeployed,
      remainingUnspent
    };
  }, [sipState, monthlyBudget, baseWeeklyCycle]);

  // Configurable E1/E2/D/R/G SIP distribution
  const distPct = sipState.sleeveDistributionPct || DEFAULT_SIP_PLANNER_STATE.sleeveDistributionPct;
  const totalDistPct = Object.values(distPct).reduce((s, v) => s + (Number(v) || 0), 0);

  const sleeveAllocations = useMemo(() => {
    const items = [
      {
        key: "e1_passive",
        cat: "E",
        title: "E1 — Indian Equity Passive",
        instruments: "Nifty 50, Nifty Next 50, Nifty 500, Healthcare ETF",
        pct: Number(distPct.e1_passive) || 0
      },
      {
        key: "e1_active",
        cat: "E",
        title: "E1 — Indian Equity Active (Core 4)",
        instruments: "PPFAS Flexi, MO Midcap, HDFC Small, HDFC BAF",
        pct: Number(distPct.e1_active) || 0
      },
      {
        key: "e2_us",
        cat: "E",
        title: "E2 — US Equity Strategic",
        instruments: "VOO, QQQM, SCHD, Invesco Momentum ETF",
        pct: Number(distPct.e2_us) || 0
      },
      {
        key: "d_debt",
        cat: "D",
        title: "D — Debt & Defensive (D1–D4)",
        instruments: "D4 Dynamic Bond, D1 Liquid, D2 Fixed, D3 Corporate",
        pct: Number(distPct.d_debt) || 0
      },
      {
        key: "r_reits",
        cat: "R",
        title: "R — REITs & InvITs",
        instruments: "Mindspace, KRT, Nexus, IndiGrid, IRB InvIT",
        pct: Number(distPct.r_reits) || 0
      },
      {
        key: "g_gold",
        cat: "G",
        title: "G — Strategic Gold",
        instruments: "GoldBeES (Primary Fresh Target)",
        pct: Number(distPct.g_gold) || 0
      }
    ];

    return items.map(item => ({
      ...item,
      monthlyAmount: Math.round((monthlyBudget * item.pct) / 100),
      weeklyAmount: Math.round((baseWeeklyCycle * item.pct) / 100)
    }));
  }, [distPct, monthlyBudget, baseWeeklyCycle]);

  // Dynamic shortfall-based recommendation for the ₹64,000 monthly SIP
  const shortfallRecommendations = useMemo(() => {
    return calculateSmartTopUp(assets, monthlyBudget, sumActual, alloc).slice(0, 8);
  }, [assets, monthlyBudget, sumActual, alloc]);

  const handleUpdateCycle = (idx, field, val) => {
    const nextCycles = sipState.weeklyCycles.map((c, i) =>
      i === idx ? { ...c, [field]: val } : c
    );
    persist({ ...sipState, weeklyCycles: nextCycles });
  };

  const handleApplyMandatorySweep = () => {
    const targetIdx = sipState.enableFifthWeekFlexibility ? 4 : 3;
    const priorDeployed = sipState.weeklyCycles
      .slice(0, targetIdx)
      .reduce((s, c) => s + (Number(c.deployedAmount) || 0), 0);
    const sweepAmt = Math.max(0, monthlyBudget - priorDeployed);

    const nextCycles = sipState.weeklyCycles.map((c, i) =>
      i === targetIdx
        ? { ...c, deployedAmount: sweepAmt, dipTriggered: true, status: "MANDATORY_SWEEP_EXECUTED" }
        : c
    );
    persist({ ...sipState, weeklyCycles: nextCycles });
  };

  const handleResetSip = () => {
    if (window.confirm("Reset SIP Planner to the ₹64,000/month (4 × ₹16,000 weekly cycles) reference configuration?")) {
      persist(DEFAULT_SIP_PLANNER_STATE);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
        <div>
          <div className="label">Systematic Capital Deployment</div>
          <h2 style={{ fontSize: 30, margin: "6px 0 0", color: "var(--white)" }}>
            SIP Planner & <span style={{ color: "var(--gold)", fontStyle: "italic" }}>4-Cycle Engine</span>
          </h2>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => setShowPoolsDrawer(!showPoolsDrawer)}
            className="mono"
            style={{
              background: showPoolsDrawer ? "rgba(212, 168, 67, 0.14)" : "transparent",
              border: "1px solid var(--gold-dim)",
              color: "var(--gold-pale)",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 10,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <Layers size={12} />
            <span>{showPoolsDrawer ? "Hide Cash Buckets" : "5 Cash Buckets"}</span>
          </button>

          <button
            onClick={handleApplyMandatorySweep}
            className="mono"
            style={{
              background: "linear-gradient(180deg, #52a86a, #2e6b3f)",
              color: "#ffffff",
              border: "none",
              borderRadius: 8,
              padding: "8px 14px",
              fontSize: 10,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Execute Final-Week Sweep
          </button>

          <button
            onClick={handleResetSip}
            className="mono"
            style={{
              background: "transparent",
              border: "1px solid var(--border-2)",
              color: "var(--text-dim)",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 10,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* LEVEL 1 — Visual 4-Cycle Deployment Summary Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 18 }}>
        <div className="glass" style={{ borderRadius: 12, padding: "14px 16px", borderTop: "3px solid var(--gold)" }}>
          <div className="mono" style={{ fontSize: 9, color: "var(--text-dim)", textTransform: "uppercase" }}>Monthly SIP Target</div>
          <div className="num" style={{ fontSize: 22, fontWeight: 700, color: "var(--white)", marginTop: 4 }}>
            {formatCurrency(monthlyBudget, currency, false)}
          </div>
          <div className="mono" style={{ fontSize: 9, color: "var(--gold-pale)", marginTop: 2 }}>
            4 × {formatCurrency(baseWeeklyCycle, currency, false)} cycles
          </div>
        </div>

        {cycleLedger.rows.slice(0, 4).map((row) => (
          <div
            key={row.weekNo}
            className="glass"
            style={{
              borderRadius: 12,
              padding: "14px 16px",
              borderTop: `3px solid ${row.isMandatorySweepWeek ? "var(--good)" : "var(--border-2)"}`
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="mono" style={{ fontSize: 9.5, color: "var(--gold)", fontWeight: 700, textTransform: "uppercase" }}>
                Week {row.weekNo}
              </span>
              {row.isMandatorySweepWeek && (
                <span className="mono" style={{ fontSize: 8, color: "var(--good)" }}>SWEEP</span>
              )}
            </div>
            <div className="num" style={{ fontSize: 19, fontWeight: 700, color: "var(--white)", marginTop: 4 }}>
              {formatCurrency(row.effectiveDeployed, currency, false)}
            </div>
            <div className="mono" style={{ fontSize: 8.5, color: "var(--text-dim)", marginTop: 2 }}>
              Pool: {formatCurrency(row.availablePool, currency, false)}
            </div>
          </div>
        ))}
      </div>

      {/* LEVEL 2 — Collapsible 5 Distinct Capital Pools Drawer */}
      {showPoolsDrawer && (
        <div className="glass" style={{ borderRadius: 12, padding: "16px 18px", marginBottom: 18, borderLeft: "3px solid var(--gold)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span className="mono" style={{ fontSize: 10.5, color: "var(--white)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Ring-Fenced Capital Pools (Strict Separation)
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: 10 }}>
            {[
              {
                key: "regularGrdeSip",
                label: "1. Regular GRDE SIP",
                val: monthlyBudget,
                sub: `4 × ${formatCurrency(baseWeeklyCycle, currency, false)} cycles`,
                color: "var(--gold)",
                onChange: (v) => persist({
                  ...sipState,
                  monthlySipBudget: v,
                  weeklyCycleAmount: Math.round(v / 4),
                  separatePools: { ...sipState.separatePools, regularGrdeSip: v }
                })
              },
              {
                key: "tacticalRecoveryCapital",
                label: "2. Tactical Recovery",
                val: sipState.separatePools.tacticalRecoveryCapital,
                sub: "TATASILV reserve (₹10k ceiling)",
                color: "#e5a93c",
                onChange: (v) => persist({
                  ...sipState,
                  separatePools: { ...sipState.separatePools, tacticalRecoveryCapital: v }
                })
              },
              {
                key: "dividendsReceived",
                label: "3. Dividends Received",
                val: sipState.separatePools.dividendsReceived,
                sub: "SCHD & REIT/InvIT payouts",
                color: "#38bdf8",
                onChange: (v) => persist({
                  ...sipState,
                  separatePools: { ...sipState.separatePools, dividendsReceived: v }
                })
              },
              {
                key: "reinvestmentAmounts",
                label: "4. Reinvestments",
                val: sipState.separatePools.reinvestmentAmounts,
                sub: "SCHD → Invesco Momentum",
                color: "var(--good)",
                onChange: (v) => persist({
                  ...sipState,
                  separatePools: { ...sipState.separatePools, reinvestmentAmounts: v }
                })
              },
              {
                key: "unallocatedCash",
                label: "5. Unallocated Cash",
                val: cycleLedger.remainingUnspent + (Number(sipState.separatePools.unallocatedCash) || 0),
                sub: cycleLedger.remainingUnspent > 0 ? "Carried into Week 4 sweep" : "Cleared",
                color: cycleLedger.remainingUnspent > 0 ? "var(--warn)" : "var(--text-dim)",
                onChange: (v) => persist({
                  ...sipState,
                  separatePools: { ...sipState.separatePools, unallocatedCash: v }
                })
              }
            ].map((pool) => (
              <div
                key={pool.key}
                style={{
                  background: "rgba(15, 22, 32, 0.75)",
                  border: "1px solid var(--border)",
                  borderTop: `2px solid ${pool.color}`,
                  borderRadius: 8,
                  padding: "10px 12px"
                }}
              >
                <div className="mono" style={{ fontSize: 8.5, color: "var(--text-dim)", textTransform: "uppercase" }}>
                  {pool.label}
                </div>
                <input
                  type="number"
                  value={pool.val}
                  onChange={(e) => pool.onChange(Number(e.target.value))}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px dashed var(--border-2)",
                    color: "var(--white)",
                    fontSize: 15,
                    fontWeight: 700,
                    marginTop: 4,
                    paddingBottom: 2,
                    outline: "none"
                  }}
                />
                <div className="mono" style={{ fontSize: 8.5, color: "var(--text-dim)", marginTop: 4 }}>
                  {pool.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Deployment Cycles Ledger */}
      <div className="glass" style={{ borderRadius: 12, overflow: "hidden", marginBottom: 18 }}>
        <div style={{
          padding: "12px 18px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Calendar size={15} color="var(--gold)" />
            <span className="mono" style={{ fontSize: 10.5, color: "var(--white)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Weekly Cycle Ledger
            </span>
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <label className="mono" style={{ fontSize: 9.5, color: "var(--gold-pale)", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={sipState.mandatoryFinalWeekDeployment}
                onChange={(e) => persist({ ...sipState, mandatoryFinalWeekDeployment: e.target.checked })}
              />
              <span>Mandatory Final-Week Sweep</span>
            </label>

            <label className="mono" style={{ fontSize: 9.5, color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={sipState.enableFifthWeekFlexibility}
                onChange={(e) => persist({ ...sipState, enableFifthWeekFlexibility: e.target.checked })}
              />
              <span>5th-Week Flexibility</span>
            </label>
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "85px 1.3fr 95px 95px 105px 105px 95px",
          gap: 8,
          padding: "9px 18px",
          background: "var(--card-2)"
        }}>
          {["Cycle", "Trigger Rule", "Planned", "Carry-In", "Available", "Deployed", "Carry-Out"].map((h, i) => (
            <div key={i} className="mono" style={{ fontSize: 8.5, color: "var(--text-dim)", textTransform: "uppercase", textAlign: i >= 2 ? "right" : "left" }}>
              {h}
            </div>
          ))}
        </div>

        {cycleLedger.rows.map((row, idx) => (
          <div
            key={row.weekNo}
            style={{
              display: "grid",
              gridTemplateColumns: "85px 1.3fr 95px 95px 105px 105px 95px",
              gap: 8,
              padding: "10px 18px",
              alignItems: "center",
              borderTop: "1px solid var(--border)",
              background: row.isMandatorySweepWeek ? "rgba(82, 168, 106, 0.06)" : (idx % 2 === 0 ? "transparent" : "rgba(15, 31, 58, 0.2)")
            }}
          >
            <div>
              <span className="mono" style={{ fontSize: 10.5, color: "var(--gold)", fontWeight: 700 }}>
                Week {row.weekNo}
              </span>
            </div>

            <div style={{ fontSize: 11.5, color: "var(--white)" }}>
              {row.dipTriggerCondition}
            </div>

            <div className="num" style={{ fontSize: 11, color: "var(--text)", textAlign: "right" }}>
              {formatCurrency(row.plannedForWeek, currency, false)}
            </div>

            <div className="num" style={{ fontSize: 11, color: row.carryIn > 0 ? "var(--gold-pale)" : "var(--text-dim)", textAlign: "right" }}>
              {row.carryIn > 0 ? `+${formatCurrency(row.carryIn, currency, false)}` : "₹0"}
            </div>

            <div className="num" style={{ fontSize: 11.5, color: "var(--white)", fontWeight: 600, textAlign: "right" }}>
              {formatCurrency(row.availablePool, currency, false)}
            </div>

            <div style={{ textAlign: "right" }}>
              <input
                type="number"
                value={row.effectiveDeployed}
                onChange={(e) => handleUpdateCycle(idx, "deployedAmount", Number(e.target.value))}
                style={{
                  width: 90,
                  background: "var(--bg)",
                  border: "1px solid var(--gold-dim)",
                  borderRadius: 6,
                  padding: "5px 8px",
                  color: "var(--white)",
                  fontSize: 11,
                  textAlign: "right"
                }}
              />
            </div>

            <div className="num" style={{
              fontSize: 11,
              fontWeight: 600,
              textAlign: "right",
              color: row.unspentAfterWeek > 0 ? "var(--warn)" : "var(--good)"
            }}>
              {row.unspentAfterWeek > 0 ? formatCurrency(row.unspentAfterWeek, currency, false) : "Cleared"}
            </div>
          </div>
        ))}
      </div>

      {/* LEVEL 2/3 — Configurable Sleeve Split & Shortfall-Guided Routing (Collapsible) */}
      <div className="glass" style={{ borderRadius: 12, overflow: "hidden" }}>
        <button
          onClick={() => setShowRoutingDrawer(!showRoutingDrawer)}
          style={{
            width: "100%",
            background: "var(--card-2)",
            border: "none",
            padding: "12px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            color: "var(--white)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Sliders size={14} color="var(--gold)" />
            <span className="mono" style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--gold)" }}>
              Sleeve Split Configuration & Shortfall-Guided Routing
            </span>
          </div>
          <span className="mono" style={{ fontSize: 9.5, color: "var(--text-dim)", display: "inline-flex", alignItems: "center", gap: 6 }}>
            {showRoutingDrawer ? "Collapse" : "Expand Routing"}
            {showRoutingDrawer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </button>

        {showRoutingDrawer && (
          <div style={{ padding: "18px", borderTop: "1px solid var(--border)", display: "flex", gap: 16, flexWrap: "wrap" }}>
            {/* Left: Configurable Sleeve Distribution */}
            <div style={{ flex: "1 1 420px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span className="mono" style={{ fontSize: 10, color: "var(--white)", textTransform: "uppercase" }}>
                  Configurable Monthly SIP Sleeve Split
                </span>
                <span className="mono" style={{ fontSize: 9.5, color: totalDistPct === 100 ? "var(--good)" : "var(--danger)" }}>
                  Total: {totalDistPct}%
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {sleeveAllocations.map((s) => (
                  <div
                    key={s.key}
                    style={{
                      background: "rgba(15, 22, 32, 0.7)",
                      border: "1px solid var(--border)",
                      borderLeft: `3px solid ${CAT_META[s.cat].hex}`,
                      borderRadius: 8,
                      padding: "8px 12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11.5, color: "var(--white)", fontWeight: 600 }}>{s.title}</div>
                      <div className="mono" style={{ fontSize: 8.5, color: "var(--text-dim)" }}>{s.instruments}</div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={s.pct}
                        onChange={(e) => persist({
                          ...sipState,
                          sleeveDistributionPct: {
                            ...sipState.sleeveDistributionPct,
                            [s.key]: Number(e.target.value)
                          }
                        })}
                        style={{
                          width: 50,
                          background: "var(--bg)",
                          border: "1px solid var(--border-2)",
                          borderRadius: 6,
                          padding: "4px 6px",
                          color: "var(--gold-pale)",
                          fontSize: 10.5,
                          textAlign: "right"
                        }}
                      />
                      <span className="mono" style={{ fontSize: 9.5, color: "var(--text-dim)" }}>%</span>
                    </div>

                    <div style={{ width: 95, textAlign: "right" }}>
                      <div className="num" style={{ fontSize: 11.5, color: "var(--white)", fontWeight: 700 }}>
                        {formatCurrency(s.monthlyAmount, currency, false)}
                      </div>
                      <div className="mono" style={{ fontSize: 8, color: "var(--text-dim)" }}>
                        {formatCurrency(s.weeklyAmount, currency, false)}/wk
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Target Shortfall-Driven Fresh Deployment Recommendations */}
            <div style={{ flex: "1 1 360px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <TrendingUp size={14} color="var(--good)" />
                <span className="mono" style={{ fontSize: 10, color: "var(--white)", textTransform: "uppercase" }}>
                  Shortfall-Guided Priority ({formatCurrency(monthlyBudget, currency, false)})
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {shortfallRecommendations.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: "rgba(15, 22, 32, 0.7)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: "8px 12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div style={{ fontSize: 11.5, color: "var(--white)", fontWeight: 500 }}>
                      {item.name}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span className="num" style={{ fontSize: 11.5, color: "var(--good)", fontWeight: 700 }}>
                        +{formatCurrency(item.allocatedAmount, currency, false)}
                      </span>
                      <span className="mono" style={{ fontSize: 8.5, color: "var(--text-dim)", marginLeft: 8 }}>
                        ({item.allocatedPct}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
