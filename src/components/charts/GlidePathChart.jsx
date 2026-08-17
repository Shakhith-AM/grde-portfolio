import React, { useMemo, useState, useRef } from 'react';
import { getAllocation } from '../../utils/calculations';
import { CAT_META, CATS } from '../../constants/masterData';

export function GlidePathChart({ currentAge, onAgeChange, riskProfile = "balanced", height = 240 }) {
  const [hoverAge, setHoverAge] = useState(null);
  const containerRef = useRef(null);

  const ages = useMemo(() => {
    const list = [];
    for (let a = 18; a <= 100; a += 1) {
      const alloc = getAllocation(a, riskProfile);
      list.push({ age: a, ...alloc });
    }
    return list;
  }, [riskProfile]);

  const activeAge = hoverAge !== null ? hoverAge : currentAge;
  const activeAlloc = useMemo(() => getAllocation(activeAge, riskProfile), [activeAge, riskProfile]);

  // Width & padding coordinates
  const width = 800;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const getX = (age) => padLeft + ((age - 18) / (100 - 18)) * chartW;
  const getY = (pct) => padTop + chartH - (pct / 100) * chartH;

  // Compute stacked area paths
  const stackedData = useMemo(() => {
    return ages.map(d => {
      const y0 = 0;
      const yG = d.G;
      const yR = yG + d.R;
      const yD = yR + d.D;
      const yE = 100;
      return { age: d.age, y0, yG, yR, yD, yE };
    });
  }, [ages]);

  const buildAreaPath = (topKey, bottomKey) => {
    const forward = stackedData.map(d => `${getX(d.age)},${getY(d[topKey])}`).join(" L ");
    const backward = [...stackedData].reverse().map(d => `${getX(d.age)},${getY(d[bottomKey])}`).join(" L ");
    return `M ${forward} L ${backward} Z`;
  };

  const handlePointerMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left - (padLeft / width) * rect.width) / ((chartW / width) * rect.width);
    const age = Math.round(18 + Math.max(0, Math.min(1, xRatio)) * (100 - 18));
    setHoverAge(age);
  };

  const handlePointerClick = (e) => {
    if (!containerRef.current || !onAgeChange) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left - (padLeft / width) * rect.width) / ((chartW / width) * rect.width);
    const age = Math.round(18 + Math.max(0, Math.min(1, xRatio)) * (100 - 18));
    onAgeChange(age);
  };

  return (
    <div className="glass" style={{ borderRadius: 14, padding: "20px 22px", position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
        <div>
          <div className="label">Continuous Lifecycle Glide Path</div>
          <h3 style={{ fontSize: 18, color: "var(--white)", margin: "4px 0 0" }}>
            The Dynamic Allocation Horizon (Ages 18–100)
          </h3>
        </div>

        {/* Live Hover/Scrubbed Pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="mono" style={{
            background: "rgba(212, 168, 67, 0.12)",
            border: "1px solid var(--gold-dim)",
            borderRadius: 999,
            padding: "4px 12px",
            fontSize: 11,
            color: "var(--gold-pale)"
          }}>
            Age: <strong style={{ color: "var(--white)" }}>{activeAge}</strong> · E: <span style={{ color: CAT_META.E.hex }}>{activeAlloc.E}%</span> | D: <span style={{ color: CAT_META.D.hex }}>{activeAlloc.D}%</span> | R: <span style={{ color: CAT_META.R.hex }}>{activeAlloc.R}%</span> | G: <span style={{ color: CAT_META.G.hex }}>{activeAlloc.G}%</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div
        ref={containerRef}
        onMouseMove={handlePointerMove}
        onMouseLeave={() => setHoverAge(null)}
        onClick={handlePointerClick}
        style={{ width: "100%", cursor: "crosshair", touchAction: "none" }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <defs>
            <linearGradient id="grad-E" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CAT_META.E.hex} stopOpacity="0.8" />
              <stop offset="100%" stopColor={CAT_META.E.hex} stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="grad-D" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CAT_META.D.hex} stopOpacity="0.8" />
              <stop offset="100%" stopColor={CAT_META.D.hex} stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="grad-R" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CAT_META.R.hex} stopOpacity="0.8" />
              <stop offset="100%" stopColor={CAT_META.R.hex} stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="grad-G" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CAT_META.G.hex} stopOpacity="0.85" />
              <stop offset="100%" stopColor={CAT_META.G.hex} stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(pct => (
            <g key={pct}>
              <line
                x1={padLeft}
                y1={getY(pct)}
                x2={padLeft + chartW}
                y2={getY(pct)}
                stroke="var(--border)"
                strokeDasharray={pct === 0 || pct === 100 ? "none" : "3,3"}
                strokeWidth={1}
              />
              <text
                x={padLeft - 8}
                y={getY(pct) + 3}
                fill="var(--text-dim)"
                fontSize="9"
                fontFamily="JetBrains Mono"
                textAnchor="end"
              >
                {pct}%
              </text>
            </g>
          ))}

          {/* Age axis labels */}
          {[18, 30, 40, 50, 60, 70, 80, 90, 100].map(a => (
            <text
              key={a}
              x={getX(a)}
              y={height - 10}
              fill="var(--text-dim)"
              fontSize="9"
              fontFamily="JetBrains Mono"
              textAnchor="middle"
            >
              {a}
            </text>
          ))}

          {/* Stacked Areas: Top to Bottom = E -> D -> R -> G */}
          <path d={buildAreaPath('yE', 'yD')} fill="url(#grad-E)" />
          <path d={buildAreaPath('yD', 'yR')} fill="url(#grad-D)" />
          <path d={buildAreaPath('yR', 'yG')} fill="url(#grad-R)" />
          <path d={buildAreaPath('yG', 'y0')} fill="url(#grad-G)" />

          {/* Boundary stroke lines */}
          <path d={stackedData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.age)} ${getY(d.yD)}`).join(" ")} fill="none" stroke="#0a1628" strokeWidth="1.5" />
          <path d={stackedData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.age)} ${getY(d.yR)}`).join(" ")} fill="none" stroke="#0a1628" strokeWidth="1.5" />
          <path d={stackedData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.age)} ${getY(d.yG)}`).join(" ")} fill="none" stroke="#0a1628" strokeWidth="1.5" />

          {/* Active Age vertical line */}
          <line
            x1={getX(activeAge)}
            y1={padTop}
            x2={getX(activeAge)}
            y2={padTop + chartH}
            stroke="var(--white)"
            strokeWidth="2"
            strokeDasharray="4,3"
          />
          <circle
            cx={getX(activeAge)}
            cy={padTop}
            r="4"
            fill="var(--gold)"
            stroke="var(--white)"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <div className="mono" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 9,
        color: "var(--text-dim)",
        marginTop: 6,
        letterSpacing: "0.06em"
      }}>
        <span>💡 Click or drag along the chart to simulate any age milestone</span>
        <div style={{ display: "flex", gap: 12 }}>
          {CATS.map(cat => (
            <span key={cat} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: CAT_META[cat].hex }} />
              <span style={{ color: "var(--white)" }}>{cat}: {CAT_META[cat].label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
