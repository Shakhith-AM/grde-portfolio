import React, { useState, useEffect } from 'react';
import { CAT_META, CATS, ALERTS_URL, CALENDAR_URL } from '../constants/masterData';
import { Activity, Radio, RefreshCw, Calendar, AlertCircle, ExternalLink } from 'lucide-react';

const FALLBACK_CALENDAR = [
  { asset: "Mindspace REIT",      type: "Distribution", date: "Aug 2026",  amount: "~₹5.2/unit",  notes: "Quarterly payout" },
  { asset: "KRT REIT",            type: "Distribution", date: "Aug 2026",  amount: "~₹4.8/unit",  notes: "Quarterly payout" },
  { asset: "Nexus REIT",          type: "Distribution", date: "Sep 2026",  amount: "~₹3.9/unit",  notes: "Quarterly payout" },
  { asset: "IndiGrid InvIT",      type: "Distribution", date: "Sep 2026",  amount: "~₹3.8/unit",  notes: "Quarterly payout" },
  { asset: "IRB InvIT",           type: "Distribution", date: "Oct 2026",  amount: "~₹2.1/unit",  notes: "Quarterly payout" },
  { asset: "Bonds / Target Mat.", type: "Maturity",     date: "Mar 2027",  amount: "Principal",    notes: "Plan reinvestment" },
  { asset: "FD + POMIS",          type: "Interest",     date: "Monthly",   amount: "Fixed credit", notes: "Auto-credited" },
  { asset: "NPS Tier I",          type: "Contribution", date: "Monthly",   amount: "₹1,000+",      notes: "Target ₹50,000/yr for 80CCD" },
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
  if (!dateStr || dateStr.toLowerCase() === "monthly") return null;
  const months = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
  const parts = dateStr.trim().split(" ");
  if (parts.length < 2) return null;
  const mon = months[parts[0].toLowerCase().slice(0, 3)];
  const yr = parseInt(parts[1]);
  if (mon === undefined || isNaN(yr)) return null;
  const diff = new Date(yr, mon, 1) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function PulseView({ portfolioState, currency = "INR" }) {
  const [calendar, setCalendar] = useState(FALLBACK_CALENDAR);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);

  const { assets, catSummary, hasData } = portfolioState;

  // Personal alerts computed from portfolio holdings
  const personalAlerts = [];
  if (hasData) {
    // Liquid fund check
    const dLiq = assets.find(a => a.id === 'd_liq');
    if (dLiq && (dLiq.currentVal / (dLiq.targetVal || 1)) < 0.5) {
      personalAlerts.push({
        type: "warn",
        cat: "D",
        title: "Emergency Cash Buffer Low",
        message: "Liquid Mutual Funds (d_liq) are under 50% of target. Recommended to build safe liquid buffer before expanding risk assets."
      });
    }

    // Category drift
    CATS.forEach(cat => {
      const diff = catSummary[cat].diff;
      if (Math.abs(diff) >= 3) {
        personalAlerts.push({
          type: diff > 0 ? "info" : "warn",
          cat,
          title: `${CAT_META[cat].label} ${diff > 0 ? "Overweight" : "Underweight"}`,
          message: `${CAT_META[cat].label} is currently ${Math.abs(diff).toFixed(1)}% ${diff > 0 ? "above" : "below"} model target.`
        });
      }
    });
  }

  const fetchLiveSheets = async () => {
    setLoading(true);
    try {
      const cR = await fetch(CALENDAR_URL + `&cb=${Date.now()}`, { cache: "no-store" });
      if (cR.ok) {
        const cT = await cR.text();
        const pC = parseCSV(cT);
        if (pC.length) setCalendar(pC);
      }
      setLastFetch(new Date());
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchLiveSheets();
  }, []);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
        <div>
          <div className="label">Live Market Intelligence</div>
          <h2 style={{ fontSize: 32, margin: "8px 0 4px" }}>
            Market <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Pulse & Signals</span> 📡
          </h2>
          <p style={{ fontSize: 13, color: "var(--text)", margin: 0 }}>
            Macro telemetry, personal portfolio drift alerts, and upcoming yield distribution calendar.
          </p>
        </div>

        <button
          onClick={fetchLiveSheets}
          disabled={loading}
          className="mono"
          style={{
            background: "transparent",
            border: "1px solid var(--border-2)",
            color: "var(--gold-pale)",
            borderRadius: 8,
            padding: "8px 14px",
            fontSize: 10,
            cursor: loading ? "wait" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <RefreshCw size={12} className={loading ? "spin" : ""} />
          <span>{loading ? "Refreshing..." : "↻ Refresh Feed"}</span>
        </button>
      </div>

      {/* Personal Signals Grid */}
      <div className="glass" style={{ borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <Activity size={16} style={{ color: "var(--gold)" }} />
          <span className="mono" style={{ fontSize: 11, color: "var(--white)", letterSpacing: "0.16em", textTransform: "uppercase" }}>
            Personal Portfolio Signals
          </span>
          <span className="mono" style={{ fontSize: 9, color: "var(--text-dim)", marginLeft: "auto" }}>
            Calculated from your active holdings
          </span>
        </div>

        <div style={{ padding: "16px 20px" }}>
          {!hasData ? (
            <div className="mono" style={{ fontSize: 11, color: "var(--text-dim)", textAlign: "center", padding: "16px 0" }}>
              Enter holdings in the <strong>Portfolio Tracker</strong> or import via Excel to view personalized rebalancing signals.
            </div>
          ) : personalAlerts.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--good)" }}>
              <span style={{ fontSize: 16 }}>✓</span>
              <span className="mono" style={{ fontSize: 11 }}>
                All asset classes are well balanced within normal threshold tolerances.
              </span>
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

      {/* Income & Distribution Calendar */}
      <div className="glass" style={{ borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Calendar size={16} style={{ color: "var(--d-color)" }} />
            <span className="mono" style={{ fontSize: 11, color: "var(--white)", letterSpacing: "0.16em", textTransform: "uppercase" }}>
              Income & Distribution Calendar
            </span>
          </div>
          <span className="mono" style={{ fontSize: 9, color: "var(--text-dim)" }}>
            Quarterly REITs, InvITs & Coupon schedules
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 110px 100px 100px 1.5fr", gap: 8, padding: "10px 18px", background: "var(--card-2)" }}>
          {["Asset / Instrument", "Event Type", "Date", "Payout Est.", "Notes"].map((h, i) => (
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
                gridTemplateColumns: "1.5fr 110px 100px 100px 1.5fr",
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
                  color: c.type === "Distribution" ? "var(--good)" : "var(--gold-pale)",
                  background: c.type === "Distribution" ? "rgba(82,168,106,0.15)" : "rgba(212,168,67,0.12)",
                  border: `1px solid ${c.type === "Distribution" ? "var(--good)" : "var(--gold-dim)"}`,
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
