import { useState, useEffect } from "react";
import { Users, UserMinus, Headphones, Clock, GraduationCap, TrendingDown, MessageSquare, Route, Activity, CheckCircle, Star } from "lucide-react";
import KPICard from "@/components/KPICard";
import { RetentionChart, EvasionReasonsChart, TicketVolumeChart, JourneyFunnelChart } from "@/components/DashboardCharts";
import DetailTable from "@/components/DetailTable";
import ChurnTable from "@/components/ChurnTable";
import EvasionCard from "@/components/EvasionCard";
import NPSChart from "@/components/NPSChart";
import AtendimentoChart from "@/components/AtendimentoChart";
import FunnelActivation from "@/components/FunnelActivation";
import NPSDetailPage from "@/components/NPSDetailPage";
import JourneyDetailPage from "@/components/JourneyDetailPage";
import IESOverviewDetail from "@/components/IESOverviewDetail";
import IESOverviewCards from "@/components/IESOverviewCards";
import MonthNavigator from "@/components/MonthNavigator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAtendimentoData, useIESMapping, useAtendimentoDiario, computeChange, formatPctPtBR, formatPtBR, formatIntPtBR } from "@/hooks/useAtendimentoData";
import { toast } from "@/hooks/use-toast";

interface TabContentProps {
  activeTab: string;
  activeIES: string[];
  onTabChange?: (tab: string) => void;
}

const productData = [
  ["MBA Gestão Empresarial", "1.240", "92,1%", "3,2%", "4,7%"],
  ["MBA Marketing Digital", "890", "89,5%", "5,1%", "5,4%"],
  ["Pós Direito Digital", "620", "93,8%", "2,8%", "3,4%"],
  ["MBA Finanças", "450", "88,2%", "6,3%", "5,5%"],
  ["Pós Gestão de Pessoas", "380", "91,0%", "4,0%", "5,0%"],
  ["MBA Data Science", "310", "94,5%", "2,1%", "3,4%"],
];

const OverviewTab = ({ onTabChange, activeIES }: { onTabChange?: (tab: string) => void; activeIES: string[] }) => {
  const isGeral = activeIES.length === 1 && activeIES[0] === "geral";

  if (!isGeral && activeIES.length === 1) {
    return <IESOverviewDetail iesTabId={activeIES[0]} />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <div className="xl:col-span-3">
          <ChurnTable />
        </div>
        <div className="xl:col-span-1 flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Impacto Financeiro</h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Receita Perdida</span>
                <span className="text-sm font-bold text-destructive">-R$ 1.2M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Receita Recuperada</span>
                <span className="text-sm font-bold text-success">+R$ 310k</span>
              </div>
              <div className="border-t border-border pt-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-card-foreground">Impacto Líquido</span>
                <span className="text-sm font-bold text-destructive">-R$ 890k</span>
              </div>
            </div>
          </div>
          <EvasionCard />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NPSChart onClick={onTabChange ? () => onTabChange("nps") : undefined} />
        <AtendimentoChart />
      </div>
      <FunnelActivation />
      <IESOverviewCards />
    </div>
  );
};

const RetentionTab = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-bold text-foreground">Retenção & Evasão</h2>
      <p className="text-sm text-muted-foreground mt-1">Análise detalhada por produto e coorte</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard title="Retenção Geral" value="90,3%" change={-0.5} changeLabel="vs mês anterior" icon={<GraduationCap className="h-5 w-5" />} variant="default" />
      <KPICard title="Evasões no Mês" value="162" change={15} changeLabel="vs mês anterior" icon={<TrendingDown className="h-5 w-5" />} variant="danger" />
      <KPICard title="Alunos em Risco" value="234" change={-8} changeLabel="vs mês anterior" icon={<UserMinus className="h-5 w-5" />} variant="warning" />
      <KPICard title="Recuperados" value="47" change={22} changeLabel="vs mês anterior" icon={<Users className="h-5 w-5" />} variant="success" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <RetentionChart />
      <EvasionReasonsChart />
    </div>
    <DetailTable
      title="Retenção por Produto"
      headers={["Produto", "Alunos", "Retenção", "Evasão Mês", "Evasão Acum."]}
      rows={productData}
      defaultExpanded
    />
  </div>
);

const SupportTab = ({ activeIES }: { activeIES: string[] }) => {
  const { slugToIesId } = useIESMapping();
  const selectedIesUuid = slugToIesId(activeIES[0] ?? "geral");

  const { months, chartData, getMonthData, isLoading, isError, error } = useAtendimentoData(selectedIesUuid);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [period, setPeriod] = useState<"diario" | "mensal">("mensal");

  // Set default month to latest available
  useEffect(() => {
    if (months.length > 0 && !selectedMonth) {
      setSelectedMonth(months[months.length - 1].value);
    }
  }, [months, selectedMonth]);

  useEffect(() => {
    if (isError && error) {
      toast({ title: "Erro ao carregar dados", description: (error as Error).message, variant: "destructive" });
    }
  }, [isError, error]);

  // Parse year/month from selectedMonth for daily query
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
  const nsChange = current && previous && current.ns_pct != null && previous.ns_pct != null
    ? +((current.ns_pct - previous.ns_pct) * 100).toFixed(1)
    : undefined;
  const resolChange = current && previous && current.resolutividade_pct != null && previous.resolutividade_pct != null
    ? +((current.resolutividade_pct - previous.resolutividade_pct) * 100).toFixed(1)
    : undefined;
  const csatChange = current && previous && current.csat_pct != null && previous.csat_pct != null
    ? +((current.csat_pct - previous.csat_pct) * 100).toFixed(1)
    : undefined;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-[200px]" />
        </div>
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
          subInfo={{ label: "IAB (únicos)", value: current?.iab_unicos != null ? formatPctPtBR(current.iab_unicos, 2) : "N/D" }}
        />
        <KPICard
          title="Nível de Serviço"
          value={current?.ns_pct != null ? formatPctPtBR(current.ns_pct, 1) : "N/D"}
          change={nsChange}
          changeLabel="vs mês anterior"
          icon={<Headphones className="h-5 w-5" />}
          variant="success"
          subInfo={{ label: "TME", value: current?.tme_minutos != null ? `${Math.round(current.tme_minutos)} min` : "N/D" }}
        />
        <KPICard
          title="Resolutividade"
          value={current?.resolutividade_pct != null ? formatPctPtBR(current.resolutividade_pct, 1) : "N/D"}
          change={resolChange}
          changeLabel="vs mês anterior"
          icon={<CheckCircle className="h-5 w-5" />}
          variant="default"
          subInfo={{ label: "Base respondente", value: current ? formatIntPtBR(current.resolutividade_base) : "N/D" }}
        />
        <KPICard
          title="CSAT"
          value={current?.csat_pct != null ? formatPctPtBR(current.csat_pct, 1) : "N/D"}
          change={csatChange}
          changeLabel="vs mês anterior (pp)"
          icon={<Star className="h-5 w-5" />}
          variant="success"
          subInfo={{ label: "Avaliações", value: current ? formatIntPtBR(current.csat_base) : "N/D" }}
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

const JourneyTab = ({ activeIES }: { activeIES: string[] }) => (
  <JourneyDetailPage activeIES={activeIES} />
);

const TabContent = ({ activeTab, activeIES, onTabChange }: TabContentProps) => {
  switch (activeTab) {
    case "retention":
      return <RetentionTab />;
    case "support":
      return <SupportTab activeIES={activeIES} />;
    case "journey":
      return <JourneyTab activeIES={activeIES} />;
    case "nps":
      return <NPSDetailPage activeIES={activeIES} />;
    default:
      return <OverviewTab onTabChange={onTabChange} activeIES={activeIES} />;
  }
};

export default TabContent;
