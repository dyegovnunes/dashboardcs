import { useState, useMemo, useEffect, useTransition } from "react";
import { cn } from "@/lib/utils";
import {
  loadEngagementData, tabIdToEngIES, getCourses, getOrdensAluno,
  calcEngagementScore, classifyScore, defaultScoreRules,
  type EngagementRecord, type ScoreRules,
} from "@/data/engagementData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";
import FunnelChart, { defaultFunnelMetas, type FunnelMetas } from "@/components/journey/FunnelChart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { RotateCcw, Settings2, AlertTriangle, ShieldCheck, ShieldAlert, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ScoreRulesModal from "@/components/journey/ScoreRulesModal";

interface JourneyDetailPageProps {
  activeIES?: string[];
}

function groupByRA(records: EngagementRecord[]): Map<number, EngagementRecord[]> {
  const map = new Map<number, EngagementRecord[]>();
  for (const r of records) {
    let arr = map.get(r.ra);
    if (!arr) { arr = []; map.set(r.ra, arr); }
    arr.push(r);
  }
  return map;
}

/** Build funnel stats from a grouped-by-RA map */
function buildFunnel(grouped: Map<number, EngagementRecord[]>) {
  const total = grouped.size;
  let login = 0, ativacao = 0, questionario = 0;
  grouped.forEach(recs => {
    if (recs.some(r => r.realizou_login === 1)) login++;
    if (recs.some(r => r.disciplina_regular === 1 && r.realizou_ativacao === 1)) ativacao++;
    if (recs.some(r => r.realizou_questionario === 1)) questionario++;
  });
  return [
    { step: "Matriculados", value: total, pct: 100 },
    { step: "Realizou Login", value: login, pct: total ? Math.round((login / total) * 100) : 0 },
    { step: "Realizou Ativação", value: ativacao, pct: total ? Math.round((ativacao / total) * 100) : 0 },
    { step: "Realizou Questionário", value: questionario, pct: total ? Math.round((questionario / total) * 100) : 0 },
  ];
}

const FUNNEL_COLORS = ["hsl(222, 59%, 20%)", "hsl(210, 80%, 55%)", "hsl(38, 92%, 50%)", "hsl(152, 60%, 40%)"];
// Funnel metas state
const ALL_IES_LIST = [
  { id: "puc-pr", label: "PUC PR" },
  { id: "puc-campinas", label: "PUC Campinas" },
  { id: "puc-rio", label: "PUC Rio" },
  { id: "pos-artmed", label: "Pós Artmed" },
  { id: "hcor", label: "HCOR" },
  { id: "fdc", label: "FDC" },
];

const JourneyDetailPage = ({ activeIES = ["geral"] }: JourneyDetailPageProps) => {
  const [records, setRecords] = useState<EngagementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoreRules, setScoreRules] = useState<ScoreRules>(defaultScoreRules);
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [funnelMetas, setFunnelMetas] = useState<FunnelMetas>(defaultFunnelMetas);
  const [, startTransition] = useTransition();

  const [selectedCursos, setSelectedCursos] = useState<string[]>([]);
  const [cursoSearch, setCursoSearch] = useState("");
  const [selectedOrdemAluno, setSelectedOrdemAluno] = useState<string>("todas");
  const [selectedRegular, setSelectedRegular] = useState<string>("todas");
  const [selectedProgress, setSelectedProgress] = useState<string>("todas");

  useEffect(() => {
    loadEngagementData().then(data => {
      setRecords(data);
      setLoading(false);
    });
  }, []);

  const isGeral = activeIES.includes("geral");

  const iesFilters = useMemo(() => {
    if (isGeral) return null;
    return activeIES.map(id => tabIdToEngIES[id]).filter(Boolean);
  }, [activeIES, isGeral]);

  const filtered = useMemo(() => {
    let data = records;
    if (iesFilters) data = data.filter(r => iesFilters.includes(r.ies));
    if (selectedCursos.length > 0) { const s = new Set(selectedCursos); data = data.filter(r => s.has(r.curso)); }
    if (selectedOrdemAluno !== "todas") {
      const o = Number(selectedOrdemAluno);
      // Para cada RA, determinar seu bucket = menor ordem_aluno com disciplina ativa
      const raBucket = new Map<number, number>();
      for (const r of data) {
        if (r.disciplina_atual === 1) {
          const current = raBucket.get(r.ra);
          if (current === undefined || r.ordem_aluno < current) {
            raBucket.set(r.ra, r.ordem_aluno);
          }
        }
      }
      // Filtrar RAs cujo bucket é o selecionado
      const rasNaOrdem = new Set<number>();
      raBucket.forEach((bucket, ra) => {
        if (bucket === o) rasNaOrdem.add(ra);
      });
      data = data.filter(r => rasNaOrdem.has(r.ra));
    }
    if (selectedRegular !== "todas") { const v = Number(selectedRegular); data = data.filter(r => r.disciplina_regular === v); }
    return data;
  }, [records, iesFilters, selectedCursos, selectedOrdemAluno, selectedRegular]);

  const groupedByRA = useMemo(() => groupByRA(filtered), [filtered]);

  const progressFiltered = useMemo(() => {
    if (selectedProgress === "todas") return filtered;
    const [min, max] = selectedProgress.split("-").map(Number);
    return filtered.filter(r => r.progresso >= min && r.progresso < max);
  }, [filtered, selectedProgress]);

  const progressGroupedByRA = useMemo(() => groupByRA(progressFiltered), [progressFiltered]);

  const cursoList = useMemo(() => getCourses(iesFilters ? records.filter(r => iesFilters.includes(r.ies)) : records), [records, iesFilters]);
  const ordensAlunoList = useMemo(() => getOrdensAluno(iesFilters ? records.filter(r => iesFilters.includes(r.ies)) : records), [records, iesFilters]);

  const hasFilters = selectedCursos.length > 0 || selectedOrdemAluno !== "todas" || selectedRegular !== "todas" || selectedProgress !== "todas";
  const resetFilters = () => {
    startTransition(() => {
      setSelectedCursos([]);
      setCursoSearch("");
      setSelectedOrdemAluno("todas");
      setSelectedRegular("todas");
      setSelectedProgress("todas");
    });
  };

  // ─── FUNNEL PER IES (geral) or single funnel ───
  const funnelsByIES = useMemo(() => {
    if (!isGeral) {
      return [{ iesLabel: iesFilters?.join(", ") || "Filtrado", data: buildFunnel(progressGroupedByRA) }];
    }
    // Build one funnel per IES
    const result: { iesLabel: string; data: ReturnType<typeof buildFunnel> }[] = [];
    for (const ies of ALL_IES_LIST) {
      const iesName = tabIdToEngIES[ies.id];
      if (!iesName) continue;
      const iesRecords = progressFiltered.filter(r => r.ies === iesName);
      if (iesRecords.length === 0) continue;
      const grouped = groupByRA(iesRecords);
      result.push({ iesLabel: ies.label, data: buildFunnel(grouped) });
    }
    return result;
  }, [isGeral, iesFilters, progressGroupedByRA, progressFiltered]);

  // ─── FUNNELS BY ORDEM_ALUNO (single IES only) ───
  const isSingleIES = !isGeral && activeIES.length === 1;
  const funnelsByOrdemAluno = useMemo(() => {
    if (!isSingleIES) return [];
    // Calcular bucket único por RA = menor ordem_aluno com disciplina ativa
    const raBucket = new Map<number, number>();
    for (const r of progressFiltered) {
      if (r.disciplina_atual === 1) {
        const current = raBucket.get(r.ra);
        if (current === undefined || r.ordem_aluno < current) {
          raBucket.set(r.ra, r.ordem_aluno);
        }
      }
    }
    // Agrupar registros por bucket do RA
    const ordemMap = new Map<number, Map<number, EngagementRecord[]>>();
    for (const r of progressFiltered) {
      const bucket = raBucket.get(r.ra);
      if (bucket === undefined) continue; // RA sem disciplina ativa
      let raMap = ordemMap.get(bucket);
      if (!raMap) { raMap = new Map(); ordemMap.set(bucket, raMap); }
      let arr = raMap.get(r.ra);
      if (!arr) { arr = []; raMap.set(r.ra, arr); }
      arr.push(r);
    }
    return Array.from(ordemMap.entries())
      .map(([ordem, raMap]) => ({ ordem, data: buildFunnel(raMap) }))
      .sort((a, b) => a.ordem - b.ordem);
  }, [isSingleIES, progressFiltered]);

  // ─── LOGIN DISTRIBUTION ───
  const loginDistData = useMemo(() => {
    const buckets: Record<string, number> = { "0": 0, "1": 0, "2": 0, "3–7": 0, "8–14": 0, "15–30": 0, "30+": 0 };
    const seen = new Set<number>();
    for (const r of filtered) {
      if (seen.has(r.ra)) continue;
      seen.add(r.ra);
      const d = r.dias_mat_login;
      if (d === null) continue;
      const abs = Math.abs(d);
      if (abs === 0) buckets["0"]++;
      else if (abs === 1) buckets["1"]++;
      else if (abs === 2) buckets["2"]++;
      else if (abs <= 7) buckets["3–7"]++;
      else if (abs <= 14) buckets["8–14"]++;
      else if (abs <= 30) buckets["15–30"]++;
      else buckets["30+"]++;
    }
    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const loginDistTotal = useMemo(() => loginDistData.reduce((s, d) => s + d.value, 0), [loginDistData]);

  // ─── ACTIVATION TIME BY ORDER ───
  const activationByOrder = useMemo(() => {
    const orderMap = new Map<number, { sum: number; count: number }>();
    for (const r of filtered) {
      if (r.disciplina_regular === 1 && r.dias_aulas_ativacao !== null && r.dias_aulas_ativacao > 0) {
        const cur = orderMap.get(r.ordem_disciplina) || { sum: 0, count: 0 };
        cur.sum += r.dias_aulas_ativacao;
        cur.count++;
        orderMap.set(r.ordem_disciplina, cur);
      }
    }
    return Array.from(orderMap.entries())
      .map(([ordem, v]) => ({ ordem, media: Math.round((v.sum / v.count) * 10) / 10 }))
      .sort((a, b) => a.ordem - b.ordem);
  }, [filtered]);

  const activationTotal = useMemo(() => activationByOrder.reduce((s, d) => s + 1, 0), [activationByOrder]);
  const activationStudents = useMemo(() => {
    const seen = new Set<number>();
    for (const r of filtered) {
      if (r.disciplina_regular === 1 && r.dias_aulas_ativacao !== null && r.dias_aulas_ativacao > 0) seen.add(r.ra);
    }
    return seen.size;
  }, [filtered]);


  // ─── SCORE DISTRIBUTION ───
  const scoreDistribution = useMemo(() => {
    let saudavel = 0, atencao = 0, altoRisco = 0;
    groupedByRA.forEach(recs => {
      const score = calcEngagementScore(recs, scoreRules);
      const cls = classifyScore(score);
      if (cls === "Saudável") saudavel++;
      else if (cls === "Atenção") atencao++;
      else altoRisco++;
    });
    return { saudavel, atencao, altoRisco, total: groupedByRA.size };
  }, [groupedByRA, scoreRules]);

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Carregando dados de engajamento...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="rounded-lg border border-border bg-card p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <span className="text-[10px] font-medium text-muted-foreground block mb-1">Curso</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-7 text-xs w-[200px] justify-between font-normal">
                  {selectedCursos.length === 0 ? "Todos os cursos" : `${selectedCursos.length} selecionado(s)`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-2" align="start">
                <input type="text" placeholder="Buscar curso..." value={cursoSearch} onChange={e => setCursoSearch(e.target.value)}
                  className="w-full mb-2 px-2 py-1.5 text-xs rounded border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
                <div className="max-h-[250px] overflow-y-auto">
                  {cursoList.filter(c => c.toLowerCase().includes(cursoSearch.toLowerCase())).map(c => (
                    <label key={c} className="flex items-center gap-2 px-2 py-1 hover:bg-muted rounded text-xs cursor-pointer">
                      <Checkbox checked={selectedCursos.includes(c)} onCheckedChange={() => {
                        startTransition(() => setSelectedCursos(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]));
                      }} />
                      <span className="truncate">{c}</span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <span className="text-[10px] font-medium text-muted-foreground block mb-1">Disc. Aluno</span>
            <Select value={selectedOrdemAluno} onValueChange={v => startTransition(() => setSelectedOrdemAluno(v))}>
              <SelectTrigger className="h-7 text-xs w-[90px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {ordensAlunoList.map(o => <SelectItem key={o} value={String(o)}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <span className="text-[10px] font-medium text-muted-foreground block mb-1">Regular</span>
            <Select value={selectedRegular} onValueChange={v => startTransition(() => setSelectedRegular(v))}>
              <SelectTrigger className="h-7 text-xs w-[90px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="1">Sim</SelectItem>
                <SelectItem value="0">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <span className="text-[10px] font-medium text-muted-foreground block mb-1">Progresso</span>
            <Select value={selectedProgress} onValueChange={v => startTransition(() => setSelectedProgress(v))}>
              <SelectTrigger className="h-7 text-xs w-[100px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos</SelectItem>
                <SelectItem value="0-0.2">{'<20%'}</SelectItem>
                <SelectItem value="0.2-0.4">20–40%</SelectItem>
                <SelectItem value="0.4-0.6">40–60%</SelectItem>
                <SelectItem value="0.6-0.8">60–80%</SelectItem>
                <SelectItem value="0.8-1.01">80–100%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-1 mt-3">
            <Button variant="ghost" size="sm" onClick={resetFilters} disabled={!hasFilters}
              className={cn("h-7 px-2", hasFilters ? "text-destructive hover:text-destructive" : "text-muted-foreground")} title="Resetar filtros">
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground" title="Configurar Score" onClick={() => setScoreModalOpen(true)}>
              <Settings2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Score Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TooltipProvider delayDuration={200}>
        <div className="rounded-lg border border-border bg-card p-4 border-l-4 border-l-success">
          <div className="flex items-start justify-between">
            <div><p className="text-sm font-medium text-muted-foreground">Saudável</p>
              <p className="text-3xl font-bold tracking-tight text-success">{scoreDistribution.saudavel}</p>
              <p className="text-[10px] text-muted-foreground">{scoreDistribution.total ? ((scoreDistribution.saudavel / scoreDistribution.total) * 100).toFixed(0) : 0}% dos alunos</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="rounded-lg bg-secondary p-2.5"><ShieldCheck className="h-5 w-5 text-success" /></div>
              <Tooltip>
                <TooltipTrigger asChild><Info className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help hover:text-muted-foreground transition-colors" /></TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[250px] text-[10px]"><p>Score ≥ −1. Nenhuma ou apenas 1 penalidade leve. Penalidades atuais: sem login ({scoreRules.penaltyNoLogin}), sem ativação ({scoreRules.penaltyNoActivation}), progresso &lt;{scoreRules.progressThreshold}% ({scoreRules.penaltyLowProgress}), login &gt;{scoreRules.loginDaysThreshold}d ({scoreRules.penaltyOldLogin}), sem questionário ({scoreRules.penaltyNoQuiz}).</p></TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 border-l-4 border-l-warning">
          <div className="flex items-start justify-between">
            <div><p className="text-sm font-medium text-muted-foreground">Atenção</p>
              <p className="text-3xl font-bold tracking-tight text-warning">{scoreDistribution.atencao}</p>
              <p className="text-[10px] text-muted-foreground">{scoreDistribution.total ? ((scoreDistribution.atencao / scoreDistribution.total) * 100).toFixed(0) : 0}% dos alunos</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="rounded-lg bg-secondary p-2.5"><AlertTriangle className="h-5 w-5 text-warning" /></div>
              <Tooltip>
                <TooltipTrigger asChild><Info className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help hover:text-muted-foreground transition-colors" /></TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[250px] text-[10px]"><p>Score entre −2 e −3. Aluno com algumas pendências (ex: login antigo &gt;{scoreRules.loginDaysThreshold} dias, progresso &lt;{scoreRules.progressThreshold}% ou sem questionário).</p></TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 border-l-4 border-l-destructive">
          <div className="flex items-start justify-between">
            <div><p className="text-sm font-medium text-muted-foreground">Alto Risco</p>
              <p className="text-3xl font-bold tracking-tight text-destructive">{scoreDistribution.altoRisco}</p>
              <p className="text-[10px] text-muted-foreground">{scoreDistribution.total ? ((scoreDistribution.altoRisco / scoreDistribution.total) * 100).toFixed(0) : 0}% dos alunos</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="rounded-lg bg-secondary p-2.5"><ShieldAlert className="h-5 w-5 text-destructive" /></div>
              <Tooltip>
                <TooltipTrigger asChild><Info className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help hover:text-muted-foreground transition-colors" /></TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[250px] text-[10px]"><p>Score ≤ −4. Múltiplas pendências críticas (sem login, sem ativação, progresso &lt;{scoreRules.progressThreshold}%, login antigo, sem questionário).</p></TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
        </TooltipProvider>
      </div>

      {/* Funnels — per IES on Geral, single otherwise */}
      <div className={cn("grid gap-4", funnelsByIES.length > 1 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 lg:grid-cols-2")}>
        {funnelsByIES.map(({ iesLabel, data }) => (
          <FunnelChart
            key={iesLabel}
            data={data}
            title={funnelsByIES.length > 1 ? `Funil — ${iesLabel}` : "Funil de Engajamento"}
            metas={funnelMetas}
            onMetasChange={setFunnelMetas}
            compact={funnelsByIES.length > 1}
          />
        ))}

        {/* Login Distribution — only show alongside single funnel */}
        {funnelsByIES.length === 1 && (
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-card-foreground">Distribuição — Dias até Login</h3>
              <span className="text-[10px] text-muted-foreground">Total: {loginDistTotal} estudantes</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={loginDistData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 13%, 91%)", borderRadius: "8px", fontSize: "11px" }} />
                <Bar dataKey="value" fill="hsl(222, 59%, 20%)" radius={[4, 4, 0, 0]} name="Alunos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Login Distribution — full width when multiple funnels */}
      {funnelsByIES.length > 1 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-card-foreground">Distribuição — Dias até Login</h3>
            <span className="text-[10px] text-muted-foreground">Total: {loginDistTotal} estudantes</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={loginDistData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
              <RechartsTooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 13%, 91%)", borderRadius: "8px", fontSize: "11px" }} />
              <Bar dataKey="value" fill="hsl(222, 59%, 20%)" radius={[4, 4, 0, 0]} name="Alunos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Activation Time by Order */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-card-foreground">Tempo Médio até Ativação por Ordem da Disciplina</h3>
          <span className="text-[10px] text-muted-foreground">Total: {activationStudents} estudantes</span>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={activationByOrder}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
            <XAxis dataKey="ordem" tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} label={{ value: "Ordem Disciplina", position: "insideBottom", offset: -5, fontSize: 10, fill: "hsl(220, 9%, 46%)" }} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} label={{ value: "Dias", angle: -90, position: "insideLeft", fontSize: 10, fill: "hsl(220, 9%, 46%)" }} />
            <RechartsTooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 13%, 91%)", borderRadius: "8px", fontSize: "11px" }}
              formatter={(v: number) => [`${v} dias`, "Média"]} />
            <Line type="monotone" dataKey="media" stroke="hsl(16, 80%, 58%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(16, 80%, 58%)" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Funnels by Ordem do Aluno — single IES only */}
      {isSingleIES && funnelsByOrdemAluno.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-card-foreground">Funis por Disciplina do Aluno</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {funnelsByOrdemAluno.map(({ ordem, data }) => (
              <FunnelChart
                key={ordem}
                data={data}
                title={`Disciplina ${ordem} do Aluno`}
                metas={funnelMetas}
                onMetasChange={setFunnelMetas}
                compact
              />
            ))}
          </div>
        </div>
      )}

      <ScoreRulesModal open={scoreModalOpen} onOpenChange={setScoreModalOpen} rules={scoreRules} onSave={setScoreRules} />
    </div>
  );
};

export default JourneyDetailPage;
