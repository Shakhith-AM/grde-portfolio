import React, { useState, useMemo, useRef } from 'react';
import { CAT_META, CATS, ASSET_TEMPLATE } from '../constants/masterData';
import { formatCurrency, inrToActiveCcy, activeCcyToInr } from '../constants/currencies';
import { calculateSmartTopUp } from '../utils/calculations';
import { 
  Download, 
  Upload, 
  Trash2, 
  FileSpreadsheet, 
  Printer, 
  Coins, 
  ArrowUpRight, 
  Check, 
  AlertTriangle 
} from 'lucide-react';

export function TrackerView({ 
  portfolioState, 
  trackerData, 
  onUpdateTracker, 
  currency = "INR", 
  onOpenExcelModal 
}) {
  const { alloc, assets, catSummary, hasData, sumActual, effectiveTotal } = portfolioState;
  
  const [topUpAmount, setTopUpAmount] = useState(50000);
  const [showTopUpSimulator, setShowTopUpSimulator] = useState(false);
  const [focusedId, setFocusedId] = useState(null);
  const [focusedNameId, setFocusedNameId] = useState(null);
  const fileInputRef = useRef(null);

  const values = trackerData.values || {};
  const customNames = trackerData.customNames || {};
  const holderName = trackerData.holderName || "";
  const totalPortfolio = trackerData.totalPortfolio || "";
  const age = trackerData.age || 50;
  const reportDate = trackerData.reportDate || new Date().toISOString().slice(0, 7);

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

  const handleNameChange = (id, name) => {
    onUpdateTracker({
      ...trackerData,
      customNames: {
        ...customNames,
        [id]: name
      }
    });
  };

  // Smart Top-Up Allocation
  const smartTopUpAllocations = useMemo(() => {
    return calculateSmartTopUp(assets, Number(topUpAmount) || 0, sumActual, alloc);
  }, [assets, topUpAmount, sumActual, alloc]);

  // Export JSON backup
  const handleExportJSON = () => {
    const payload = {
      ...trackerData,
      exportedAt: new Date().toISOString(),
      schema: "GRDE-V5.3"
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

  // Import JSON backup
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

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to reset all holdings and portfolio data?")) {
      onUpdateTracker({
        holderName: "",
        totalPortfolio: "",
        age: 50,
        values: {},
        customNames: {},
        reportDate: new Date().toISOString().slice(0, 7)
      });
    }
  };

  const hasReconciliationGap = totalPortfolio > 0 && sumActual > 0 && Math.abs(sumActual - Number(totalPortfolio)) > 100;

  return (
    <div>
      {/* Header & Quick Sync Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 18 }}>
        <div>
          <div className="label">Portfolio Tracker & Ledger</div>
          <h2 style={{ fontSize: 32, margin: "8px 0 4px" }}>
            Asset <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Holdings</span>
          </h2>
          <p style={{ fontSize: 12.5, color: "var(--text-dim)", margin: 0, maxWidth: 540 }}>
            Enter your exact amounts below or sync directly via Excel. Tap any fund name to rename it to your actual bank, broker, or AMC scheme name.
          </p>
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
            <span>Excel / SIP Sync</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="mono"
            style={{
              background: "transparent",
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
            <Download size={12} />
            <span>Export JSON</span>
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
            <span>Import JSON</span>
          </button>

          <button
            onClick={handleClearAll}
            className="mono"
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--danger)",
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
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Reconciliation Warning Banner */}
      {hasReconciliationGap && (
        <div style={{
          background: "rgba(212, 168, 67, 0.08)",
          border: "1px solid var(--gold-dim)",
          borderRadius: 10,
          padding: "10px 16px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 12,
          color: "var(--gold-pale)"
        }}>
          <AlertTriangle size={16} style={{ color: "var(--gold)", flexShrink: 0 }} />
          <span>
            Reconciliation check: Sum of individual asset entries is <strong>{formatCurrency(sumActual, currency, false)}</strong> vs. explicit total portfolio of <strong>{formatCurrency(totalPortfolio, currency, false)}</strong>. The engine uses <strong>{formatCurrency(effectiveTotal, currency, false)}</strong> as the base.
          </span>
        </div>
      )}

      {/* Profile & Metadata Inputs */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ flex: "1 1 200px" }}>
          <label className="mono" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.14em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>
            Portfolio Holder
          </label>
          <input
            type="text"
            value={holderName}
            onChange={(e) => onUpdateTracker({ ...trackerData, holderName: e.target.value })}
            placeholder="e.g. Shakhith A.M. / Family Portfolio"
            style={{
              width: "100%",
              background: "var(--bg)",
              border: "1px solid var(--border-2)",
              borderRadius: 8,
              padding: "9px 12px",
              color: "var(--white)",
              fontSize: 12,
              outline: "none"
            }}
          />
        </div>

        <div style={{ flex: "1 1 180px" }}>
          <label className="mono" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.14em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>
            Total Portfolio Value ({currency})
          </label>
          <input
            type="number"
            value={inrToActiveCcy(totalPortfolio, currency)}
            onChange={(e) => onUpdateTracker({ ...trackerData, totalPortfolio: activeCcyToInr(e.target.value, currency) })}
            placeholder={sumActual > 0 ? String(inrToActiveCcy(sumActual, currency)) : "0"}
            style={{
              width: "100%",
              background: "var(--bg)",
              border: "1px solid var(--border-2)",
              borderRadius: 8,
              padding: "9px 12px",
              color: "var(--white)",
              fontFamily: "Oxygen, Questrial, sans-serif",
              fontSize: 12,
              outline: "none"
            }}
          />
        </div>

        <div style={{ flex: "0 0 110px" }}>
          <label className="mono" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.14em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>
            Your Age
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
              padding: "9px 12px",
              color: "var(--white)",
              fontSize: 12,
              outline: "none"
            }}
          />
        </div>

        <div style={{ flex: "0 0 130px" }}>
          <label className="mono" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.14em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>
            Report Month
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
              padding: "9px 12px",
              color: "var(--white)",
              fontSize: 12,
              outline: "none"
            }}
          />
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="glass" style={{ borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
        {/* Table Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "24px 1.5fr 110px 110px 70px 100px",
          gap: 8,
          padding: "12px 18px",
          background: "var(--card-2)",
          alignItems: "center",
          borderBottom: "1px solid var(--border)"
        }}>
          {["", "Holding / Custom Scheme Name", `Current (${currency})`, `Target (${currency})`, "Split %", "Variance"].map((h, i) => (
            <div key={i} className="mono" style={{
              fontSize: 9,
              color: "var(--gold)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              textAlign: i >= 2 ? "right" : "left"
            }}>
              {h}
            </div>
          ))}
        </div>

        {/* Grouped Category Rows */}
        {CATS.map(cat => {
          const m = CAT_META[cat];
          const catAssets = assets.filter(a => a.cat === cat);
          const catCur = catAssets.reduce((s, a) => s + a.currentVal, 0);
          const catTgt = catAssets.reduce((s, a) => s + a.targetVal, 0);

          return (
            <div key={cat}>
              {/* Category Sub-header */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 18px",
                background: "#0f1620ee",
                borderTop: "1px solid var(--border)",
                borderBottom: "1px solid var(--border)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "Cinzel", fontSize: 16, color: m.hex, fontWeight: 700 }}>{cat}</span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--white)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                    {m.label} ({alloc[cat]}%)
                  </span>
                  <span className="mono" style={{ fontSize: 9, color: "var(--text-dim)" }}>· {m.tag}</span>
                </div>

                <div className="num" style={{ fontSize: 11, color: "var(--white)", fontWeight: 600 }}>
                  {formatCurrency(catCur, currency, false)} / {formatCurrency(catTgt, currency, false)}
                </div>
              </div>

              {/* Asset Item Rows */}
              {catAssets.map((a, i) => {
                const isOverweight = a.variance >= 0;
                return (
                  <div
                    key={a.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "24px 1.5fr 110px 110px 70px 100px",
                      gap: 8,
                      padding: "10px 18px",
                      alignItems: "center",
                      background: i % 2 === 0 ? "transparent" : "rgba(15, 31, 58, 0.3)",
                      borderTop: i > 0 ? "1px solid rgba(255,255,255,0.03)" : "none"
                    }}
                  >
                    <div>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: m.hex }} />
                    </div>

                    <div>
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
                          padding: "2px 6px",
                          color: "var(--white)",
                          fontSize: 12,
                          fontWeight: 500,
                          outline: "none"
                        }}
                      />
                      <div className="mono" style={{ fontSize: 9, color: "var(--text-dim)", paddingLeft: 6 }}>
                        {a.desc}
                      </div>
                    </div>

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
                          padding: "6px 8px",
                          color: "var(--white)",
                          fontFamily: "Oxygen, Questrial, sans-serif",
                          fontSize: 11,
                          textAlign: "right",
                          outline: "none"
                        }}
                      />
                    </div>

                    <div className="num" style={{ fontSize: 11, color: "var(--text)", textAlign: "right" }}>
                      {effectiveTotal > 0 ? formatCurrency(a.targetVal, currency, false) : "—"}
                    </div>

                    <div className="num" style={{ fontSize: 10.5, color: "var(--text-dim)", textAlign: "right" }}>
                      {a.finalPct.toFixed(2)}%
                    </div>

                    <div className="num" style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textAlign: "right",
                      color: a.currentVal > 0 ? (isOverweight ? "var(--good)" : "var(--danger)") : "var(--text-dim)"
                    }}>
                      {a.currentVal > 0 ? `${isOverweight ? "+" : ""}${formatCurrency(a.variance, currency, false)}` : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Ledger Total Footer */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "24px 1.5fr 110px 110px 70px 100px",
          gap: 8,
          padding: "14px 18px",
          background: "var(--card-2)",
          borderTop: "2px solid var(--gold-dim)",
          alignItems: "center"
        }}>
          <div />
          <div className="mono" style={{ fontSize: 11, color: "var(--gold)", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Total Portfolio
          </div>
          <div className="num" style={{ fontSize: 12, color: "var(--white)", fontWeight: 700, textAlign: "right" }}>
            {formatCurrency(sumActual, currency, false)}
          </div>
          <div className="num" style={{ fontSize: 12, color: "var(--text)", fontWeight: 600, textAlign: "right" }}>
            {formatCurrency(effectiveTotal, currency, false)}
          </div>
          <div className="num" style={{ fontSize: 11, color: "var(--text-dim)", textAlign: "right" }}>
            100%
          </div>
          <div className="num" style={{
            fontSize: 12,
            fontWeight: 700,
            textAlign: "right",
            color: sumActual > 0 ? (sumActual >= effectiveTotal ? "var(--good)" : "var(--danger)") : "var(--text-dim)"
          }}>
            {sumActual > 0 ? formatCurrency(sumActual - effectiveTotal, currency, false) : "—"}
          </div>
        </div>
      </div>

      {/* Smart Cash-Injection Rebalancing Simulator */}
      <div className="glass" style={{ borderRadius: 14, overflow: "hidden", marginBottom: 24, borderLeft: "4px solid var(--gold)" }}>
        <div style={{
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          borderBottom: "1px solid var(--border)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Coins size={18} style={{ color: "var(--gold)" }} />
            <div>
              <div className="mono" style={{ fontSize: 11, color: "var(--white)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                Smart Cash-Injection Top-Up Engine
              </div>
              <div className="mono" style={{ fontSize: 9, color: "var(--text-dim)", marginTop: 2 }}>
                Fresh-capital rebalancing — no forced sales
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="mono" style={{ fontSize: 10, color: "var(--text-dim)" }}>Simulate Top-Up Amount:</span>
            <input
              type="number"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(Number(e.target.value))}
              style={{
                background: "var(--bg)",
                border: "1px solid var(--gold-dim)",
                borderRadius: 6,
                padding: "6px 10px",
                color: "var(--gold-pale)",
                fontFamily: "Oxygen, Questrial, sans-serif",
                fontSize: 12,
                width: 120,
                outline: "none"
              }}
            />
          </div>
        </div>

        <div style={{ padding: "16px 20px" }}>
          {smartTopUpAllocations.length === 0 || topUpAmount <= 0 ? (
            <div className="mono" style={{ fontSize: 11, color: "var(--text-dim)", textAlign: "center", padding: "10px 0" }}>
              Enter a top-up amount above to calculate optimal capital routing.
            </div>
          ) : (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
                {smartTopUpAllocations.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: "rgba(15, 22, 32, 0.7)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: "10px 14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{
                          fontFamily: "Cinzel",
                          fontSize: 9,
                          fontWeight: 700,
                          color: CAT_META[item.cat]?.hex || "var(--gold)",
                          background: `${CAT_META[item.cat]?.hex || "#d4a843"}18`,
                          padding: "1px 5px",
                          borderRadius: 3
                        }}>
                          {item.cat}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--white)", fontWeight: 500 }}>
                          {item.name}
                        </span>
                      </div>
                      <div className="mono" style={{ fontSize: 8.5, color: "var(--text-dim)", marginTop: 2 }}>
                        {item.reason}
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div className="num" style={{ fontSize: 13, color: "var(--good)", fontWeight: 700 }}>
                        +{formatCurrency(item.allocatedAmount, currency, false)}
                      </div>
                      <div className="mono" style={{ fontSize: 8.5, color: "var(--gold-pale)" }}>
                        {item.allocatedPct}% of top-up
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
