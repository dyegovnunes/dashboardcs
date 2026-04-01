import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from "recharts";
import { useMemo } from "react";

/* ── Public API ── */

export interface WaterfallItem {
  /** Label shown on the X axis */
  label: string;
  /** Numeric value. For totals use the absolute value; for deltas use signed (+/-) */
  value: number;
  /** Mark as "total" so the bar starts at 0 instead of stacking */
  isTotal?: boolean;
  /** Optional colour override (HSL string). Falls back to green/red/grey */
  color?: string;
}

interface WaterfallChartProps {
  data: WaterfallItem[];
  title?: string;
  height?: number;
}

/* ── Internal bar shape ── */

interface ComputedBar {
  label: string;
  value: number;
  offset: number;
  fill: string;
  displayValue: string;
}

const DEFAULT_POSITIVE = "hsl(152, 60%, 40%)";
const DEFAULT_NEGATIVE = "hsl(0, 72%, 51%)";
const DEFAULT_TOTAL    = "hsl(220, 13%, 66%)";

function computeBars(items: WaterfallItem[]): ComputedBar[] {
  let running = 0;
  return items.map((item) => {
    if (item.isTotal) {
      const bar: ComputedBar = {
        label: item.label,
        value: item.value,
        offset: 0,
        fill: item.color ?? DEFAULT_TOTAL,
        displayValue: item.value.toLocaleString("pt-BR"),
      };
      running = item.value;
      return bar;
    }

    const prev = running;
    running += item.value;

    const absVal = Math.abs(item.value);
    const offset = item.value >= 0 ? prev : prev + item.value; // negative drops down

    return {
      label: item.label,
      value: absVal,
      offset: Math.max(offset, 0),
      fill: item.color ?? (item.value >= 0 ? DEFAULT_POSITIVE : DEFAULT_NEGATIVE),
      displayValue:
        item.value >= 0
          ? `+${absVal.toLocaleString("pt-BR")}`
          : `-${absVal.toLocaleString("pt-BR")}`,
    };
  });
}

/* ── Custom label ── */

const renderLabel = (props: any) => {
  const { x, y, width, value } = props;
  if (!value) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      textAnchor="middle"
      fontSize={11}
      fontWeight={600}
      fill="hsl(220, 9%, 46%)"
    >
      {value}
    </text>
  );
};

/* ── Component ── */

const WaterfallChart = ({ data, title, height = 200 }: WaterfallChartProps) => {
  const bars = useMemo(() => computeBars(data), [data]);

  return (
    <div>
      {title && (
        <h3 className="text-sm font-semibold text-card-foreground mb-3">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={bars} margin={{ top: 25, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "hsl(220, 9%, 46%)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "hsl(220, 9%, 46%)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => v.toLocaleString("pt-BR")}
            width={50}
          />
          <Tooltip
            cursor={false}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const entry = payload[0]?.payload as ComputedBar;
              if (!entry) return null;
              return (
                <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
                  <p className="text-xs font-semibold text-popover-foreground">{entry.label}</p>
                  <p className="text-sm font-bold" style={{ color: entry.fill }}>
                    {entry.displayValue}
                  </p>
                </div>
              );
            }}
          />
          {/* Invisible offset bar */}
          <Bar dataKey="offset" stackId="w" fill="transparent" radius={0} isAnimationActive={false} />
          {/* Visible value bar */}
          <Bar dataKey="value" stackId="w" radius={[4, 4, 0, 0]}>
            {bars.map((b, i) => (
              <Cell key={i} fill={b.fill} />
            ))}
            <LabelList dataKey="displayValue" position="top" content={renderLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WaterfallChart;
