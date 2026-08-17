import React, { useState, useMemo, useEffect } from 'react';
import { calculateFireTrajectory } from '../../utils/calculations';
import { formatCurrency } from '../../constants/currencies';
import confetti from 'canvas-confetti';
import { Sparkles, TrendingUp, RotateCcw } from 'lucide-react';

export function WealthProjector({ netWorth = 0, currency = "INR", age = 50 }) {
  const [savedGoals] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("grde_fire_goals_v1") || "{}");
    } catch (e) {
      return {};
    }
  });

  const [targetCorpus, setTargetCorpus] = useState(() => savedGoals.targetCorpus || 35000000);
  const [monthlySip, setMonthlySip] = useState(() => savedGoals.monthlySip || 65000);
  const [assumedRate, setAssumedRate] = useState(() => savedGoals.assumedRate || 11);
  const [stepUp, setStepUp] = useState(() => (savedGoals.stepUp !== undefined ? savedGoals.stepUp : 5));
  const [horizonYears, setHorizonYears] = useState(30);

  // Age inheritance from Portfolio Tracker with optional override toggle
  const [isOverrideAge, setIsOverrideAge] = useState(() => savedGoals.isOverrideAge || false);
  const [currentAge, setCurrentAge] = useState(() => {
    if (savedGoals.isOverrideAge && savedGoals.currentAge) {
      return savedGoals.currentAge;
    }
    return age || 50;
  });

  // Automatically inherit and sync Portfolio Tracker age whenever it changes (unless user explicitly toggles override)
  useEffect(() => {
    if (!isOverrideAge && age) {
      setCurrentAge(age);
    }
  }, [age, isOverrideAge]);

  // Auto-save goals to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("grde_fire_goals_v1", JSON.stringify({
        targetCorpus,
        monthlySip,
        assumedRate,
        currentAge,
        stepUp,
        isOverrideAge
      }));
    } catch (e) {}
  }, [targetCorpus, monthlySip, assumedRate, currentAge, stepUp, isOverrideAge]);

  const trajectory = useMemo(() => {
    return calculateFireTrajectory({
      currentNetWorth: netWorth,
      monthlySip: Number(monthlySip) || 0,
      annualGrowthRate: assumedRate,
      targetCorpus: Number(targetCorpus) || 0,
      currentAge: Number(currentAge) || (age || 50),
      yearsToProject: horizonYears,
      stepUpPct: stepUp
    });
  }, [netWorth, monthlySip, assumedRate, targetCorpus, currentAge, age, horizonYears, stepUp]);

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

        {/* Milestone Badge with Visible Regulatory Assumptions */}
        {trajectory.reachedAge ? (
          <div style={{
            background: "rgba(82,168,106,0.12)",
            border: "1px solid var(--good)",
            borderRadius: 999,
            padding: "5px 14px",
            display: "inline-flex",
            alignItems: "center",
            gap: 6
          }}>
            <Sparkles size={13} style={{ color: "var(--good)" }} />
            <span className="mono" style={{ fontSize: 10, color: "var(--good)", fontWeight: 600 }}>
              Projected target age: Age {trajectory.reachedAge} (~{trajectory.reachedAge - currentAge} yrs) · Based on current assumptions
            </span>
          </div>
        ) : target > 0 && netWorth >= target ? (
          <div style={{
            background: "rgba(82,168,106,0.12)",
            border: "1px solid var(--good)",
            borderRadius: 999,
            padding: "5px 14px",
            display: "inline-flex",
            alignItems: "center",
            gap: 6
          }}>
            <Sparkles size={13} style={{ color: "var(--good)" }} />
            <span className="mono" style={{ fontSize: 10, color: "var(--good)", fontWeight: 600 }}>
              Target corpus already achieved at current net worth
            </span>
          </div>
        ) : null}
      </div>

      <div style={{ padding: "20px 22px" }}>
        {/* Controls grid */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
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

          <div style={{ flex: "0 0 140px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label className="mono" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.14em" }}>
                Current Age
              </label>
              {!isOverrideAge && (
                <span className="mono" style={{ fontSize: 8, color: "var(--good)", letterSpacing: "0.06em" }}>
                  SYNCED
                </span>
              )}
            </div>
            <input
              type="number"
              min={18}
              max={90}
              value={currentAge}
              disabled={!isOverrideAge}
              onChange={(e) => setCurrentAge(Number(e.target.value))}
              style={{
                width: "100%",
                background: isOverrideAge ? "var(--bg)" : "rgba(15, 22, 32, 0.8)",
                border: `1px solid ${isOverrideAge ? "var(--gold-dim)" : "var(--border-2)"}`,
                borderRadius: 8,
                padding: "9px 12px",
                color: isOverrideAge ? "var(--gold-pale)" : "var(--white)",
                fontFamily: "Oxygen, Questrial, sans-serif",
                fontSize: 13,
                outline: "none",
                cursor: isOverrideAge ? "text" : "default"
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

        {/* Age Sync & Override Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={isOverrideAge}
              onChange={(e) => {
                const checked = e.target.checked;
                setIsOverrideAge(checked);
                if (!checked && age) {
                  setCurrentAge(age);
                }
              }}
              style={{ accentColor: "var(--gold)" }}
            />
            <span className="mono" style={{ fontSize: 9.5, color: isOverrideAge ? "var(--gold-pale)" : "var(--text-dim)" }}>
              Override simulation age (test hypothetical scenario)
            </span>
          </label>
          {isOverrideAge && (
            <button
              onClick={() => {
                setIsOverrideAge(false);
                if (age) setCurrentAge(age);
              }}
              className="mono"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--gold)",
                fontSize: 9,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                marginLeft: 8,
                textDecoration: "underline"
              }}
            >
              <RotateCcw size={10} />
              <span>Reset to portfolio age ({age})</span>
            </button>
          )}
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

        {/* Growth Rate Slider with Regulatory Caption */}
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)", display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span className="mono" style={{ fontSize: 9, color: "var(--text-dim)", textTransform: "uppercase" }}>
                Assumed Portfolio CAGR: <strong style={{ color: "var(--gold)" }}>{assumedRate}%</strong>
              </span>
              <span className="mono" style={{ fontSize: 9, color: "var(--text-dim)" }}>Conservative (6%) → Aggressive (15%)</span>
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
            {/* Explicit Regulatory Positioning Caption */}
            <div className="mono" style={{ fontSize: 9.5, color: "var(--text-dim)", marginTop: 6, fontStyle: "italic", letterSpacing: "0.02em" }}>
              Illustrative projection — not a return forecast. Based on user-selected growth assumption.
            </div>
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
