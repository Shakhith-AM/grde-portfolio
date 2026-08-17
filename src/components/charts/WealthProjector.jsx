import React, { useState, useMemo, useEffect } from 'react';
import { calculateFireTrajectory } from '../../utils/calculations';
import { formatCurrency } from '../../constants/currencies';
import confetti from 'canvas-confetti';
import { Sparkles, TrendingUp } from 'lucide-react';

export function WealthProjector({ netWorth = 0, currency = "INR", age = 35 }) {
  const [targetCorpus, setTargetCorpus] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("grde_fire_goals_v1") || "{}");
      return saved.targetCorpus || 50000000;
    } catch (e) {
      return 50000000;
    }
  });

  const [monthlySip, setMonthlySip] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("grde_fire_goals_v1") || "{}");
      return saved.monthlySip || 50000;
    } catch (e) {
      return 50000;
    }
  });

  const [assumedRate, setAssumedRate] = useState(11);
  const [stepUp, setStepUp] = useState(5); // 5% annual step-up
  const [currentAge, setCurrentAge] = useState(age || 35);
  const [horizonYears, setHorizonYears] = useState(25);

  useEffect(() => {
    try {
      localStorage.setItem("grde_fire_goals_v1", JSON.stringify({
        targetCorpus,
        monthlySip,
        assumedRate,
        currentAge,
        stepUp
      }));
    } catch (e) {}
  }, [targetCorpus, monthlySip, assumedRate, currentAge, stepUp]);

  const trajectory = useMemo(() => {
    return calculateFireTrajectory({
      currentNetWorth: netWorth,
      monthlySip: Number(monthlySip) || 0,
      annualGrowthRate: assumedRate,
      targetCorpus: Number(targetCorpus) || 0,
      currentAge: Number(currentAge) || 35,
      yearsToProject: horizonYears,
      stepUpPct: stepUp
    });
  }, [netWorth, monthlySip, assumedRate, targetCorpus, currentAge, horizonYears, stepUp]);

  const target = Number(targetCorpus) || 0;
  const progress = target > 0 ? Math.min(100, (netWorth / target) * 100) : 0;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#d4a843', '#52a86a', '#4a7fb8', '#f4f0e8']
    });
  };

  // SVG dimensions
  const width = 760;
  const height = 220;
  const padLeft = 50;
  const padRight = 30;
  const padTop = 20;
  const padBottom = 30;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const maxVal = Math.max(target * 1.15, trajectory.finalCorpus * 1.05, 1000000);

  const getX = (yr) => padLeft + (yr / horizonYears) * chartW;
  const getY = (val) => padTop + chartH - (val / maxVal) * chartH;

  const areaPath = useMemo(() => {
    if (!trajectory.points.length) return "";
    const forward = trajectory.points.map(p => `${getX(p.year)},${getY(p.balance)}`).join(" L ");
    return `M ${getX(0)},${getY(0)} L ${forward} L ${getX(horizonYears)},${getY(0)} Z`;
  }, [trajectory, maxVal]);

  const linePath = useMemo(() => {
    if (!trajectory.points.length) return "";
    return trajectory.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.year)} ${getY(p.balance)}`).join(" ");
  }, [trajectory, maxVal]);

  return (
    <div className="glass" style={{ borderRadius: 14, overflow: "hidden", marginTop: 20 }}>
      <div style={{
        padding: "16px 22px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 10
      }}>
        <div>
          <span className="mono" style={{ fontSize: 11, color: "var(--white)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
            FIRE & Wealth Compounding Simulator
          </span>
          <span className="mono" style={{ fontSize: 9, color: "var(--text-dim)", marginLeft: 12 }}>
            Interactive projection with annual step-up
          </span>
        </div>

        {trajectory.reachedAge && (
          <div style={{
            background: "rgba(82,168,106,0.12)",
            border: "1px solid var(--good)",
            borderRadius: 999,
            padding: "4px 14px",
            display: "inline-flex",
            alignItems: "center",
            gap: 6
          }}>
            <Sparkles size={13} style={{ color: "var(--good)" }} />
            <span className="mono" style={{ fontSize: 10, color: "var(--good)", fontWeight: 600 }}>
              Financial Freedom: Age {trajectory.reachedAge} (~{trajectory.reachedAge - currentAge} yrs)
            </span>
          </div>
        )}
      </div>

      <div style={{ padding: "20px 22px" }}>
        {/* Controls grid */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
          <div style={{ flex: "1 1 180px" }}>
            <label className="mono" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.14em", display: "block", marginBottom: 6 }}>
              Target Corpus ({currency})
            </label>
            <input
              type="number"
              value={targetCorpus}
              onChange={(e) => setTargetCorpus(e.target.value)}
              style={{
                width: "100%",
                background: "var(--bg)",
                border: "1px solid var(--border-2)",
                borderRadius: 8,
                padding: "9px 12px",
                color: "var(--white)",
                fontFamily: "Oxygen, Questrial, sans-serif",
                fontSize: 13,
                outline: "none"
              }}
            />
          </div>

          <div style={{ flex: "1 1 160px" }}>
            <label className="mono" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.14em", display: "block", marginBottom: 6 }}>
              Monthly SIP ({currency})
            </label>
            <input
              type="number"
              value={monthlySip}
              onChange={(e) => setMonthlySip(e.target.value)}
              style={{
                width: "100%",
                background: "var(--bg)",
                border: "1px solid var(--border-2)",
                borderRadius: 8,
                padding: "9px 12px",
                color: "var(--white)",
                fontFamily: "Oxygen, Questrial, sans-serif",
                fontSize: 13,
                outline: "none"
              }}
            />
          </div>

          <div style={{ flex: "0 0 110px" }}>
            <label className="mono" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.14em", display: "block", marginBottom: 6 }}>
              Current Age
            </label>
            <input
              type="number"
              min={18}
              max={90}
              value={currentAge}
              onChange={(e) => setCurrentAge(Number(e.target.value))}
              style={{
                width: "100%",
                background: "var(--bg)",
                border: "1px solid var(--border-2)",
                borderRadius: 8,
                padding: "9px 12px",
                color: "var(--white)",
                fontFamily: "Oxygen, Questrial, sans-serif",
                fontSize: 13,
                outline: "none"
              }}
            />
          </div>

          <div style={{ flex: "0 0 130px" }}>
            <label className="mono" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.14em", display: "block", marginBottom: 6 }}>
              Annual Step-Up %
            </label>
            <select
              value={stepUp}
              onChange={(e) => setStepUp(Number(e.target.value))}
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
            >
              <option value={0}>0% (Flat SIP)</option>
              <option value={5}>5% Step-Up</option>
              <option value={10}>10% Step-Up</option>
              <option value={15}>15% Step-Up</option>
            </select>
          </div>
        </div>

        {/* Progress bar to target */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span className="mono" style={{ fontSize: 10, color: "var(--text-dim)" }}>
              Current Net Worth: <strong style={{ color: "var(--white)" }}>{formatCurrency(netWorth, currency, false)}</strong>
            </span>
            <span className="mono" style={{ fontSize: 10, color: "var(--gold)" }}>
              Target: <strong style={{ color: "var(--gold-pale)" }}>{formatCurrency(target, currency, false)}</strong> ({progress.toFixed(1)}%)
            </span>
          </div>

          <div style={{ width: "100%", height: 10, background: "var(--bg)", border: "1px solid var(--border-2)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{
              width: `${progress}%`,
              height: "100%",
              borderRadius: 999,
              background: "linear-gradient(90deg, var(--gold), var(--good))",
              transition: "width 0.4s ease"
            }} />
          </div>
        </div>

        {/* SVG Compounding Chart */}
        <div style={{ width: "100%", overflowX: "auto" }}>
          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", display: "block" }}>
            <defs>
              <linearGradient id="fireGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4a843" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#d4a843" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Target line */}
            {target > 0 && (
              <g>
                <line
                  x1={padLeft}
                  y1={getY(target)}
                  x2={padLeft + chartW}
                  y2={getY(target)}
                  stroke="var(--gold-pale)"
                  strokeDasharray="4,4"
                  strokeWidth={1.5}
                />
                <text
                  x={padLeft + chartW}
                  y={getY(target) - 5}
                  fill="var(--gold)"
                  fontSize="9"
                  fontFamily="JetBrains Mono"
                  textAnchor="end"
                >
                  TARGET: {formatCurrency(target, currency, true)}
                </text>
              </g>
            )}

            {/* Growth Area & Line */}
            <path d={areaPath} fill="url(#fireGrad)" />
            <path d={linePath} fill="none" stroke="var(--gold)" strokeWidth={2.5} />

            {/* Year markers & axes */}
            {trajectory.points.filter((_, i) => i % 5 === 0 || i === horizonYears).map(p => (
              <g key={p.year}>
                <line
                  x1={getX(p.year)}
                  y1={padTop}
                  x2={getX(p.year)}
                  y2={padTop + chartH}
                  stroke="var(--border)"
                  strokeDasharray="2,2"
                  strokeWidth={0.7}
                />
                <text
                  x={getX(p.year)}
                  y={height - 8}
                  fill="var(--text-dim)"
                  fontSize="9"
                  fontFamily="JetBrains Mono"
                  textAnchor="middle"
                >
                  Age {p.age} (+{p.year}y)
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Growth Rate Slider */}
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span className="mono" style={{ fontSize: 9, color: "var(--text-dim)", textTransform: "uppercase" }}>
                Assumed Portfolio CAGR: <strong style={{ color: "var(--gold)" }}>{assumedRate}%</strong>
              </span>
              <span className="mono" style={{ fontSize: 9, color: "var(--text-dim)" }}>Conservative (7%) → Aggressive (14%)</span>
            </div>
            <input
              type="range"
              min={6}
              max={15}
              step={0.5}
              value={assumedRate}
              onChange={(e) => setAssumedRate(Number(e.target.value))}
              style={{ width: "100%", cursor: "pointer" }}
            />
          </div>

          <button
            onClick={triggerConfetti}
            className="mono"
            style={{
              background: "transparent",
              border: "1px solid var(--gold-dim)",
              color: "var(--gold-pale)",
              borderRadius: 8,
              padding: "7px 14px",
              fontSize: 10,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <Sparkles size={12} />
            <span>Celebrate Milestone</span>
          </button>
        </div>
      </div>
    </div>
  );
}
