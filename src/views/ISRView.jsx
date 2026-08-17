import React, { useMemo } from 'react';
import { StabilityGauge } from '../components/charts/StabilityGauge';
import { CAT_META, CATS, AGE_BANDS } from '../constants/masterData';
import { formatCurrency } from '../constants/currencies';
import { getAllocation, getBand, round1 } from '../utils/calculations';
import { ShieldCheck, CheckCircle2, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

export function ISRView({ portfolioState, currency = "INR" }) {
  const { alloc, assets, catSummary, hasData, isr, effectiveTotal } = portfolioState;
  const targetISR = alloc.G + alloc.R + alloc.D;
  const band = getBand(alloc.age || 50);

  // Top 6 rebalancing priorities
  const rebalancePriorities = useMemo(() => {
    if (!hasData) return [];
    return [...assets]
      .filter(a => a.targetVal > 0)
      .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
      .slice(0, 6);
  }, [hasData, assets]);

  // Age Warnings
  const ageDiagnostics = CATS.map(cat => {
    if (!hasData) return null;
    const diff = catSummary[cat].curPct - catSummary[cat].tgtPct;
    const absDiff = Math.abs(diff);
    if (absDiff < 2) {
      return { cat, status: "ok", msg: `${CAT_META[cat].label} is aligned at ${catSummary[cat].curPct.toFixed(1)}% (Target: ${catSummary[cat].tgtPct}%)` };
    }
    if (diff > 0) {
      return { cat, status: "over", msg: `${CAT_META[cat].label} is ${absDiff.toFixed(1)}% above target — consider pausing fresh SIPs or trimming` };
    }
    return { cat, status: "under", msg: `${CAT_META[cat].label} is ${absDiff.toFixed(1)}% below target — priority candidate for fresh monthly SIP allocation` };
  }).filter(Boolean);

  return (
    <div>
      {/* Header */}
      <div className="label">Investment Safety & Resilience</div>
      <h2 style={{ fontSize: 32, margin: "8px 0 4px" }}>
        ISR <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Analysis Engine</span>
      </h2>
      <p style={{ fontSize: 13, color: "var(--text)", margin: "0 0 20px", maxWidth: 680 }}>
        The <strong>Income Stability Ratio (ISR)</strong> calculates the proportion of your net worth safeguarded in defensive and income-yielding assets: <strong>ISR = (Gold + Real Estate + Debt) / Total</strong>.
      </p>

      {/* Stability Gauge Card */}
      <div className="glass" style={{ borderRadius: 14, padding: "24px 28px", textAlign: "center", marginBottom: 20 }}>
        <div className="label" style={{ textAlign: "left", marginBottom: 10 }}>Portfolio Stability & Defensive Gauge</div>
        
        <StabilityGauge value={isr} size={280} targetValue={targetISR} />

        <div style={{
          fontFamily: "Cinzel",
          fontSize: 42,
          fontWeight: 700,
          color: "var(--white)",
          marginTop: -16
        }}>
          {isr.toFixed(1)}%
        </div>

        <div className="mono" style={{ fontSize: 10, color: "var(--gold-pale)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Current Income Stability Ratio
        </div>

        <div style={{
          display: "inline-flex",
          gap: 16,
          background: "rgba(15, 22, 32, 0.7)",
          border: "1px solid var(--border)",
          borderRadius: 999,
          padding: "6px 18px",
          marginTop: 14,
          fontSize: 11
        }}>
          <span className="mono" style={{ color: "var(--text-dim)" }}>
            Model Target: <strong style={{ color: "var(--gold)" }}>{targetISR.toFixed(1)}%</strong> (Band {band})
          </span>
          <span className="mono" style={{ color: Math.abs(isr - targetISR) < 3 ? "var(--good)" : "var(--warn)" }}>
            Deviation: {isr >= targetISR ? "+" : ""}{(isr - targetISR).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Live vs Target 4-column metric grid */}
      <div className="glass" style={{ borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
          <span className="mono" style={{ fontSize: 11, color: "var(--white)", letterSpacing: "0.16em", textTransform: "uppercase" }}>
            Capital Shield Audit: Live vs Framework Target
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
          {[
            { label: "Live ISR (Shield)", value: hasData ? `${isr.toFixed(1)}%` : "—", sub: "G + R + D actual", color: "var(--good)" },
            { label: "Target ISR", value: `${targetISR.toFixed(1)}%`, sub: `Age ${alloc.age || 50} target`, color: "var(--gold)" },
            { label: "Live Growth Engine", value: hasData ? `${catSummary.E.curPct.toFixed(1)}%` : "—", sub: "Equity actual", color: "var(--e-color)" },
            { label: "Target Growth", value: `${alloc.E}%`, sub: "Equity target", color: "var(--text-dim)" },
          ].map((item, i) => (
            <div key={i} style={{
              padding: "18px 16px",
              textAlign: "center",
              borderRight: i < 3 ? "1px solid var(--border)" : "none",
              background: i % 2 === 0 ? "transparent" : "rgba(15, 31, 58, 0.2)"
            }}>
              <div className="mono" style={{ fontSize: 9, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 6 }}>
                {item.label}
              </div>
              <div style={{ fontFamily: "Cinzel", fontSize: 26, color: item.color, fontWeight: 700 }}>
                {item.value}
              </div>
              <div className="mono" style={{ fontSize: 9, color: "var(--text-dim)", marginTop: 4 }}>
                {item.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rebalancing Priority Matrix */}
      {hasData && rebalancePriorities.length > 0 && (
        <div className="glass" style={{ borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className="mono" style={{ fontSize: 11, color: "var(--white)", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                Rebalancing Action Priorities
              </span>
              <span className="mono" style={{ fontSize: 9, color: "var(--text-dim)", marginLeft: 10 }}>
                Ranked by absolute capital deviation (Top 6)
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "24px 1.5fr 80px 100px 100px 80px", gap: 8, padding: "10px 18px", background: "var(--card-2)" }}>
            {["#", "Asset Name", "Category", "Current", "Target", "Action"].map((h, i) => (
              <div key={i} className="mono" style={{ fontSize: 9, color: "var(--text-dim)", textTransform: "uppercase", textAlign: i >= 3 ? "right" : "left" }}>
                {h}
              </div>
            ))}
          </div>

          {rebalancePriorities.map((a, i) => {
            const isBuy = a.variance < -1000;
            const isTrim = a.variance > 1000;
            const actionText = isBuy ? "TOP-UP" : isTrim ? "TRIM" : "HOLD";
            const actionColor = isBuy ? "var(--good)" : isTrim ? "var(--danger)" : "var(--gold)";

            return (
              <div
                key={a.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "24px 1.5fr 80px 100px 100px 80px",
                  gap: 8,
                  padding: "10px 18px",
                  alignItems: "center",
                  borderTop: "1px solid var(--border)",
                  background: i % 2 === 0 ? "transparent" : "rgba(15, 31, 58, 0.25)"
                }}
              >
                <div className="mono" style={{ fontSize: 10, color: "var(--text-dim)" }}>{i + 1}</div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--white)", fontWeight: 500 }}>{a.name}</div>
                  <div className="mono" style={{ fontSize: 8.5, color: "var(--text-dim)" }}>{a.desc}</div>
                </div>
                <div>
                  <span style={{
                    fontFamily: "Cinzel",
                    fontSize: 9.5,
                    fontWeight: 700,
                    color: CAT_META[a.cat].hex,
                    background: `${CAT_META[a.cat].hex}18`,
                    padding: "2px 6px",
                    borderRadius: 4
                  }}>
                    {a.cat}
                  </span>
                </div>
                <div className="num" style={{ fontSize: 11, color: "var(--white)", textAlign: "right" }}>
                  {formatCurrency(a.currentVal, currency, true)}
                </div>
                <div className="num" style={{ fontSize: 11, color: "var(--text-dim)", textAlign: "right" }}>
                  {formatCurrency(a.targetVal, currency, true)}
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className="mono" style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: actionColor,
                    background: `${actionColor}18`,
                    border: `1px solid ${actionColor}44`,
                    borderRadius: 4,
                    padding: "3px 8px"
                  }}>
                    {actionText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Age Band Matrix */}
      <div className="glass" style={{ borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="mono" style={{ fontSize: 11, color: "var(--white)", letterSpacing: "0.16em", textTransform: "uppercase" }}>
            Framework Lifecycle Matrix
          </span>
          <span className="mono" style={{ fontSize: 9.5, color: "var(--gold)" }}>
            ACTIVE BAND: {band}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 1fr 1fr 1fr 80px", padding: "10px 18px", background: "var(--card-2)" }}>
          {["Age Band", "G (Gold)", "R (Real Estate)", "D (Debt)", "E (Equity)", "ISR Total"].map((h, i) => (
            <div key={i} className="mono" style={{
              fontSize: 9,
              color: i === 0 ? "var(--text-dim)" : i === 5 ? "var(--good)" : CAT_META[CATS[i - 1]]?.hex,
              textTransform: "uppercase"
            }}>
              {h}
            </div>
          ))}
        </div>

        {AGE_BANDS.map((row, i) => {
          const isCurrent = row.range === band;
          const bandAge = 18 + i * 5;
          const mAlloc = getAllocation(bandAge);
          const bandISR = round1(mAlloc.G + mAlloc.R + mAlloc.D);

          return (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "90px 1fr 1fr 1fr 1fr 80px",
                padding: "9px 18px",
                background: isCurrent ? "rgba(212, 168, 67, 0.1)" : (i % 2 === 0 ? "transparent" : "rgba(15, 31, 58, 0.3)"),
                borderLeft: isCurrent ? "3px solid var(--gold)" : "3px solid transparent",
                borderTop: "1px solid rgba(255,255,255,0.02)"
              }}
            >
              <div className="num" style={{ fontSize: 11, color: isCurrent ? "var(--gold)" : "var(--text)", fontWeight: isCurrent ? 700 : 400 }}>
                {isCurrent ? "▸ " : ""}{row.range}
              </div>
              <div className="num" style={{ fontSize: 11, color: "var(--white)" }}>{mAlloc.G}%</div>
              <div className="num" style={{ fontSize: 11, color: "var(--white)" }}>{mAlloc.R}%</div>
              <div className="num" style={{ fontSize: 11, color: "var(--white)" }}>{mAlloc.D}%</div>
              <div className="num" style={{ fontSize: 11, color: "var(--white)" }}>{mAlloc.E}%</div>
              <div className="num" style={{ fontSize: 11, color: "var(--good)", fontWeight: 600 }}>{bandISR}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
