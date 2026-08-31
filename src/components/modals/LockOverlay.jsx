import React, { useState } from 'react';
import { 
  OWNER_BANK_NAME, 
  OWNER_ACCOUNT_TYPE, 
  OWNER_ACCOUNT_NO, 
  OWNER_ACCOUNT_HOLDER, 
  OWNER_IFSC, 
  OWNER_PHONE, 
  MONTHLY_AMT, 
  ANNUAL_AMT 
} from '../../constants/masterData';
import { validateAccessCode } from '../../utils/accessTokens';
import { Lock, Building2, KeyRound, Check, Copy, ArrowRight, ShieldCheck } from 'lucide-react';

export function LockOverlay({ onUnlock }) {
  const [view, setView] = useState("home"); // "home" | "pay" | "code"
  const [plan, setPlan] = useState("monthly");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [copiedField, setCopiedField] = useState("");

  const amt = plan === "monthly" ? MONTHLY_AMT : ANNUAL_AMT;

  const copyText = async (field, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(""), 1800);
    } catch (e) {
      alert(`Please copy manually: ${text}`);
    }
  };

  const openWhatsApp = () => {
    const msg = `Hi Shakhith, I have completed the payment of ₹${amt.toLocaleString("en-IN")} for GRDE Engine ${plan} access to your ICICI Bank account.\n\nBank: ICICI Bank (Savings)\nAccount No: ${OWNER_ACCOUNT_NO}\nBeneficiary: ${OWNER_ACCOUNT_HOLDER}\nPlan: ${plan === "monthly" ? "Monthly ₹299" : "Annual ₹2,499"}\n\nPlease verify and share my access code.\n\n— Sent from GRDE App`;
    window.open(`https://wa.me/${OWNER_PHONE}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const submitCode = () => {
    const res = validateAccessCode(code);
    if (res.ok) {
      onUnlock(res.role);
    } else {
      setErr(res.error || "Invalid access code.");
    }
  };

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      zIndex: 30,
      display: "grid",
      placeItems: "center",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      background: "rgba(10, 22, 40, 0.82)",
      borderRadius: 14,
      padding: 20
    }}>
      <div className="glass" style={{
        borderRadius: 16,
        padding: "32px 34px",
        maxWidth: 500,
        width: "100%",
        textAlign: "center",
        boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
        borderColor: "var(--gold-dim)"
      }}>

        {/* ── HOME VIEW ── */}
        {view === "home" && (
          <>
            <div style={{
              width: 56,
              height: 56,
              margin: "0 auto 16px",
              borderRadius: 14,
              background: "linear-gradient(135deg, #d4a843, #8a7029)",
              display: "grid",
              placeItems: "center",
              color: "#0a1628"
            }}>
              <Lock size={26} />
            </div>

            <h3 style={{ fontFamily: "Cinzel", fontSize: 22, color: "var(--white)", margin: "0 0 8px" }}>
              Unlock <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Full Engine Access</span>
            </h3>

            <p style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.6, margin: "0 0 20px" }}>
              Track personal holdings, live variance alerts, smart fresh-capital rebalancing, and ISR analysis.
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
              {["Full Holdings Tracker", "Smart Top-Up Simulator", "Rebalancing Engine", "ISR Stability Audit"].map(f => (
                <span key={f} className="mono" style={{
                  fontSize: 9,
                  color: "var(--gold-pale)",
                  background: "rgba(212,168,67,0.08)",
                  border: "1px solid var(--gold-dim)",
                  borderRadius: 999,
                  padding: "4px 10px"
                }}>
                  {f}
                </span>
              ))}
            </div>

            <button
              onClick={() => setView("pay")}
              className="mono"
              style={{
                width: "100%",
                background: "linear-gradient(180deg, #d4a843, #8a7029)",
                color: "#0a1628",
                border: "none",
                borderRadius: 10,
                padding: "13px 22px",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                cursor: "pointer",
                marginBottom: 10
              }}
            >
              Subscribe / Bank Transfer
            </button>

            <button
              onClick={() => setView("code")}
              className="mono"
              style={{
                width: "100%",
                background: "transparent",
                color: "var(--text-dim)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "11px 22px",
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                cursor: "pointer"
              }}
            >
              I have an access code
            </button>
          </>
        )}

        {/* ── PAY VIEW ── */}
        {view === "pay" && (
          <>
            <div className="label" style={{ marginBottom: 6 }}>Bank Transfer Details</div>
            <h3 style={{ fontFamily: "Cinzel", fontSize: 20, color: "var(--white)", margin: "0 0 16px" }}>
              Pay via <span style={{ color: "var(--gold)", fontStyle: "italic" }}>ICICI Bank</span>
            </h3>

            {/* Plan Switcher */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              {[
                { key: "monthly", label: "₹299 / mo", sub: "Monthly · Cancel anytime" },
                { key: "annual",  label: "₹2,499 / yr", sub: "Annual · Save ₹1,089", badge: "BEST VALUE" }
              ].map(p => (
                <button
                  key={p.key}
                  onClick={() => setPlan(p.key)}
                  style={{
                    flex: 1,
                    background: plan === p.key ? "rgba(212,168,67,0.12)" : "transparent",
                    border: `2px solid ${plan === p.key ? "var(--gold)" : "var(--border)"}`,
                    borderRadius: 10,
                    padding: "10px 8px",
                    cursor: "pointer",
                    textAlign: "center"
                  }}
                >
                  <div style={{ fontFamily: "Cinzel", fontSize: 17, color: "var(--gold)", fontWeight: 600 }}>
                    {p.label}
                  </div>
                  <div className="mono" style={{ fontSize: 8.5, color: "var(--text-dim)", marginTop: 2 }}>
                    {p.sub}
                  </div>
                  {p.badge && (
                    <div className="mono" style={{
                      fontSize: 8,
                      color: "var(--good)",
                      background: "rgba(82,168,106,0.12)",
                      border: "1px solid var(--good)",
                      borderRadius: 4,
                      padding: "1px 5px",
                      display: "inline-block",
                      marginTop: 3
                    }}>
                      {p.badge}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Bank Details Box */}
            <div className="glass" style={{ borderRadius: 10, padding: "14px 16px", marginBottom: 14, textAlign: "left", borderColor: "var(--gold-dim)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid var(--border)" }}>
                <Building2 size={15} style={{ color: "var(--gold)" }} />
                <span className="mono" style={{ fontSize: 10, color: "var(--gold-pale)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>
                  {OWNER_BANK_NAME} ({OWNER_ACCOUNT_TYPE})
                </span>
              </div>

              {/* Beneficiary Name */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div>
                  <div className="mono" style={{ fontSize: 8.5, color: "var(--text-dim)" }}>Account Holder Name</div>
                  <div className="mono" style={{ fontSize: 12, color: "var(--white)", fontWeight: 600 }}>{OWNER_ACCOUNT_HOLDER}</div>
                </div>
                <button
                  onClick={() => copyText("name", OWNER_ACCOUNT_HOLDER)}
                  className="mono"
                  style={{
                    background: copiedField === "name" ? "rgba(82,168,106,0.2)" : "transparent",
                    border: `1px solid ${copiedField === "name" ? "var(--good)" : "var(--gold-dim)"}`,
                    color: copiedField === "name" ? "var(--good)" : "var(--gold)",
                    borderRadius: 6,
                    padding: "3px 8px",
                    fontSize: 8.5,
                    cursor: "pointer"
                  }}
                >
                  {copiedField === "name" ? "✓ COPIED" : "COPY"}
                </button>
              </div>

              {/* Account Number */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div>
                  <div className="mono" style={{ fontSize: 8.5, color: "var(--text-dim)" }}>Account Number</div>
                  <div className="num" style={{ fontSize: 13, color: "var(--gold-pale)", fontWeight: 700, letterSpacing: "0.05em" }}>{OWNER_ACCOUNT_NO}</div>
                </div>
                <button
                  onClick={() => copyText("acc", OWNER_ACCOUNT_NO)}
                  className="mono"
                  style={{
                    background: copiedField === "acc" ? "rgba(82,168,106,0.2)" : "transparent",
                    border: `1px solid ${copiedField === "acc" ? "var(--good)" : "var(--gold-dim)"}`,
                    color: copiedField === "acc" ? "var(--good)" : "var(--gold)",
                    borderRadius: 6,
                    padding: "3px 8px",
                    fontSize: 8.5,
                    cursor: "pointer"
                  }}
                >
                  {copiedField === "acc" ? "✓ COPIED" : "COPY"}
                </button>
              </div>

              {/* IFSC Code */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div>
                  <div className="mono" style={{ fontSize: 8.5, color: "var(--text-dim)" }}>IFSC Code</div>
                  <div className="mono" style={{ fontSize: 12, color: "var(--white)", fontWeight: 600, letterSpacing: "0.05em" }}>{OWNER_IFSC}</div>
                </div>
                <button
                  onClick={() => copyText("ifsc", OWNER_IFSC)}
                  className="mono"
                  style={{
                    background: copiedField === "ifsc" ? "rgba(82,168,106,0.2)" : "transparent",
                    border: `1px solid ${copiedField === "ifsc" ? "var(--good)" : "var(--gold-dim)"}`,
                    color: copiedField === "ifsc" ? "var(--good)" : "var(--gold)",
                    borderRadius: 6,
                    padding: "3px 8px",
                    fontSize: 8.5,
                    cursor: "pointer"
                  }}
                >
                  {copiedField === "ifsc" ? "✓ COPIED" : "COPY"}
                </button>
              </div>

              {/* Amount */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 4, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <div className="mono" style={{ fontSize: 8.5, color: "var(--text-dim)" }}>Amount to Pay</div>
                  <div className="mono" style={{ fontSize: 13, color: "var(--good)", fontWeight: 700 }}>₹{amt.toLocaleString("en-IN")}</div>
                </div>
                <button
                  onClick={() => copyText("amt", String(amt))}
                  className="mono"
                  style={{
                    background: copiedField === "amt" ? "rgba(82,168,106,0.2)" : "transparent",
                    border: `1px solid ${copiedField === "amt" ? "var(--good)" : "var(--gold-dim)"}`,
                    color: copiedField === "amt" ? "var(--good)" : "var(--gold)",
                    borderRadius: 6,
                    padding: "3px 8px",
                    fontSize: 8.5,
                    cursor: "pointer"
                  }}
                >
                  {copiedField === "amt" ? "✓ COPIED" : "COPY"}
                </button>
              </div>
            </div>

            {/* Instruction Tip */}
            <div className="mono" style={{ fontSize: 8.5, color: "var(--text-dim)", textAlign: "left", lineHeight: 1.6, marginBottom: 12, paddingLeft: 4 }}>
              💡 Transfer via <strong>GPay / PhonePe (To Bank Account & IFSC)</strong> or <strong>Net Banking (IMPS/NEFT)</strong>.
            </div>

            {/* WhatsApp Verification */}
            <button
              onClick={openWhatsApp}
              className="mono"
              style={{
                width: "100%",
                background: "rgba(37, 211, 102, 0.12)",
                border: "1px solid #25D366",
                color: "#25D366",
                borderRadius: 8,
                padding: "10px 16px",
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                cursor: "pointer",
                marginBottom: 12,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6
              }}
            >
              ✓ Paid — Send Screenshot on WhatsApp
            </button>

            <button
              onClick={() => setView("home")}
              style={{ background: "transparent", border: "none", color: "var(--text-dim)", fontSize: 11, cursor: "pointer" }}
            >
              ← Back
            </button>
          </>
        )}

        {/* ── CODE ENTRY VIEW ── */}
        {view === "code" && (
          <>
            <div style={{
              width: 48,
              height: 48,
              margin: "0 auto 12px",
              borderRadius: 12,
              background: "rgba(212,168,67,0.1)",
              border: "1px solid var(--gold-dim)",
              display: "grid",
              placeItems: "center",
              color: "var(--gold)"
            }}>
              <KeyRound size={22} />
            </div>

            <h3 style={{ fontFamily: "Cinzel", fontSize: 20, color: "var(--white)", margin: "0 0 6px" }}>
              Enter <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Access Code</span>
            </h3>

            <p style={{ fontSize: 12, color: "var(--text-dim)", margin: "0 0 16px" }}>
              Paste your access code or personal owner bypass token.
            </p>

            <input
              autoFocus
              value={code}
              onChange={(e) => { setCode(e.target.value); setErr(""); }}
              onKeyDown={(e) => e.key === "Enter" && submitCode()}
              placeholder="GRDE-XXXX-XXXX"
              className="mono"
              style={{
                width: "100%",
                background: "var(--bg)",
                border: `1px solid ${err ? "var(--danger)" : "var(--border-2)"}`,
                borderRadius: 8,
                padding: "12px 14px",
                color: "var(--white)",
                fontSize: 13,
                letterSpacing: "0.18em",
                textAlign: "center",
                textTransform: "uppercase",
                marginBottom: 10
              }}
            />

            {err && <div style={{ color: "var(--danger)", fontSize: 11, marginBottom: 10 }}>{err}</div>}

            <button
              onClick={submitCode}
              className="mono"
              style={{
                width: "100%",
                background: "linear-gradient(180deg, #d4a843, #8a7029)",
                color: "#0a1628",
                border: "none",
                borderRadius: 8,
                padding: "12px 20px",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                cursor: "pointer",
                marginBottom: 10
              }}
            >
              Unlock Engine
            </button>

            <button
              onClick={() => { setView("home"); setErr(""); setCode(""); }}
              style={{ background: "transparent", border: "none", color: "var(--text-dim)", fontSize: 11, cursor: "pointer" }}
            >
              ← Back
            </button>
          </>
        )}

      </div>
    </div>
  );
}
