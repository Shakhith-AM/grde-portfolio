import React, { useState } from 'react';
import { CAT_META, CATS } from '../../constants/masterData';
import { formatCurrency } from '../../constants/currencies';

export function AllocationDonut({ data, size = 200, currency = "INR", totalValue = null, centerLabel = "ALLOCATION" }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.44;
  const innerR = size * 0.28;

  let cumulativeAngle = -90;

  const slices = data.map((item, idx) => {
    const angle = (item.pct / 100) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const xi1 = cx + innerR * Math.cos(endRad);
    const yi1 = cy + innerR * Math.sin(endRad);
    const xi2 = cx + innerR * Math.cos(startRad);
    const yi2 = cy + innerR * Math.sin(startRad);

    const largeArcFlag = item.pct > 50 ? 1 : 0;

    const pathData = `
      M ${x1} ${y1}
      A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}
      L ${xi1} ${yi1}
      A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${xi2} ${yi2}
      Z
    `;

    return {
      ...item,
      pathData,
      idx
    };
  });

  const activeSlice = hoveredIdx !== null ? slices[hoveredIdx] : null;

  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: "visible" }}
      >
        {slices.map((slice) => {
          const isHovered = hoveredIdx === slice.idx;
          return (
            <path
              key={slice.idx}
              d={slice.pathData}
              fill={slice.color}
              stroke="#0a1628"
              strokeWidth={2}
              style={{
                cursor: "pointer",
                transition: "transform 0.2s ease, opacity 0.2s ease",
                transformOrigin: `${cx}px ${cy}px`,
                transform: isHovered ? "scale(1.05)" : "scale(1)",
                opacity: hoveredIdx !== null && !isHovered ? 0.6 : 1,
                filter: isHovered ? `drop-shadow(0 0 10px ${slice.color}88)` : "none"
              }}
              onMouseEnter={() => setHoveredIdx(slice.idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          );
        })}
      </svg>

      {/* Center Readout */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        pointerEvents: "none",
        width: innerR * 1.8
      }}>
        {activeSlice ? (
          <>
            <div style={{
              fontFamily: "Cinzel",
              fontSize: 16,
              fontWeight: 700,
              color: activeSlice.color,
              lineHeight: 1
            }}>
              {activeSlice.cat || activeSlice.label}
            </div>
            <div style={{
              fontFamily: "Cinzel",
              fontSize: 18,
              fontWeight: 600,
              color: "var(--white)",
              marginTop: 3
            }}>
              {activeSlice.pct.toFixed(1)}%
            </div>
            {activeSlice.val !== undefined && (
              <div className="num" style={{ fontSize: 9, color: "var(--text-dim)", marginTop: 2 }}>
                {formatCurrency(activeSlice.val, currency, true)}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mono" style={{
              fontSize: 8,
              color: "var(--text-dim)",
              letterSpacing: "0.14em",
              textTransform: "uppercase"
            }}>
              {centerLabel}
            </div>
            <div style={{
              fontFamily: "Cinzel",
              fontSize: totalValue ? 15 : 17,
              fontWeight: 600,
              color: "var(--gold-pale)",
              marginTop: 2
            }}>
              {totalValue ? formatCurrency(totalValue, currency, true) : "100%"}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
