import React, { useState, useMemo } from 'react';
import { generateSubscriberCodeRecord, computeCodeHashSync } from '../utils/accessTokens';
import { SUBSCRIPTION_TIERS } from '../services/entitlementService';
import { GRDE_STORAGE, STORAGE_KEYS } from '../utils/storage';
import {
  KeyRound,
  Plus,
  Copy,
  Download,
  Trash2,
  RefreshCw,
  ShieldCheck,
  RotateCcw,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const AUDIT_STORAGE_KEY = "grde_owner_subscriber_audit_v1";

export function CodesView() {
  const [codes, setCodes] = useState(() => {
    const raw = GRDE_STORAGE.getJSON(STORAGE_KEYS.ISSUED_CODES, []);
    // Upgrade any legacy records non-destructively so every record has id, codeHash, activationDate, expiryDate, status
    return raw.map((c, idx) => {
      const expDate = c.expiryDate || (c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 10) : "2026-12-31");
      const actDate = c.activationDate || (c.createdAt ? new Date(c.createdAt).toISOString().slice(0, 10) : "2026-11-07");
      const status = c.status || (c.active === false ? "REVOKED" : "ACTIVE");
      return {
        id: c.id || `SUB-LEGACY-${idx + 1}`,
        code: c.code,
        codeHash: c.codeHash || computeCodeHashSync(c.code || ""),
        plan: c.plan || "monthly",
        tierLabel: c.tierLabel || SUBSCRIPTION_TIERS[c.plan || "monthly"]?.label || "Monthly Subscriber",
        subscriberName: c.subscriberName || c.label || "",
        subscriberEmail: c.subscriberEmail || "",
        createdAt: c.createdAt || Date.now(),
        activationDate: actDate,
        expiryDate: expDate,
        expiresAt: c.expiresAt || new Date(`${expDate}T23:59:59`).getTime(),
        status,
        active: status === "ACTIVE" || status === "PENDING_ACTIVATION",
        activatedCount: c.activatedCount || 0,
        replacedById: c.replacedById || null,
        replacesId: c.replacesId || null
      };
    });
  });

  const [auditLog, setAuditLog] = useState(() => {
    return GRDE_STORAGE.getJSON(AUDIT_STORAGE_KEY, []);
  });

  const [plan, setPlan] = useState("monthly");
  const [subscriberName, setSubscriberName] = useState("");
  const [activationDate, setActivationDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [customExpiryDate, setCustomExpiryDate] = useState("");
  const [toast, setToast] = useState("");
  const [showAuditDrawer, setShowAuditDrawer] = useState(false);

  const persist = (nextCodes, auditEvent = null) => {
    setCodes(nextCodes);
    GRDE_STORAGE.set(STORAGE_KEYS.ISSUED_CODES, nextCodes);
    if (auditEvent) {
      const nextAudit = [
        {
          eventId: `AUD-${Date.now()}`,
          timestamp: new Date().toISOString(),
          ...auditEvent
        },
        ...auditLog
      ].slice(0, 200);
      setAuditLog(nextAudit);
      GRDE_STORAGE.set(AUDIT_STORAGE_KEY, nextAudit);
    }
  };

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const issueOne = () => {
    const record = generateSubscriberCodeRecord({
      plan,
      subscriberName,
      activationDate,
      customExpiryDate
    });
    const next = [record, ...codes];
    persist(next, {
      action: "ISSUE_CODE",
      codeId: record.id,
      codeHash: record.codeHash,
      plan: record.plan,
      subscriberName: record.subscriberName || "Unassigned",
      details: `Issued ${record.tierLabel} code valid ${record.activationDate} → ${record.expiryDate}`
    });
    setSubscriberName("");
    flash(`${record.tierLabel} code generated`);
  };

  const revokeOrRestore = (idx) => {
    const target = codes[idx];
    if (!target) return;
    const nextStatus = target.status === "REVOKED" ? "ACTIVE" : "REVOKED";
    const next = codes.map((c, i) =>
      i === idx
        ? { ...c, status: nextStatus, active: nextStatus === "ACTIVE" }
        : c
    );
    persist(next, {
      action: nextStatus === "REVOKED" ? "REVOKE_CODE" : "RESTORE_CODE",
      codeId: target.id,
      codeHash: target.codeHash,
      plan: target.plan,
      subscriberName: target.subscriberName || "Unassigned",
      details: `Status changed to ${nextStatus}`
    });
    flash(`Code ${nextStatus.toLowerCase()}`);
  };

  const renewCode = (idx) => {
    const target = codes[idx];
    if (!target) return;
    const tierDays = SUBSCRIPTION_TIERS[target.plan]?.defaultDurationDays || 31;
    const baseTime = Math.max(Date.now(), target.expiresAt || Date.now());
    const newExpTime = baseTime + tierDays * 86400000;
    const newExpDate = new Date(newExpTime).toISOString().slice(0, 10);

    const next = codes.map((c, i) =>
      i === idx
        ? {
            ...c,
            expiryDate: newExpDate,
            expiresAt: new Date(`${newExpDate}T23:59:59`).getTime(),
            status: "ACTIVE",
            active: true
          }
        : c
    );
    persist(next, {
      action: "RENEW_CODE",
      codeId: target.id,
      codeHash: target.codeHash,
      plan: target.plan,
      subscriberName: target.subscriberName || "Unassigned",
      details: `Renewed for +${tierDays} days → new expiry ${newExpDate}`
    });
    flash(`Renewed until ${newExpDate}`);
  };

  const replaceCode = (idx) => {
    const oldRec = codes[idx];
    if (!oldRec) return;
    const replacement = generateSubscriberCodeRecord({
      plan: oldRec.plan,
      subscriberName: oldRec.subscriberName,
      subscriberEmail: oldRec.subscriberEmail,
      activationDate: new Date().toISOString().slice(0, 10),
      customExpiryDate: oldRec.expiryDate
    });
    replacement.replacesId = oldRec.id;

    const updatedList = codes.map((c, i) =>
      i === idx
        ? { ...c, status: "REPLACED", active: false, replacedById: replacement.id }
        : c
    );
    persist([replacement, ...updatedList], {
      action: "REPLACE_CODE",
      codeId: replacement.id,
      codeHash: replacement.codeHash,
      plan: replacement.plan,
      subscriberName: replacement.subscriberName || "Unassigned",
      details: `Replaced ${oldRec.id} with new code ${replacement.id}`
    });
    flash(`Replaced with new code ${replacement.code}`);
  };

  const removeCode = (idx) => {
    const target = codes[idx];
    if (!target) return;
    if (window.confirm("Remove this subscriber record from local console?")) {
      persist(
        codes.filter((_, i) => i !== idx),
        {
          action: "DELETE_RECORD",
          codeId: target.id,
          codeHash: target.codeHash,
          plan: target.plan,
          subscriberName: target.subscriberName || "Unassigned",
          details: "Removed subscriber code record from local console"
        }
      );
    }
  };

  const updateSubscriberField = (idx, field, val) => {
    const next = codes.map((c, i) => {
      if (i !== idx) return c;
      const updated = { ...c, [field]: val };
      if (field === "expiryDate" && val) {
        updated.expiresAt = new Date(`${val}T23:59:59`).getTime();
      }
      return updated;
    });
    persist(next);
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      flash(`Copied ${code}`);
    } catch (e) {}
  };

  // Exports a secure Backend Entitlement Register containing ONLY SHA-256 hashes (no plaintext codes)
  const exportHashedBackendRegister = () => {
    const payload = {
      schema: "GRDE-ENTITLEMENT-BACKEND-REGISTER-V1",
      exportedAt: new Date().toISOString(),
      securityNote: "Contains SHA-256 code digests only (zero plaintext codes) for seeding the external Entitlement Backend.",
      subscribers: codes.map(c => ({
        subscriberId: c.id,
        codeHash: c.codeHash,
        plan: c.plan,
        entitlements: SUBSCRIPTION_TIERS[c.plan]?.entitlements || [],
        activationDate: c.activationDate,
        expiryDate: c.expiryDate,
        expiresAt: c.expiresAt,
        status: c.status,
        replacedById: c.replacedById
      }))
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GRDE_Hashed_Entitlement_Register_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAdminCSV = () => {
    const rows = [["Record ID", "Status", "Plan / Tier", "Subscriber", "Activation Date", "Expiry Date", "Code Hash (SHA-256)", "Replaced By"]].concat(
      codes.map(c => [
        c.id,
        c.status,
        c.tierLabel || c.plan,
        c.subscriberName || "",
        c.activationDate || "",
        c.expiryDate || "",
        c.codeHash || "",
        c.replacedById || ""
      ])
    );
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GRDE_Subscriber_Register_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const summary = useMemo(() => {
    const active = codes.filter(c => c.status === "ACTIVE").length;
    const revoked = codes.filter(c => c.status === "REVOKED" || c.status === "REPLACED").length;
    return { active, revoked, total: codes.length };
  }, [codes]);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
        <div>
          <div className="label" style={{ color: "var(--gold)" }}>
            Local-Only Administration Console · Excluded from Public Bundle
          </div>
          <h2 style={{ fontSize: 30, margin: "6px 0 0", color: "var(--white)" }}>
            Owner / Admin <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Subscriber Console</span>
          </h2>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={exportHashedBackendRegister}
            disabled={!codes.length}
            className="mono"
            style={{
              background: "rgba(82, 168, 106, 0.14)",
              color: "var(--good)",
              border: "1px solid var(--good)",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 9.5,
              cursor: codes.length ? "pointer" : "not-allowed",
              display: "inline-flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <ShieldCheck size={12} />
            <span>Export Hashed Backend Register (JSON)</span>
          </button>

          <button
            onClick={exportAdminCSV}
            disabled={!codes.length}
            className="mono"
            style={{
              background: "transparent",
              color: "var(--text)",
              border: "1px solid var(--border-2)",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 9.5,
              cursor: codes.length ? "pointer" : "not-allowed",
              display: "inline-flex",
              alignItems: "center",
              gap: 5
            }}
          >
            <Download size={12} />
            <span>Export Register CSV</span>
          </button>
        </div>
      </div>

      {/* Level 1 — Code Generation & Tier Assignment Bar */}
      <div className="glass" style={{ borderRadius: 14, padding: "18px 20px", marginBottom: 18, borderLeft: "4px solid var(--gold)" }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--gold-pale)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 12 }}>
          Generate Individual Subscriber Access Code & Entitlement Record
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, alignItems: "flex-end" }}>
          <div>
            <label className="mono" style={{ fontSize: 8.5, color: "var(--text-dim)", display: "block", marginBottom: 4, textTransform: "uppercase" }}>
              Subscription Plan / Tier
            </label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="mono"
              style={{
                width: "100%",
                background: "var(--bg)",
                color: "var(--gold-pale)",
                border: "1px solid var(--gold-dim)",
                borderRadius: 8,
                padding: "8px 10px",
                fontSize: 11,
                outline: "none"
              }}
            >
              <option value="monthly">Monthly Subscriber (31d)</option>
              <option value="annual">Annual Pro Subscriber (366d)</option>
              <option value="institutional">Institutional / Advisory (366d)</option>
              <option value="trial">Review / Trial Access (14d)</option>
            </select>
          </div>

          <div>
            <label className="mono" style={{ fontSize: 8.5, color: "var(--text-dim)", display: "block", marginBottom: 4, textTransform: "uppercase" }}>
              Subscriber Name / Identifier
            </label>
            <input
              type="text"
              placeholder="e.g. Subscriber Name"
              value={subscriberName}
              onChange={(e) => setSubscriberName(e.target.value)}
              style={{
                width: "100%",
                background: "var(--bg)",
                border: "1px solid var(--border-2)",
                borderRadius: 8,
                padding: "8px 10px",
                color: "var(--white)",
                fontSize: 11.5
              }}
            />
          </div>

          <div>
            <label className="mono" style={{ fontSize: 8.5, color: "var(--text-dim)", display: "block", marginBottom: 4, textTransform: "uppercase" }}>
              Activation Date
            </label>
            <input
              type="date"
              value={activationDate}
              onChange={(e) => setActivationDate(e.target.value)}
              style={{
                width: "100%",
                background: "var(--bg)",
                border: "1px solid var(--border-2)",
                borderRadius: 8,
                padding: "8px 10px",
                color: "var(--white)",
                fontSize: 11
              }}
            />
          </div>

          <div>
            <label className="mono" style={{ fontSize: 8.5, color: "var(--text-dim)", display: "block", marginBottom: 4, textTransform: "uppercase" }}>
              Expiry Date (Blank = Auto)
            </label>
            <input
              type="date"
              value={customExpiryDate}
              onChange={(e) => setCustomExpiryDate(e.target.value)}
              style={{
                width: "100%",
                background: "var(--bg)",
                border: "1px solid var(--border-2)",
                borderRadius: 8,
                padding: "8px 10px",
                color: "var(--white)",
                fontSize: 11
              }}
            />
          </div>

          <div>
            <button
              onClick={issueOne}
              className="mono"
              style={{
                width: "100%",
                background: "linear-gradient(180deg, #d4a843, #8a7029)",
                color: "#0a1628",
                border: "none",
                borderRadius: 8,
                padding: "9px 14px",
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6
              }}
            >
              <Plus size={14} />
              <span>Generate Code</span>
            </button>
          </div>
        </div>

        <div className="mono" style={{ display: "flex", gap: 18, marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border)", fontSize: 10, color: "var(--text-dim)" }}>
          <span>Active Codes: <strong style={{ color: "var(--good)" }}>{summary.active}</strong></span>
          <span>Revoked / Replaced: <strong style={{ color: "var(--warn)" }}>{summary.revoked}</strong></span>
          <span>Total Register: <strong style={{ color: "var(--white)" }}>{summary.total}</strong></span>
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

      {/* Subscriber Register Table */}
      <div className="glass" style={{ borderRadius: 14, overflow: "hidden", marginBottom: 18 }}>
        <div style={{
          padding: "12px 18px",
          background: "var(--card-2)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span className="mono" style={{ fontSize: 10.5, color: "var(--white)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Auditable Subscriber Register ({codes.length})
          </span>
          <span className="mono" style={{ fontSize: 9, color: "var(--text-dim)" }}>
            Stores SHA-256 Digest + Lifecycle Status (Active · Renew · Replace · Revoke)
          </span>
        </div>

        {codes.length === 0 ? (
          <div style={{ padding: "36px 20px", textAlign: "center" }}>
            <KeyRound size={32} style={{ color: "var(--gold-dim)", margin: "0 auto 8px" }} />
            <div style={{ color: "var(--text-dim)", fontSize: 12.5 }}>
              No subscriber codes in local register. Use the form above to generate an individual subscriber code.
            </div>
          </div>
        ) : (
          <div>
            {codes.map((c, i) => {
              const statusColor =
                c.status === "ACTIVE" ? "var(--good)" :
                c.status === "PENDING_ACTIVATION" ? "#38bdf8" :
                c.status === "REPLACED" ? "var(--gold)" : "var(--danger)";

              return (
                <div
                  key={c.id || i}
                  style={{
                    padding: "12px 18px",
                    borderTop: i > 0 ? "1px solid var(--border)" : "none",
                    background: i % 2 === 0 ? "transparent" : "rgba(15, 31, 58, 0.2)",
                    opacity: c.active ? 1 : 0.65
                  }}
                >
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <code style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: c.active ? "var(--gold-pale)" : "var(--text-dim)",
                        textDecoration: c.active ? "none" : "line-through"
                      }}>
                        {c.code}
                      </code>
                      <span className="mono" style={{
                        fontSize: 8.5,
                        color: statusColor,
                        border: `1px solid ${statusColor}66`,
                        borderRadius: 4,
                        padding: "2px 6px"
                      }}>
                        {c.status}
                      </span>
                      <span className="mono" style={{ fontSize: 9, color: "var(--text-dim)" }}>
                        {c.tierLabel}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <button
                        onClick={() => copyCode(c.code)}
                        className="mono"
                        style={{
                          background: "transparent",
                          border: "1px solid var(--gold-dim)",
                          color: "var(--gold)",
                          borderRadius: 6,
                          padding: "4px 8px",
                          fontSize: 9,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        <Copy size={10} />
                        <span>Copy</span>
                      </button>

                      <button
                        onClick={() => renewCode(i)}
                        className="mono"
                        title="Extend expiry date by plan duration"
                        style={{
                          background: "rgba(82, 168, 106, 0.12)",
                          border: "1px solid var(--good)",
                          color: "var(--good)",
                          borderRadius: 6,
                          padding: "4px 8px",
                          fontSize: 9,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        <RefreshCw size={10} />
                        <span>Renew</span>
                      </button>

                      <button
                        onClick={() => replaceCode(i)}
                        className="mono"
                        title="Issue replacement code and mark current code REPLACED"
                        style={{
                          background: "transparent",
                          border: "1px solid #38bdf866",
                          color: "#38bdf8",
                          borderRadius: 6,
                          padding: "4px 8px",
                          fontSize: 9,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        <RotateCcw size={10} />
                        <span>Replace</span>
                      </button>

                      <button
                        onClick={() => revokeOrRestore(i)}
                        className="mono"
                        style={{
                          background: "transparent",
                          border: "1px solid var(--border-2)",
                          color: c.status === "REVOKED" ? "var(--good)" : "var(--warn)",
                          borderRadius: 6,
                          padding: "4px 8px",
                          fontSize: 9,
                          cursor: "pointer"
                        }}
                      >
                        {c.status === "REVOKED" ? "Restore" : "Revoke"}
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
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Row Metadata: Subscriber Name, Activation, Expiry & SHA-256 Digest */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.4fr 130px 130px 1.6fr", gap: 10, marginTop: 8, alignItems: "center" }}>
                    <input
                      type="text"
                      placeholder="Subscriber Name / Reference"
                      value={c.subscriberName || ""}
                      onChange={(e) => updateSubscriberField(i, "subscriberName", e.target.value)}
                      style={{
                        background: "var(--bg)",
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        padding: "4px 8px",
                        color: "var(--white)",
                        fontSize: 11
                      }}
                    />
                    <div className="mono" style={{ fontSize: 9, color: "var(--text-dim)" }}>
                      Act: <strong style={{ color: "var(--white)" }}>{c.activationDate}</strong>
                    </div>
                    <div className="mono" style={{ fontSize: 9, color: "var(--text-dim)" }}>
                      Exp: <strong style={{ color: "var(--gold-pale)" }}>{c.expiryDate}</strong>
                    </div>
                    <div className="mono" style={{ fontSize: 8.5, color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      Hash: {c.codeHash}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Level 3 — Auditable Subscriber Event Log & 3-Layer Architecture Specification */}
      <div className="glass" style={{ borderRadius: 14, overflow: "hidden" }}>
        <button
          onClick={() => setShowAuditDrawer(!showAuditDrawer)}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "13px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Layers size={15} style={{ color: "var(--gold)" }} />
            <span className="mono" style={{ fontSize: 10.5, color: "var(--white)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Level 3 · Subscriber Audit Log ({auditLog.length} Events) & Future Backend Entitlement Specification
            </span>
          </div>
          {showAuditDrawer ? <ChevronUp size={16} color="var(--gold)" /> : <ChevronDown size={16} color="var(--gold)" />}
        </button>

        {showAuditDrawer && (
          <div style={{ padding: "16px 18px", borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginBottom: 16 }}>
              <div style={{ background: "rgba(15, 22, 32, 0.75)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px" }}>
                <div className="mono" style={{ fontSize: 9, color: "var(--gold)" }}>1. LOCAL OWNER / ADMIN CONSOLE</div>
                <div style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 4, lineHeight: 1.45 }}>
                  Accessible strictly in local development (`import.meta.env.DEV`). Issues codes, sets tiers/dates, revokes/renews/replaces codes, and exports SHA-256 hashed registers.
                </div>
              </div>
              <div style={{ background: "rgba(15, 22, 32, 0.75)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px" }}>
                <div className="mono" style={{ fontSize: 9, color: "var(--good)" }}>2. SECURE ENTITLEMENT BACKEND</div>
                <div style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 4, lineHeight: 1.45 }}>
                  Stores `codeHash` (SHA-256 / Argon2id) on an external HTTPS service. Validates codes server-side, enforces expiry/revocation, and prevents client-side bypass.
                </div>
              </div>
              <div style={{ background: "rgba(15, 22, 32, 0.75)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px" }}>
                <div className="mono" style={{ fontSize: 9, color: "#38bdf8" }}>3. PUBLIC SUBSCRIBER INTERFACE</div>
                <div style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 4, lineHeight: 1.45 }}>
                  Clean subscriber activation modal in the public app. Never embeds master owner codes, bank credentials, or valid subscriber code lists in client JavaScript.
                </div>
              </div>
            </div>

            {auditLog.length > 0 && (
              <div style={{ maxHeight: 220, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 8 }}>
                {auditLog.map((ev) => (
                  <div
                    key={ev.eventId}
                    className="mono"
                    style={{
                      padding: "8px 12px",
                      borderBottom: "1px solid var(--border)",
                      fontSize: 9.5,
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12
                    }}
                  >
                    <span style={{ color: "var(--gold)" }}>{ev.action}</span>
                    <span style={{ color: "var(--white)", flex: 1 }}>{ev.details}</span>
                    <span style={{ color: "var(--text-dim)" }}>{ev.timestamp.slice(0, 19).replace("T", " ")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
