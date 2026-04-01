import { useState } from "react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FunnelMetasModal from "./FunnelMetasModal";

export interface FunnelStep {
  step: string;
  value: number;
  pct: number;
}

export interface FunnelMetas {
  loginMeta: number;
  ativacaoMeta: number;
  questionarioMeta: number;
}

export const defaultFunnelMetas: FunnelMetas = {
  loginMeta: 80,
  ativacaoMeta: 60,
  questionarioMeta: 50,
};

interface FunnelChartProps {
  data: FunnelStep[];
  title: string;
  metas: FunnelMetas;
  onMetasChange: (metas: FunnelMetas) => void;
  compact?: boolean;
}

const BAR_COLOR = "hsl(222, 59%, 35%)";

const FunnelChart = ({ data, title, metas, onMetasChange, compact }: FunnelChartProps) => {
  const [metasOpen, setMetasOpen] = useState(false);

  if (!data.length || data[0].value === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-4 text-center">Sem dados</p>
      </div>
    );
  }

  const maxValue = data[0].value;
  const metaValues = [null, metas.loginMeta, metas.ativacaoMeta, metas.questionarioMeta];

  const conversions: { actual: number; meta: number; hit: boolean; diff: number }[] = [];
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1].value;
    const actual = prev > 0 ? Math.round((data[i].value / prev) * 100) : 0;
    const meta = metaValues[i] ?? 0;
    conversions.push({ actual, meta, hit: actual >= meta, diff: actual - meta });
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">Total: {data[0].value} estudantes</span>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground" onClick={() => setMetasOpen(true)} title="Configurar metas">
            <Settings2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-0">
        {data.map((step, i) => {
          const widthPct = maxValue > 0 ? Math.max(15, (step.value / maxValue) * 100) : 15;

          return (
            <div key={step.step} className="flex flex-col">
              {/* Bar row */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground w-[90px] text-right shrink-0 truncate">
                  {step.step}
                </span>
                <div className="flex-1 flex justify-center" style={{ height: compact ? 28 : 32 }}>
                  <div
                    className="h-full rounded-sm flex items-center justify-center transition-all"
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: BAR_COLOR,
                      minWidth: 40,
                    }}
                  >
                    <span className="text-white text-xs font-semibold">
                      {step.value.toLocaleString("pt-BR")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Conversion indicator */}
              {i < data.length - 1 && (
                <div className="flex items-center justify-center ml-[98px] my-1">
                  <div
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] border"
                    style={{
                      borderColor: conversions[i].hit ? "hsl(152, 60%, 40%)" : "hsl(0, 72%, 51%)",
                      backgroundColor: conversions[i].hit ? "hsl(152, 60%, 95%)" : "hsl(0, 72%, 96%)",
                      color: conversions[i].hit ? "hsl(152, 60%, 30%)" : "hsl(0, 72%, 40%)",
                    }}
                  >
                    <span className="font-bold text-[10px]">{conversions[i].actual}%</span>
                    <span className="opacity-60">|</span>
                    <span>Meta: {conversions[i].meta}%</span>
                    {conversions[i].hit ? <span>▲</span> : <span>▼</span>}
                    <span>{conversions[i].diff > 0 ? "+" : ""}{conversions[i].diff}%</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <FunnelMetasModal open={metasOpen} onOpenChange={setMetasOpen} metas={metas} onSave={onMetasChange} />
    </div>
  );
};

export default FunnelChart;
