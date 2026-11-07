import React, { useState } from 'react';
import { verifySubscriberCodeWithBackend, ENTITLEMENT_CONFIG } from '../../services/entitlementService';
import { KeyRound, ShieldCheck, X } from 'lucide-react';

/**
 * Public Subscriber Activation Interface
 *
 * Security & Architectural Contract:
 * - Prepared for future subscriber monetisation via an external HTTPS entitlement backend.
 * - Never contains master owner codes, bank account numbers, signing keys, or a list of valid subscriber codes.
 */
export function LockOverlay({ isOpen = false, onClose, onUnlock }) {
  const [code, setCode] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const submitCode = async () => {
    setSubmitting(true);
    setStatusMsg("");
    const res = await verifySubscriberCodeWithBackend(code);
    setSubmitting(false);

    if (res.ok && onUnlock) {
      onUnlock(`subscriber:${res.tier || "monthly"}`);
      if (onClose) onClose();
    } else {
      setStatusMsg(res.error || "Unable to verify subscriber code.");
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 100,
      display: "grid",
      placeItems: "center",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      background: "rgba(10, 22, 40, 0.82)",
      padding: 20
    }}>
      <div className="glass" style={{
        borderRadius: 16,
        padding: "28px 32px",
        maxWidth: 460,
        width: "100%",
        textAlign: "center",
        position: "relative",
        boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
        borderColor: "var(--gold-dim)"
      }}>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              background: "transparent",
              border: "none",
              color: "var(--text-dim)",
              cursor: "pointer"
            }}
          >
            <X size={16} />
          </button>
        )}

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

        <div className="mono" style={{ fontSize: 9, color: "var(--gold)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 4 }}>
          Subscriber Entitlement Interface
        </div>

        <h3 style={{ fontFamily: "Cinzel", fontSize: 20, color: "var(--white)", margin: "0 0 8px" }}>
          Activate <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Subscriber Code</span>
        </h3>

        <p style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5, margin: "0 0 16px" }}>
          Enter your individual GRDE subscriber code to verify entitlement status with the authentication service.
        </p>

        <input
          autoFocus
          value={code}
          onChange={(e) => { setCode(e.target.value); setStatusMsg(""); }}
          onKeyDown={(e) => e.key === "Enter" && submitCode()}
          placeholder="GRDE-M-XXXX-XXXX-XXXX"
          className="mono"
          style={{
            width: "100%",
            background: "var(--bg)",
            border: "1px solid var(--border-2)",
            borderRadius: 8,
            padding: "11px 14px",
            color: "var(--white)",
            fontSize: 12.5,
            letterSpacing: "0.14em",
            textAlign: "center",
            textTransform: "uppercase",
            marginBottom: 10
          }}
        />

        {statusMsg && (
          <div className="mono" style={{
            color: "var(--gold-pale)",
            background: "rgba(212, 168, 67, 0.08)",
            border: "1px solid var(--gold-dim)",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 10,
            lineHeight: 1.5,
            marginBottom: 12
          }}>
            {statusMsg}
          </div>
        )}

        <button
          onClick={submitCode}
          disabled={submitting}
          className="mono"
          style={{
            width: "100%",
            background: "linear-gradient(180deg, #d4a843, #8a7029)",
            color: "#0a1628",
            border: "none",
            borderRadius: 8,
            padding: "11px 18px",
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            cursor: "pointer",
            marginBottom: 12
          }}
        >
          {submitting ? "Verifying..." : "Verify Subscriber Entitlement"}
        </button>

        <div className="mono" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 9, color: "var(--good)" }}>
          <ShieldCheck size={12} />
          <span>
            {ENTITLEMENT_CONFIG.monetisationEnforced
              ? "External Entitlement Service Active"
              : "Oct 2026 Release: All 7 Public Modules Unlocked"}
          </span>
        </div>
      </div>
    </div>
  );
}
