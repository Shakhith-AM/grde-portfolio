import React from 'react';
import { CAT_META, CAGR_META } from '../../constants/masterData';

export function CategoryCard({ cat, pct, showCagr = true, livePct = null }) {
  const m = CAT_META[cat];
  const cagr = CAGR_META[cat];

  return (
    <div
      className="glass"
      style={{
        flex: "1 1 120px",
        borderRadius: 12,
        padding: "18px 12px 14px",
        textAlign: "center",
        position: "relative",
        borderBottom: `3px solid ${m.hex}`,
        transition: "transform .2s ease, box-shadow .2s ease"
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = `0 8px 24px ${m.hex}22`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{
        fontFamily: "Cinzel",
        fontSize: 32,
        color: m.hex,
        fontWeight: 700,
        lineHeight: 1
      }}>
        {cat}
      </div>

      <div className="mono" style={{
        fontSize: 9,
        color: "var(--text-dim)",
        letterSpacing: "0.18em",
        marginTop: 4
      }}>
        {m.label}
      </div>

      <div style={{
        fontFamily: "Cinzel",
        fontSize: 26,
        color: "var(--white)",
        marginTop: 10,
        fontWeight: 600
      }}>
        {pct}%
      </div>

      {livePct !== null && (
        <div className="num" style={{
          fontSize: 10,
          marginTop: 2,
          color: Math.abs(livePct - pct) < 2 ? "var(--good)" : (livePct > pct ? "var(--gold)" : "var(--danger)")
        }}>
          Live {livePct.toFixed(1)}%
        </div>
      )}

      {/* Mini indicator bar */}
      <div style={{
        width: "70%",
        height: 3,
        background: "var(--border)",
        borderRadius: 2,
        margin: "8px auto 0",
        overflow: "hidden"
      }}>
        <div style={{
          width: `${Math.min((pct / 65) * 100, 100)}%`,
          height: "100%",
          background: m.hex,
          borderRadius: 2
        }} />
      </div>

      {showCagr && cagr && (
        <div className="mono" style={{
          fontSize: 9,
          color: "var(--text-dim)",
          marginTop: 10,
          letterSpacing: "0.06em"
        }}>
          Hist. avg <span style={{ color: m.hex, fontWeight: 500 }}>{cagr.range}</span>
        </div>
      )}
    </div>
  );
}
