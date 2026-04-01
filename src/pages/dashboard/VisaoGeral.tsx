/**
 * Visão Geral — página independente
 * Dados: src/data/churnData.ts (CHURN_ACUM, RETENTION_TREND_SERIES)
 * Componentes reutilizáveis: ChurnTable, NPSChart, AtendimentoChart,
 *   FunnelActivation, IESOverviewCards, IESOverviewDetail, EvasionCard
 */
import { useNavigate } from "react-router-dom";
import ChurnTable from "@/components/ChurnTable";
import EvasionCard from "@/components/EvasionCard";
import NPSChart from "@/components/NPSChart";
import AtendimentoChart from "@/components/AtendimentoChart";
import FunnelActivation from "@/components/FunnelActivation";
import IESOverviewCards from "@/components/IESOverviewCards";
import IESOverviewDetail from "@/components/IESOverviewDetail";

interface VisaoGeralProps {
  activeIES: string[];
  onTabChange?: (tab: string) => void;
}

const VisaoGeral = ({ activeIES, onTabChange }: VisaoGeralProps) => {
  const navigate = useNavigate();
  const isGeral = activeIES.length === 1 && activeIES[0] === "geral";

  // Visão detalhada de uma IES específica
  if (!isGeral && activeIES.length === 1) {
    return <IESOverviewDetail iesTabId={activeIES[0]} />;
  }

  return (
    <div className="space-y-6">
      {/* Churn table + impacto financeiro */}
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

      {/* NPS + Atendimento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NPSChart onClick={onTabChange ? () => onTabChange("nps") : () => navigate("/nps")} />
        <AtendimentoChart />
      </div>

      {/* Funil de ativação */}
      <FunnelActivation />

      {/* Cards por IES */}
      <IESOverviewCards />
    </div>
  );
};

export default VisaoGeral;
