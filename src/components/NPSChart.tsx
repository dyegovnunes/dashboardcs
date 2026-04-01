import { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import { loadNpsData, calcNPS, getCycles, iesDisplayMap, iesColors, validIESNames, type NPSRecord } from "@/data/npsData";

interface NPSChartProps {
  onClick?: () => void;
}

const NPSChart = ({ onClick }: NPSChartProps) => {
  const [records, setRecords] = useState<NPSRecord[]>([]);

  useEffect(() => {
    loadNpsData().then(setRecords);
  }, []);

  const npsData = useMemo(() => {
    const cycles = getCycles(records);
    return cycles.map((cycle) => {
      const [ano, ciclo] = cycle.split(".").map(Number);
      const row: Record<string, string | number | null> = { cycle };
      for (const ies of validIESNames) {
        const filtered = records.filter((r) => r.ano === ano && r.ciclo === ciclo && r.nome_ies === ies);
        row[ies] = filtered.length > 0 ? calcNPS(filtered) : null;
      }
      return row;
    });
  }, [records]);

  return (
    <div
      className={`rounded-lg border border-border bg-card p-5 ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-card-foreground">NPS</h3>
        {onClick && <span className="text-[10px] text-muted-foreground">Clique para detalhes →</span>}
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={npsData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
          <XAxis dataKey="cycle" tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
          <YAxis domain={[-20, 100]} tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 13%, 91%)", borderRadius: "8px", fontSize: "11px" }} />
          <Legend wrapperStyle={{ fontSize: "10px" }} formatter={(value: string) => iesDisplayMap[value] || value} />
          <ReferenceLine y={60} stroke="hsl(0, 72%, 51%)" strokeDasharray="6 3" strokeWidth={2} label={{ value: "Meta: 60", position: "right", fontSize: 10, fill: "hsl(0, 72%, 51%)" }} />
          {validIESNames.map((ies) => (
            <Line
              key={ies}
              type="monotone"
              dataKey={ies}
              stroke={iesColors[ies]}
              strokeWidth={1.5}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
              name={ies}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NPSChart;
