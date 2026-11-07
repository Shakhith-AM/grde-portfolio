import React, { useState, useMemo } from 'react';
import { StatCard } from '../components/common/StatCard';
import { AllocationDonut } from '../components/charts/AllocationDonut';
import { WealthProjector } from '../components/charts/WealthProjector';
import { CAT_META, CATS } from '../constants/masterData';
import { formatCurrency } from '../constants/currencies';
import { computeExpandedHealth, getHealthStatus } from '../utils/calculations';
import { 
  Wallet, 
  ShieldCheck, 
  Activity, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Layers
} from 'lucide-react';

export function DashboardView({ portfolioState, currency, onNavigate, onOpenExcelModal, age }) {
  const [expandHealth, setExpandHealth] = useState(false);
  const [expandAudit, setExpandAudit] = useState(false);
  const { alloc, assets, catSummary, equityBreakdown, oct2026ChartReconciliation, hasData, sumActual, effectiveTotal, isr } = portfolioState;

  const health = useMemo(() => {
    return computeExpandedHealth(assets, catSummary, alloc, effectiveTotal);
  }, [assets, catSummary, alloc, effectiveTotal]);

  const healthStatus = getHealthStatus(hasData ? health.overall : null);

  const donutData = CATS.map(cat => ({
    cat,
    label: CAT_META[cat].label,
    pct: hasData ? catSummary[cat].curPct : alloc[cat],
    val: hasData ? catSummary[cat].cur : (effectiveTotal * alloc[cat] / 100),
    color: CAT_META[cat].hex
  }));

  const activeAge = age || alloc?.age || 52;

  return (
    <div>
      {/* Header titles */}
      <div className="label">Executive Summary · 04/10/2026 Snapshot</div>
      <h2 style={{ fontSize: 32, margin: "8px 0 6px" }}>
        Portfolio <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Dashboard</span>
      </h2>
      <p style={{ fontSize: 13, color: "var(--text)", margin: "0 0 20px", maxWidth: 680 }}>
        Multi-asset wealth engineering across the <strong>10 : 15 : 25 : 50</strong> Beaver Dam Framework at Age {activeAge} (Band {alloc.range}).
      </p>

      {/* Top 4 Key Metric Tiles */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <StatCard
          label="GRDE Strategic Base"
          value={formatCurrency(effectiveTotal, currency, true)}
          sub={hasData ? `Actual: ${formatCurrency(sumActual, currency, true)} · Retirement Goal: ₹4.00 Cr` : "Reference ₹40L Base · Retirement Goal: ₹4.00 Cr"}
          accentColor="var(--gold)"
          icon={Wallet}
          badge={hasData ? "04/10/2026" : "BASELINE"}
        />

        <StatCard
          label="Income Stability Ratio (ISR)"
          value={`${isr.toFixed(1)}%`}
          sub={`Target Shield: ${(alloc.G + alloc.R + alloc.D).toFixed(1)}% (G+R+D)`}
          accentColor="var(--good)"
          icon={ShieldCheck}
          badge={isr >= 45 && isr <= 55 ? "SAFE ZONE (50%)" : isr > 55 ? "DEFENSIVE" : "GROWTH TILT"}
        />

        <StatCard
          label="GRDE Health Score"
          value={hasData ? `${health.overall}/100` : "—"}
          sub={healthStatus.text}
          accentColor="#e5a93c"
          icon={Activity}
          badge="8-FACTOR"
        />

        <StatCard
          label="Monthly SIP Cadence"
          value="₹64,000"
          sub="4 × ₹16,000 Weekly Cycles"
          accentColor="var(--d-color)"
          icon={Calendar}
          badge="DISCIPLINE"
        />
      </div>

      {/* Allocation breakdown & Donut */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        {/* Left: Donut & Legend */}
        <div className="glass" style={{ flex: "1 1 320px", borderRadius: 14, padding: "22px 24px" }}>
          <div className="label" style={{ marginBottom: 12 }}>Current vs Strategic Split (10:15:25:50)</div>
          <AllocationDonut
            data={donutData}
            size={190}
            currency={currency}
            totalValue={effectiveTotal}
            centerLabel={hasData ? "TARGET BASE" : "MODEL %"}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
            {CATS.map(cat => {
              const curPct = hasData ? catSummary[cat].curPct : alloc[cat];
              const tgtPct = alloc[cat];
              const diff = curPct - tgtPct;
              return (
                <div key={cat} style={{ background: "rgba(15, 22, 32, 0.7)", padding: "8px 12px", borderRadius: 8, borderLeft: `3px solid ${CAT_META[cat].hex}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="mono" style={{ fontSize: 10, color: "var(--white)", fontWeight: 600 }}>{cat}</span>
                    <span className="num" style={{ fontSize: 11, color: "var(--white)", fontWeight: 600 }}>{curPct.toFixed(1)}%</span>
                  </div>
                  <div className="mono" style={{ fontSize: 8, color: "var(--text-dim)", marginTop: 2 }}>
                    Target: {tgtPct}% {hasData && <span style={{ color: diff >= 0 ? "var(--good)" : "var(--danger)" }}>({diff >= 0 ? "+" : ""}{diff.toFixed(1)}%)</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: October 2026 Architecture Highlights & Quick Actions */}
        <div className="glass" style={{ flex: "1 1 380px", borderRadius: 14, padding: "22px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div className="label" style={{ marginBottom: 8 }}>Portfolio Command Center</div>
            <h3 style={{ fontSize: 20, color: "var(--white)", margin: "0 0 10px" }}>
              October 2026 Architecture
            </h3>
            <p style={{ fontSize: 12.5, color: "var(--text)", lineHeight: 1.6, margin: "0 0 16px" }}>
              Balanced across strategic Gold (G1–G3), 5 institutional REIT/InvITs, 4 defensive Debt sleeves (D1–D4), and the dual-engine E1 India + E2 US Equity structure.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, paddingBottom: 6, borderBottom: "1px solid var(--border)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--white)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--g-color)" }} />
                  <strong>G — Gold (10%)</strong>
                </span>
                <span className="num" style={{ color: "var(--text-dim)", fontSize: 11.5 }}>
                  {formatCurrency(catSummary.G.cur, currency, false)} / {formatCurrency(catSummary.G.tgt, currency, false)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, paddingBottom: 6, borderBottom: "1px solid var(--border)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--white)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--r-color)" }} />
                  <strong>R — REITs & InvITs (15%)</strong>
                </span>
                <span className="num" style={{ color: "var(--text-dim)", fontSize: 11.5 }}>
                  {formatCurrency(catSummary.R.cur, currency, false)} / {formatCurrency(catSummary.R.tgt, currency, false)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, paddingBottom: 6, borderBottom: "1px solid var(--border)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--white)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--d-color)" }} />
                  <strong>D — Debt D1–D4 (25%)</strong>
                </span>
                <span className="num" style={{ color: "var(--text-dim)", fontSize: 11.5 }}>
                  {formatCurrency(catSummary.D.cur, currency, false)} / {formatCurrency(catSummary.D.tgt, currency, false)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--white)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--e-color)" }} />
                  <strong>E — Equity E1+E2 (50%)</strong>
                </span>
                <span className="num" style={{ color: "var(--text-dim)", fontSize: 11.5 }}>
                  {formatCurrency(catSummary.E.cur, currency, false)} / {formatCurrency(catSummary.E.tgt, currency, false)}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
            <button
              onClick={() => onNavigate("tracker")}
              className="mono"
              style={{
                background: "linear-gradient(180deg, #d4a843, #8a7029)",
                color: "#0a1628",
                border: "none",
                borderRadius: 8,
                padding: "10px 16px",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <span>Portfolio Engine</span>
              <ArrowRight size={12} />
            </button>

            <button
              onClick={() => onNavigate("sip")}
              className="mono"
              style={{
                background: "rgba(82, 168, 106, 0.14)",
                border: "1px solid var(--good)",
                color: "var(--good)",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer"
              }}
            >
              ₹64k SIP Planner
            </button>
          </div>
        </div>
      </div>

      {/* Level 3 Progressive Disclosure: 04/10/2026 Snapshot & Audit Reconciliation (Collapsible) */}
      {oct2026ChartReconciliation && (
        <div className="glass" style={{ borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
          <button
            onClick={() => setExpandAudit(v => !v)}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "14px 22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Layers size={16} style={{ color: "var(--gold)" }} />
              <span className="mono" style={{ fontSize: 11, color: "var(--white)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                04/10/2026 Progress Chart Snapshot & Reconciliation
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="mono" style={{ fontSize: 10.5, color: "var(--gold-pale)" }}>
                Strategic: {formatCurrency(oct2026ChartReconciliation.grdePresentStrategicOnly, currency, false)} · Chart: {formatCurrency(oct2026ChartReconciliation.grdePresentChartWithTataSilv, currency, false)}
              </span>
              {expandAudit ? <ChevronUp size={16} color="var(--gold)" /> : <ChevronDown size={16} color="var(--gold)" />}
            </div>
          </button>

          {expandAudit && (
            <div style={{ borderTop: "1px solid var(--border)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))" }}>
                {[
                  {
                    title: "G — GOLD (10%)",
                    present: oct2026ChartReconciliation.gStrategicOnly,
                    subNote: `Chart w/ TATASILV: ${formatCurrency(oct2026ChartReconciliation.gWithTataSilv, currency, false)}`,
                    target: catSummary.G.tgt,
                    variance: oct2026ChartReconciliation.gStrategicVariance,
                    color: CAT_META.G.hex
                  },
                  {
                    title: "R — REITs/InvITs (15%)",
                    present: catSummary.R.cur,
                    subNote: "3 REITs + 2 InvITs",
                    target: catSummary.R.tgt,
                    variance: catSummary.R.varianceVal,
                    color: CAT_META.R.hex
                  },
                  {
                    title: "D — DEBT (25%)",
                    present: catSummary.D.cur,
                    subNote: "D1 + D2 + D3 + D4",
                    target: catSummary.D.tgt,
                    variance: catSummary.D.varianceVal,
                    color: CAT_META.D.hex
                  },
                  {
                    title: "E1 — IND EQUITY (30%)",
                    present: equityBreakdown.e1TotalActual,
                    subNote: `Passive ${formatCurrency(equityBreakdown.e1PassiveActual, currency, true)} · Active ${formatCurrency(equityBreakdown.e1ActiveSubtotalActual, currency, true)}`,
                    target: equityBreakdown.e1TotalTarget,
                    variance: equityBreakdown.e1Variance,
                    color: CAT_META.E.hex
                  },
                  {
                    title: "E2 — US EQUITY (20%)",
                    present: equityBreakdown.e2TotalActual,
                    subNote: "VOO/QQQM/SCHD/MOM + MON100",
                    target: equityBreakdown.e2TotalTarget,
                    variance: equityBreakdown.e2Variance,
                    color: "#38bdf8"
                  },
                  {
                    title: "GRDE TOTAL (100%)",
                    present: oct2026ChartReconciliation.grdePresentChartWithTataSilv,
                    subNote: `GRDE + NPS: ${formatCurrency(oct2026ChartReconciliation.grdePlusNpsChartTotal, currency, false)}`,
                    target: oct2026ChartReconciliation.grdeTarget,
                    variance: oct2026ChartReconciliation.grdeChartVariance,
                    color: "var(--gold)"
                  }
                ].map((col, idx) => (
                  <div
                    key={col.title}
                    style={{
                      padding: "12px 14px",
                      borderRight: idx < 5 ? "1px solid var(--border)" : "none",
                      borderTop: `2px solid ${col.color}`
                    }}
                  >
                    <div className="mono" style={{ fontSize: 9, color: col.color, fontWeight: 700 }}>{col.title}</div>
                    <div className="num" style={{ fontSize: 13.5, color: "var(--white)", fontWeight: 700, marginTop: 4 }}>
                      {formatCurrency(col.present, currency, false)}
                    </div>
                    <div className="mono" style={{ fontSize: 8.5, color: "var(--text-dim)", marginTop: 2 }}>
                      Target: {formatCurrency(col.target, currency, false)}
                    </div>
                    <div className="num" style={{
                      fontSize: 10,
                      fontWeight: 700,
                      marginTop: 3,
                      color: col.variance >= 0 ? "var(--good)" : "var(--danger)"
                    }}>
                      {col.variance >= 0 ? "+" : ""}{formatCurrency(col.variance, currency, false)}
                    </div>
                    <div className="mono" style={{ fontSize: 8, color: "var(--gold-pale)", marginTop: 2 }}>
                      {col.subNote}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 8-Factor Health Score Breakdown (Collapsible) */}
      <div className="glass" style={{ borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
        <button
          onClick={() => setExpandHealth(v => !v)}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "14px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Activity size={16} style={{ color: "var(--gold)" }} />
            <span className="mono" style={{ fontSize: 11, color: "var(--white)", letterSpacing: "0.16em", textTransform: "uppercase" }}>
              Proprietary 8-Factor Health Score Audit
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="mono" style={{ fontSize: 11, color: healthStatus.color, fontWeight: 600 }}>
              {health.overall}/100 · {healthStatus.text}
            </span>
            {expandHealth ? <ChevronUp size={16} color="var(--gold)" /> : <ChevronDown size={16} color="var(--gold)" />}
          </div>
        </button>

        {expandHealth && (
          <div style={{ padding: "0 22px 20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginTop: 10 }}>
              {health.factors.map((f) => {
                const fColor = f.score >= 75 ? "var(--good)" : f.score >= 50 ? "var(--gold)" : "var(--danger)";
                return (
                  <div key={f.key} style={{ background: "rgba(15, 22, 32, 0.7)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span className="mono" style={{ fontSize: 11, color: "var(--white)", fontWeight: 500 }}>{f.label}</span>
                      <span className="num" style={{ fontSize: 12, color: fColor, fontWeight: 700 }}>{Math.round(f.score)}/100</span>
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 8 }}>{f.desc}</div>
                    <div style={{ width: "100%", height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${f.score}%`, height: "100%", background: fColor, borderRadius: 2, transition: "width 0.4s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* FIRE & Wealth Projector */}
      <WealthProjector netWorth={effectiveTotal} currency={currency} age={activeAge} />
    </div>
  );
}
