import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  loadNpsData, calcNPS, getCycles, getIESList, getCursoList, getWordFrequencies,
  iesDisplayMap, iesColors, tabIdToIes, exportRecordsToCsv, parseRecords, mergeRecords,
  loadExtraRecordsFromStorage, saveExtraRecordsToStorage,
  type NPSRecord, type NPSClassification,
} from "@/data/npsData";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend,
  Bar, ComposedChart, LabelList, PieChart, Pie, Cell,
} from "recharts";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ThumbsUp, ThumbsDown, Minus, RotateCcw, Download, Upload, ClipboardCheck } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import NPSGauge from "@/components/nps/NPSGauge";
import WordCloudCard from "@/components/nps/WordCloudCard";
import ExpandableCard from "@/components/nps/ExpandableCard";
import ClassificationValidationModal from "@/components/nps/ClassificationValidationModal";
import NPSEngagementCharts from "@/components/nps/NPSEngagementCharts";

const PIE_COLORS: Record<string, string> = {
  "Acadêmico": "hsl(220, 70%, 50%)",
  "Atendimento": "hsl(0, 70%, 55%)",
  "Comercial": "hsl(38, 92%, 50%)",
  "Produto": "hsl(280, 60%, 50%)",
  "Comunicações": "hsl(170, 60%, 40%)",
  "Operações (Serviços)": "hsl(340, 60%, 50%)",
  "IES": "hsl(200, 70%, 45%)",
};

const NEGATIVE_CATEGORIES = Object.keys(PIE_COLORS);

interface NPSDetailPageProps {
  activeIES?: string[];
}

const NPSDetailPage = ({ activeIES = ["geral"] }: NPSDetailPageProps) => {
  const [npsRecords, setNpsRecords] = useState<NPSRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCycles, setSelectedCycles] = useState<string[]>([]);
  const [selectedMaturidade, setSelectedMaturidade] = useState<string>("todas");
  const [selectedCursos, setSelectedCursos] = useState<string[]>([]);
  const [cursoSearch, setCursoSearch] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [validationOpen, setValidationOpen] = useState(false);

  useEffect(() => {
    loadNpsData().then((records) => {
      setNpsRecords(records);
      setLoading(false);
    });
  }, []);

  // Build classifications map from record fields
  const classifications = useMemo(() => {
    const map = new Map<string, NPSClassification>();
    for (const r of npsRecords) {
      if (r.categoria) {
        map.set(r.response_id, { categoria: r.categoria, subcategoria: r.subcategoria || "" });
      }
    }
    return map;
  }, [npsRecords]);

  // Handle CSV upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;
      const incoming = parseRecords(text);
      const { merged, newOnly } = mergeRecords(npsRecords, incoming);
      if (newOnly.length === 0) {
        console.log("Nenhum registro novo encontrado (todos os response_id já existem).");
        return;
      }
      const prevExtras = loadExtraRecordsFromStorage();
      const { newOnly: reallyNew } = mergeRecords(prevExtras, newOnly);
      saveExtraRecordsToStorage([...prevExtras, ...reallyNew]);
      setNpsRecords(merged);
    };
    reader.readAsText(file);
    e.target.value = "";
  }, [npsRecords]);

  const iesFilters = useMemo(() => {
    if (activeIES.includes("geral")) return null;
    return activeIES.map((id) => tabIdToIes[id]).filter(Boolean);
  }, [activeIES]);

  const allCycles = useMemo(() => getCycles(npsRecords), [npsRecords]);
  const allIES = useMemo(() => getIESList(npsRecords), [npsRecords]);

  const filtered = useMemo(() => {
    let data = npsRecords;
    if (iesFilters) data = data.filter((r) => iesFilters.includes(r.nome_ies));
    if (selectedCycles.length > 0) data = data.filter((r) => selectedCycles.includes(`${r.ano}.${r.ciclo}`));
    if (selectedMaturidade !== "todas") data = data.filter((r) => r.maturidade === selectedMaturidade);
    if (selectedCursos.length > 0) data = data.filter((r) => selectedCursos.includes(r.curso_ajustado));
    return data;
  }, [npsRecords, iesFilters, selectedCycles, selectedMaturidade, selectedCursos]);

  const cursoList = useMemo(() => getCursoList(iesFilters ? npsRecords.filter(r => iesFilters.includes(r.nome_ies)) : npsRecords), [npsRecords, iesFilters]);

  const npsValue = calcNPS(filtered);
  const totalVotos = filtered.length;
  const promotores = filtered.filter((r) => r.classificacao === "Promotor").length;
  const neutros = filtered.filter((r) => r.classificacao === "Neutro").length;
  const detratores = filtered.filter((r) => r.classificacao === "Detrator").length;
  const npsCalouro = calcNPS(filtered.filter((r) => r.maturidade === "Calouro"));
  const npsVeterano = calcNPS(filtered.filter((r) => r.maturidade === "Veterano"));
  const qtdCalouro = filtered.filter((r) => r.maturidade === "Calouro").length;
  const qtdVeterano = filtered.filter((r) => r.maturidade === "Veterano").length;

  const chartData = useMemo(() => {
    const activeCycles = selectedCycles.length > 0 ? selectedCycles : allCycles;
    const activeIESKeys = iesFilters ? iesFilters : allIES;
    return activeCycles.map((cycle) => {
      const [ano, ciclo] = cycle.split(".").map(Number);
      const row: Record<string, string | number | null> = { cycle };
      for (const ies of activeIESKeys) {
        let data = npsRecords.filter((r) => r.ano === ano && r.ciclo === ciclo && r.nome_ies === ies);
        if (selectedMaturidade !== "todas") data = data.filter((r) => r.maturidade === selectedMaturidade);
        if (selectedCursos.length > 0) data = data.filter((r) => selectedCursos.includes(r.curso_ajustado));
        row[ies] = data.length > 0 ? calcNPS(data) : null;
      }
      return row;
    });
  }, [iesFilters, selectedCycles, selectedMaturidade, selectedCursos, allCycles, allIES, npsRecords]);

  const activeIESKeys = iesFilters ? iesFilters : allIES;

  const calourovVeterano = useMemo(() => {
    const activeCycles = selectedCycles.length > 0 ? selectedCycles : allCycles;
    return activeCycles.map((cycle) => {
      const [ano, ciclo] = cycle.split(".").map(Number);
      let cycleData = npsRecords.filter((r) => r.ano === ano && r.ciclo === ciclo);
      if (iesFilters) cycleData = cycleData.filter((r) => iesFilters.includes(r.nome_ies));
      if (selectedCursos.length > 0) cycleData = cycleData.filter((r) => selectedCursos.includes(r.curso_ajustado));
      const calouros = cycleData.filter((r) => r.maturidade === "Calouro");
      const veteranos = cycleData.filter((r) => r.maturidade === "Veterano");
      const total = cycleData.length || 1;
      return {
        cycle,
        npsCalouro: calcNPS(calouros),
        npsVeterano: calcNPS(veteranos),
        npsGeral: calcNPS(cycleData),
        pctCalouro: Math.round((calouros.length / total) * 100),
        pctVeterano: Math.round((veteranos.length / total) * 100),
      };
    });
  }, [npsRecords, iesFilters, selectedCycles, selectedCursos, allCycles]);

  // Category pie chart data
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    let positivo = 0, irrelevante = 0, semResposta = 0;

    for (const r of filtered) {
      const cls = classifications.get(r.response_id);
      if (!cls) continue;
      const cat = cls.categoria;
      if (cat === "Positivo") { positivo++; continue; }
      if (cat === "Irrelevante") { irrelevante++; continue; }
      if (cat === "Sem resposta" || !cat) { semResposta++; continue; }
      if (NEGATIVE_CATEGORIES.includes(cat)) {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    }

    const pieData = Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { pieData, positivo, irrelevante, semResposta };
  }, [filtered, classifications]);

  const wordPromotor = useMemo(() => getWordFrequencies(filtered.filter(r => r.classificacao === "Promotor"), 40), [filtered]);
  const wordDetrator = useMemo(() => getWordFrequencies(filtered.filter(r => r.classificacao === "Detrator"), 40), [filtered]);

  const cursosRelevantes = useMemo(() => {
    const cursoFiltered = filtered.filter(r => r.curso_ajustado !== "Curso não informado");
    const map = new Map<string, { total: number; ies: string }>();
    cursoFiltered.forEach((r) => {
      const cur = map.get(r.curso_ajustado) || { total: 0, ies: r.nome_ies };
      cur.total++;
      map.set(r.curso_ajustado, cur);
    });
    const totalGeral = cursoFiltered.length || 1;
    return Array.from(map.entries())
      .map(([curso, v]) => ({
        curso,
        ies: iesDisplayMap[v.ies] || v.ies,
        nps: calcNPS(cursoFiltered.filter((r) => r.curso_ajustado === curso)),
        votos: v.total,
        representatividade: ((v.total / totalGeral) * 100).toFixed(1),
      }))
      .sort((a, b) => b.votos - a.votos)
      .slice(0, 15);
  }, [filtered]);

  const toggleCycle = (cycle: string) => {
    setSelectedCycles((prev) => prev.includes(cycle) ? prev.filter((c) => c !== cycle) : [...prev, cycle]);
  };

  const toggleCurso = (curso: string) => {
    setSelectedCursos((prev) => prev.includes(curso) ? prev.filter((c) => c !== curso) : [...prev, curso]);
  };

  const resetFilters = () => {
    setSelectedCycles([]);
    setSelectedMaturidade("todas");
    setSelectedCursos([]);
  };

  const hasFilters = selectedCycles.length > 0 || selectedMaturidade !== "todas" || selectedCursos.length > 0;

  const downloadCsv = (useFiltered: boolean) => {
    const data = useFiltered ? filtered : npsRecords;
    const csv = exportRecordsToCsv(data, classifications.size > 0 ? classifications : undefined);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nps_${useFiltered ? "filtrado" : "completo"}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const CalouroTopLabel = (props: any) => {
    const { x, y, width, value } = props;
    return <text x={x + width / 2} y={y - 4} textAnchor="middle" fontSize={9} fill="hsl(220, 9%, 46%)">{value}</text>;
  };
  const VeteranoTopLabel = (props: any) => {
    const { x, y, width, value } = props;
    return <text x={x + width / 2} y={y - 4} textAnchor="middle" fontSize={9} fill="hsl(220, 9%, 46%)">{value}</text>;
  };

  const classifiedTotal = filtered.filter(r => classifications.has(r.response_id)).length;
  const classifiedPct = totalVotos > 0 ? Math.round((classifiedTotal / totalVotos) * 100) : 0;

  return (
    <div className="space-y-4">
      {loading && (
        <div className="flex items-center justify-center py-20 text-muted-foreground">Carregando dados...</div>
      )}
      {!loading && <>
      {/* Filters */}
      <div className="rounded-lg border border-border bg-card p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[180px]">
            <span className="text-[10px] font-medium text-muted-foreground block mb-1">Ciclo</span>
            <div className="flex gap-1 flex-wrap">
              {allCycles.map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => toggleCycle(cycle)}
                  className={cn(
                    "px-2 py-0.5 text-[10px] font-semibold rounded-full border transition-all",
                    selectedCycles.includes(cycle)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-muted-foreground border-border hover:border-muted-foreground"
                  )}
                >
                  {cycle}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[10px] font-medium text-muted-foreground block mb-1">Maturidade</span>
            <Select value={selectedMaturidade} onValueChange={setSelectedMaturidade}>
              <SelectTrigger className="h-7 text-xs w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="Calouro">Calouro</SelectItem>
                <SelectItem value="Veterano">Veterano</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <span className="text-[10px] font-medium text-muted-foreground block mb-1">Curso</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-7 text-xs w-[200px] justify-between font-normal">
                  {selectedCursos.length === 0 ? "Todos os cursos" : `${selectedCursos.length} selecionado(s)`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-2" align="start">
                <input
                  type="text"
                  placeholder="Buscar curso..."
                  value={cursoSearch}
                  onChange={(e) => setCursoSearch(e.target.value)}
                  className="w-full mb-2 px-2 py-1.5 text-xs rounded border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <div className="max-h-[250px] overflow-y-auto">
                  {cursoList
                    .filter((c) => c.toLowerCase().includes(cursoSearch.toLowerCase()))
                    .map((c) => (
                      <label key={c} className="flex items-center gap-2 px-2 py-1 hover:bg-muted rounded text-xs cursor-pointer">
                        <Checkbox
                          checked={selectedCursos.includes(c)}
                          onCheckedChange={() => toggleCurso(c)}
                        />
                        <span className="truncate">{c}</span>
                      </label>
                    ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-end gap-1 mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              disabled={!hasFilters}
              className={cn("h-7 px-2", hasFilters ? "text-destructive hover:text-destructive" : "text-muted-foreground")}
              title="Resetar filtros"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground" title="Baixar base">
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-1" align="end">
                <button
                  onClick={() => downloadCsv(true)}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted rounded"
                >
                  Baixar com filtros atuais
                </button>
                <button
                  onClick={() => downloadCsv(false)}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted rounded"
                >
                  Baixar base completa
                </button>
              </PopoverContent>
            </Popover>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground"
              title="Subir nova base CSV"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground"
              title="Validar categorizações"
              onClick={() => setValidationOpen(true)}
            >
              <ClipboardCheck className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Row 1: Gauge + Proportions | NPS por Ciclo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4 flex flex-col items-center gap-3">
          <NPSGauge value={npsValue} />
          <div className="flex gap-4 mt-1">
            <div className="flex items-center gap-1.5">
              <ThumbsUp className="h-4 w-4 text-success" />
              <div>
                <span className="text-xs font-bold text-success">PROMOTOR</span>
                <div className="text-[10px] text-muted-foreground">{promotores} ({totalVotos ? ((promotores / totalVotos) * 100).toFixed(0) : 0}%)</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Minus className="h-4 w-4 text-warning" />
              <div>
                <span className="text-xs font-bold text-warning">NEUTRO</span>
                <div className="text-[10px] text-muted-foreground">{neutros} ({totalVotos ? ((neutros / totalVotos) * 100).toFixed(0) : 0}%)</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <ThumbsDown className="h-4 w-4 text-destructive" />
              <div>
                <span className="text-xs font-bold text-destructive">DETRATOR</span>
                <div className="text-[10px] text-muted-foreground">{detratores} ({totalVotos ? ((detratores / totalVotos) * 100).toFixed(0) : 0}%)</div>
              </div>
            </div>
          </div>
          <div className="w-full border-t border-border pt-2 mt-1">
            <div className="text-[10px] font-semibold text-muted-foreground text-center mb-1">Calouro / Veterano</div>
            <div className="flex justify-center gap-6 text-xs">
              <div className="text-center">
                <span className="font-bold text-foreground">{npsCalouro}</span>
                <div className="text-[9px] text-muted-foreground">{qtdCalouro} votos</div>
              </div>
              <div className="text-muted-foreground">/</div>
              <div className="text-center">
                <span className="font-bold text-foreground">{npsVeterano}</span>
                <div className="text-[9px] text-muted-foreground">{qtdVeterano} votos</div>
              </div>
            </div>
          </div>
        </div>

        <ExpandableCard title="NPS por Ciclo" className="lg:col-span-2 rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">NPS por Ciclo</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="cycle" tick={{ fontSize: 10, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
              <YAxis domain={[-30, 100]} tick={{ fontSize: 10, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 13%, 91%)", borderRadius: "8px", fontSize: "11px" }} />
              <Legend wrapperStyle={{ fontSize: "9px" }} formatter={(v: string) => iesDisplayMap[v] || v} />
              <ReferenceLine y={60} stroke="hsl(0, 72%, 51%)" strokeDasharray="6 3" strokeWidth={2} label={{ value: "Meta: 60", position: "right", fontSize: 9, fill: "hsl(0, 72%, 51%)" }} />
              {activeIESKeys.map((ies) => (
                <Line key={ies} type="monotone" dataKey={ies} stroke={iesColors[ies] || "hsl(220, 9%, 46%)"} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ExpandableCard>
      </div>

      {/* Row 2: Calouro vs Veterano + Pizza Categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ExpandableCard title="Calouro vs Veterano" className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">Calouro vs Veterano</h3>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={calourovVeterano}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="cycle" tick={{ fontSize: 10, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="nps" domain={[-20, 100]} tick={{ fontSize: 10, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: "11px", borderRadius: "8px", background: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 13%, 91%)" }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = { npsCalouro: "NPS Calouro", npsVeterano: "NPS Veterano", npsGeral: "NPS Geral" };
                  return [value, labels[name] || name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: "9px" }} formatter={(v: string) => {
                const labels: Record<string, string> = { npsCalouro: "Calouro", npsVeterano: "Veterano", npsGeral: "NPS Geral" };
                return labels[v] || v;
              }} />
              <Bar yAxisId="nps" dataKey="npsCalouro" fill="hsl(220, 13%, 75%)" radius={[3, 3, 0, 0]} barSize={24}>
                <LabelList content={<CalouroTopLabel />} />
              </Bar>
              <Bar yAxisId="nps" dataKey="npsVeterano" fill="hsl(220, 13%, 40%)" radius={[3, 3, 0, 0]} barSize={24}>
                <LabelList content={<VeteranoTopLabel />} />
              </Bar>
              <Line yAxisId="nps" type="monotone" dataKey="npsGeral" stroke="hsl(340, 70%, 50%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(340, 70%, 50%)" }}>
                <LabelList dataKey="npsGeral" position="top" fontSize={9} fill="hsl(340, 70%, 50%)" offset={12} />
              </Line>
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex gap-2 mt-1 overflow-x-auto justify-center">
            {calourovVeterano.map((d) => (
              <div key={d.cycle} className="text-center min-w-[60px]">
                <div className="text-[9px] text-muted-foreground">{d.cycle}</div>
                <div className="text-[9px] font-medium text-muted-foreground">{d.pctCalouro}% / {d.pctVeterano}%</div>
              </div>
            ))}
          </div>
        </ExpandableCard>

        <ExpandableCard title="Categorias das Respostas" className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">Categorias das Respostas</h3>
          {categoryData.pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={categoryData.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={true}
                    fontSize={9}
                  >
                    {categoryData.pieData.map((entry) => (
                      <Cell key={entry.name} fill={PIE_COLORS[entry.name] || "hsl(220, 9%, 60%)"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontSize: "11px", borderRadius: "8px", background: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 13%, 91%)" }}
                    formatter={(value: number) => [value, "Respostas"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2 text-[9px] text-muted-foreground">
                <span>Positivo: {categoryData.positivo} ({totalVotos ? ((categoryData.positivo / totalVotos) * 100).toFixed(1) : 0}%)</span>
                <span>Irrelevante: {categoryData.irrelevante} ({totalVotos ? ((categoryData.irrelevante / totalVotos) * 100).toFixed(1) : 0}%)</span>
                <span>Sem resposta: {categoryData.semResposta} ({totalVotos ? ((categoryData.semResposta / totalVotos) * 100).toFixed(1) : 0}%)</span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-xs text-muted-foreground">
              {classifiedPct === 0 ? "Nenhuma categorização encontrada. Suba uma base com as colunas 'categoria' e 'subcategoria'." : "Sem dados de categoria"}
            </div>
          )}
        </ExpandableCard>
      </div>

      {/* Row 3: Word clouds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ExpandableCard title="Motivos — Promotores" className="">
          <WordCloudCard words={wordPromotor} title="Motivos — Promotores" variant="promotor" />
        </ExpandableCard>
        <ExpandableCard title="Motivos — Detratores" className="">
          <WordCloudCard words={wordDetrator} title="Motivos — Detratores" variant="detrator" />
        </ExpandableCard>
      </div>

      {/* Row 4: NPS por Curso */}
      <ExpandableCard title="NPS por Curso" className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-card-foreground">NPS por Curso</h3>
          {(() => {
            const naoInformado = filtered.filter(r => r.curso_ajustado === "Curso não informado").length;
            if (naoInformado === 0) return null;
            const pct = totalVotos > 0 ? ((naoInformado / totalVotos) * 100).toFixed(1) : "0";
            return (
              <span className="text-[9px] text-muted-foreground">
                Cursos não identificados: {pct}% ({naoInformado})
              </span>
            );
          })()}
        </div>
        <div className="overflow-auto max-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px]">Curso</TableHead>
                <TableHead className="text-[10px] text-center">NPS</TableHead>
                <TableHead className="text-[10px] text-center">Votos</TableHead>
                <TableHead className="text-[10px] text-center">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cursosRelevantes.map((row) => (
                <TableRow key={row.curso}>
                  <TableCell className="text-[10px] font-medium max-w-[200px] truncate">{row.curso}</TableCell>
                  <TableCell className={cn("text-[10px] text-center font-bold",
                    row.nps >= 60 ? "text-success" : row.nps >= 30 ? "text-warning" : "text-destructive"
                  )}>{row.nps}</TableCell>
                  <TableCell className="text-[10px] text-center text-muted-foreground">{row.votos}</TableCell>
                  <TableCell className="text-[10px] text-center text-muted-foreground">{row.representatividade}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ExpandableCard>

      {/* NPS × Engajamento */}
      <NPSEngagementCharts npsRecords={filtered} />
      <ClassificationValidationModal
        open={validationOpen}
        onOpenChange={setValidationOpen}
        records={filtered}
        classifications={classifications}
      />
      </>}
    </div>
  );
};

export default NPSDetailPage;
