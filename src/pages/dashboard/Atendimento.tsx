/**
 * Atendimento — página independente
 * Dados: Supabase (via hook useAtendimentoData) — dados reais
 * Esta página já usa dados reais do banco, não hardcode.
 */
import { useState, useEffect } from "react";
import { Activity, Headphones, CheckCircle, Star } from "lucide-react";
import KPICard from "@/components/KPICard";
import AtendimentoChart from "@/components/AtendimentoChart";
import MonthNavigator from "@/components/MonthNavigator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAtendimentoData,
  useIESMapping,
  useAtendimentoDiario,
  computeChange,
  formatPctPtBR,
  formatIntPtBR,
} from "@/hooks/useAtendimentoData";
import { toast } from "@/hooks/use-toast";

interface AtendimentoProps {
  activeIES: string[];
}

const Atendimento = ({ activeIES }: AtendimentoProps) => {
  const { slugToIesId } = useIESMapping();
  const selectedIesUuid = slugToIesId(activeIES[0] ?? "geral");

  const { months, chartData, getMonthData, isLoading, isError, error } =
    useAtendimentoData(selectedIesUuid);

  const [selectedMonth, setSelectedMonth] = useState("");
  const [period, setPeriod] = useState<"diario" | "mensal">("mensal");

  useEffect(() => {
    if (months.length > 0 && !selectedMonth) {
      setSelectedMonth(months[months.length - 1].value);
    }
  }, [months, selectedMonth]);

  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Erro ao carregar dados",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  }, [isError, error]);

  const currentMonthObj = months.find((m) => m.value === selectedMonth);
  const parsedDate = currentMonthObj ? new Date(currentMonthObj.raw) : null;
  const dailyYear = parsedDate?.getUTCFullYear() ?? 2025;
  const dailyMonth = parsedDate?.getUTCMonth() ?? 0;

  const { data: dailyData, isLoading: isDailyLoading } = useAtendimentoDiario(
    selectedIesUuid,
    dailyYear,
    dailyMonth,
    period === "diario" && !!currentMonthObj
  );

  const { current, previous } = getMonthData(selectedMonth);

  const iabChange = computeChange(current?.iab, previous?.iab);
  const nsChange =
    current && previous && current.ns_pct != null && previous.ns_pct != null
      ? +((current.ns_pct - previous.ns_pct) * 100).toFixed(1)
      : undefined;
  const resolChange =
    current && previous &&
    current.resolutividade_pct != null && previous.resolutividade_pct != null
      ? +((current.resolutividade_pct - previous.resolutividade_pct) * 100).toFixed(1)
      : undefined;
  const csatChange =
    current && previous && current.csat_pct != null && previous.csat_pct != null
      ? +((current.csat_pct - previous.csat_pct) * 100).toFixed(1)
      : undefined;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[140px] rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-[340px] rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <MonthNavigator
          months={months}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="IAB"
          value={current?.iab != null ? formatPctPtBR(current.iab, 2) : "N/D"}
          change={iabChange}
          changeLabel="vs mês anterior"
          icon={<Activity className="h-5 w-5" />}
          variant="default"
          subInfo={{
            label: "IAB (únicos)",
            value: current?.iab_unicos != null ? formatPctPtBR(current.iab_unicos, 2) : "N/D",
          }}
        />
        <KPICard
          title="Nível de Serviço"
          value={current?.ns_pct != null ? formatPctPtBR(current.ns_pct, 1) : "N/D"}
          change={nsChange}
          changeLabel="vs mês anterior"
          icon={<Headphones className="h-5 w-5" />}
          variant="success"
          subInfo={{
            label: "TME",
            value: current?.tme_minutos != null ? `${Math.round(current.tme_minutos)} min` : "N/D",
          }}
        />
        <KPICard
          title="Resolutividade"
          value={
            current?.resolutividade_pct != null
              ? formatPctPtBR(current.resolutividade_pct, 1)
              : "N/D"
          }
          change={resolChange}
          changeLabel="vs mês anterior (pp)"
          icon={<CheckCircle className="h-5 w-5" />}
          variant="default"
          subInfo={{
            label: "Base respondente",
            value: current ? formatIntPtBR(current.resolutividade_base) : "N/D",
          }}
        />
        <KPICard
          title="CSAT"
          value={current?.csat_pct != null ? formatPctPtBR(current.csat_pct, 1) : "N/D"}
          change={csatChange}
          changeLabel="vs mês anterior (pp)"
          icon={<Star className="h-5 w-5" />}
          variant="success"
          subInfo={{
            label: "Avaliações",
            value: current ? formatIntPtBR(current.csat_base) : "N/D",
          }}
        />
      </div>

      <AtendimentoChart
        selectedMonth={selectedMonth}
        data={chartData}
        period={period}
        onPeriodChange={setPeriod}
        dailyData={dailyData ?? undefined}
        isDailyLoading={isDailyLoading}
      />
    </div>
  );
};

export default Atendimento;
