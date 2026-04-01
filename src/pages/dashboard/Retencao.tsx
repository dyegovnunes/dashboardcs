/**
 * Retenção — página independente
 * Dados: src/data/churnData.ts, src/data/iesConfig.ts, src/data/sensitivityData.ts
 * Componentes reutilizáveis: ChurnTable, RetentionChart, EvasionReasonsChart,
 *   WaterfallChart, DetailTable, KPICard
 */
import { GraduationCap, TrendingDown, UserMinus, Users } from "lucide-react";
import KPICard from "@/components/KPICard";
import { RetentionChart, EvasionReasonsChart } from "@/components/DashboardCharts";
import DetailTable from "@/components/DetailTable";
import ChurnTable from "@/components/ChurnTable";
import { CHURN_ACUM } from "@/data/churnData";

// Dados reais de evasão acumulada (Jan→Mar/26)
const totalEvasao = CHURN_ACUM.reduce((acc, r) => acc + (r.baseAtivaReal || 0), 0);
const totalEvas = 719 + 269 + 161 + 387 + 118 + 45; // evasão real acumulada

const productData = [
  ["PUC PR",        "7.495",  `${(100 - 9.42).toFixed(1)}%`,  "719",   "9,42%"],
  ["PUC Campinas",  "3.894",  `${(100 - 6.84).toFixed(1)}%`,  "269",   "6,84%"],
  ["PUC Rio",       "1.727",  `${(100 - 8.65).toFixed(1)}%`,  "161",   "8,65%"],
  ["Pós Artmed",    "6.193",  `${(100 - 5.97).toFixed(1)}%`,  "387",   "5,97%"],
  ["HCor",          "1.337",  `${(100 - 8.47).toFixed(1)}%`,  "118",   "8,47%"],
  ["FDC",           "936",    `${(100 - 4.99).toFixed(1)}%`,  "45",    "4,99%"],
];

const Retencao = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-bold text-foreground">Retenção & Evasão</h2>
      <p className="text-sm text-muted-foreground mt-1">Jan→Mar/2026 — todos os institutos</p>
    </div>

    {/* KPIs */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title="Churn Acum. Médio"
        value="7,39%"
        change={-33.0}
        changeLabel="vs mesmo período 2025"
        icon={<TrendingDown className="h-5 w-5" />}
        variant="success"
      />
      <KPICard
        title="Evasões Acumuladas"
        value={totalEvas.toLocaleString("pt-BR")}
        change={-28}
        changeLabel="vs mesmo período 2025"
        icon={<UserMinus className="h-5 w-5" />}
        variant="warning"
      />
      <KPICard
        title="Base Ativa Total"
        value="21.582"
        change={2.1}
        changeLabel="vs base inicial Jan/26"
        icon={<Users className="h-5 w-5" />}
        variant="default"
      />
      <KPICard
        title="Dentro da Meta"
        value="4 / 6"
        change={undefined}
        changeLabel="IES no churn acum."
        icon={<GraduationCap className="h-5 w-5" />}
        variant="default"
      />
    </div>

    {/* Churn table com dados reais */}
    <ChurnTable />

    {/* Evolução de retenção + motivos de evasão */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <RetentionChart />
      <EvasionReasonsChart />
    </div>

    {/* Tabela por IES */}
    <DetailTable
      title="Retenção por IES — Jan→Mar/26"
      headers={["IES", "Base Ativa", "Retenção", "Evasões", "Churn Acum."]}
      rows={productData}
      defaultExpanded
    />
  </div>
);

export default Retencao;
