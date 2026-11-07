import React, { useState } from 'react';
import { CAT_META, CATS, AUXILIARY_SLEEVES } from '../constants/masterData';
import { formatCurrency } from '../constants/currencies';
import { Printer, Copy, Check, Info, ChevronDown, ChevronUp, Layers } from 'lucide-react';

export function BlueprintView({ portfolioState, currency }) {
  const [copied, setCopied] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [showMethodology, setShowMethodology] = useState(false);

  const { alloc, assets, goldBreakdown, equityBreakdown, auxiliaryHoldings, hasData, effectiveTotal } = portfolioState;

  const copyBlueprint = async () => {
    const lines = [
      "═══════════════════════════════════════════════════════════════",
      "GRDE FRAMEWORK ARCHITECTURAL BLUEPRINT — v5.4 (OCTOBER 2026)",
      "The Beaver Dam Method · Age Band 50–55 · Reference ₹40,00,000",
      "═══════════════════════════════════════════════════════════════",
      "",
      `🟡 G (GOLD — 4-SLEEVE ARCHITECTURE): ${alloc.G}% OF PORTFOLIO (₹4,00,000 at ₹40L)`,
      "   • G1 — GoldBeES (Primary fresh Gold target · Oct 4 Chart Target ₹3,40,000 / 8.5%)",
      "   • G1 Transition — GLDM (US) (Oct 4 Historical Target ₹60,000 / 1.5% preserved; Gradual Transition Holding with ₹0 permanent fresh target)",
      "   • G2 — Sovereign Gold Bonds (Configurable strategic split pending confirmation)",
      "   • G3 — Physical Gold (Configurable strategic split pending confirmation)",
      "   • [Auxiliary Outside G] G4 — Physical Foreign Currency (travel reserve)",
      "   • [Tactical Outside G] TATASILV — Controlled recovery & exit -> GoldBeES",
      "",
      `🔴 R (REITs & InvITs): ${alloc.R}% OF PORTFOLIO (₹6,00,000 at ₹40L)`,
      "   • Mindspace REIT        — 20% of R (3.0% GRDE · ₹1,20,000)",
      "   • KRT REIT              — 20% of R (3.0% GRDE · ₹1,20,000)",
      "   • Nexus Select REIT     — 20% of R (3.0% GRDE · ₹1,20,000)",
      "   • IndiGrid InvIT        — 24% of R (3.6% GRDE · ₹1,44,000)",
      "   • IRB InvIT             — 16% of R (2.4% GRDE · ₹96,000)",
      "",
      `🔵 D (DEBT — 4-SLEEVE ARCHITECTURE): ${alloc.D}% OF PORTFOLIO (₹10,00,000 at ₹40L)`,
      "   • D1 — Liquid + Ultra Short Duration (Jio BlackRock + Nippon) — ₹2,00,000",
      "   • D2 — POMIS / Fixed Deposits                                 — ₹4,50,000",
      "   • D3 — Bonds (Wint Wealth individually selected)              — ₹2,00,000",
      "   • D4 — Dynamic Bond Funds (Nippon Dynamic Bond Fund)          — ₹1,50,000",
      "   • [Separate Outside GRDE] NPS Tier I tracked separately",
      "",
      `🟢 E (EQUITY ENGINE — E1 INDIA + E2 US): ${alloc.E}% OF PORTFOLIO (₹20,00,000 at ₹40L)`,
      "   ▸ E1 — INDIAN EQUITY (₹12,00,000 Target = 30% of GRDE · ₹15,92,238.35 Present):",
      "     • E1 Passive (₹6,00,000 Target · ₹3,48,662.35 Present): Nifty 50 ETF (₹1.5L), Nifty Next 50 ETF (₹1.5L), Nifty 500 ETF (₹1.5L), Nifty Healthcare ETF (₹1.5L)",
      "     • E1 Active Core (₹6,00,000 Target · ₹7,15,666.00 Present): HDFC BAF (₹60k), HDFC Small Cap (₹90k), Motilal Oswal Midcap (₹1.5L), PPFAS Flexicap (₹3.0L)",
      "     • E1 Active — Legacy / Transition (₹0 Target · ₹5,27,910.00 Present): Legacy Active MFs (₹4,49,992.00) + Mirae Healthcare Active Transition (₹77,918.00) -> E1 Active Combined Subtotal: ₹12,43,576.00",
      "   ▸ E2 — US EQUITY (₹8,00,000 = 20% of GRDE):",
      "     • VOO (S&P 500 Core): 10% of GRDE (₹4,00,000)",
      "     • QQQM (Nasdaq-100 Growth): 4% of GRDE (₹1,60,000)",
      "     • SCHD (Dividend US Equity; moved from D): 3% of GRDE (₹1,20,000; dividends -> Momentum)",
      "     • Invesco Momentum ETF (Configurable ticker): 3% of GRDE (₹1,20,000)",
      "     • MON100 tracked as Transition Holding (fresh Nasdaq -> QQQM)",
      "",
      `Income Stability Ratio (ISR): ${(alloc.G + alloc.R + alloc.D).toFixed(1)}%`,
      "═══════════════════════════════════════════════════════════════"
    ];

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  const getStatusBadge = (a) => {
    if (a.holdingType === "LEGACY") return { label: "LEGACY", color: "var(--warn)" };
    if (a.holdingType === "TRANSITION") return { label: "TRANSITION", color: "#38bdf8" };
    if (a.configurableGoldSplit && a.targetVal === 0) return { label: "CONFIGURABLE", color: "var(--gold)" };
    return { label: "CORE", color: "var(--good)" };
  };

  return (
    <div style={{ maxWidth: 920, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
        <div>
          <div className="label">October 2026 Consolidated Architecture</div>
          <h2 style={{ fontSize: 32, margin: "8px 0 4px" }}>
            GRDE <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Blueprint</span> 🏛️
          </h2>
          <div style={{ fontSize: 12.5, color: "var(--text-dim)", fontStyle: "italic", fontFamily: "Cinzel" }}>
            Strategic 10 : 15 : 25 : 50 Allocation · Reference {formatCurrency(effectiveTotal, currency, false)}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => window.print()}
            className="mono"
            style={{
              background: "linear-gradient(180deg, #d4a843, #8a7029)",
              color: "#0a1628",
              border: "none",
              borderRadius: 8,
              padding: "8px 14px",
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
            <Printer size={13} />
            <span>Print PDF</span>
          </button>

          <button
            onClick={copyBlueprint}
            className="mono"
            style={{
              background: copied ? "rgba(82,168,106,0.15)" : "transparent",
              border: `1px solid ${copied ? "var(--good)" : "var(--border-2)"}`,
              color: copied ? "var(--good)" : "var(--text)",
              borderRadius: 8,
              padding: "8px 14px",
              fontSize: 10,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? "Copied" : "Copy Blueprint"}</span>
          </button>
        </div>
      </div>

      {/* Master Allocation Strip: G 10% | R 15% | D 25% | E 50% */}
      <div className="glass" style={{ borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
          {CATS.map((cat, idx) => {
            const m = CAT_META[cat];
            const targetAtCurrent = (effectiveTotal * alloc[cat]) / 100;
            return (
              <div
                key={cat}
                style={{
                  padding: "16px 20px",
                  borderRight: idx < 3 ? "1px solid var(--border)" : "none",
                  borderTop: `3px solid ${m.hex}`
                }}
              >
                <div className="mono" style={{ fontSize: 9.5, color: m.hex, fontWeight: 700, letterSpacing: "0.12em" }}>
                  {cat} — {m.label}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ fontFamily: "Cinzel", fontSize: 28, color: "var(--white)", fontWeight: 700 }}>
                    {alloc[cat]}%
                  </span>
                  <span className="num" style={{ fontSize: 13, color: "var(--gold-pale)", fontWeight: 600 }}>
                    {formatCurrency(targetAtCurrent, currency, false)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4 Category Architectural Cards (Level 1 Compact Rows + Level 2 Expandable Row Info) */}
      {CATS.map(cat => {
        const m = CAT_META[cat];
        const catAssets = assets.filter(a => a.cat === cat && !(a.id === "r_dc_legacy" && a.currentVal === 0));
        const targetPct = alloc[cat];
        const catTotalLive = catAssets.reduce((s, a) => s + a.currentVal, 0);
        const catTargetVal = (effectiveTotal * targetPct) / 100;
        const livePct = effectiveTotal > 0 ? (catTotalLive / effectiveTotal) * 100 : 0;

        return (
          <div
            key={cat}
            className="glass"
            style={{
              borderRadius: 14,
              marginBottom: 16,
              overflow: "hidden",
              borderLeft: `4px solid ${m.hex}`
            }}
          >
              {/* Category Header */}
              <div style={{
                background: `linear-gradient(135deg, ${m.hex}14, transparent)`,
                padding: "12px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--border)",
                flexWrap: "wrap",
                gap: 10
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{
                    fontFamily: "Cinzel",
                    fontSize: 19,
                    fontWeight: 700,
                    color: m.hex,
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `${m.hex}16`,
                    border: `1px solid ${m.hex}40`
                  }}>
                    {cat}
                  </span>
                  <div>
                    <div style={{ fontFamily: "Cinzel", fontSize: 15, color: "var(--white)", fontWeight: 600 }}>
                      {cat} — {m.label}
                    </div>
                    <div className="mono" style={{ fontSize: 9, color: "var(--text-dim)", marginTop: 2 }}>
                      {m.tag}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "Cinzel", fontSize: 20, color: m.hex, fontWeight: 700 }}>
                    {targetPct}% · {formatCurrency(catTargetVal, currency, false)}
                  </div>
                  {hasData && (
                    <div className="num" style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 1 }}>
                      Actual: {formatCurrency(catTotalLive, currency, false)} ({livePct.toFixed(1)}%)
                    </div>
                  )}
                </div>
              </div>

              {/* Clean Sub-Sleeve Bar for E (E1 Passive | E1 Active | E2 US) */}
              {cat === "E" && equityBreakdown && (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  background: "rgba(10, 16, 26, 0.55)",
                  borderBottom: "1px solid var(--border)"
                }}>
                  {[
                    {
                      label: "E1 Passive (15%)",
                      cur: equityBreakdown.e1PassiveActual,
                      tgt: equityBreakdown.e1PassiveTarget
                    },
                    {
                      label: "E1 Active + Legacy (15%)",
                      cur: equityBreakdown.e1ActiveSubtotalActual,
                      tgt: equityBreakdown.e1ActiveTarget
                    },
                    {
                      label: "E2 US Equity (20%)",
                      cur: equityBreakdown.e2TotalActual,
                      tgt: equityBreakdown.e2TotalTarget
                    }
                  ].map((sub, sIdx) => (
                    <div
                      key={sub.label}
                      style={{
                        padding: "7px 20px",
                        borderRight: sIdx < 2 ? "1px solid var(--border)" : "none",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <span className="mono" style={{ fontSize: 9, color: "var(--text-dim)" }}>{sub.label}</span>
                      <span className="num" style={{ fontSize: 10.5, color: "var(--white)", fontWeight: 600 }}>
                        {formatCurrency(sub.cur, currency, true)} / {formatCurrency(sub.tgt, currency, true)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

            {/* Compact Constituent Holding Rows */}
            <div style={{ padding: "4px 20px 8px" }}>
              {catAssets.map((a, i) => {
                const badge = getStatusBadge(a);
                const isExpanded = expandedRowId === a.id;

                return (
                  <div
                    key={a.id}
                    style={{
                      borderBottom: i < catAssets.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      padding: "8px 0"
                    }}
                  >
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 125px 125px 96px 26px",
                      alignItems: "center",
                      gap: 10
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                        <span className="mono" style={{ fontSize: 9, color: "var(--text-dim)", width: 46, flexShrink: 0 }}>
                          {a.sleeveCode}
                        </span>
                        <span style={{ fontSize: 12.5, color: "var(--white)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {a.name}
                        </span>
                      </div>

                      <div className="num" style={{ fontSize: 11.5, color: "var(--white)", textAlign: "right", fontWeight: 600 }}>
                        {formatCurrency(a.currentVal, currency, false)}
                      </div>

                      <div className="num" style={{ fontSize: 11.5, color: a.isLegacyOrTransition ? "var(--text-dim)" : "var(--gold-pale)", textAlign: "right" }}>
                        {a.id === "g_gldm"
                          ? "₹0 (Oct: ₹60k)"
                          : a.configurableGoldSplit && a.targetVal === 0
                            ? "Configurable"
                            : a.isLegacyOrTransition
                              ? "₹0"
                              : formatCurrency(a.targetVal, currency, false)}
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <span className="mono" style={{
                          fontSize: 8,
                          color: badge.color,
                          border: `1px solid ${badge.color}55`,
                          borderRadius: 4,
                          padding: "2px 6px",
                          letterSpacing: "0.08em"
                        }}>
                          {badge.label}
                        </span>
                      </div>

                      <button
                        onClick={() => setExpandedRowId(isExpanded ? null : a.id)}
                        title="View classification & methodology notes"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: isExpanded ? "var(--gold)" : "var(--text-dim)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 2
                        }}
                      >
                        <Info size={13} />
                      </button>
                    </div>

                    {/* Level 2 — Why (Strategic Rationale & Classification) */}
                    {isExpanded && (
                      <div className="mono" style={{
                        marginTop: 6,
                        marginLeft: 54,
                        padding: "9px 14px",
                        background: "rgba(15, 22, 32, 0.8)",
                        borderRadius: 6,
                        borderLeft: `2px solid ${badge.color}`,
                        fontSize: 9.5,
                        color: "var(--text-dim)",
                        lineHeight: 1.5
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                          <span><strong style={{ color: "var(--gold-pale)" }}>WHY ({badge.label}):</strong> {a.sub}</span>
                          <span>Strategic Weight: <strong style={{ color: "var(--white)" }}>{a.finalPct.toFixed(2)}% of GRDE</strong></span>
                        </div>
                        <div style={{ marginTop: 3 }}>{a.desc}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Level 3 — How It Was Calculated (Sub-Sleeve Math, Transition Proof & Auxiliary Holdings) */}
      <div className="glass" style={{ borderRadius: 14, overflow: "hidden", marginTop: 18 }}>
        <button
          onClick={() => setShowMethodology(v => !v)}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Layers size={15} style={{ color: "var(--gold)" }} />
            <span className="mono" style={{ fontSize: 10.5, color: "var(--white)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Level 3 · Calculation Proof, Sub-Sleeve Totals & Auxiliary Holdings (G4 · NPS · TATASILV)
            </span>
          </div>
          {showMethodology ? <ChevronUp size={16} color="var(--gold)" /> : <ChevronDown size={16} color="var(--gold)" />}
        </button>

        {showMethodology && (
          <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--border)" }}>
            {/* E1 & G Subtotals */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginTop: 14, marginBottom: 14 }}>
              {goldBreakdown && (
                <div style={{ background: "rgba(15, 22, 32, 0.7)", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)" }}>
                  <div className="mono" style={{ fontSize: 9, color: "var(--gold)" }}>G — GOLD SUB-SLEEVES</div>
                  <div className="num" style={{ fontSize: 12, color: "var(--white)", fontWeight: 700, marginTop: 3 }}>
                    GoldBeES: {formatCurrency(goldBreakdown.gGoldbeesActual, currency, false)}
                  </div>
                  <div className="mono" style={{ fontSize: 8.5, color: "var(--text-dim)", marginTop: 2 }}>
                    GLDM Transition: {formatCurrency(goldBreakdown.gGldmTransitionActual, currency, false)} (Oct Ref: ₹60,000) · G1–G3 split configurable
                  </div>
                </div>
              )}
              {equityBreakdown && (
                <>
                  <div style={{ background: "rgba(15, 22, 32, 0.7)", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)" }}>
                    <div className="mono" style={{ fontSize: 9, color: "var(--good)" }}>E1 PASSIVE SUBTOTAL</div>
                    <div className="num" style={{ fontSize: 12, color: "var(--white)", fontWeight: 700, marginTop: 3 }}>
                      {formatCurrency(equityBreakdown.e1PassiveActual, currency, false)} / {formatCurrency(equityBreakdown.e1PassiveTarget, currency, false)}
                    </div>
                    <div className="mono" style={{ fontSize: 8.5, color: "var(--text-dim)", marginTop: 2 }}>
                      Nifty 50, Next 50, 500 & Healthcare ETF ({formatCurrency(equityBreakdown.e1PassiveVariance, currency, false)})
                    </div>
                  </div>
                  <div style={{ background: "rgba(15, 22, 32, 0.7)", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)" }}>
                    <div className="mono" style={{ fontSize: 9, color: "var(--gold)" }}>E1 ACTIVE SUBTOTAL</div>
                    <div className="num" style={{ fontSize: 12, color: "var(--white)", fontWeight: 700, marginTop: 3 }}>
                      {formatCurrency(equityBreakdown.e1ActiveSubtotalActual, currency, false)} / {formatCurrency(equityBreakdown.e1ActiveTarget, currency, false)}
                    </div>
                    <div className="mono" style={{ fontSize: 8.5, color: "var(--text-dim)", marginTop: 2 }}>
                      Core: {formatCurrency(equityBreakdown.e1ActiveActual, currency, false)} + Legacy/Mirae HC: {formatCurrency(equityBreakdown.e1LegacyActual, currency, false)}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Auxiliary Sleeves */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
              {(auxiliaryHoldings || AUXILIARY_SLEEVES).map((s) => (
                <div
                  key={s.id}
                  style={{
                    background: "rgba(15, 22, 32, 0.7)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "10px 12px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="mono" style={{ fontSize: 9, color: "#38bdf8", fontWeight: 700 }}>{s.code}</span>
                    <span className="num" style={{ fontSize: 11, color: "var(--white)", fontWeight: 600 }}>
                      {formatCurrency(s.currentVal || 0, currency, false)}
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--white)", fontWeight: 500, marginTop: 3 }}>{s.name}</div>
                  <div className="mono" style={{ fontSize: 8.5, color: "var(--text-dim)", marginTop: 2 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
