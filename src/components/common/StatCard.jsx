import React from 'react';

export function StatCard({ label, value, sub, accentColor = "var(--gold)", icon: Icon, badge }) {
  return (
    <div
      className="glass"
      style={{
        flex: "1 1 210px",
        borderRadius: 14,
        padding: "20px 22px",
        position: "relative",
        overflow: "hidden",
        borderTop: `2px solid ${accentColor}`,
        boxShadow: `0 8px 24px rgba(0, 0, 0, 0.35)`
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span className="mono" style={{
          fontSize: 10,
          color: "var(--text-dim)",
          letterSpacing: "0.16em",
          textTransform: "uppercase"
        }}>
          {label}
        </span>
        {Icon && <Icon size={16} style={{ color: accentColor, opacity: 0.85 }} />}
      </div>

      <div style={{
        fontFamily: "Cinzel",
        fontSize: "clamp(24px, 2.5vw, 32px)",
        fontWeight: 600,
        color: "var(--white)",
        lineHeight: 1.15
      }}>
        {value}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
        {sub && (
          <div className="mono" style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.04em" }}>
            {sub}
          </div>
        )}
        {badge && (
          <span className="mono" style={{
            fontSize: 9,
            padding: "2px 8px",
            borderRadius: 999,
            background: `${accentColor}18`,
            border: `1px solid ${accentColor}44`,
            color: accentColor,
            letterSpacing: "0.08em"
          }}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
