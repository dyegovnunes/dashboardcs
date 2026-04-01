import { useQuery } from "@tanstack/react-query";
import { externalSupabase } from "@/integrations/supabase/externalClient";

export interface IESInfo {
  id: string;
  nome: string;
  slug: string;
}

export interface AtendimentoRow {
  ies_id: string;
  ies_nome: string;
  periodo: string;
  total_chamados: number;
  ras_unicos: number;
  base_ativa: number | null;
  iab: number | null;
  iab_unicos: number | null;
  ns_pct: number | null;
  chamados_dentro_ns: number;
  tme_minutos: number | null;
  tma_minutos: number | null;
  csat_medio: number | null;
  csat_pct: number | null;
  csat_base: number;
  resolutividade_pct: number | null;
  resolutividade_base: number;
  resolvidos: number;
  transferencias: number;
  rechamadas: number;
}

const MONTH_NAMES: Record<number, string> = {
  0: "Jan", 1: "Fev", 2: "Mar", 3: "Abr", 4: "Mai", 5: "Jun",
  6: "Jul", 7: "Ago", 8: "Set", 9: "Out", 10: "Nov", 11: "Dez",
};

export function formatPeriodo(periodo: string): string {
  const d = new Date(periodo);
  const m = MONTH_NAMES[d.getUTCMonth()];
  const y = String(d.getUTCFullYear()).slice(2);
  return `${m}/${y}`;
}

export function formatPeriodoLabel(periodo: string): string {
  const d = new Date(periodo);
  const monthFull: Record<number, string> = {
    0: "Janeiro", 1: "Fevereiro", 2: "Março", 3: "Abril", 4: "Maio", 5: "Junho",
    6: "Julho", 7: "Agosto", 8: "Setembro", 9: "Outubro", 10: "Novembro", 11: "Dezembro",
  };
  return `${monthFull[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function safeDiv(a: number | null, b: number | null): number | null {
  if (a == null || b == null || b === 0) return null;
  return a / b;
}

function aggregateRows(rows: AtendimentoRow[]): AtendimentoRow {
  const total_chamados = rows.reduce((s, r) => s + (r.total_chamados || 0), 0);
  const ras_unicos = rows.reduce((s, r) => s + (r.ras_unicos || 0), 0);
  const base_ativa = rows.reduce((s, r) => s + (r.base_ativa || 0), 0) || null;
  const chamados_dentro_ns = rows.reduce((s, r) => s + (r.chamados_dentro_ns || 0), 0);
  const csat_base = rows.reduce((s, r) => s + (r.csat_base || 0), 0);
  const resolutividade_base = rows.reduce((s, r) => s + (r.resolutividade_base || 0), 0);
  const resolvidos = rows.reduce((s, r) => s + (r.resolvidos || 0), 0);
  const transferencias = rows.reduce((s, r) => s + (r.transferencias || 0), 0);
  const rechamadas = rows.reduce((s, r) => s + (r.rechamadas || 0), 0);

  const tme_sum = rows.reduce((s, r) => s + (r.tme_minutos || 0) * (r.total_chamados || 0), 0);
  const tma_sum = rows.reduce((s, r) => s + (r.tma_minutos || 0) * (r.total_chamados || 0), 0);
  const csat_medio_sum = rows.reduce((s, r) => s + (r.csat_medio || 0) * (r.csat_base || 0), 0);

  // csat_pct weighted by csat_base
  const csat_positivos_sum = rows.reduce((s, r) => s + (r.csat_pct || 0) * (r.csat_base || 0), 0);

  return {
    ies_id: "todas",
    ies_nome: "Todas",
    periodo: rows[0]?.periodo ?? "",
    total_chamados,
    ras_unicos,
    base_ativa,
    iab: safeDiv(total_chamados, base_ativa),
    iab_unicos: safeDiv(ras_unicos, base_ativa),
    ns_pct: total_chamados > 0 ? chamados_dentro_ns / total_chamados : null,
    chamados_dentro_ns,
    tme_minutos: total_chamados > 0 ? tme_sum / total_chamados : null,
    tma_minutos: total_chamados > 0 ? tma_sum / total_chamados : null,
    csat_medio: csat_base > 0 ? csat_medio_sum / csat_base : null,
    csat_pct: csat_base > 0 ? csat_positivos_sum / csat_base : null,
    csat_base,
    resolutividade_pct: resolutividade_base > 0 ? resolvidos / resolutividade_base : null,
    resolutividade_base,
    resolvidos,
    transferencias,
    rechamadas,
  };
}

// Hook: IES mapping (slug → UUID)
export function useIESMapping() {
  const query = useQuery({
    queryKey: ["ies-mapping"],
    queryFn: async () => {
      const { data, error } = await externalSupabase
        .from("ies")
        .select("id, nome, slug")
        .order("nome");
      if (error) throw new Error(error.message);
      return (data ?? []) as IESInfo[];
    },
    staleTime: 30 * 60 * 1000,
  });

  function slugToIesId(slug: string): string | null {
    if (slug === "geral") return null;
    return query.data?.find((i) => i.slug === slug)?.id ?? null;
  }

  return { ...query, iesList: query.data ?? [], slugToIesId };
}

export function useAtendimentoData(iesUuid?: string | null) {
  const query = useQuery({
    queryKey: ["atendimento", "vw_iab_ns_mensal"],
    queryFn: async () => {
      const { data, error } = await externalSupabase
        .from("vw_iab_ns_mensal")
        .select("*")
        .order("periodo", { ascending: true });

      if (error) throw new Error(error.message);
      return (data ?? []) as AtendimentoRow[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const rawData = query.data ?? [];

  const iesList = Array.from(
    new Map(rawData.map((r) => [r.ies_id, r.ies_nome])).entries()
  ).map(([id, nome]) => ({ id, nome })).sort((a, b) => a.nome.localeCompare(b.nome));

  const monthsSet = new Map<string, string>();
  rawData.forEach((r) => {
    const key = formatPeriodo(r.periodo);
    if (!monthsSet.has(key)) monthsSet.set(key, r.periodo);
  });
  const months = Array.from(monthsSet.entries()).map(([label, raw]) => ({
    value: label,
    raw,
    label: formatPeriodoLabel(raw),
  }));

  // Filter by UUID
  const isAll = !iesUuid;
  const filteredByIes = isAll ? rawData : rawData.filter((r) => r.ies_id === iesUuid);

  const byPeriodo = new Map<string, AtendimentoRow[]>();
  filteredByIes.forEach((r) => {
    const key = r.periodo;
    if (!byPeriodo.has(key)) byPeriodo.set(key, []);
    byPeriodo.get(key)!.push(r);
  });

  const aggregatedData: AtendimentoRow[] = [];
  byPeriodo.forEach((rows) => {
    if (isAll) {
      aggregatedData.push(aggregateRows(rows));
    } else {
      aggregatedData.push(rows[0]);
    }
  });
  aggregatedData.sort((a, b) => a.periodo.localeCompare(b.periodo));

  function getMonthData(monthLabel: string) {
    const idx = aggregatedData.findIndex((r) => formatPeriodo(r.periodo) === monthLabel);
    if (idx < 0) return { current: null, previous: null };
    return {
      current: aggregatedData[idx],
      previous: idx > 0 ? aggregatedData[idx - 1] : null,
    };
  }

  const chartData = aggregatedData.map((r) => ({
    periodo: formatPeriodo(r.periodo),
    iab: r.iab != null ? +(r.iab * 100).toFixed(2) : 0,
    nivelServico: r.ns_pct != null ? +(r.ns_pct * 100).toFixed(1) : 0,
    resolucao: r.resolutividade_pct != null ? +(r.resolutividade_pct * 100).toFixed(1) : 0,
    satisfacao: r.csat_pct != null ? +(r.csat_pct * 100).toFixed(1) : 0,
    volumetria: r.total_chamados || 0,
  }));

  return {
    ...query,
    rawData,
    iesList,
    months,
    aggregatedData,
    chartData,
    getMonthData,
  };
}

// Hook: daily data
export interface DailyRow {
  dia: string;
  total_chamados: number;
  ns_pct: number | null;
  iab_dia: number | null;
  csat_pct: number | null;
  resolutividade_pct: number | null;
  tme_minutos: number | null;
  tma_minutos: number | null;
  volumetria?: number;
}

export function useAtendimentoDiario(iesUuid: string | null, year: number, month: number, enabled: boolean) {
  const startOfMonth = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const endOfMonth = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  return useQuery({
    queryKey: ["atendimento-diario", iesUuid, startOfMonth, endOfMonth],
    enabled,
    queryFn: async () => {
      let q = externalSupabase
        .from("vw_iab_ns_diario")
        .select("*")
        .gte("dia", startOfMonth)
        .lte("dia", endOfMonth)
        .order("dia", { ascending: true });

      if (iesUuid) {
        q = q.eq("ies_id", iesUuid);
      }

      const { data, error } = await q;
      if (error) throw new Error(error.message);

      const rows = data ?? [];

      // If GERAL (no iesUuid), aggregate by day
      if (!iesUuid && rows.length > 0) {
        const grouped: Record<string, {
          dia: string;
          total_chamados: number;
          chamados_dentro_ns: number;
          csat_base: number;
          csat_positivos: number;
          resolvidos: number;
          resolutividade_base: number;
          tme_sum: number;
          tma_sum: number;
        }> = {};

        for (const row of rows) {
          const key = row.dia;
          if (!grouped[key]) {
            grouped[key] = { dia: key, total_chamados: 0, chamados_dentro_ns: 0, csat_base: 0, csat_positivos: 0, resolvidos: 0, resolutividade_base: 0, tme_sum: 0, tma_sum: 0 };
          }
          const g = grouped[key];
          g.total_chamados += row.total_chamados || 0;
          g.chamados_dentro_ns += row.chamados_dentro_ns || 0;
          g.csat_base += row.csat_base || 0;
          g.csat_positivos += row.csat_positivos || 0;
          g.resolvidos += row.resolvidos || 0;
          g.resolutividade_base += row.resolutividade_base || 0;
          g.tme_sum += (row.tme_minutos || 0) * (row.total_chamados || 0);
          g.tma_sum += (row.tma_minutos || 0) * (row.total_chamados || 0);
        }

        return Object.values(grouped).map((d): DailyRow => ({
          dia: d.dia,
          total_chamados: d.total_chamados,
          ns_pct: d.total_chamados > 0 ? d.chamados_dentro_ns / d.total_chamados : null,
          iab_dia: null, // not meaningful for aggregate
          csat_pct: d.csat_base > 0 ? d.csat_positivos / d.csat_base : null,
          resolutividade_pct: d.resolutividade_base > 0 ? d.resolvidos / d.resolutividade_base : null,
          tme_minutos: d.total_chamados > 0 ? d.tme_sum / d.total_chamados : null,
          tma_minutos: d.total_chamados > 0 ? d.tma_sum / d.total_chamados : null,
          volumetria: d.total_chamados,
        }));
      }

      // Single IES: return as-is
      return rows.map((r: any): DailyRow => ({
        dia: r.dia,
        total_chamados: r.total_chamados || 0,
        ns_pct: r.ns_pct,
        iab_dia: r.iab_dia,
        csat_pct: r.csat_pct,
        resolutividade_pct: r.resolutividade_pct,
        tme_minutos: r.tme_minutos,
        tma_minutos: r.tma_minutos,
        volumetria: r.total_chamados || 0,
      }));
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function computeChange(current: number | null, previous: number | null): number | undefined {
  if (current == null || previous == null || previous === 0) return undefined;
  return +((current - previous) / Math.abs(previous) * 100).toFixed(1);
}

export function formatPtBR(value: number | null, decimals = 1): string {
  if (value == null) return "N/D";
  return value.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatPctPtBR(value: number | null, decimals = 1): string {
  if (value == null) return "N/D";
  return `${(value * 100).toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}%`;
}

export function formatIntPtBR(value: number | null): string {
  if (value == null) return "N/D";
  return Math.round(value).toLocaleString("pt-BR");
}
