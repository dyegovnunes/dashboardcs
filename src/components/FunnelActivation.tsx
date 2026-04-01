import { cn } from "@/lib/utils";

interface FunnelData {
  ies: string;
  matriculados: number;
  login: number;
  ativacao: number;
  avaliacao: number;
  metaLogin: number;
  metaAtivacao: number;
  metaAvaliacao: number;
}

const funnelData: FunnelData[] = [
  { ies: "PUC PR", matriculados: 1240, login: 1150, ativacao: 780, avaliacao: 320, metaLogin: 90, metaAtivacao: 70, metaAvaliacao: 35 },
  { ies: "PUC Campinas", matriculados: 890, login: 810, ativacao: 534, avaliacao: 195, metaLogin: 90, metaAtivacao: 70, metaAvaliacao: 35 },
  { ies: "PUC Rio", matriculados: 620, login: 580, ativacao: 410, avaliacao: 165, metaLogin: 90, metaAtivacao: 70, metaAvaliacao: 35 },
  { ies: "Pós Artmed", matriculados: 450, login: 395, ativacao: 270, avaliacao: 98, metaLogin: 90, metaAtivacao: 70, metaAvaliacao: 35 },
  { ies: "HCor", matriculados: 380, login: 360, ativacao: 285, avaliacao: 142, metaLogin: 90, metaAtivacao: 70, metaAvaliacao: 35 },
  { ies: "FDC", matriculados: 310, login: 275, ativacao: 190, avaliacao: 72, metaLogin: 90, metaAtivacao: 70, metaAvaliacao: 35 },
  { ies: "+Campus", matriculados: 280, login: 250, ativacao: 168, avaliacao: 58, metaLogin: 90, metaAtivacao: 70, metaAvaliacao: 35 },
  { ies: "SECAD", matriculados: 220, login: 205, ativacao: 150, avaliacao: 68, metaLogin: 90, metaAtivacao: 70, metaAvaliacao: 35 },
];

const FunnelCard = ({ data }: { data: FunnelData }) => {
  const convLogin = ((data.login / data.matriculados) * 100).toFixed(0);
  const convAtivacao = ((data.ativacao / data.matriculados) * 100).toFixed(0);
  const convAvaliacao = ((data.avaliacao / data.matriculados) * 100).toFixed(0);

  const belowMetaLogin = Number(convLogin) < data.metaLogin;
  const belowMetaAtivacao = Number(convAtivacao) < data.metaAtivacao;
  const belowMetaAvaliacao = Number(convAvaliacao) < data.metaAvaliacao;

  const steps = [
    { label: "Matriculados", value: data.matriculados, conv: null, belowMeta: false },
    { label: "Primeiro login", value: data.login, conv: `${convLogin}%`, belowMeta: belowMetaLogin },
    { label: "Ativação", value: data.ativacao, conv: `${convAtivacao}%`, belowMeta: belowMetaAtivacao },
    { label: "Atividade Aval.", value: data.avaliacao, conv: `${convAvaliacao}%`, belowMeta: belowMetaAvaliacao },
  ];

  const maxValue = data.matriculados;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h4 className="text-xs font-semibold text-card-foreground mb-3">{data.ies}</h4>
      <div className="space-y-2">
        {steps.map((step) => (
          <div key={step.label} className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground w-20 text-right shrink-0">{step.label}</span>
            <div className="flex-1 flex items-center gap-2">
              <div
                className={cn(
                  "h-6 rounded flex items-center justify-center text-[10px] font-bold text-primary-foreground transition-all",
                  step.belowMeta ? "bg-destructive" : "bg-primary"
                )}
                style={{ width: `${Math.max((step.value / maxValue) * 100, 20)}%` }}
              >
                {step.value}
              </div>
              {step.conv && (
                <span className={cn(
                  "text-[10px] font-semibold shrink-0",
                  step.belowMeta ? "text-destructive" : "text-muted-foreground"
                )}>
                  {step.conv}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FunnelActivation = () => (
  <div className="space-y-4">
    <h3 className="text-sm font-semibold text-card-foreground text-center">Funil de Ativação</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {funnelData.map((data) => (
        <FunnelCard key={data.ies} data={data} />
      ))}
    </div>
  </div>
);

export default FunnelActivation;
