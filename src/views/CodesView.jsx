import React, { useState, useEffect } from 'react';
import { generatePortableCode, parsePortableCode } from '../utils/accessTokens';
import { GRDE_STORAGE, STORAGE_KEYS } from '../utils/storage';
import { KeyRound, Plus, Copy, Share2, Download, Trash2, Check, ShieldCheck } from 'lucide-react';

export function CodesView() {
  const [codes, setCodes] = useState(() => {
    return GRDE_STORAGE.getJSON(STORAGE_KEYS.ISSUED_CODES, []);
  });
  const [plan, setPlan] = useState("monthly");
  const [toast, setToast] = useState("");

  const persist = (next) => {
    setCodes(next);
    GRDE_STORAGE.set(STORAGE_KEYS.ISSUED_CODES, next);
  };

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1600);
  };

  const issueOne = () => {
    const createdAt = Date.now();
    const code = generatePortableCode(plan);
    const parsed = parsePortableCode(code);
    const next = [{ code, plan, createdAt, expiresAt: parsed?.expiresAt || null, active: true, label: "" }, ...codes];
    persist(next);
    flash(`${plan === "annual" ? "Annual" : "Monthly"} code generated`);
  };

  const issueBatch = (n) => {
    const fresh = Array.from({ length: n }, () => {
      const createdAt = Date.now();
      const code = generatePortableCode(plan);
      const parsed = parsePortableCode(code);
      return { code, plan, createdAt, expiresAt: parsed?.expiresAt || null, active: true, label: "" };
    });
    persist([...fresh, ...codes]);
    flash(`${n} ${plan} codes generated in batch`);
  };

  const toggleActive = (idx) => {
    const next = codes.map((c, i) => i === idx ? { ...c, active: !c.active } : c);
    persist(next);
  };

  const removeCode = (idx) => {
    if (window.confirm("Permanently delete this code record?")) {
      persist(codes.filter((_, i) => i !== idx));
    }
  };

  const updateLabel = (idx, label) => {
    persist(codes.map((c, i) => i === idx ? { ...c, label } : c));
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      flash(`Copied ${code}`);
    } catch (e) {}
  };

  const shareWhatsApp = async (code) => {
    const rec = codes.find(c => c.code === code);
    const expiry = rec?.expiresAt
      ? new Date(rec.expiresAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : "as indicated by subscription plan";

    const msg = `Hi! Here is your official i3D *GRDE Portfolio Engine* access 🔐\n\nAccess Code: *${code}*\nPlan: *${rec?.plan === "annual" ? "Annual ₹2,499" : "Monthly ₹299"}*\nValid Until: *${expiry}*\n\nHow to activate:\n1. Open your GRDE Engine app\n2. Tap "I have an access code"\n3. Paste the code above and tap Unlock\n\n— Shakhith A.M., i3D Studio`;
    
    try {
      await navigator.clipboard.writeText(msg);
      flash("Message copied — opening WhatsApp");
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
    } catch (e) {}
  };

  const exportCSV = () => {
    const rows = [["Code", "Status", "Plan", "Note / Subscriber", "Issued At", "Expires At"]].concat(
      codes.map(c => [
        c.code,
        c.active ? "Active" : "Revoked",
        c.plan || "Monthly",
        c.label || "",
        new Date(c.createdAt).toLocaleDateString("en-IN"),
        c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN") : ""
      ])
    );
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GRDE_Subscriber_Codes_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const activeCount = codes.filter(c => c.active).length;

  return (
    <div>
      {/* Header */}
      <div className="label">Owner Administration Console</div>
      <h2 style={{ fontSize: 32, margin: "8px 0 4px" }}>
        Subscriber <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Code Engine</span> ★
      </h2>
      <p style={{ fontSize: 13, color: "var(--text)", margin: "0 0 20px", maxWidth: 700 }}>
        Generate offline-verifiable, portable access tokens for your paying monthly or annual subscribers.
        Tokens validate their own expiry date without requiring an active server database.
      </p>

      {/* Control Action Bar */}
      <div className="glass" style={{ borderRadius: 14, padding: "16px 20px", display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 18 }}>
        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          className="mono"
          style={{
            background: "var(--bg)",
            color: "var(--gold-pale)",
            border: "1px solid var(--gold-dim)",
            borderRadius: 8,
            padding: "9px 14px",
            fontSize: 11,
            outline: "none"
          }}
        >
          <option value="monthly">Monthly · 31 Days (₹299)</option>
          <option value="annual">Annual · 366 Days (₹2,499)</option>
        </select>

        <button
          onClick={issueOne}
          className="mono"
          style={{
            background: "linear-gradient(180deg, #d4a843, #8a7029)",
            color: "#0a1628",
            border: "none",
            borderRadius: 8,
            padding: "9px 18px",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <Plus size={14} />
          <span>Generate Code</span>
        </button>

        <button
          onClick={() => issueBatch(5)}
          className="mono"
          style={{
            background: "transparent",
            color: "var(--gold-pale)",
            border: "1px solid var(--gold-dim)",
            borderRadius: 8,
            padding: "9px 14px",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            cursor: "pointer"
          }}
        >
          Batch × 5
        </button>

        <button
          onClick={exportCSV}
          disabled={!codes.length}
          className="mono"
          style={{
            background: "transparent",
            color: "var(--text)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "9px 14px",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            cursor: codes.length ? "pointer" : "not-allowed",
            display: "inline-flex",
            alignItems: "center",
            gap: 5
          }}
        >
          <Download size={12} />
          <span>Export CSV</span>
        </button>

        <div style={{ marginLeft: "auto", display: "flex", gap: 14 }} className="mono">
          <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
            Active: <strong style={{ color: "var(--good)" }}>{activeCount}</strong>
          </span>
          <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
            Total Issued: <strong style={{ color: "var(--white)" }}>{codes.length}</strong>
          </span>
        </div>
      </div>

      {toast && (
        <div className="mono" style={{
          background: "rgba(82,168,106,0.15)",
          border: "1px solid var(--good)",
          color: "var(--good)",
          borderRadius: 8,
          padding: "8px 14px",
          fontSize: 11,
          textAlign: "center",
          marginBottom: 14
        }}>
          ✓ {toast}
        </div>
      )}

      {/* Codes List */}
      {codes.length === 0 ? (
        <div className="glass" style={{ borderRadius: 14, padding: "40px 20px", textAlign: "center" }}>
          <KeyRound size={36} style={{ color: "var(--gold-dim)", margin: "0 auto 10px" }} />
          <div style={{ color: "var(--text)", fontSize: 13 }}>
            No subscriber codes issued yet. Click <strong style={{ color: "var(--gold)" }}>+ Generate Code</strong> to create one.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {codes.map((c, i) => (
            <div
              key={i}
              className="glass"
              style={{
                borderRadius: 10,
                padding: "12px 16px",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 12,
                opacity: c.active ? 1 : 0.45
              }}
            >
              <code style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 13,
                fontWeight: 600,
                color: c.active ? "var(--gold-pale)" : "var(--text-dim)",
                letterSpacing: "0.08em",
                textDecoration: c.active ? "none" : "line-through"
              }}>
                {c.code}
              </code>

              <input
                type="text"
                placeholder="Subscriber Name / Note (e.g. Rahul Sharma)"
                value={c.label || ""}
                onChange={(e) => updateLabel(i, e.target.value)}
                style={{
                  flex: "1 1 180px",
                  minWidth: 140,
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "6px 10px",
                  color: "var(--white)",
                  fontSize: 11
                }}
              />

              <span className="mono" style={{ fontSize: 9, color: "var(--text-dim)" }}>
                {c.plan?.toUpperCase()} · Exp {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
              </span>

              <button
                onClick={() => copyCode(c.code)}
                className="mono"
                style={{
                  background: "transparent",
                  border: "1px solid var(--gold-dim)",
                  color: "var(--gold)",
                  borderRadius: 6,
                  padding: "5px 10px",
                  fontSize: 9.5,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                <Copy size={11} />
                <span>Copy</span>
              </button>

              <button
                onClick={() => shareWhatsApp(c.code)}
                className="mono"
                style={{
                  background: "rgba(37, 211, 102, 0.12)",
                  border: "1px solid #25D366",
                  color: "#25D366",
                  borderRadius: 6,
                  padding: "5px 10px",
                  fontSize: 9.5,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                <Share2 size={11} />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={() => toggleActive(i)}
                className="mono"
                style={{
                  background: "transparent",
                  border: "1px solid var(--border)",
                  color: "var(--text-dim)",
                  borderRadius: 6,
                  padding: "5px 10px",
                  fontSize: 9.5,
                  cursor: "pointer"
                }}
              >
                {c.active ? "Revoke" : "Enable"}
              </button>

              <button
                onClick={() => removeCode(i)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--danger)",
                  cursor: "pointer",
                  padding: 4
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
