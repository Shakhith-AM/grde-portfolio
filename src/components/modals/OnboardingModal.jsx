import React, { useState } from 'react';
import { CAT_META } from '../../constants/masterData';
import { ShieldAlert, Building2, Shield, TrendingUp, Check } from 'lucide-react';

export function OnboardingModal({ onComplete }) {
  const [step, setStep] = useState(0);
  const [holderName, setHolderName] = useState("");
  const [age, setAge] = useState(35);
  const [portfolioValue, setPortfolioValue] = useState("");

  const handleFinish = () => {
    try {
      const existing = JSON.parse(localStorage.getItem("grde_tracker_v3") || "{}");
      localStorage.setItem("grde_tracker_v3", JSON.stringify({
        ...existing,
        holderName: holderName.trim(),
        age: Number(age) || 35,
        totalPortfolio: portfolioValue ? Number(portfolioValue) : (existing.totalPortfolio ?? ""),
        values: existing.values ?? {},
        reportDate: existing.reportDate ?? new Date().toISOString().slice(0, 7),
      }));
      localStorage.setItem("grde_onboarded_v1", "1");
    } catch (e) {}
    onComplete();
  };

  const handleSkip = () => {
    try {
      localStorage.setItem("grde_onboarded_v1", "1");
    } catch (e) {}
    onComplete();
  };

  const screens = [
    {
      title: "What is GRDE?",
      body: (
        <>
          <p style={{ fontSize: 13.5, color: "var(--text)", lineHeight: 1.8, margin: 0 }}>
            GRDE stands for <strong style={{ color: "var(--gold-pale)" }}>Gold, Real Estate, Debt, Equity</strong> —
            four distinct economic engines that, structured in dynamic proportions across your lifetime,
            behave like a beaver's dam: resilient against market drought, flood, and inflation storms.
          </p>
          <p style={{ fontSize: 13.5, color: "var(--text)", lineHeight: 1.8, marginTop: 14 }}>
            It is not a speculative stock tip. It is an <strong style={{ color: "var(--white)" }}>architectural framework</strong> for
            disciplined asset allocation and financial longevity.
          </p>
        </>
      )
    },
    {
      title: "The Four Core Pillars",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { cat: "G", tag: "The Hedge",   text: "Gold & Silver — Crisis anchor and currency debasement defense.", icon: ShieldAlert },
            { cat: "R", tag: "The Rent",    text: "Real Estate (REITs & InvITs) — Inflation-linked liquid cash flow.", icon: Building2 },
            { cat: "D", tag: "The Defense", text: "Debt & Liquidity — Capital protection, emergency buffer, and stability.", icon: Shield },
            { cat: "E", tag: "The Engine",  text: "Equity — Long-term compounding growth engine.", icon: TrendingUp },
          ].map((r, i) => {
            const Icon = r.icon;
            return (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span style={{
                  fontFamily: "Cinzel",
                  fontSize: 16,
                  fontWeight: 700,
                  color: CAT_META[r.cat].hex,
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `${CAT_META[r.cat].hex}18`,
                  border: `1px solid ${CAT_META[r.cat].hex}44`,
                  flexShrink: 0
                }}>
                  {r.cat}
                </span>
                <div>
                  <div className="mono" style={{ fontSize: 9, color: CAT_META[r.cat].hex, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                    {r.tag}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.45, marginTop: 2 }}>
                    {r.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )
    },
    {
      title: "The Continuous Age Glide Path",
      body: (
        <>
          <p style={{ fontSize: 13.5, color: "var(--text)", lineHeight: 1.8, margin: 0 }}>
            In your 20s and 30s, the framework tilts heavily towards <span style={{ color: CAT_META.E.hex }}>Equity</span> for exponential compounding.
          </p>
          <p style={{ fontSize: 13.5, color: "var(--text)", lineHeight: 1.8, marginTop: 12 }}>
            As you approach your 50s and retirement, weight smoothly shifts toward <span style={{ color: CAT_META.D.hex }}>Debt</span> and{" "}
            <span style={{ color: CAT_META.R.hex }}>REITs/InvITs</span> for monthly income, while <span style={{ color: CAT_META.G.hex }}>Gold</span> accelerates
            up to 15% to safeguard against sequence-of-returns risk.
          </p>
        </>
      )
    },
    {
      title: "Set Up Your Initial Profile",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label className="mono" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.14em", display: "block", marginBottom: 5 }}>
              Portfolio Holder (Optional)
            </label>
            <input
              type="text"
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
              placeholder="e.g. Shakhith A.M. / Family Office"
              style={{
                width: "100%",
                background: "var(--bg)",
                border: "1px solid var(--border-2)",
                borderRadius: 8,
                padding: "9px 12px",
                color: "var(--white)",
                fontSize: 13,
                outline: "none"
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 120px" }}>
              <label className="mono" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.14em", display: "block", marginBottom: 5 }}>
                Your Age
              </label>
              <input
                type="number"
                min={18}
                max={100}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--bg)",
                  border: "1px solid var(--border-2)",
                  borderRadius: 8,
                  padding: "9px 12px",
                  color: "var(--white)",
                  fontSize: 13,
                  outline: "none"
                }}
              />
            </div>

            <div style={{ flex: "1 1 180px" }}>
              <label className="mono" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.14em", display: "block", marginBottom: 5 }}>
                Approx. Portfolio Value (INR)
              </label>
              <input
                type="number"
                value={portfolioValue}
                onChange={(e) => setPortfolioValue(e.target.value)}
                placeholder="e.g. 2500000"
                style={{
                  width: "100%",
                  background: "var(--bg)",
                  border: "1px solid var(--border-2)",
                  borderRadius: 8,
                  padding: "9px 12px",
                  color: "var(--white)",
                  fontSize: 13,
                  outline: "none"
                }}
              />
            </div>
          </div>
        </div>
      )
    }
  ];

  const s = screens[step];
  const isLast = step === screens.length - 1;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 200,
      display: "grid",
      placeItems: "center",
      background: "rgba(6, 10, 16, 0.92)",
      backdropFilter: "blur(8px)",
      padding: 16
    }}>
      <div className="glass" style={{
        borderRadius: 16,
        padding: "32px 36px",
        maxWidth: 520,
        width: "100%",
        boxShadow: "0 30px 90px rgba(0,0,0,0.7)",
        borderColor: "var(--gold-dim)"
      }}>
        {/* Step progress bars */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {screens.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background: i <= step ? "var(--gold)" : "var(--border)",
                transition: "background 0.3s ease"
              }}
            />
          ))}
        </div>

        <div className="mono" style={{ fontSize: 9, color: "var(--gold)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>
          Orientation {step + 1} of {screens.length}
        </div>

        <h3 style={{ fontFamily: "Cinzel", fontSize: 22, color: "var(--white)", margin: "0 0 16px" }}>
          {s.title}
        </h3>

        <div style={{ minHeight: 150 }}>
          {s.body}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <button
            onClick={handleSkip}
            className="mono"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-dim)",
              fontSize: 11,
              cursor: "pointer"
            }}
          >
            Skip intro
          </button>

          <div style={{ display: "flex", gap: 10 }}>
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="mono"
                style={{
                  background: "transparent",
                  border: "1px solid var(--border-2)",
                  color: "var(--text-dim)",
                  borderRadius: 8,
                  padding: "9px 16px",
                  fontSize: 11,
                  cursor: "pointer"
                }}
              >
                ← Back
              </button>
            )}

            <button
              onClick={() => isLast ? handleFinish() : setStep(s => s + 1)}
              className="mono"
              style={{
                background: "linear-gradient(180deg, #d4a843, #8a7029)",
                color: "#0a1628",
                border: "none",
                borderRadius: 8,
                padding: "9px 20px",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                cursor: "pointer"
              }}
            >
              {isLast ? "Enter Portfolio Engine" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
