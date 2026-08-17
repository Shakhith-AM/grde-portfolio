import React, { useState, useMemo } from 'react';
import { GlidePathChart } from '../components/charts/GlidePathChart';
import { CategoryCard } from '../components/common/CategoryCard';
import { AllocationDonut } from '../components/charts/AllocationDonut';
import { getAllocation, getBand } from '../utils/calculations';
import { RISK_PROFILES, CAT_META, CATS } from '../constants/masterData';
import { formatCurrency } from '../constants/currencies';
import { Copy, Download, Sliders, Check } from 'lucide-react';

export function AllocatorView({ age, onAgeChange, riskProfile, onRiskProfileChange, portfolioValue = 0, currency = "INR" }) {
  const [copied, setCopied] = useState(false);
  const alloc = useMemo(() => getAllocation(age, riskProfile), [age, riskProfile]);
  const band = useMemo(() => getBand(age), [age]);

  const donutData = CATS.map(cat => ({
    cat,
    label: CAT_META[cat].label,
    pct: alloc[cat],
    val: portfolioValue > 0 ? (portfolioValue * alloc[cat] / 100) : null,
    color: CAT_META[cat].hex
  }));

  const buildSummaryText = () => {
    const lines = [
      "═══════════════════════════════════════════",
      "GRDE ASSET ALLOCATION BLUEPRINT — v5.3",
      "═══════════════════════════════════════════",
      `Age: ${age} (Band ${band})`,
      `Risk Strategy: ${RISK_PROFILES[riskProfile]?.label || "Balanced"}`,
      portfolioValue > 0 ? `Portfolio Capital: ${formatCurrency(portfolioValue, currency, false)}` : "Portfolio Capital: Not specified",
      "",
      `🟡 G (Gold & Silver): ${alloc.G}% ${portfolioValue > 0 ? `| ${formatCurrency(portfolioValue * alloc.G / 100, currency, false)}` : ""}`,
      `🔴 R (Real Estate / REITs): ${alloc.R}% ${portfolioValue > 0 ? `| ${formatCurrency(portfolioValue * alloc.R / 100, currency, false)}` : ""}`,
      `🔵 D (Debt & Defense): ${alloc.D}% ${portfolioValue > 0 ? `| ${formatCurrency(portfolioValue * alloc.D / 100, currency, false)}` : ""}`,
      `🟢 E (Equity Engine): ${alloc.E}% ${portfolioValue > 0 ? `| ${formatCurrency(portfolioValue * alloc.E / 100, currency, false)}` : ""}`,
      "",
      `Income Stability Ratio (ISR): ${(alloc.G + alloc.R + alloc.D).toFixed(1)}%`,
      "═══════════════════════════════════════════",
      "Educational framework by Shakhith A.M., i3D Studio."
    ];
    return lines.join("\n");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildSummaryText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      alert("Failed to copy summary.");
    }
  };

  const handleDownload = () => {
    const text = buildSummaryText();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GRDE_Allocation_Age${age}_${riskProfile}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Header */}
      <div className="label">Dynamic Risk Engine</div>
      <h2 style={{ fontSize: 32, margin: "8px 0 6px" }}>
        Target <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Allocation Model</span>
      </h2>
      <p style={{ fontSize: 13, color: "var(--text)", margin: "0 0 20px", maxWidth: 720 }}>
        Your chronological age dictates the delicate equilibrium between growth compounding and capital defense.
        Drag the interactive age slider or tap the glide path chart to project any point in your lifetime.
      </p>

      {/* Interactive Lifecycle Glide Path Curve */}
      <div style={{ marginBottom: 20 }}>
        <GlidePathChart
          currentAge={age}
          onAgeChange={onAgeChange}
          riskProfile={riskProfile}
          height={240}
        />
      </div>

      {/* Main Age Slider & Risk Profile Controls Card */}
      <div className="glass" style={{ borderRadius: 14, padding: "24px 28px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ fontFamily: "Cinzel", fontSize: 46, color: "var(--white)", fontWeight: 700 }}>{age}</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.18em", textTransform: "uppercase" }}>years old</span>
            <span className="mono" style={{
              fontSize: 10,
              color: "var(--gold)",
              background: "rgba(212,168,67,0.1)",
              border: "1px solid var(--gold-dim)",
              padding: "3px 10px",
              borderRadius: 999,
              letterSpacing: "0.14em",
              textTransform: "uppercase"
            }}>
              Band {band}
            </span>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleCopy}
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
              <span>{copied ? "Copied" : "Copy Model"}</span>
            </button>

            <button
              onClick={handleDownload}
              className="mono"
              style={{
                background: "linear-gradient(180deg, #d4a843, #8a7029)",
                color: "#0a1628",
                border: "none",
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.1em",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <Download size={12} />
              <span>Export Summary</span>
            </button>
          </div>
        </div>

        {/* Age Range Slider */}
        <input
          type="range"
          min={18}
          max={100}
          value={age}
          onChange={(e) => onAgeChange(Number(e.target.value))}
          style={{ width: "100%", cursor: "pointer", accentColor: "var(--gold)" }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span className="mono" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.1em" }}>18 — MAXIMUM GROWTH</span>
          <span className="mono" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.1em" }}>100 — MAXIMUM DEFENSE</span>
        </div>

        {/* Risk Profile Selector */}
        <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--border)" }}>
          <div className="mono" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>
            Risk Strategy Overlay — Direct Equity Multiplier
          </div>

          <div style={{ display: "inline-flex", gap: 6, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 999, padding: 4, flexWrap: "wrap" }}>
            {Object.entries(RISK_PROFILES).map(([key, p]) => {
              const isActive = riskProfile === key;
              return (
                <button
                  key={key}
                  onClick={() => onRiskProfileChange(key)}
                  className="mono"
                  style={{
                    background: isActive ? "linear-gradient(180deg, #d4a843, #8a7029)" : "transparent",
                    color: isActive ? "#0a1628" : "var(--text-dim)",
                    border: "none",
                    borderRadius: 999,
                    padding: "7px 16px",
                    cursor: "pointer",
                    fontSize: 10,
                    fontWeight: isActive ? 600 : 500,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase"
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <p className="mono" style={{ fontSize: 10, color: "var(--text-dim)", lineHeight: 1.6, margin: "10px 0 0" }}>
            {RISK_PROFILES[riskProfile].blurb}
          </p>
        </div>

        {/* Category Cards (G, R, D, E) */}
        <div style={{ display: "flex", gap: 12, marginTop: 22, flexWrap: "wrap" }}>
          {CATS.map(cat => (
            <CategoryCard key={cat} cat={cat} pct={alloc[cat]} showCagr={true} />
          ))}
        </div>
      </div>

      {/* Visual Component Comparison */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div className="glass" style={{ flex: "1 1 320px", borderRadius: 14, padding: "22px 24px" }}>
          <div className="label" style={{ marginBottom: 12 }}>Target Proportions</div>
          <AllocationDonut data={donutData} size={180} currency={currency} />
        </div>

        <div className="glass" style={{ flex: "1 1 360px", borderRadius: 14, padding: "22px 24px" }}>
          <div className="label" style={{ marginBottom: 16 }}>Relative Component Scale</div>
          {CATS.map(cat => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div className="mono" style={{ width: 80, fontSize: 10, color: "var(--text-dim)", textAlign: "right" }}>
                {CAT_META[cat].label.split(" ")[0]}
              </div>
              <div style={{ flex: 1, position: "relative", height: 22, background: "var(--bg)", borderRadius: 4, overflow: "hidden", border: "1px solid var(--border)" }}>
                <div style={{
                  width: `${(alloc[cat] / 65) * 100}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${CAT_META[cat].hex}aa, ${CAT_META[cat].hex})`,
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 8
                }}>
                  <span className="num" style={{ fontSize: 10, fontWeight: 700, color: "#0a1628" }}>
                    {alloc[cat]}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
