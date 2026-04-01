import { cn } from "@/lib/utils";
import {
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from "recharts";
import { DailyRow } from "@/hooks/useAtendimentoData";
import { useState } from "react";

interface ChartDataPoint {
  periodo: string;
  iab: number;
  nivelServico: number;
  resolucao: number;
  satisfacao: number;
  volumetria: number;
}

interface AtendimentoChartProps {
  selectedMonth?: string;
  data?: ChartDataPoint[];
  isLoading?: boolean;
  period?: "diario" | "mensal";
  onPeriodChange?: (p: "diario" | "mensal") => void;
  dailyData?: DailyRow[];
  isDailyLoading?: boolean;
}

const AtendimentoChart = ({
  data,
  isLoading,
  period = "mensal",
  onPeriodChange,
  dailyData,
  isDailyLoading,
}: AtendimentoChartProps) => {
  const [showResolucao, setShowResolucao] = useState(false);
  const [showSatisfacao, setShowSatisfacao] = useState(false);
  const [showVolumetria, setShowVolumetria] = useState(false);

  const isDaily = period === "diario";

  // Build chart data for daily mode
  const dailyChartData = (dailyData ?? []).map((r) => ({
    periodo: r.dia.slice(8, 10), // "01", "02", etc.
    iab: r.iab_dia != null ? +(r.iab_dia * 100).toFixed(2) : 0,
    nivelServico: r.ns_pct != null ? +(r.ns_pct * 100).toFixed(1) : 0,
    resolucao: r.resolutividade_pct != null ? +(r.resolutividade_pct * 100).toFixed(1) : 0,
    satisfacao: r.csat_pct != null ? +(r.csat_pct * 100).toFixed(1) : 0,
    volumetria: r.total_chamados || 0,
  }));

  const chartData = isDaily ? dailyChartData : (data ?? []);
  const loading = isLoading || (isDaily && isDailyLoading);

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="h-[280px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground text-sm">Carregando gráfico…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-card-foreground">IAB x NS</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-muted rounded-md p-0.5">
            <button
              onClick={() => onPeriodChange?.("diario")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded transition-all",
                isDaily
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              DIÁRIO
            </button>
            <button
              onClick={() => onPeriodChange?.("mensal")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded transition-all",
                !isDaily
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              MENSAL
            </button>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setShowResolucao(!showResolucao)}
              className={cn(
                "px-2.5 py-1 text-[10px] font-semibold rounded-full border transition-all",
                showResolucao
                  ? "bg-success text-success-foreground border-success"
                  : "bg-transparent text-muted-foreground border-border hover:border-muted-foreground"
              )}
            >
              Resolução
            </button>
            <button
              onClick={() => setShowSatisfacao(!showSatisfacao)}
              className={cn(
                "px-2.5 py-1 text-[10px] font-semibold rounded-full border transition-all",
                showSatisfacao
                  ? "bg-warning text-warning-foreground border-warning"
                  : "bg-transparent text-muted-foreground border-border hover:border-muted-foreground"
              )}
            >
              Satisfação
            </button>
            <button
              onClick={() => setShowVolumetria(!showVolumetria)}
              className={cn(
                "px-2.5 py-1 text-[10px] font-semibold rounded-full border transition-all",
                showVolumetria
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-transparent text-muted-foreground border-border hover:border-muted-foreground"
              )}
            >
              Volumetria
            </button>
          </div>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
          Nenhum dado encontrado para o período selecionado.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
            <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
            {showVolumetria && (
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
            )}
            <Tooltip
              contentStyle={{
                background: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(220, 13%, 91%)",
                borderRadius: "8px",
                fontSize: "11px",
              }}
              formatter={(value: number, name: string) => {
                if (name === "Volumetria") return [value.toLocaleString("pt-BR"), name];
                return [`${value.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}%`, name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: "10px" }} />
            <Line yAxisId="left" type="monotone" dataKey="iab" stroke="hsl(222, 59%, 20%)" strokeWidth={2} dot={{ r: 3 }} name="IAB (%)" />
            <Line yAxisId="left" type="monotone" dataKey="nivelServico" stroke="hsl(210, 80%, 55%)" strokeWidth={2} dot={{ r: 3 }} name="Nível Serviço (%)" />
            {showResolucao && (
              <Line yAxisId="left" type="monotone" dataKey="resolucao" stroke="hsl(152, 60%, 40%)" strokeWidth={1.5} strokeDasharray="4 2" dot={{ r: 2 }} name="Resolução (%)" />
            )}
            {showSatisfacao && (
              <Line yAxisId="left" type="monotone" dataKey="satisfacao" stroke="hsl(38, 92%, 50%)" strokeWidth={1.5} strokeDasharray="4 2" dot={{ r: 2 }} name="Satisfação (%)" />
            )}
            {showVolumetria && (
              <Bar yAxisId="right" dataKey="volumetria" fill="hsl(16, 80%, 58%)" opacity={0.3} radius={[4, 4, 0, 0]} name="Volumetria" />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default AtendimentoChart;
