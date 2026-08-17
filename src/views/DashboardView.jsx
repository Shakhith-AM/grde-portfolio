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
  Sparkles
} from 'lucide-react';

export function DashboardView({ portfolioState, currency, onNavigate, onOpenExcelModal }) {
  const [expandHealth, setExpandHealth] = useState(false);
  const { alloc, assets, catSummary, hasData, effectiveTotal, isr } = portfolioState;

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

  return (
    <div>
      {/* Header titles */}
      <div className="label">Executive Summary</div>
      <h2 style={{ fontSize: 32, margin: "8px 0 6px" }}>
        Portfolio <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Dashboard</span>
      </h2>
      <p style={{ fontSize: 13, color: "var(--text)", margin: "0 0 22px", maxWidth: 640 }}>
        Live multi-asset wealth management overview synthesized from the Beaver Dam Framework.
        {!hasData && (
          <span style={{ color: "var(--gold-pale)", marginLeft: 6 }}>
            (Showing blueprint baseline — enter actual holdings or sync Excel to activate live scoring).
          </span>
        )}
      </p>

      {/* Top 4 Key Metric Tiles */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <StatCard
          label="Total Net Worth"
          value={hasData ? formatCurrency(effectiveTotal, currency, true) : "—"}
          sub={hasData ? "Synced from holdings tracker" : "No live holdings entered"}
          accentColor="var(--gold)"
          icon={Wallet}
          badge={hasData ? "LIVE" : "BASELINE"}
        />

        <StatCard
          label="Income Stability Ratio (ISR)"
          value={`${isr.toFixed(1)}%`}
          sub="G + R + D Defense Portion"
          accentColor="var(--good)"
          icon={ShieldCheck}
          badge={isr >= 45 && isr <= 55 ? "SAFE ZONE" : isr > 55 ? "DEFENSIVE" : "GROWTH TILT"}
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
          label="Income Calendar"
          value="Quarterly"
          sub="REITs & InvITs cashflow"
          accentColor="var(--d-color)"
          icon={Calendar}
          badge="AUTOMATED"
        />
      </div>

      {/* Allocation breakdown & Donut */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        {/* Left: Donut & Legend */}
        <div className="glass" style={{ flex: "1 1 320px", borderRadius: 14, padding: "22px 24px" }}>
          <div className="label" style={{ marginBottom: 12 }}>Current Capital Split</div>
          <AllocationDonut
            data={donutData}
            size={190}
            currency={currency}
            totalValue={effectiveTotal}
            centerLabel={hasData ? "NET WORTH" : "MODEL %"}
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

        {/* Right: Quick actions & status */}
        <div className="glass" style={{ flex: "1 1 380px", borderRadius: 14, padding: "22px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div className="label" style={{ marginBottom: 8 }}>Portfolio Command Center</div>
            <h3 style={{ fontSize: 20, color: "var(--white)", margin: "0 0 10px" }}>
              Framework Insights & Action Points
            </h3>
            <p style={{ fontSize: 12.5, color: "var(--text)", lineHeight: 1.6, margin: "0 0 16px" }}>
              The Beaver Dam structure balances high equity growth with defensive real assets. Keep emergency cash funded and monitor international equity allocations.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text)" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--good)" }} />
                <span>Liquid Fund buffer (D_LIQ): <strong>{hasData ? (assets.find(a=>a.id==='d_liq')?.currentVal > 0 ? "Funded" : "Needs Allocation") : "Standard Target"}</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text)" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)" }} />
                <span>Gold Anchor (G_GOLD): <strong>{alloc.G}% model weight active</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text)" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--e-color)" }} />
                <span>Global Equity Hedge (E_ETFUS): <strong>35% of Equity bucket</strong></span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
            <button
              onClick={() => onNavigate("tracker")}
              className="mono"
              style={{
                background: "linear-gradient(180deg, #d4a843, #8a7029)",
                color: "#0a1628",
                border: "none",
                borderRadius: 8,
                padding: "10px 18px",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <span>Manage Holdings</span>
              <ArrowRight size={12} />
            </button>

            <button
              onClick={onOpenExcelModal}
              className="mono"
              style={{
                background: "transparent",
                border: "1px solid var(--border-2)",
                color: "var(--good)",
                borderRadius: 8,
                padding: "10px 16px",
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer"
              }}
            >
              Sync Monthly SIP
            </button>
          </div>
        </div>
      </div>

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
      <WealthProjector netWorth={effectiveTotal} currency={currency} age={alloc.age || 35} />
    </div>
  );
}
