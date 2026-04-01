import { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";
import WaterfallChart from "@/components/ies/WaterfallChart";
import { waterfallByIES } from "@/data/waterfallData";

import { loadNpsData, calcNPS, getCycles, tabIdToIes, type NPSRecord } from "@/data/npsData";
import NPSGauge from "@/components/nps/NPSGauge";
import AtendimentoChart from "@/components/AtendimentoChart";
import { cn } from "@/lib/utils";

interface IESOverviewDetailProps {
  iesTabId: string;
}

// Mock monthly churn evolution data per IES (% churn mensal)
const churnEvolutionByIES: Record<string, { mes: string; churn: number; anoAnterior: number; meta: number }[]> = {
  "puc-pr": [
    { mes: "Jan", churn: 3.2, anoAnterior: 3.8, meta: 3.5 },
    { mes: "Fev", churn: 3.5, anoAnterior: 4.0, meta: 3.5 },
    { mes: "Mar", churn: 3.1, anoAnterior: 3.6, meta: 3.5 },
    { mes: "Abr", churn: 3.8, anoAnterior: 4.2, meta: 3.5 },
    { mes: "Mai", churn: 3.4, anoAnterior: 3.9, meta: 3.5 },
    { mes: "Jun", churn: 3.6, anoAnterior: 4.1, meta: 3.5 },
    { mes: "Jul", churn: 3.3, anoAnterior: 3.7, meta: 3.5 },
    { mes: "Ago", churn: 3.9, anoAnterior: 4.3, meta: 3.5 },
    { mes: "Set", churn: 3.7, anoAnterior: 4.0, meta: 3.5 },
    { mes: "Out", churn: 3.8, anoAnterior: 4.1, meta: 3.5 },
    { mes: "Nov", churn: 3.5, anoAnterior: 3.8, meta: 3.5 },
    { mes: "Dez", churn: 3.4, anoAnterior: 3.7, meta: 3.5 },
  ],
  "puc-campinas": [
    { mes: "Jan", churn: 4.0, anoAnterior: 4.5, meta: 3.5 },
    { mes: "Fev", churn: 4.3, anoAnterior: 4.8, meta: 3.5 },
    { mes: "Mar", churn: 3.8, anoAnterior: 4.3, meta: 3.5 },
    { mes: "Abr", churn: 4.5, anoAnterior: 5.0, meta: 3.5 },
    { mes: "Mai", churn: 4.1, anoAnterior: 4.6, meta: 3.5 },
    { mes: "Jun", churn: 4.2, anoAnterior: 4.7, meta: 3.5 },
    { mes: "Jul", churn: 3.9, anoAnterior: 4.4, meta: 3.5 },
    { mes: "Ago", churn: 4.4, anoAnterior: 4.9, meta: 3.5 },
    { mes: "Set", churn: 4.2, anoAnterior: 4.7, meta: 3.5 },
    { mes: "Out", churn: 4.3, anoAnterior: 4.8, meta: 3.5 },
    { mes: "Nov", churn: 4.0, anoAnterior: 4.5, meta: 3.5 },
    { mes: "Dez", churn: 3.9, anoAnterior: 4.4, meta: 3.5 },
  ],
  "puc-rio": [
    { mes: "Jan", churn: 2.8, anoAnterior: 3.3, meta: 3.5 },
    { mes: "Fev", churn: 3.0, anoAnterior: 3.5, meta: 3.5 },
    { mes: "Mar", churn: 2.7, anoAnterior: 3.2, meta: 3.5 },
    { mes: "Abr", churn: 3.2, anoAnterior: 3.7, meta: 3.5 },
    { mes: "Mai", churn: 2.9, anoAnterior: 3.4, meta: 3.5 },
    { mes: "Jun", churn: 3.1, anoAnterior: 3.6, meta: 3.5 },
    { mes: "Jul", churn: 2.8, anoAnterior: 3.3, meta: 3.5 },
    { mes: "Ago", churn: 3.3, anoAnterior: 3.8, meta: 3.5 },
    { mes: "Set", churn: 3.1, anoAnterior: 3.6, meta: 3.5 },
    { mes: "Out", churn: 3.0, anoAnterior: 3.5, meta: 3.5 },
    { mes: "Nov", churn: 2.9, anoAnterior: 3.4, meta: 3.5 },
    { mes: "Dez", churn: 2.8, anoAnterior: 3.3, meta: 3.5 },
  ],
  "pos-artmed": [
    { mes: "Jan", churn: 4.8, anoAnterior: 5.2, meta: 4.0 },
    { mes: "Fev", churn: 5.1, anoAnterior: 5.5, meta: 4.0 },
    { mes: "Mar", churn: 4.6, anoAnterior: 5.0, meta: 4.0 },
    { mes: "Abr", churn: 5.3, anoAnterior: 5.7, meta: 4.0 },
    { mes: "Mai", churn: 4.9, anoAnterior: 5.3, meta: 4.0 },
    { mes: "Jun", churn: 5.0, anoAnterior: 5.4, meta: 4.0 },
    { mes: "Jul", churn: 4.7, anoAnterior: 5.1, meta: 4.0 },
    { mes: "Ago", churn: 5.2, anoAnterior: 5.6, meta: 4.0 },
    { mes: "Set", churn: 5.0, anoAnterior: 5.4, meta: 4.0 },
    { mes: "Out", churn: 5.1, anoAnterior: 5.5, meta: 4.0 },
    { mes: "Nov", churn: 4.8, anoAnterior: 5.2, meta: 4.0 },
    { mes: "Dez", churn: 4.7, anoAnterior: 5.1, meta: 4.0 },
  ],
  "hcor": [
    { mes: "Jan", churn: 2.5, anoAnterior: 3.0, meta: 3.0 },
    { mes: "Fev", churn: 2.7, anoAnterior: 3.2, meta: 3.0 },
    { mes: "Mar", churn: 2.4, anoAnterior: 2.9, meta: 3.0 },
    { mes: "Abr", churn: 2.9, anoAnterior: 3.4, meta: 3.0 },
    { mes: "Mai", churn: 2.6, anoAnterior: 3.1, meta: 3.0 },
    { mes: "Jun", churn: 2.8, anoAnterior: 3.3, meta: 3.0 },
    { mes: "Jul", churn: 2.5, anoAnterior: 3.0, meta: 3.0 },
    { mes: "Ago", churn: 3.0, anoAnterior: 3.5, meta: 3.0 },
    { mes: "Set", churn: 2.8, anoAnterior: 3.3, meta: 3.0 },
    { mes: "Out", churn: 2.7, anoAnterior: 3.2, meta: 3.0 },
    { mes: "Nov", churn: 2.6, anoAnterior: 3.1, meta: 3.0 },
    { mes: "Dez", churn: 2.5, anoAnterior: 3.0, meta: 3.0 },
  ],
  "fdc": [
    { mes: "Jan", churn: 4.2, anoAnterior: 4.7, meta: 4.0 },
    { mes: "Fev", churn: 4.5, anoAnterior: 5.0, meta: 4.0 },
    { mes: "Mar", churn: 4.0, anoAnterior: 4.5, meta: 4.0 },
    { mes: "Abr", churn: 4.7, anoAnterior: 5.2, meta: 4.0 },
    { mes: "Mai", churn: 4.3, anoAnterior: 4.8, meta: 4.0 },
    { mes: "Jun", churn: 4.5, anoAnterior: 5.0, meta: 4.0 },
    { mes: "Jul", churn: 4.1, anoAnterior: 4.6, meta: 4.0 },
    { mes: "Ago", churn: 4.6, anoAnterior: 5.1, meta: 4.0 },
    { mes: "Set", churn: 4.5, anoAnterior: 5.0, meta: 4.0 },
    { mes: "Out", churn: 4.4, anoAnterior: 4.9, meta: 4.0 },
    { mes: "Nov", churn: 4.2, anoAnterior: 4.7, meta: 4.0 },
    { mes: "Dez", churn: 4.1, anoAnterior: 4.6, meta: 4.0 },
  ],
};

// Base ativa mock
const baseAtivaByIES: Record<string, { orcada: number; realizada: number }> = {
  "puc-pr": { orcada: 1300, realizada: 1240 },
  "puc-campinas": { orcada: 950, realizada: 890 },
  "puc-rio": { orcada: 600, realizada: 620 },
  "pos-artmed": { orcada: 500, realizada: 450 },
  "hcor": { orcada: 400, realizada: 380 },
  "fdc": { orcada: 350, realizada: 310 },
};

// Tab display name from tabId
const tabDisplayNames: Record<string, string> = {
  "puc-pr": "PUC PR",
  "puc-campinas": "PUC CAMPINAS",
  "puc-rio": "PUC RIO",
  "pos-artmed": "PÓS ARTMED",
  "hcor": "HCOR",
  "fdc": "FDC",
};

const IESOverviewDetail = ({ iesTabId }: IESOverviewDetailProps) => {
  const [npsRecords, setNpsRecords] = useState<NPSRecord[]>([]);

  useEffect(() => {
    loadNpsData().then(setNpsRecords);
  }, []);

  const csvIesName = tabIdToIes[iesTabId];
  const displayName = tabDisplayNames[iesTabId] || iesTabId;

  // NPS value for this IES
  const npsValue = useMemo(() => {
    if (!csvIesName) return 0;
    const filtered = npsRecords.filter((r) => r.nome_ies === csvIesName);
    return calcNPS(filtered);
  }, [npsRecords, csvIesName]);

  // NPS over time for this IES only
  const npsOverTime = useMemo(() => {
    if (!csvIesName) return [];
    const cycles = getCycles(npsRecords);
    return cycles.map((cycle) => {
      const [ano, ciclo] = cycle.split(".").map(Number);
      const filtered = npsRecords.filter((r) => r.ano === ano && r.ciclo === ciclo && r.nome_ies === csvIesName);
      return {
        cycle,
        nps: filtered.length > 0 ? calcNPS(filtered) : null,
        respostas: filtered.length,
      };
    }).filter((d) => d.nps !== null);
  }, [npsRecords, csvIesName]);

  // NPS distribution
  const npsDistribution = useMemo(() => {
    if (!csvIesName) return { promotores: 0, neutros: 0, detratores: 0, total: 0 };
    const filtered = npsRecords.filter((r) => r.nome_ies === csvIesName);
    return {
      promotores: filtered.filter((r) => r.classificacao === "Promotor").length,
      neutros: filtered.filter((r) => r.classificacao === "Neutro").length,
      detratores: filtered.filter((r) => r.classificacao === "Detrator").length,
      total: filtered.length,
    };
  }, [npsRecords, csvIesName]);

  const churnData = churnEvolutionByIES[iesTabId] || [];
  const waterfallData = waterfallByIES[iesTabId] || [];
  const baseAtiva = baseAtivaByIES[iesTabId] || { orcada: 0, realizada: 0 };
  const baseGap = baseAtiva.realizada - baseAtiva.orcada;
  const basePercent = baseAtiva.orcada > 0 ? ((baseAtiva.realizada / baseAtiva.orcada) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
        <p className="text-sm text-muted-foreground mt-1">Visão geral da instituição</p>
      </div>

      {/* Row 1: Churn Evolution + Base Ativa */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Churn Evolution */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">EVOLUÇÃO CHURN — 2026</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={churnData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
                domain={[0, "auto"]}
              />
              <Tooltip
                contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 13%, 91%)", borderRadius: "8px", fontSize: "11px" }}
                formatter={(value: number) => [`${value}%`, ""]}
              />
              <Legend wrapperStyle={{ fontSize: "10px" }} />
              <Line type="monotone" dataKey="churn" stroke="hsl(0, 72%, 51%)" strokeWidth={2.5} dot={{ r: 3 }} name="Churn 2026" />
              <Line type="monotone" dataKey="anoAnterior" stroke="hsl(220, 9%, 46%)" strokeWidth={1.5} strokeDasharray="5 3" dot={{ r: 2 }} name="Ano Anterior" />
              <Line type="monotone" dataKey="meta" stroke="hsl(152, 60%, 40%)" strokeWidth={1.5} strokeDasharray="3 3" dot={{ r: 2 }} name="Meta" />
            </LineChart>
          </ResponsiveContainer>

          {/* Waterfall */}
          <div className="mt-4 border-t border-border pt-4">
            <WaterfallChart data={waterfallData} />
          </div>
        </div>

        {/* Base Ativa + Impacto Financeiro */}
        <div className="flex flex-col gap-4">
          {/* Base Ativa */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-card-foreground mb-3">BASE ATIVA</h3>
            <div className="flex items-start gap-4">
              {/* Left: numbers */}
              <div className="space-y-2 flex-shrink-0">
                <div>
                  <p className="text-[10px] text-muted-foreground">Orçada</p>
                  <p className="text-xl font-bold text-card-foreground">{baseAtiva.orcada.toLocaleString("pt-BR")}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Realizada</p>
                  <p className="text-xl font-bold text-card-foreground">{baseAtiva.realizada.toLocaleString("pt-BR")}</p>
                </div>
              </div>
              {/* Right: atingimento + bars */}
              <div className="flex-1 flex flex-col items-end justify-between">
                <div className="text-right mb-2">
                  <p className="text-[10px] text-muted-foreground">Atingimento</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    Number(basePercent) >= 100 ? "text-success" : "text-destructive"
                  )}>
                    {basePercent}%
                  </p>
                  <p className={cn(
                    "text-xs font-semibold",
                    baseGap >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {baseGap >= 0 ? "+" : ""}{baseGap.toLocaleString("pt-BR")} alunos
                  </p>
                </div>
                <div className="w-full space-y-1.5">
                  <div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                      <span>Orçada</span>
                      <span>{baseAtiva.orcada}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-muted-foreground/30" style={{ width: "100%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                      <span>Realizada</span>
                      <span>{baseAtiva.realizada}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", Number(basePercent) >= 100 ? "bg-success" : "bg-destructive")}
                        style={{ width: `${Math.min(Number(basePercent), 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Impacto Financeiro */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-card-foreground mb-3">IMPACTO FINANCEIRO</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Receita Perdida (Churn)</span>
                <span className="text-sm font-bold text-destructive">-R$ 284k</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Receita Recuperada</span>
                <span className="text-sm font-bold text-success">+R$ 62k</span>
              </div>
              <div className="border-t border-border pt-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-card-foreground">Impacto Líquido</span>
                <span className="text-sm font-bold text-destructive">-R$ 222k</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Ticket Médio</span>
                <span className="text-sm font-semibold text-card-foreground">R$ 1.750</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Alunos Evadidos</span>
                <span className="text-sm font-semibold text-card-foreground">162</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: NPS Gauge + NPS Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* NPS Gauge + Distribution */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">NPS</h3>
          <NPSGauge value={npsValue} />
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-success">{npsDistribution.promotores}</p>
              <p className="text-[10px] text-muted-foreground">Promotores</p>
            </div>
            <div>
              <p className="text-lg font-bold text-warning">{npsDistribution.neutros}</p>
              <p className="text-[10px] text-muted-foreground">Neutros</p>
            </div>
            <div>
              <p className="text-lg font-bold text-destructive">{npsDistribution.detratores}</p>
              <p className="text-[10px] text-muted-foreground">Detratores</p>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2">{npsDistribution.total} respostas</p>
        </div>

        {/* NPS Over Time */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">NPS AO LONGO DO TEMPO</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={npsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="cycle" tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
              <YAxis domain={[-20, 100]} tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 13%, 91%)", borderRadius: "8px", fontSize: "11px" }} />
              <ReferenceLine y={60} stroke="hsl(0, 72%, 51%)" strokeDasharray="6 3" strokeWidth={2} label={{ value: "Meta: 60", position: "right", fontSize: 10, fill: "hsl(0, 72%, 51%)" }} />
              <Line type="monotone" dataKey="nps" stroke="hsl(222, 59%, 20%)" strokeWidth={2.5} dot={{ r: 4 }} name="NPS" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Atendimento (reusing the general component) */}
      <AtendimentoChart />
    </div>
  );
};

export default IESOverviewDetail;
