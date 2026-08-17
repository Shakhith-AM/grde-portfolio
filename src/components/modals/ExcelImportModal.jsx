import React, { useState, useRef } from 'react';
import { parseExcelOrCsv, generateExcelTemplate } from '../../utils/excelParser';
import { CAT_META } from '../../constants/masterData';
import { formatCurrency } from '../../constants/currencies';
import { FileSpreadsheet, Upload, Download, CheckCircle, AlertCircle, X } from 'lucide-react';

export function ExcelImportModal({ isOpen, onClose, onApplyHoldings, currency = "INR" }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [parsedResult, setParsedResult] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setError("");
    setLoading(true);

    try {
      const res = await parseExcelOrCsv(selected);
      setParsedResult(res);
    } catch (err) {
      setError("Failed to parse spreadsheet. Please ensure it is a valid .xlsx or .csv file.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedResult || !parsedResult.mapped.length) return;
    
    // Convert mapped list to values and customNames
    const values = {};
    const customNames = {};
    
    parsedResult.mapped.forEach(item => {
      values[item.id] = (values[item.id] || 0) + item.amount;
      if (item.name && item.name !== item.originalName) {
        customNames[item.id] = item.name;
      }
    });

    onApplyHoldings(values, customNames);
    onClose();
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 150,
      display: "grid",
      placeItems: "center",
      background: "rgba(6, 10, 16, 0.88)",
      backdropFilter: "blur(8px)",
      padding: 16
    }}>
      <div className="glass" style={{
        borderRadius: 16,
        padding: "28px 30px",
        maxWidth: 620,
        width: "100%",
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
        borderColor: "var(--gold-dim)",
        position: "relative"
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            background: "transparent",
            border: "none",
            color: "var(--text-dim)",
            cursor: "pointer"
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "rgba(82,168,106,0.15)",
            border: "1px solid var(--good)",
            display: "grid",
            placeItems: "center",
            color: "var(--good)"
          }}>
            <FileSpreadsheet size={18} />
          </div>
          <div>
            <h3 style={{ fontFamily: "Cinzel", fontSize: 20, color: "var(--white)", margin: 0 }}>
              Excel & SIP <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Spreadsheet Importer</span>
            </h3>
            <div className="mono" style={{ fontSize: 9, color: "var(--text-dim)", marginTop: 2 }}>
              Upload your monthly investment register or holdings sheet
            </div>
          </div>
        </div>

        {/* Action bar: download template */}
        <div style={{
          background: "rgba(212, 168, 67, 0.06)",
          border: "1px solid var(--gold-dim)",
          borderRadius: 10,
          padding: "12px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "14px 0"
        }}>
          <div style={{ fontSize: 12, color: "var(--text)" }}>
            Need the official column format?
          </div>
          <button
            onClick={generateExcelTemplate}
            className="mono"
            style={{
              background: "linear-gradient(180deg, #d4a843, #8a7029)",
              color: "#0a0e14",
              border: "none",
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.1em",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 5
            }}
          >
            <Download size={12} />
            <span>Download Template (.xlsx)</span>
          </button>
        </div>

        {/* Drop zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: "2px dashed var(--border-2)",
            borderRadius: 12,
            padding: "28px 20px",
            textAlign: "center",
            cursor: "pointer",
            background: "rgba(15, 22, 32, 0.6)",
            transition: "border-color 0.2s ease",
            marginBottom: 16
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) {
              handleFileChange({ target: { files: e.dataTransfer.files } });
            }
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls, .csv"
            style={{ display: "none" }}
          />
          <Upload size={32} style={{ color: "var(--gold-pale)", opacity: 0.8, margin: "0 auto 8px" }} />
          <div style={{ fontSize: 13, color: "var(--white)", fontWeight: 500 }}>
            {file ? file.name : "Click to select or drag & drop Excel / CSV file"}
          </div>
          <div className="mono" style={{ fontSize: 9, color: "var(--text-dim)", marginTop: 4 }}>
            Supports .xlsx, .xls, and .csv formats
          </div>
        </div>

        {loading && (
          <div className="mono" style={{ textAlign: "center", fontSize: 11, color: "var(--gold)", margin: "10px 0" }}>
            Reading spreadsheet & auto-mapping assets...
          </div>
        )}

        {error && (
          <div style={{
            background: "rgba(214, 96, 77, 0.12)",
            border: "1px solid var(--danger)",
            borderRadius: 8,
            padding: "10px 12px",
            color: "var(--danger)",
            fontSize: 11,
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12
          }}>
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {/* Parsed Preview */}
        {parsedResult && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span className="mono" style={{ fontSize: 10, color: "var(--good)", letterSpacing: "0.14em" }}>
                ✓ {parsedResult.mapped.length} Holdings Recognized ({parsedResult.totalRows} rows parsed)
              </span>
              <span className="num" style={{ fontSize: 11, color: "var(--white)", fontWeight: 600 }}>
                Total: {formatCurrency(parsedResult.mapped.reduce((s, i) => s + i.amount, 0), currency, false)}
              </span>
            </div>

            <div style={{
              maxHeight: 180,
              overflowY: "auto",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "6px 10px",
              marginBottom: 16
            }}>
              {parsedResult.mapped.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "6px 0",
                    borderBottom: idx < parsedResult.mapped.length - 1 ? "1px solid var(--border)" : "none"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      fontFamily: "Cinzel",
                      fontSize: 10,
                      fontWeight: 700,
                      color: CAT_META[item.category]?.hex || "var(--gold)",
                      background: `${CAT_META[item.category]?.hex || "#d4a843"}18`,
                      padding: "2px 6px",
                      borderRadius: 4
                    }}>
                      {item.category}
                    </span>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--white)" }}>{item.name}</div>
                      <div className="mono" style={{ fontSize: 9, color: "var(--text-dim)" }}>
                        Mapped to {item.id} (Row {item.rowNumber})
                      </div>
                    </div>
                  </div>

                  <div className="num" style={{ fontSize: 12, color: "var(--white)", fontWeight: 600 }}>
                    {formatCurrency(item.amount, currency, false)}
                  </div>
                </div>
              ))}
            </div>

            {parsedResult.unmapped.length > 0 && (
              <div className="mono" style={{ fontSize: 9, color: "var(--warn)", marginBottom: 12 }}>
                ℹ {parsedResult.unmapped.length} row(s) had missing or unrecognized categories and were skipped.
              </div>
            )}

            <button
              onClick={handleConfirmImport}
              className="mono"
              style={{
                width: "100%",
                background: "linear-gradient(180deg, #52a86a, #2e6b3f)",
                color: "#ffffff",
                border: "none",
                borderRadius: 8,
                padding: "12px 20px",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6
              }}
            >
              <CheckCircle size={14} />
              <span>Apply & Update Portfolio Tracker</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
