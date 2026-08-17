import React from 'react';
import { ShieldAlert, ExternalLink, RefreshCw } from 'lucide-react';
import { GRDE_VERSION } from '../../constants/masterData';

export function Footer({ onReplayIntro }) {
  return (
    <footer style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
        marginBottom: 16
      }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
          GRDE Engine v{GRDE_VERSION} · An Architect's Blueprint for Wealth Creation
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <a
            href="https://grde.in"
            target="_blank"
            rel="noopener noreferrer"
            className="mono"
            style={{
              color: "var(--gold-pale)",
              fontSize: 10,
              letterSpacing: "0.12em",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4
            }}
          >
            <span>About GRDE Framework</span>
            <ExternalLink size={11} />
          </a>
          
          <button
            onClick={onReplayIntro}
            className="mono"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--gold-pale)",
              fontSize: 10,
              letterSpacing: "0.12em",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 4
            }}
          >
            <RefreshCw size={11} />
            <span>Replay Intro</span>
          </button>
          
          <span className="mono" style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em" }}>
            Architected by Shakhith A.M. · i3D Studio
          </span>
        </div>
      </div>

      <div style={{
        background: "rgba(15, 31, 58, 0.4)",
        border: "1px solid var(--border)",
        borderLeft: "3px solid var(--gold-dim)",
        borderRadius: 8,
        padding: "14px 18px",
        display: "flex",
        alignItems: "flex-start",
        gap: 12
      }}>
        <ShieldAlert size={18} style={{ color: "var(--gold)", flexShrink: 0, marginTop: 2 }} />
        <div>
          <div className="mono" style={{ fontSize: 9, color: "var(--gold)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>
            Regulatory & Educational Framework Disclaimer
          </div>
          <p style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>
            GRDE is an <strong style={{ color: "var(--text)" }}>educational portfolio engineering framework</strong>.
            All allocations, calculations, scenarios, and rebalancing simulations are mathematical examples based on user inputs
            and <strong style={{ color: "var(--text)" }}>should not be construed as SEBI-registered investment advice or guarantees of future returns</strong>.
            Market investments carry risk of capital loss. Always consult a qualified SEBI-registered financial advisor before executing trades.
          </p>
        </div>
      </div>
    </footer>
  );
}
