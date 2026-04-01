import { useMemo } from "react";

interface NPSGaugeProps {
  value: number; // -100 to 100
}

const NPSGauge = ({ value }: NPSGaugeProps) => {
  const clampedValue = Math.max(-100, Math.min(100, value));

  // Angle: -100 = -180deg (left), 100 = 0deg (right), so 0 is top center
  const angle = useMemo(() => {
    // Map -100..100 to -90..90 degrees (using a semicircle from 180 to 0)
    return 180 - ((clampedValue + 100) / 200) * 180;
  }, [clampedValue]);

  // Meta line at 60
  const metaAngle = 180 - ((60 + 100) / 200) * 180;

  const needleLength = 72;
  const cx = 100;
  const cy = 95;

  const needleX = cx + needleLength * Math.cos((Math.PI * angle) / 180);
  const needleY = cy - needleLength * Math.sin((Math.PI * angle) / 180);

  const metaX1 = cx + 58 * Math.cos((Math.PI * metaAngle) / 180);
  const metaY1 = cy - 58 * Math.sin((Math.PI * metaAngle) / 180);
  const metaX2 = cx + 82 * Math.cos((Math.PI * metaAngle) / 180);
  const metaY2 = cy - 82 * Math.sin((Math.PI * metaAngle) / 180);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 115" width="220" height="130">
        {/* Background arcs: Detrator (red), Neutro (yellow), Promotor (green) */}
        {/* Detrator: -100 to 0 => 180deg to 90deg */}
        <path
          d="M 18 95 A 82 82 0 0 1 100 13"
          fill="none"
          stroke="hsl(0, 72%, 51%)"
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.25"
        />
        {/* Neutro: 0 to 50 => 90deg to 45deg */}
        <path
          d="M 100 13 A 82 82 0 0 1 157.9 36.9"
          fill="none"
          stroke="hsl(38, 92%, 50%)"
          strokeWidth="14"
          opacity="0.25"
        />
        {/* Promotor: 50 to 100 => 45deg to 0deg */}
        <path
          d="M 157.9 36.9 A 82 82 0 0 1 182 95"
          fill="none"
          stroke="hsl(152, 60%, 40%)"
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.25"
        />

        {/* Scale labels */}
        <text x="14" y="108" fontSize="9" fill="hsl(220, 9%, 46%)" textAnchor="middle">-100</text>
        <text x="42" y="40" fontSize="9" fill="hsl(220, 9%, 46%)" textAnchor="middle">-50</text>
        <text x="100" y="16" fontSize="9" fill="hsl(220, 9%, 46%)" textAnchor="middle">0</text>
        <text x="158" y="40" fontSize="9" fill="hsl(220, 9%, 46%)" textAnchor="middle">50</text>
        <text x="186" y="108" fontSize="9" fill="hsl(220, 9%, 46%)" textAnchor="middle">100</text>

        {/* Meta marker at 60 */}
        <line
          x1={metaX1} y1={metaY1} x2={metaX2} y2={metaY2}
          stroke="hsl(0, 72%, 51%)"
          strokeWidth="2"
          strokeDasharray="3 2"
        />
        <text
          x={metaX2 + 4 * Math.cos((Math.PI * metaAngle) / 180)}
          y={metaY2 - 4 * Math.sin((Math.PI * metaAngle) / 180)}
          fontSize="7"
          fill="hsl(0, 72%, 51%)"
          textAnchor="middle"
        >
          Meta
        </text>

        {/* Needle */}
        <line
          x1={cx} y1={cy} x2={needleX} y2={needleY}
          stroke="hsl(222, 47%, 11%)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="5" fill="hsl(222, 47%, 11%)" />
        <circle cx={cx} cy={cy} r="2.5" fill="hsl(0, 0%, 100%)" />
      </svg>
      <div className="text-center -mt-2">
        <span className="text-2xl font-bold text-foreground">{clampedValue.toFixed(1)}</span>
        <span className="block text-[10px] text-muted-foreground font-medium">NPS Global</span>
      </div>
    </div>
  );
};

export default NPSGauge;
