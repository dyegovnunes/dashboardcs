/**
 * ChurnTable — dados reais importados de src/data/churnData.ts
 * REGRA: nunca hardcodar valores de churn aqui.
 * Fonte única: CHURN_MENSAL e CHURN_ACUM.
 */
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CHURN_MENSAL, CHURN_ACUM } from "@/data/churnData";

const ChurnTable = () => {
  const [view, setView] = useState<"mensal" | "acumulado">("mensal");
  const data = view === "mensal" ? CHURN_MENSAL : CHURN_ACUM;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* Churn Table */}
      <div className="lg:col-span-3 rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-card-foreground">
            CHURN {view === "mensal" ? "MENSAL (Mar/26)" : "ACUMULADO (Jan→Mar/26)"}
          </h3>
          <div className="flex bg-muted rounded-md p-0.5">
            <button
              onClick={() => setView("mensal")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded transition-all",
                view === "mensal"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              MENSAL
            </button>
            <button
              onClick={() => setView("acumulado")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded transition-all",
                view === "acumulado"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              ACUMULADO
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">IES</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">CHURN</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">META</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">DESVIO</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">YoY</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.ies} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 text-xs font-semibold text-card-foreground">{row.ies}</td>
                  <td className="px-4 py-2.5 text-center font-mono text-xs text-card-foreground">{row.churn}%</td>
                  <td className="px-4 py-2.5 text-center font-mono text-xs text-muted-foreground">{row.meta}%</td>
                  <td className={cn(
                    "px-4 py-2.5 text-center font-mono text-xs font-semibold",
                    row.desvio > 0 ? "text-destructive" : "text-success"
                  )}>
                    {row.desvio > 0 ? "+" : ""}{row.desvio.toFixed(1)}%
                  </td>
                  <td className={cn(
                    "px-4 py-2.5 text-center font-mono text-xs font-semibold",
                    row.yoy > 0 ? "text-destructive" : "text-success"
                  )}>
                    {row.yoy > 0 ? "+" : ""}{row.yoy.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Base Ativa Bar Chart */}
      <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-card-foreground mb-4">BASE ATIVA vs META</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={data.map(r => ({
              ies: r.ies.replace("PÓS ARTMED", "ARTMED"),
              baseAtiva: r.baseAtivaReal,
              metaBase: r.baseAtivaMeta,
            }))}
            layout="vertical"
            barGap={2}
            barSize={14}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
            <YAxis
              dataKey="ies"
              type="category"
              tick={{ fontSize: 10, fill: "hsl(220, 9%, 46%)" }}
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(220, 13%, 91%)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            <Bar dataKey="metaBase" fill="hsl(220, 13%, 85%)" radius={[0, 4, 4, 0]} name="Meta" />
            <Bar dataKey="baseAtiva" fill="hsl(152, 60%, 40%)" radius={[0, 4, 4, 0]} name="Realizado" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChurnTable;
