import React from 'react';

export function StabilityGauge({ value = 50, size = 260, targetValue = 50 }) {
  const cx = size / 2;
  const cy = size * 0.6;
  const r = size * 0.42;

  // Arc segments from 180° (left) to 0° (right)
  const segments = [
    { start: 180, end: 144, color: "#d6604d", label: "Aggressive / Volatile" },
    { start: 144, end: 108, color: "#d4a04b", label: "Growth Tilted" },
    { start: 108, end: 72,  color: "#d4a843", label: "Balanced Range" },
    { start: 72,  end: 36,  color: "#7fa86b", label: "Strong Defense" },
    { start: 36,  end: 0,   color: "#52a86a", label: "Ultra Defensive" },
  ];

  const clampedVal = Math.max(0, Math.min(100, Number(value) || 0));
  const needleAngle = 180 - (clampedVal / 100) * 180;
  const needleRad = (needleAngle * Math.PI) / 180;
  const nx = cx + (r - 16) * Math.cos(needleRad);
  const ny = cy - (r - 16) * Math.sin(needleRad);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
      <svg
        role="img"
        aria-label={`Portfolio stability gauge: ${clampedVal.toFixed(1)}%`}
        width={size}
        height={size * 0.68}
        viewBox={`0 0 ${size} ${size * 0.68}`}
      >
        {segments.map((seg, i) => {
          const a1 = ((180 - seg.start) * Math.PI) / 180;
          const a2 = ((180 - seg.end) * Math.PI) / 180;
          const x1 = cx + r * Math.cos(a1);
          const y1 = cy - r * Math.sin(a1);
          const x2 = cx + r * Math.cos(a2);
          const y2 = cy - r * Math.sin(a2);

          return (
            <path
              key={i}
              d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
              fill="none"
              stroke={seg.color}
              strokeWidth={13}
              strokeLinecap="round"
            />
          );
        })}

        {/* Target indicator tick */}
        {targetValue !== null && (
          <line
            x1={cx + (r - 20) * Math.cos(((180 - (targetValue / 100) * 180) * Math.PI) / 180)}
            y1={cy - (r - 20) * Math.sin(((180 - (targetValue / 100) * 180) * Math.PI) / 180)}
            x2={cx + (r + 4) * Math.cos(((180 - (targetValue / 100) * 180) * Math.PI) / 180)}
            y2={cy - (r + 4) * Math.sin(((180 - (targetValue / 100) * 180) * Math.PI) / 180)}
            stroke="var(--white)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        )}

        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          stroke="var(--gold-pale)"
          strokeWidth={3}
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 6px rgba(212,168,67,0.5))" }}
        />
        <circle cx={cx} cy={cy} r={7} fill="var(--gold)" stroke="var(--white)" strokeWidth={1.5} />
      </svg>
    </div>
  );
}
