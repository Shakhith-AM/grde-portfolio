import React, { useState } from 'react';
import { CAT_META, CATS, ASSET_TEMPLATE } from '../constants/masterData';
import { formatCurrency } from '../constants/currencies';
import { BookOpen, Printer, Copy, Check } from 'lucide-react';

export function BlueprintView({ portfolioState, currency }) {
  const [copied, setCopied] = useState(false);
  const { alloc, assets, hasData, effectiveTotal, isr } = portfolioState;

  const PUB_DESC = {
    g_gold:   "Physical gold-backed ETFs — liquidity & sovereign crisis anchor",
    g_silver: "Silver ETFs — industrial & precious metal hybrid with higher beta",
    r_mind:   "Mindspace REIT — Grade-A commercial office parks across Tier-1 tech hubs",
    r_krt:    "Brookfield / KRT REIT — Institutional office portfolio with multinational tenants",
    r_nexus:  "Nexus Select Trust — Consumption-driven Grade-A retail mall portfolio",
    r_dc:     "Data Centre REITs — AI computing & cloud data-center infrastructure",
    r_indi:   "IndiGrid InvIT — Sovereign-backed power transmission lines (long-term yield)",
    r_irb:    "IRB InvIT — National highway toll roads & cash-generating infrastructure",
    d_liq:    "Liquid Mutual Funds — Instant T+0 redemption, zero exit load emergency buffer",
    d_ult:    "Ultra Short Duration Funds — 3 to 6 month high-grade corporate paper",
    d_fd:     "Bank Fixed Deposits — Guaranteed principal protection & DICGC insurance cover",
    d_pomis:  "Post Office MIS / SCSS — Sovereign guaranteed monthly coupon cashflow",
    d_inc:    "Target Maturity Bonds / G-Secs — Duration capture with locked yield to maturity",
    d_nps:    "NPS Tier-1 — Active Choice (50% Equity, 30% G-Sec, 20% Corp Bond) with 80CCD tax benefits",
    e_mf:     "Active Equity Mutual Funds — Multi-cap, Flexi-cap & Focused compounding funds",
    e_etfin:  "Indian Equity ETFs — Nifty 50 & Nifty Midcap 150 passive low-cost core",
    e_etfus:  "US Equity ETFs — S&P 500 & Nasdaq 100 global technology dollar hedge",
    e_hc:     "Healthcare Thematic Fund — Secular defensive growth in pharma & healthcare"
  };

  const copyBlueprint = async () => {
    const lines = [
      "═══════════════════════════════════════════════════════════════",
      "GRDE FRAMEWORK ARCHITECTURAL BLUEPRINT — v5.3",
      "The Beaver Dam Method · i3D Studio",
      "═══════════════════════════════════════════════════════════════",
      "",
      `🟡 G (GOLD & SILVER): ${alloc.G}% OF PORTFOLIO`,
      "   • Gold ETFs             — 90% of G Bucket",
      "   • Silver ETFs           — 10% of G Bucket",
      "",
      `🔴 R (REAL ESTATE / REITS / INVITS): ${alloc.R}% OF PORTFOLIO`,
      "   • Office REITs          — 30.0% of R Bucket",
      "   • Retail REITs          — 13.5% of R Bucket",
      "   • Data Centre REITs     — 16.5% of R Bucket",
      "   • Power InvITs          — 28.0% of R Bucket",
      "   • Road InvITs           — 12.0% of R Bucket",
      "",
      `🔵 D (DEBT & DEFENSE): ${alloc.D}% OF PORTFOLIO`,
      "   • Liquid Funds          — 25% of D Bucket",
      "   • Ultra Short Funds     — 20% of D Bucket",
      "   • Fixed Deposits        — 15% of D Bucket",
      "   • POMIS / Income        — 15% of D Bucket",
      "   • Target Maturity Bonds — 15% of D Bucket",
      "   • NPS Tier-1            — 10% of D Bucket",
      "",
      `🟢 E (EQUITY ENGINE): ${alloc.E}% OF PORTFOLIO`,
      "   • Indian Active MFs     — 30% of E Bucket",
      "   • Indian Passive ETFs   — 30% of E Bucket",
      "   • US / Global ETFs      — 35% of E Bucket",
      "   • Healthcare Thematic   —  5% of E Bucket",
      "",
      `Investment Safety Ratio (ISR): ${(alloc.G + alloc.R + alloc.D).toFixed(1)}%`,
      "═══════════════════════════════════════════════════════════════"
    ];

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14, marginBottom: 24 }}>
        <div>
          <div className="label">Framework Architecture</div>
          <h2 style={{ fontSize: 32, margin: "8px 0 6px" }}>
            GRDE <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Blueprint</span> 🏛️
          </h2>
          <div style={{ fontSize: 13, color: "var(--text-dim)", fontStyle: "italic", fontFamily: "Cinzel" }}>
            "Don't hoard like a squirrel. Build like a beaver."
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
              padding: "9px 16px",
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
            <span>Print / Save PDF</span>
          </button>

          <button
            onClick={copyBlueprint}
            className="mono"
            style={{
              background: copied ? "rgba(82,168,106,0.15)" : "transparent",
              border: `1px solid ${copied ? "var(--good)" : "var(--border-2)"}`,
              color: copied ? "var(--good)" : "var(--text)",
              borderRadius: 8,
              padding: "9px 14px",
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

      {/* 4 Category Panels */}
      {CATS.map(cat => {
        const m = CAT_META[cat];
        const catAssets = assets.filter(a => a.cat === cat);
        const targetPct = alloc[cat];
        const catTotalLive = catAssets.reduce((s, a) => s + a.currentVal, 0);
        const livePct = effectiveTotal > 0 ? (catTotalLive / effectiveTotal) * 100 : 0;

        return (
          <div
            key={cat}
            className="glass"
            style={{
              borderRadius: 14,
              marginBottom: 18,
              overflow: "hidden",
              borderLeft: `4px solid ${m.hex}`,
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
            }}
          >
            {/* Category Header */}
            <div style={{
              background: `linear-gradient(135deg, ${m.hex}16, transparent)`,
              padding: "14px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid var(--border)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{
                  fontFamily: "Cinzel",
                  fontSize: 22,
                  fontWeight: 700,
                  color: m.hex,
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `${m.hex}18`,
                  border: `1px solid ${m.hex}44`
                }}>
                  {cat}
                </span>
                <div>
                  <div style={{ fontFamily: "Cinzel", fontSize: 14, color: "var(--white)", fontWeight: 600 }}>
                    {m.label}
                  </div>
                  <div className="mono" style={{ fontSize: 9, color: m.hex, letterSpacing: "0.16em" }}>
                    {m.tag}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "Cinzel", fontSize: 26, color: m.hex, fontWeight: 600 }}>
                  {targetPct}%
                </div>
                <div className="mono" style={{ fontSize: 8, color: "var(--text-dim)" }}>
                  Framework Target
                </div>
                {hasData && (
                  <div className="num" style={{ fontSize: 9, marginTop: 2, color: Math.abs(livePct - targetPct) < 2 ? "var(--good)" : (livePct > targetPct ? "var(--gold)" : "var(--danger)") }}>
                    Live: {livePct.toFixed(1)}% ({formatCurrency(catTotalLive, currency, true)})
                  </div>
                )}
              </div>
            </div>

            {/* Sub-asset rows */}
            <div style={{ padding: "8px 20px 14px" }}>
              {catAssets.map((a, i) => {
                const subPct = (a.catFrac * 100);
                return (
                  <div
                    key={a.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 0",
                      borderBottom: i < catAssets.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      gap: 16
                    }}
                  >
                    <div style={{ flex: "1 1 240px" }}>
                      <div style={{ fontSize: 13, color: "var(--white)", fontWeight: 500 }}>
                        {a.name}
                      </div>
                      <div className="mono" style={{ fontSize: 9.5, color: "var(--text-dim)", marginTop: 2, lineHeight: 1.4 }}>
                        {PUB_DESC[a.id] || a.desc}
                      </div>
                    </div>

                    <div style={{ flex: "0 0 160px", textAlign: "right" }}>
                      <div className="mono" style={{ fontSize: 11, color: "var(--gold-pale)", fontWeight: 600 }}>
                        {subPct.toFixed(1)}% of {cat}
                      </div>
                      <div className="mono" style={{ fontSize: 8.5, color: "var(--text-dim)", marginTop: 2 }}>
                        Final: {(targetPct * a.catFrac).toFixed(2)}%
                      </div>
                    </div>

                    {hasData && (
                      <div style={{ flex: "0 0 120px", textAlign: "right" }}>
                        <div className="num" style={{ fontSize: 11, color: "var(--white)", fontWeight: 600 }}>
                          {formatCurrency(a.currentVal, currency, true)}
                        </div>
                        <div className="mono" style={{ fontSize: 8.5, color: a.variance >= 0 ? "var(--good)" : "var(--danger)" }}>
                          {a.variance >= 0 ? "+" : ""}{formatCurrency(a.variance, currency, true)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ISR Banner */}
      <div className="glass" style={{ borderRadius: 14, padding: "20px 24px", borderLeft: "4px solid var(--good)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          <div>
            <div className="label" style={{ marginBottom: 4 }}>Total Defensive Foundation</div>
            <div style={{ fontFamily: "Cinzel", fontSize: 24, color: "var(--white)", fontWeight: 600 }}>
              Income Stability Ratio (ISR) = {isr.toFixed(1)}%
            </div>
            <div className="mono" style={{ fontSize: 9.5, color: "var(--text-dim)", marginTop: 4 }}>
              Combined weight of Gold (G) + Real Estate (R) + Debt (D) · Capital protection zone
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {CATS.map(cat => (
              <span key={cat} className="num" style={{
                fontSize: 10,
                color: CAT_META[cat].hex,
                background: `${CAT_META[cat].hex}18`,
                border: `1px solid ${CAT_META[cat].hex}44`,
                borderRadius: 6,
                padding: "3px 8px"
              }}>
                {cat}: {alloc[cat]}%
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
