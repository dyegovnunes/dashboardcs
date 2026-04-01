import { useAtendimentoData, formatPctPtBR } from "@/hooks/useAtendimentoData";
import { Skeleton } from "@/components/ui/skeleton";

const IESOverviewCards = () => {
  const { rawData, isLoading } = useAtendimentoData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-[120px] rounded-lg" />
        ))}
      </div>
    );
  }

  if (rawData.length === 0) return null;

  // Find the latest periodo
  const latestPeriodo = rawData.reduce((max, r) => (r.periodo > max ? r.periodo : max), rawData[0].periodo);
  const latestRows = rawData.filter((r) => r.periodo === latestPeriodo);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-card-foreground">Indicadores por IES — Último mês disponível</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {latestRows.map((row) => (
          <div key={row.ies_id} className="rounded-lg border border-border bg-card p-4 space-y-2">
            <h4 className="text-sm font-semibold text-card-foreground">{row.ies_nome}</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">NS</span>
                <span className="text-xs font-semibold">{formatPctPtBR(row.ns_pct, 1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">IAB</span>
                <span className="text-xs font-semibold">{formatPctPtBR(row.iab, 1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Resolutividade</span>
                <span className="text-xs font-semibold">{formatPctPtBR(row.resolutividade_pct, 1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">CSAT</span>
                <span className="text-xs font-semibold">{formatPctPtBR(row.csat_pct, 1)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IESOverviewCards;
