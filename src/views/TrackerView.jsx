import React, { useState, useMemo, useRef } from 'react';
import { CAT_META, CATS, AUXILIARY_SLEEVES, DEFAULT_OCT_2026_TRACKER } from '../constants/masterData';
import { formatCurrency, inrToActiveCcy, activeCcyToInr } from '../constants/currencies';
import { calculateSmartTopUp } from '../utils/calculations';
import { 
  Download, 
  Upload, 
  Trash2, 
  FileSpreadsheet, 
  Coins, 
  Settings,
  Info,
  ChevronDown,
  ChevronUp,
  Layers
} from 'lucide-react';

export function TrackerView({ 
  portfolioState, 
  trackerData, 
  onUpdateTracker, 
  currency = "INR", 
  onOpenExcelModal 
}) {
  const {
    alloc,
    assets,
    catSummary,
    goldBreakdown,
    equityBreakdown,
    auxiliaryHoldings,
    sumAuxiliary,
    oct2026ChartReconciliation,
    sumActual,
    effectiveTotal
  } = portfolioState;
  
  const [topUpAmount, setTopUpAmount] = useState(64000);
  const [focusedId, setFocusedId] = useState(null);
  const [focusedNameId, setFocusedNameId] = useState(null);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [showSleeveSettings, setShowSleeveSettings] = useState(false);
  const [showAuxiliaryAudit, setShowAuxiliaryAudit] = useState(false);
  const fileInputRef = useRef(null);

  const values = trackerData.values || {};
  const auxiliaryValues = trackerData.auxiliaryValues || {};
  const customNames = trackerData.customNames || {};
  const holderName = trackerData.holderName || "";
  const totalPortfolio = trackerData.totalPortfolio || 4000000;
  const age = trackerData.age || 52;
  const reportDate = trackerData.reportDate || "2026-10";
  const invescoMomentumTicker = trackerData.invescoMomentumTicker || "INVESCO-MOM (Provisional — Confirm Ticker)";

  const handleValueChange = (id, rawVal) => {
    const cleaned = String(rawVal).replace(/[^0-9.]/g, "");
    const inrVal = activeCcyToInr(cleaned, currency);
    onUpdateTracker({
      ...trackerData,
      values: {
        ...values,
        [id]: inrVal
      }
    });
  };

  const handleAuxValueChange = (id, rawVal) => {
    const cleaned = String(rawVal).replace(/[^0-9.]/g, "");
    const inrVal = activeCcyToInr(cleaned, currency);
    onUpdateTracker({
      ...trackerData,
      auxiliaryValues: {
        ...auxiliaryValues,
        [id]: inrVal
      }
    });
  };

  const handleNameChange = (id, name) => {
    onUpdateTracker({
      ...trackerData,
      customNames: {
        ...customNames,
        [id]: name
      }
    });
  };

  const smartTopUpAllocations = useMemo(() => {
    return calculateSmartTopUp(assets, Number(topUpAmount) || 0, sumActual, alloc);
  }, [assets, topUpAmount, sumActual, alloc]);

  const handleExportJSON = () => {
    const payload = {
      ...trackerData,
      exportedAt: new Date().toISOString(),
      schema: "GRDE-OCT-2026-V5.4"
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GRDE_Portfolio_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (window.confirm("Import this backup? It will replace your current holdings on this device.")) {
          onUpdateTracker(data);
        }
      } catch (err) {
        alert("Failed to parse GRDE backup JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleResetBaseline = () => {
    if (window.confirm("Restore the October 2026 Consolidated baseline holdings and ₹40,00,000 target reference?")) {
      onUpdateTracker(DEFAULT_OCT_2026_TRACKER);
    }
  };

  const getStatusBadge = (a) => {
    if (a.holdingType === "LEGACY") return { label: "LEGACY", color: "var(--warn)" };
    if (a.holdingType === "TRANSITION") return { label: "TRANSITION", color: "#38bdf8" };
    if (a.configurableGoldSplit && a.targetVal === 0) return { label: "CONFIGURABLE", color: "var(--gold)" };
    return { label: "CORE", color: "var(--good)" };
  };

  return (
    <div>
      {/* Header & Quick Sync Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
        <div>
          <div className="label">GRDE Portfolio Engine · 04/10/2026 Snapshot</div>
          <h2 style={{ fontSize: 32, margin: "8px 0 4px" }}>
            Asset <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Holdings & Targets</span>
          </h2>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={onOpenExcelModal}
            className="mono"
            style={{
              background: "linear-gradient(180deg, #52a86a, #2e6b3f)",
              color: "#ffffff",
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
            <FileSpreadsheet size={13} />
            <span>Excel Sync</span>
          </button>

          <button
            onClick={() => setShowSleeveSettings(v => !v)}
            className="mono"
            style={{
              background: showSleeveSettings ? "rgba(212, 168, 67, 0.14)" : "transparent",
              border: "1px solid var(--gold-dim)",
              color: "var(--gold-pale)",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 10,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 5
            }}
          >
            <Settings size={12} />
            <span>Sleeve Config</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="mono"
            style={{
              background: "transparent",
              border: "1px solid var(--border-2)",
              color: "var(--text)",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 10,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 5
            }}
          >
            <Download size={12} />
            <span>Export</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJSON}
            accept=".json"
            style={{ display: "none" }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="mono"
            style={{
              background: "transparent",
              border: "1px solid var(--border-2)",
              color: "var(--text-dim)",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 10,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 5
            }}
          >
            <Upload size={12} />
            <span>Import</span>
          </button>

          <button
            onClick={handleResetBaseline}
            className="mono"
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--gold-pale)",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 10,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 4
            }}
          >
            <Trash2 size={12} />
            <span>Restore Baseline</span>
          </button>
        </div>
      </div>

      {/* Compact Profile Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: showSleeveSettings ? 12 : 18 }}>
        <div>
          <label className="mono" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.14em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
            Portfolio Holder
          </label>
          <input
            type="text"
            value={holderName}
            onChange={(e) => onUpdateTracker({ ...trackerData, holderName: e.target.value })}
            placeholder="e.g. Shakhith A.M."
            style={{
              width: "100%",
              background: "var(--bg)",
              border: "1px solid var(--border-2)",
              borderRadius: 8,
              padding: "8px 12px",
              color: "var(--white)",
              fontSize: 12,
              outline: "none"
            }}
          />
        </div>

        <div>
          <label className="mono" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.14em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
            Target Base ({currency})
          </label>
          <input
            type="number"
            value={inrToActiveCcy(totalPortfolio, currency)}
            onChange={(e) => onUpdateTracker({ ...trackerData, totalPortfolio: activeCcyToInr(e.target.value, currency) })}
            placeholder="4000000"
            style={{
              width: "100%",
              background: "var(--bg)",
              border: "1px solid var(--border-2)",
              borderRadius: 8,
              padding: "8px 12px",
              color: "var(--white)",
              fontSize: 12,
              outline: "none"
            }}
          />
        </div>

        <div>
          <label className="mono" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.14em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
            Age (Band {alloc.range})
          </label>
          <input
            type="number"
            min={18}
            max={100}
            value={age}
            onChange={(e) => onUpdateTracker({ ...trackerData, age: Number(e.target.value) })}
            style={{
              width: "100%",
              background: "var(--bg)",
              border: "1px solid var(--border-2)",
              borderRadius: 8,
              padding: "8px 12px",
              color: "var(--white)",
              fontSize: 12,
              outline: "none"
            }}
          />
        </div>

        <div>
          <label className="mono" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.14em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
            Snapshot Month
          </label>
          <input
            type="month"
            value={reportDate}
            onChange={(e) => onUpdateTracker({ ...trackerData, reportDate: e.target.value })}
            style={{
              width: "100%",
              background: "var(--bg)",
              border: "1px solid var(--border-2)",
              borderRadius: 8,
              padding: "8px 12px",
              color: "var(--white)",
              fontSize: 12,
              outline: "none"
            }}
          />
        </div>
      </div>

      {/* Level 2 Expandable Sleeve Configuration Drawer (Invesco Ticker & Configurable G1–G3 Split) */}
      {showSleeveSettings && (
        <div className="glass" style={{ borderRadius: 12, padding: "14px 18px", marginBottom: 18, borderLeft: "3px solid var(--gold)" }}>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: "1 1 240px" }}>
              <label className="mono" style={{ fontSize: 9, color: "var(--gold-pale)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                E2 Configurable Invesco Momentum Ticker
              </label>
              <input
                type="text"
                value={invescoMomentumTicker}
                onChange={(e) => onUpdateTracker({ ...trackerData, invescoMomentumTicker: e.target.value })}
                style={{
                  width: "100%",
                  background: "var(--bg)",
                  border: "1px solid var(--gold-dim)",
                  borderRadius: 6,
                  padding: "7px 10px",
                  color: "var(--white)",
                  fontSize: 11.5,
                  outline: "none"
                }}
              />
            </div>

            {goldBreakdown && (
              <div style={{ flex: "1 1 340px" }}>
                <div className="mono" style={{ fontSize: 9, color: "var(--gold-pale)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
                  Configurable Gold Split (% of G · Pending Confirmation)
                </div>
                <div className="mono" style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 10, color: "var(--text-dim)" }}>
                  <label>
                    GoldBeES %{" "}
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={trackerData.goldSplitConfig?.g_gold_pctOfG ?? 85}
                      onChange={(e) => onUpdateTracker({
                        ...trackerData,
                        goldSplitConfig: {
                          ...(trackerData.goldSplitConfig || {}),
                          g_gold_pctOfG: Number(e.target.value)
                        }
                      })}
                      style={{ width: 50, background: "var(--bg)", border: "1px solid var(--border-2)", borderRadius: 6, color: "var(--white)", fontSize: 11, padding: "5px 6px", textAlign: "right" }}
                    />
                  </label>
                  <label>
                    SGB %{" "}
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={trackerData.goldSplitConfig?.g_sgb_pctOfG ?? 0}
                      onChange={(e) => onUpdateTracker({
                        ...trackerData,
                        goldSplitConfig: {
                          ...(trackerData.goldSplitConfig || {}),
                          g_sgb_pctOfG: Number(e.target.value)
                        }
                      })}
                      style={{ width: 46, background: "var(--bg)", border: "1px solid var(--border-2)", borderRadius: 6, color: "var(--white)", fontSize: 11, padding: "5px 6px", textAlign: "right" }}
                    />
                  </label>
                  <label>
                    Phys %{" "}
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={trackerData.goldSplitConfig?.g_phys_pctOfG ?? 0}
                      onChange={(e) => onUpdateTracker({
                        ...trackerData,
                        goldSplitConfig: {
                          ...(trackerData.goldSplitConfig || {}),
                          g_phys_pctOfG: Number(e.target.value)
                        }
                      })}
                      style={{ width: 46, background: "var(--bg)", border: "1px solid var(--border-2)", borderRadius: 6, color: "var(--white)", fontSize: 11, padding: "5px 6px", textAlign: "right" }}
                    />
                  </label>
                  {goldBreakdown.gConfigurableUnassignedTarget > 0 && (
                    <span style={{ color: "var(--gold)" }}>
                      ({formatCurrency(goldBreakdown.gConfigurableUnassignedTarget, currency, false)} unassigned)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main 5-Column Holdings Ledger: Instrument | Actual Value | Strategic Target | Variance | Status */}
      <div className="glass" style={{ borderRadius: 14, overflow: "hidden", marginBottom: 18 }}>
        {/* Table Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.8fr 135px 135px 125px 120px",
          gap: 10,
          padding: "11px 18px",
          background: "var(--card-2)",
          alignItems: "center",
          borderBottom: "1px solid var(--border)"
        }}>
          {[
            "Instrument",
            `Actual Value (${currency})`,
            "Strategic Target",
            "Variance",
            "Status"
          ].map((h, i) => (
            <div key={i} className="mono" style={{
              fontSize: 9,
              color: "var(--gold)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              textAlign: i >= 1 && i <= 3 ? "right" : i === 4 ? "right" : "left"
            }}>
              {h}
            </div>
          ))}
        </div>

        {/* Grouped Category Rows */}
        {CATS.map(cat => {
          const m = CAT_META[cat];
          const catAssets = assets.filter(a => a.cat === cat && !(a.id === "r_dc_legacy" && a.currentVal === 0));
          const catCur = catSummary[cat].cur;
          const catTgt = catSummary[cat].tgt;
          const catVar = catSummary[cat].varianceVal;

          return (
            <div key={cat}>
              {/* Category Header with Subtotal & Target */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 18px",
                background: "#0f1620ee",
                borderTop: "1px solid var(--border)",
                borderBottom: "1px solid var(--border)",
                flexWrap: "wrap",
                gap: 8
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "Cinzel", fontSize: 15, color: m.hex, fontWeight: 700 }}>{cat}</span>
                  <span className="mono" style={{ fontSize: 10.5, color: "var(--white)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                    {m.label} ({alloc[cat]}%)
                  </span>
                </div>

                <div className="num" style={{ display: "flex", gap: 16, fontSize: 11, alignItems: "center" }}>
                  <span style={{ color: "var(--white)", fontWeight: 600 }}>
                    Actual: {formatCurrency(catCur, currency, false)}
                  </span>
                  <span style={{ color: "var(--text-dim)" }}>
                    Target: {formatCurrency(catTgt, currency, false)}
                  </span>
                  <span style={{ color: catVar >= 0 ? "var(--good)" : "var(--danger)", fontWeight: 600 }}>
                    {catVar >= 0 ? "+" : ""}{formatCurrency(catVar, currency, false)}
                  </span>
                </div>
              </div>

              {/* Clean Sub-Sleeve Bar for E (E1 Passive | E1 Active + Legacy | E2 US) */}
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
                      tgt: equityBreakdown.e1PassiveTarget,
                      varVal: equityBreakdown.e1PassiveVariance
                    },
                    {
                      label: "E1 Active + Legacy (15%)",
                      cur: equityBreakdown.e1ActiveSubtotalActual,
                      tgt: equityBreakdown.e1ActiveTarget,
                      varVal: equityBreakdown.e1ActiveVariance
                    },
                    {
                      label: "E2 US Equity (20%)",
                      cur: equityBreakdown.e2TotalActual,
                      tgt: equityBreakdown.e2TotalTarget,
                      varVal: equityBreakdown.e2Variance
                    }
                  ].map((sub, sIdx) => (
                    <div
                      key={sub.label}
                      style={{
                        padding: "6px 18px",
                        borderRight: sIdx < 2 ? "1px solid var(--border)" : "none",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <span className="mono" style={{ fontSize: 9, color: "var(--text-dim)" }}>{sub.label}</span>
                      <span className="num" style={{ fontSize: 10.5, color: "var(--white)", fontWeight: 600 }}>
                        {formatCurrency(sub.cur, currency, true)} / {formatCurrency(sub.tgt, currency, true)}{" "}
                        <span style={{ color: sub.varVal >= 0 ? "var(--good)" : "var(--danger)", fontSize: 9.5 }}>
                          ({sub.varVal >= 0 ? "+" : ""}{formatCurrency(sub.varVal, currency, true)})
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Compact Instrument Rows */}
              {catAssets.map((a, i) => {
                const isOverweight = a.variance >= 0;
                const badge = getStatusBadge(a);
                const isExpanded = expandedRowId === a.id;

                return (
                  <div
                    key={a.id}
                    style={{
                      background: i % 2 === 0 ? "transparent" : "rgba(15, 31, 58, 0.25)",
                      borderTop: i > 0 ? "1px solid rgba(255,255,255,0.03)" : "none"
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.8fr 135px 135px 125px 120px",
                        gap: 10,
                        padding: "7px 18px",
                        alignItems: "center"
                      }}
                    >
                      {/* Col 1: Instrument Name */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                        <input
                          type="text"
                          value={customNames[a.id] ?? ""}
                          placeholder={a.name}
                          onChange={(e) => handleNameChange(a.id, e.target.value)}
                          onFocus={() => setFocusedNameId(a.id)}
                          onBlur={() => setFocusedNameId(null)}
                          style={{
                            width: "100%",
                            background: "transparent",
                            border: focusedNameId === a.id ? "1px solid var(--gold-dim)" : "1px solid transparent",
                            borderRadius: 4,
                            padding: "3px 6px",
                            color: "var(--white)",
                            fontSize: 12,
                            fontWeight: 500,
                            outline: "none"
                          }}
                        />
                      </div>

                      {/* Col 2: Actual Value Input */}
                      <div>
                        <input
                          type="number"
                          value={inrToActiveCcy(values[a.id] ?? "", currency)}
                          onChange={(e) => handleValueChange(a.id, e.target.value)}
                          placeholder="0"
                          onFocus={() => setFocusedId(a.id)}
                          onBlur={() => setFocusedId(null)}
                          style={{
                            width: "100%",
                            background: "var(--bg)",
                            border: `1px solid ${focusedId === a.id ? "var(--gold)" : "var(--border)"}`,
                            borderRadius: 6,
                            padding: "5px 8px",
                            color: "var(--white)",
                            fontSize: 11.5,
                            textAlign: "right",
                            outline: "none"
                          }}
                        />
                      </div>

                      {/* Col 3: Strategic Target */}
                      <div className="num" style={{ fontSize: 11.5, color: a.isLegacyOrTransition ? "var(--text-dim)" : "var(--text)", textAlign: "right" }}>
                        {a.id === "g_gldm"
                          ? "₹0 (Oct: ₹60k)"
                          : a.configurableGoldSplit && a.targetVal === 0
                            ? "Configurable"
                            : a.isLegacyOrTransition
                              ? "₹0"
                              : formatCurrency(a.targetVal, currency, false)}
                      </div>

                      {/* Col 4: Variance */}
                      <div className="num" style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        textAlign: "right",
                        color: a.isLegacyOrTransition
                          ? "var(--gold-pale)"
                          : (isOverweight ? "var(--good)" : "var(--danger)")
                      }}>
                        {a.isLegacyOrTransition
                          ? formatCurrency(a.currentVal, currency, false)
                          : `${isOverweight ? "+" : ""}${formatCurrency(a.variance, currency, false)}`}
                      </div>

                      {/* Col 5: Concise Status Badge + Info Icon */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
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
                        <button
                          onClick={() => setExpandedRowId(isExpanded ? null : a.id)}
                          title="Toggle instrument details"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: isExpanded ? "var(--gold)" : "var(--text-dim)",
                            cursor: "pointer",
                            padding: 2,
                            display: "inline-flex",
                            alignItems: "center"
                          }}
                        >
                          <Info size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Level 2 — Why (Strategic Rationale & Action Rule) */}
                    {isExpanded && (
                      <div className="mono" style={{
                        padding: "9px 18px 10px 24px",
                        background: "rgba(10, 16, 26, 0.8)",
                        borderTop: "1px dashed var(--border)",
                        fontSize: 9.5,
                        color: "var(--text-dim)",
                        display: "flex",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 8
                      }}>
                        <div>
                          <strong style={{ color: "var(--gold-pale)" }}>WHY ({badge.label}) · {a.sleeveCode}:</strong> {a.sub} ({a.finalPct.toFixed(2)}% GRDE) — {a.desc}
                        </div>
                        <div style={{ color: a.shortfall > 0 ? "var(--good)" : "var(--gold-pale)" }}>
                          {a.deploymentAction}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Compact Ledger Total Footer */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.8fr 135px 135px 125px 120px",
          gap: 10,
          padding: "12px 18px",
          background: "var(--card-2)",
          borderTop: "2px solid var(--gold-dim)",
          alignItems: "center"
        }}>
          <div className="mono" style={{ fontSize: 10.5, color: "var(--gold)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Strategic GRDE Total (100%)
          </div>
          <div className="num" style={{ fontSize: 12.5, color: "var(--white)", fontWeight: 700, textAlign: "right" }}>
            {formatCurrency(sumActual, currency, false)}
          </div>
          <div className="num" style={{ fontSize: 12.5, color: "var(--text)", fontWeight: 600, textAlign: "right" }}>
            {formatCurrency(effectiveTotal, currency, false)}
          </div>
          <div className="num" style={{
            fontSize: 12,
            fontWeight: 700,
            textAlign: "right",
            color: sumActual >= effectiveTotal ? "var(--good)" : "var(--danger)"
          }}>
            {formatCurrency(sumActual - effectiveTotal, currency, false)}
          </div>
          <div className="mono" style={{ fontSize: 8.5, color: "var(--gold-pale)", textAlign: "right" }}>
            04/10/2026
          </div>
        </div>
      </div>

      {/* Level 3 — How It Was Calculated (04/10/2026 Chart Reconciliation & Auxiliary Reserves) */}
      <div className="glass" style={{ borderRadius: 14, overflow: "hidden", marginBottom: 18 }}>
        <button
          onClick={() => setShowAuxiliaryAudit(v => !v)}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "13px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Layers size={15} style={{ color: "#38bdf8" }} />
            <span className="mono" style={{ fontSize: 10.5, color: "var(--white)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Level 3 · Calculation Proof, 04/10/2026 Reconciliation & Auxiliary Reserves
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {oct2026ChartReconciliation && (
              <span className="mono" style={{ fontSize: 10, color: "var(--gold-pale)" }}>
                Chart Total: {formatCurrency(oct2026ChartReconciliation.grdePresentChartWithTataSilv, currency, false)} · GRDE + NPS: {formatCurrency(oct2026ChartReconciliation.grdePlusNpsChartTotal, currency, false)}
              </span>
            )}
            {showAuxiliaryAudit ? <ChevronUp size={16} color="var(--gold)" /> : <ChevronDown size={16} color="var(--gold)" />}
          </div>
        </button>

        {showAuxiliaryAudit && (
          <div style={{ borderTop: "1px solid var(--border)" }}>
            {/* Calculation Proof Strip */}
            {equityBreakdown && oct2026ChartReconciliation && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                background: "rgba(10, 16, 26, 0.65)",
                borderBottom: "1px solid var(--border)"
              }}>
                <div style={{ padding: "10px 18px", borderRight: "1px solid var(--border)" }}>
                  <div className="mono" style={{ fontSize: 8.5, color: "var(--gold)" }}>G — STRATEGIC VS CHART</div>
                  <div className="num" style={{ fontSize: 11.5, color: "var(--white)", fontWeight: 600, marginTop: 2 }}>
                    {formatCurrency(oct2026ChartReconciliation.gStrategicOnly, currency, false)} + {formatCurrency(oct2026ChartReconciliation.tataSilvOct04Snapshot, currency, false)} (TATASILV) = {formatCurrency(oct2026ChartReconciliation.gWithTataSilv, currency, false)}
                  </div>
                </div>
                <div style={{ padding: "10px 18px", borderRight: "1px solid var(--border)" }}>
                  <div className="mono" style={{ fontSize: 8.5, color: "var(--good)" }}>E1 — INDIA SUBTOTAL PROOF</div>
                  <div className="num" style={{ fontSize: 11.5, color: "var(--white)", fontWeight: 600, marginTop: 2 }}>
                    Passive {formatCurrency(equityBreakdown.e1PassiveActual, currency, false)} + Active {formatCurrency(equityBreakdown.e1ActiveSubtotalActual, currency, false)} = {formatCurrency(equityBreakdown.e1TotalActual, currency, false)}
                  </div>
                </div>
                <div style={{ padding: "10px 18px" }}>
                  <div className="mono" style={{ fontSize: 8.5, color: "#38bdf8" }}>PORTFOLIO GRAND TOTAL PROOF</div>
                  <div className="num" style={{ fontSize: 11.5, color: "var(--white)", fontWeight: 600, marginTop: 2 }}>
                    GRDE Chart {formatCurrency(oct2026ChartReconciliation.grdePresentChartWithTataSilv, currency, false)} + NPS {formatCurrency(oct2026ChartReconciliation.npsTier1Oct04Snapshot, currency, false)} = {formatCurrency(oct2026ChartReconciliation.grdePlusNpsChartTotal, currency, false)}
                  </div>
                </div>
              </div>
            )}

            {(auxiliaryHoldings || AUXILIARY_SLEEVES).map((s, idx) => (
              <div
                key={s.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1.6fr 135px 1fr",
                  gap: 12,
                  padding: "10px 18px",
                  alignItems: "center",
                  borderBottom: idx < AUXILIARY_SLEEVES.length - 1 ? "1px solid var(--border)" : "none"
                }}
              >
                <div className="mono" style={{ fontSize: 10, color: "#38bdf8", fontWeight: 700 }}>{s.code}</div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--white)", fontWeight: 500 }}>{s.name}</div>
                  <div className="mono" style={{ fontSize: 8.5, color: "var(--text-dim)" }}>{s.desc}</div>
                </div>
                <div>
                  <input
                    type="number"
                    value={inrToActiveCcy(auxiliaryValues[s.id] ?? s.currentVal ?? 0, currency)}
                    onChange={(e) => handleAuxValueChange(s.id, e.target.value)}
                    style={{
                      width: "100%",
                      background: "var(--bg)",
                      border: "1px solid var(--border-2)",
                      borderRadius: 6,
                      padding: "5px 8px",
                      color: "var(--white)",
                      fontSize: 11,
                      textAlign: "right"
                    }}
                  />
                </div>
                <div className="mono" style={{ fontSize: 9, color: "var(--text-dim)", textAlign: "right" }}>
                  Outside 10:15:25:50 base
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compact Fresh Deployment Recommendation Engine */}
      <div className="glass" style={{ borderRadius: 14, overflow: "hidden", borderLeft: "4px solid var(--gold)" }}>
        <div style={{
          padding: "12px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          borderBottom: "1px solid var(--border)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Coins size={16} style={{ color: "var(--gold)" }} />
            <span className="mono" style={{ fontSize: 10.5, color: "var(--white)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Fresh Capital Routing Simulator
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="mono" style={{ fontSize: 9.5, color: "var(--text-dim)" }}>Monthly SIP / Top-Up:</span>
            <input
              type="number"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(Number(e.target.value))}
              style={{
                background: "var(--bg)",
                border: "1px solid var(--gold-dim)",
                borderRadius: 6,
                padding: "5px 10px",
                color: "var(--gold-pale)",
                fontSize: 11.5,
                width: 115,
                outline: "none",
                textAlign: "right"
              }}
            />
          </div>
        </div>

        <div style={{ padding: "14px 20px" }}>
          {smartTopUpAllocations.length === 0 || topUpAmount <= 0 ? (
            <div className="mono" style={{ fontSize: 10.5, color: "var(--text-dim)", textAlign: "center", padding: "8px 0" }}>
              Enter an amount above to preview shortfall-guided routing.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
              {smartTopUpAllocations.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: "rgba(15, 22, 32, 0.7)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "9px 12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{
                        fontFamily: "Cinzel",
                        fontSize: 8.5,
                        fontWeight: 700,
                        color: CAT_META[item.cat]?.hex || "var(--gold)",
                        background: `${CAT_META[item.cat]?.hex || "#d4a843"}18`,
                        padding: "1px 5px",
                        borderRadius: 3
                      }}>
                        {item.cat}
                      </span>
                      <span style={{ fontSize: 11.5, color: "var(--white)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.name}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
                    <div className="num" style={{ fontSize: 12, color: "var(--good)", fontWeight: 700 }}>
                      +{formatCurrency(item.allocatedAmount, currency, false)}
                    </div>
                    <div className="mono" style={{ fontSize: 8, color: "var(--text-dim)" }}>
                      {item.allocatedPct}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
