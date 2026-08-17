import React from 'react';
import { CURRENCIES } from '../../constants/currencies';
import { GRDE_VERSION } from '../../constants/masterData';
import { Lock, Unlock, FileSpreadsheet } from 'lucide-react';

export function Header({ unlocked, onLock, currency, onCurrencyChange, onOpenExcelModal }) {
  return (
    <header className="grde-header" style={{
      borderBottom: "1px solid var(--border)",
      background: "linear-gradient(180deg, rgba(15, 31, 58, 0.6), rgba(10, 22, 40, 0.2))",
      padding: "16px 28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 40,
      backdropFilter: "blur(14px)"
    }}>
      {/* Brand logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 36,
          height: 36,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: 3
        }}>
          <div style={{ background: "var(--g-color)", borderRadius: 3, boxShadow: "0 0 6px rgba(212,168,67,0.3)" }} />
          <div style={{ background: "var(--r-color)", borderRadius: 3, boxShadow: "0 0 6px rgba(214,96,77,0.3)" }} />
          <div style={{ background: "var(--d-color)", borderRadius: 3, boxShadow: "0 0 6px rgba(74,127,184,0.3)" }} />
          <div style={{ background: "var(--e-color)", borderRadius: 3, boxShadow: "0 0 6px rgba(82,168,106,0.3)" }} />
        </div>
        <div>
          <div style={{
            fontFamily: "Cinzel",
            fontWeight: 700,
            fontSize: 20,
            color: "var(--white)",
            letterSpacing: "0.18em"
          }}>
            GRDE
          </div>
          <div className="mono" style={{
            fontSize: 9,
            color: "var(--text-dim)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginTop: 1
          }}>
            The Beaver Dam Method
          </div>
        </div>
      </div>

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {/* Excel / SIP quick import button */}
        <button
          onClick={onOpenExcelModal}
          className="mono"
          title="Import Excel / Monthly SIP Spreadsheet"
          style={{
            background: "rgba(82, 168, 106, 0.1)",
            border: "1px solid rgba(82, 168, 106, 0.35)",
            color: "var(--good)",
            borderRadius: 999,
            padding: "5px 12px",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <FileSpreadsheet size={13} />
          <span>Excel / SIP Sync</span>
        </button>

        {/* Currency Switcher */}
        <select
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
          className="mono"
          title="Switch display currency"
          style={{
            background: "rgba(212, 168, 67, 0.08)",
            border: "1px solid var(--gold-dim)",
            color: "var(--gold-pale)",
            borderRadius: 999,
            padding: "5px 12px",
            fontSize: 10,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            cursor: "pointer",
            outline: "none"
          }}
        >
          {Object.values(CURRENCIES).map(c => (
            <option key={c.code} value={c.code} style={{ background: "#0f1620", color: "#f0ece4" }}>
              {c.flag} · {c.symbol} {c.code}
            </option>
          ))}
        </select>

        {/* Version Badge */}
        <div className="mono" style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          color: "var(--text-dim)",
          borderRadius: 999,
          padding: "5px 12px",
          fontSize: 10,
          letterSpacing: "0.14em"
        }}>
          v{GRDE_VERSION}
        </div>

        {/* Lock status */}
        {unlocked ? (
          <button
            onClick={onLock}
            title="Lock session"
            className="mono"
            style={{
              background: "rgba(82,168,106,0.1)",
              border: "1px solid rgba(82,168,106,0.4)",
              color: "var(--good)",
              borderRadius: 999,
              padding: "5px 12px",
              fontSize: 10,
              letterSpacing: "0.14em",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <Unlock size={12} />
            <span>UNLOCKED</span>
          </button>
        ) : (
          <div className="mono" style={{
            background: "rgba(214,96,77,0.1)",
            border: "1px solid rgba(214,96,77,0.3)",
            color: "var(--danger)",
            borderRadius: 999,
            padding: "5px 12px",
            fontSize: 10,
            letterSpacing: "0.14em",
            display: "inline-flex",
            alignItems: "center",
            gap: 6
          }}>
            <Lock size={12} />
            <span>PROTECTED</span>
          </div>
        )}
      </div>
    </header>
  );
}
