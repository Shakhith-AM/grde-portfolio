import React, { useState, useEffect, useMemo } from 'react';
import { CAT_META, CATS, CALENDAR_URL } from '../constants/masterData';
import { formatCurrency } from '../constants/currencies';
import { computeExpandedHealth, getHealthStatus } from '../utils/calculations';
import { 
  Activity, 
  Radio, 
  RefreshCw, 
  Calendar, 
  ShieldCheck,
  ArrowRight,
  Info
} from 'lucide-react';

const FALLBACK_CALENDAR = [
  { asset: "Mindspace REIT",            type: "Distribution", date: "Nov 2026",  amount: "~₹5.2/unit",  notes: "Quarterly payout (R1 Office REIT)" },
  { asset: "KRT REIT",                  type: "Distribution", date: "Nov 2026",  amount: "~₹4.8/unit",  notes: "Quarterly payout (R2 Office REIT)" },
  { asset: "Nexus Select Trust REIT",   type: "Distribution", date: "Nov 2026",  amount: "~₹3.9/unit",  notes: "Quarterly payout (R3 Retail REIT)" },
  { asset: "IndiGrid InvIT",            type: "Distribution", date: "Nov 2026",  amount: "~₹3.8/unit",  notes: "Quarterly payout (R4 Power InvIT)" },
  { asset: "IRB InvIT",                 type: "Distribution", date: "Nov 2026",  amount: "~₹2.1/unit",  notes: "Quarterly payout (R5 Highway InvIT)" },
  { asset: "SCHD (E2 US Dividend ETF)", type: "Dividend",     date: "Dec 2026",  amount: "Quarterly USD", notes: "Earmarked for reinvestment into Invesco Momentum ETF" },
  { asset: "D2 POMIS / Fixed Deposits", type: "Interest",     date: "Monthly",   amount: "Fixed credit", notes: "Monthly income stream (₹4.5L D2 sleeve)" },
  { asset: "D3 Wint Wealth Bonds",      type: "Coupon",       date: "Monthly",   amount: "Scheduled",    notes: "Senior secured bond coupon schedule (₹2.0L D3 sleeve)" },
  { asset: "NPS Tier I (Outside GRDE)", type: "Contribution", date: "Annual/Mo", amount: "₹50,000/yr",   notes: "Tracked outside main ₹40L GRDE allocation (80CCD)" }
];

// Public-safe Macro Context Snapshot with explicit data status tags (never presents stale/unavailable market feeds as current)
const PUBLIC_MACRO_CONTEXT = [
  {
    id: "US_FED_RATE",
    label: "US Federal Funds Target Range",
    value: "3.75%–4.00%",
    source: "Federal Reserve FOMC (Effective 2026-09-17)",
    status: "VERIFIED · RECENT RELEASE",
    relevance: "Supports E2 US Equity (VOO / QQQM / SCHD / Invesco Momentum) valuation backdrop."
  },
  {
    id: "RBI_REPO_RATE",
    label: "RBI Policy Repo Rate",
    value: "6.50%",
    source: "RBI Monetary Policy Committee (2026-08-08)",
    status: "VERIFIED · DATED (>60D)",
    relevance: "Anchors D4 Nippon Dynamic Bond Fund (₹1.5L target) and R (REIT/InvIT) yield spread."
  },
  {
    id: "INDIA_CPI",
    label: "India Headline CPI Inflation",
    value: "3.65%",
    source: "MoSPI CPI Release (Published 2026-08-12 · Ref Jul 2026)",
    status: "VERIFIED · DATED (>60D)",
    relevance: "Preserves positive real yields across D1 Liquid/Ultra Short (₹2L) and D2 POMIS/FD (₹4.5L)."
  },
  {
    id: "INDIA_MFG_PMI",
    label: "India Manufacturing PMI",
    value: "56.5",
    source: "S&P Global / HSBC India PMI (Published 2026-10-01 · Ref Sep 2026)",
    status: "VERIFIED · RECENT RELEASE",
    relevance: "Expansionary (>50) domestic activity supporting E1 Indian Equity (₹6L Passive + ₹6L Active)."
  },
  {
    id: "LIVE_SPOT_STREAMS",
    label: "Live Intraday / Daily Spot Feeds (Sensex, USD/INR, Brent)",
    value: "UNAVAILABLE IN OFFLINE MODE",
    source: "No live brokerage/exchange feed connected",
    status: "DATA STATUS: UNAVAILABLE",
    relevance: "Application never invents or fabricates live market marks when primary feeds are offline."
  }
];

function parseCSV(text) {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.replace(/"/g, "").trim().toLowerCase());
  return lines.slice(1).map(line => {
    const vals = line.match(/(".*?"|[^,]+)(?=,|$)/g) || [];
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (vals[i] || "").replace(/"/g, "").trim(); });
    return obj;
  });
}

function daysUntil(dateStr) {
  if (!dateStr || dateStr.toLowerCase().includes("month") || dateStr.toLowerCase().includes("annual")) return null;
  const months = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
  const parts = dateStr.trim().split(" ");
  if (parts.length < 2) return null;
  const mon = months[parts[0].toLowerCase().slice(0, 3)];
  const yr = parseInt(parts[1]);
  if (mon === undefined || isNaN(yr)) return null;
  const diff = new Date(yr, mon, 1) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function PulseView({ portfolioState, currency = "INR", onNavigate = null }) {
  const [calendar, setCalendar] = useState(FALLBACK_CALENDAR);
  const [loading, setLoading] = useState(false);

  const { alloc, assets, catSummary, equityBreakdown, hasData, effectiveTotal, isr } = portfolioState;

  const health = useMemo(() => {
    return computeExpandedHealth(assets, catSummary, alloc, effectiveTotal);
  }, [assets, catSummary, alloc, effectiveTotal]);

  const healthStatus = getHealthStatus(hasData ? health.overall : null);

  // Personal alerts computed from October 2026 portfolio holdings
  const personalAlerts = useMemo(() => {
    const list = [];
    if (!hasData) return list;

    // 1. D1 Liquid + Ultra Short check
    const d1 = assets.find(a => a.id === 'd_liq');
    if (d1 && d1.currentVal < d1.targetVal) {
      list.push({
        type: "warn",
        cat: "D",
        title: "D1 Liquidity Sleeve Below ₹2,00,000 Target",
        message: `D1 (Jio BlackRock Liquid + Nippon Ultra Short Duration) is currently at ${formatCurrency(d1.currentVal, currency, false)} vs ₹2,00,000 target (${formatCurrency(d1.targetVal - d1.currentVal, currency, false)} shortfall).`
      });
    }

    // 2. D4 Nippon Dynamic Bond Fund check
    const d4 = assets.find(a => a.id === 'd_dyn');
    if (d4 && d4.currentVal < d4.targetVal) {
      list.push({
        type: "info",
        cat: "D",
        title: "D4 Dynamic Bond Sleeve Building Phase",
        message: `D4 (Nippon Dynamic Bond Fund) has a strategic target of ${formatCurrency(d4.targetVal, currency, false)} (15% of D) to capture duration & rate-cycle stability.`
      });
    }

    // 3. E1 Legacy Active MFs & Mirae Healthcare Transition notice
    if (equityBreakdown?.e1LegacyActual > 0) {
      list.push({
        type: "info",
        cat: "E",
        title: "E1 Legacy MFs & Mirae Healthcare Under Gradual Transition",
        message: `${formatCurrency(equityBreakdown.e1LegacyActual, currency, false)} is held in Legacy Active MFs and Mirae Asset Healthcare. Route all fresh Indian Equity SIPs into the 8 strategic E1 sleeves (Nifty 50, Nifty Next 50, Nifty 500, Healthcare ETF, HDFC BAF, HDFC Small Cap, Motilal Midcap, PPFAS Flexicap); transition legacy holdings gradually subject to LTCG and exit loads.`
      });
    }

    // 4. E2 MON100 Transition & SCHD Dividend Routing notice
    if (equityBreakdown?.e2TransitionActual > 0) {
      list.push({
        type: "info",
        cat: "E",
        title: "E2 MON100 Transition & QQQM / Momentum Routing Active",
        message: `MON100 (${formatCurrency(equityBreakdown.e2TransitionActual, currency, false)}) is tracked as a Transition Holding, not a 5th permanent E2 target. Direct fresh Nasdaq-100 SIPs to QQQM (4% GRDE target) and earmark SCHD dividends for Invesco Momentum ETF.`
      });
    }

    // 5. Category drift checks
    CATS.forEach(cat => {
      const diff = catSummary[cat].diff;
      if (Math.abs(diff) >= 2.5) {
        list.push({
          type: diff > 0 ? "info" : "warn",
          cat,
          title: `${CAT_META[cat].label} ${diff > 0 ? "Above" : "Below"} Strategic Weight (${catSummary[cat].curPct.toFixed(1)}% vs ${catSummary[cat].tgtPct}%)`,
          message: `${CAT_META[cat].label} is currently ${Math.abs(diff).toFixed(1)}% ${diff > 0 ? "above" : "below"} its ${catSummary[cat].tgtPct}% model allocation.`
        });
      }
    });

    return list;
  }, [hasData, assets, equityBreakdown, catSummary, currency]);

  const fetchLiveSheets = async () => {
    setLoading(true);
    try {
      const cR = await fetch(CALENDAR_URL + `&cb=${Date.now()}`, { cache: "no-store" });
      if (cR.ok) {
        const cT = await cR.text();
        const pC = parseCSV(cT);
        if (pC.length) setCalendar(pC);
      }
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchLiveSheets();
  }, []);

  return (
    <div style={{ color: "var(--text)" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
        <div>
          <div className="label">Portfolio Intelligence, Drift Monitoring & Deployment Cadence</div>
          <h2 style={{ fontSize: 30, margin: "8px 0 4px", color: "var(--white)" }}>
            GRDE <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Pulse & Monitoring</span> 📡
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-dim)", margin: 0 }}>
            Real-time portfolio allocation status, drift diagnostics, verified macro context, upcoming ₹64,000 SIP deployments, and distribution schedule.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {onNavigate && (
            <button
              onClick={() => onNavigate("sip")}
              className="mono"
              style={{
                background: "rgba(212, 168, 67, 0.12)",
                border: "1px solid var(--gold-dim)",
                color: "var(--gold-pale)",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 10.5,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <span>Open ₹64k SIP Planner</span>
              <ArrowRight size={12} />
            </button>
          )}

          <button
            onClick={fetchLiveSheets}
            disabled={loading}
            className="mono"
            style={{
              background: "transparent",
              border: "1px solid var(--border-2)",
              color: "var(--gold-pale)",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 10.5,
              cursor: loading ? "wait" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <RefreshCw size={12} className={loading ? "spin" : ""} />
            <span>{loading ? "Refreshing..." : "↻ Refresh Calendar"}</span>
          </button>
        </div>
      </div>

      {/* Top Portfolio Pulse Summary Strip */}
      <div className="glass" style={{
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: 22,
        border: "1px solid rgba(212, 168, 67, 0.3)"
      }}>
        <div style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
          background: "rgba(212, 168, 67, 0.06)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Radio size={16} color="var(--gold)" />
            <span className="mono" style={{ fontSize: 11.5, fontWeight: 700, color: "var(--white)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              October 2026 Consolidated Portfolio Telemetry
            </span>
          </div>
          <span className="mono" style={{ fontSize: 10, color: "var(--gold-pale)" }}>
            Strategic Mandate: 10 : 15 : 25 : 50 · Age Band 50–55
          </span>
        </div>

        <div style={{ padding: "18px 20px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))",
            gap: 10
          }}>
            <div style={{ background: "rgba(15, 23, 42, 0.7)", borderTop: "3px solid var(--gold)", borderRadius: 8, padding: "12px 14px" }}>
              <div className="mono" style={{ fontSize: 9.5, color: "var(--gold)", textTransform: "uppercase" }}>
                Portfolio Health
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--white)", marginTop: 4 }}>
                {hasData ? `${health.overall}/100` : "Baseline"} · {healthStatus.text}
              </div>
              <div style={{ fontSize: 10.5, color: "var(--text-dim)", marginTop: 2 }}>
                8-Factor Structural Audit
              </div>
            </div>

            <div style={{ background: "rgba(15, 23, 42, 0.7)", borderTop: "3px solid var(--good)", borderRadius: 8, padding: "12px 14px" }}>
              <div className="mono" style={{ fontSize: 9.5, color: "var(--good)", textTransform: "uppercase" }}>
                Defensive Shield (ISR)
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--white)", marginTop: 4 }}>
                {isr.toFixed(1)}% (Target 50.0%)
              </div>
              <div style={{ fontSize: 10.5, color: "var(--text-dim)", marginTop: 2 }}>
                G (10%) + R (15%) + D (25%)
              </div>
            </div>

            <div style={{ background: "rgba(15, 23, 42, 0.7)", borderTop: "3px solid #38bdf8", borderRadius: 8, padding: "12px 14px" }}>
              <div className="mono" style={{ fontSize: 9.5, color: "#38bdf8", textTransform: "uppercase" }}>
                Upcoming SIP Cadence
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--white)", marginTop: 4 }}>
                ₹64,000 / Month
              </div>
              <div style={{ fontSize: 10.5, color: "var(--text-dim)", marginTop: 2 }}>
                4 × ₹16,000 Weekly Cycles + Wk 4 Sweep
              </div>
            </div>

            <div style={{ background: "rgba(15, 23, 42, 0.7)", borderTop: "3px solid #eab308", borderRadius: 8, padding: "12px 14px" }}>
              <div className="mono" style={{ fontSize: 9.5, color: "#eab308", textTransform: "uppercase" }}>
                Strategic Retirement Target
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--white)", marginTop: 4 }}>
                ₹4,00,00,000 (₹4 Cr)
              </div>
              <div style={{ fontSize: 10.5, color: "var(--text-dim)", marginTop: 2 }}>
                Long-Term Compounding Horizon
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Portfolio Drift & Transition Signals */}
      <div className="glass" style={{ borderRadius: 14, overflow: "hidden", marginBottom: 22 }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <Activity size={16} style={{ color: "var(--gold)" }} />
          <span className="mono" style={{ fontSize: 11, color: "var(--white)", letterSpacing: "0.16em", textTransform: "uppercase" }}>
            Personal Portfolio Drift & Transition Alerts
          </span>
          <span className="mono" style={{ fontSize: 9, color: "var(--text-dim)", marginLeft: "auto" }}>
            Computed from G1–G3, R, D1–D4, E1 & E2 sleeves
          </span>
        </div>

        <div style={{ padding: "16px 20px" }}>
          {!hasData ? (
            <div className="mono" style={{ fontSize: 11, color: "var(--text-dim)", textAlign: "center", padding: "16px 0" }}>
              Enter holdings in the <strong>Portfolio Engine</strong> to view personalized rebalancing signals.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {personalAlerts.map((alert, i) => (
                <div
                  key={i}
                  style={{
                    background: "rgba(15, 22, 32, 0.7)",
                    border: `1px solid ${alert.type === "warn" ? "var(--warn)" : "var(--border-2)"}`,
                    borderLeft: `4px solid ${CAT_META[alert.cat]?.hex || "var(--gold)"}`,
                    borderRadius: 8,
                    padding: "12px 16px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontFamily: "Cinzel",
                      fontSize: 9,
                      fontWeight: 700,
                      color: CAT_META[alert.cat]?.hex || "var(--gold)",
                      background: `${CAT_META[alert.cat]?.hex || "#d4a843"}18`,
                      padding: "1px 5px",
                      borderRadius: 3
                    }}>
                      {alert.cat}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--white)", fontWeight: 600 }}>
                      {alert.title}
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--text)", lineHeight: 1.5 }}>
                    {alert.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Macro Context & Data Integrity Surface */}
      <div className="glass" style={{ borderRadius: 14, overflow: "hidden", marginBottom: 22 }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldCheck size={16} color="var(--good)" />
            <span className="mono" style={{ fontSize: 11, color: "var(--white)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Macro Context & Data Provenance Status
            </span>
          </div>
          <span className="mono" style={{ fontSize: 9.5, color: "var(--gold-pale)" }}>
            Explicitly distinguishes verified historical releases from unavailable live market streams
          </span>
        </div>

        <div style={{ padding: "14px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          {PUBLIC_MACRO_CONTEXT.map((m) => {
            const isUnavailable = m.status.includes("UNAVAILABLE");
            return (
              <div
                key={m.id}
                style={{
                  background: "rgba(15, 22, 32, 0.75)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "12px 14px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <span className="mono" style={{ fontSize: 9.5, color: "var(--text-dim)" }}>{m.label}</span>
                  <span className="mono" style={{
                    fontSize: 8.5,
                    color: isUnavailable ? "var(--warn)" : "var(--good)",
                    border: `1px solid ${isUnavailable ? "var(--warn)" : "var(--good)"}`,
                    borderRadius: 4,
                    padding: "1px 5px"
                  }}>
                    {m.status}
                  </span>
                </div>
                <div className="num" style={{ fontSize: 17, fontWeight: 700, color: isUnavailable ? "var(--gold-pale)" : "var(--white)", marginTop: 6 }}>
                  {m.value}
                </div>
                <div className="mono" style={{ fontSize: 8.5, color: "var(--gold)", marginTop: 3 }}>
                  {m.source}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 6, lineHeight: 1.45 }}>
                  {m.relevance}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Income & Distribution Calendar */}
      <div className="glass" style={{ borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Calendar size={16} style={{ color: "var(--d-color)" }} />
            <span className="mono" style={{ fontSize: 11, color: "var(--white)", letterSpacing: "0.16em", textTransform: "uppercase" }}>
              Income, Dividend Reinvestment & Distribution Calendar
            </span>
          </div>
          <span className="mono" style={{ fontSize: 9, color: "var(--text-dim)" }}>
            REITs, InvITs, SCHD Dividends & D2/D3 Coupons
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 110px 100px 110px 1.6fr", gap: 8, padding: "10px 18px", background: "var(--card-2)" }}>
          {["Asset / Instrument", "Event Type", "Schedule", "Payout Est.", "GRDE Routing Notes"].map((h, i) => (
            <div key={i} className="mono" style={{ fontSize: 9, color: "var(--text-dim)", textTransform: "uppercase" }}>
              {h}
            </div>
          ))}
        </div>

        {calendar.map((c, i) => {
          const days = daysUntil(c.date);
          return (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 110px 100px 110px 1.6fr",
                gap: 8,
                padding: "12px 18px",
                alignItems: "center",
                borderTop: "1px solid var(--border)",
                background: i % 2 === 0 ? "transparent" : "rgba(15, 31, 58, 0.25)"
              }}
            >
              <div style={{ fontSize: 12.5, color: "var(--white)", fontWeight: 500 }}>
                {c.asset}
              </div>

              <div>
                <span className="mono" style={{
                  fontSize: 9,
                  color: c.type === "Distribution" || c.type === "Dividend" ? "var(--good)" : "var(--gold-pale)",
                  background: c.type === "Distribution" || c.type === "Dividend" ? "rgba(82,168,106,0.15)" : "rgba(212,168,67,0.12)",
                  border: `1px solid ${c.type === "Distribution" || c.type === "Dividend" ? "var(--good)" : "var(--gold-dim)"}`,
                  borderRadius: 4,
                  padding: "2px 6px"
                }}>
                  {c.type}
                </span>
              </div>

              <div className="mono" style={{ fontSize: 10, color: "var(--text)" }}>
                {c.date}
                {days !== null && days >= 0 && (
                  <span style={{ fontSize: 9, color: "var(--gold)", display: "block" }}>
                    in {days}d
                  </span>
                )}
              </div>

              <div className="num" style={{ fontSize: 11, color: "var(--white)", fontWeight: 600 }}>
                {c.amount}
              </div>

              <div className="mono" style={{ fontSize: 9.5, color: "var(--text-dim)" }}>
                {c.notes}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
