import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const ChartCard = ({ title, subtitle, children }: ChartCardProps) => (
  <div className="rounded-lg border border-border bg-card p-5">
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const retentionData = [
  { month: "Ago", taxa: 92.1 },
  { month: "Set", taxa: 91.5 },
  { month: "Out", taxa: 90.8 },
  { month: "Nov", taxa: 91.2 },
  { month: "Dez", taxa: 89.7 },
  { month: "Jan", taxa: 90.3 },
];

export const RetentionChart = () => (
  <ChartCard title="Taxa de Retenção" subtitle="Últimos 6 meses">
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={retentionData}>
        <defs>
          <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(222, 59%, 20%)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="hsl(222, 59%, 20%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
        <YAxis domain={[85, 95]} tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
        <Tooltip
          contentStyle={{
            background: "hsl(0, 0%, 100%)",
            border: "1px solid hsl(220, 13%, 91%)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value: number) => [`${value}%`, "Retenção"]}
        />
        <Area type="monotone" dataKey="taxa" stroke="hsl(222, 59%, 20%)" strokeWidth={2} fill="url(#retentionGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  </ChartCard>
);

const evasionReasons = [
  { name: "Financeiro", value: 35, color: "hsl(16, 80%, 58%)" },
  { name: "Tempo", value: 25, color: "hsl(222, 59%, 20%)" },
  { name: "Insatisfação", value: 20, color: "hsl(38, 92%, 50%)" },
  { name: "Pessoal", value: 12, color: "hsl(152, 60%, 40%)" },
  { name: "Outro", value: 8, color: "hsl(210, 80%, 55%)" },
];

export const EvasionReasonsChart = () => (
  <ChartCard title="Motivos de Evasão" subtitle="Distribuição atual">
    <div className="flex items-center gap-4">
      <ResponsiveContainer width="50%" height={200}>
        <PieChart>
          <Pie
            data={evasionReasons}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            dataKey="value"
            strokeWidth={2}
            stroke="hsl(0, 0%, 100%)"
          >
            {evasionReasons.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`${value}%`, ""]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 flex-1">
        {evasionReasons.map((reason) => (
          <div key={reason.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: reason.color }} />
              <span className="text-muted-foreground">{reason.name}</span>
            </div>
            <span className="font-semibold text-card-foreground">{reason.value}%</span>
          </div>
        ))}
      </div>
    </div>
  </ChartCard>
);

const ticketData = [
  { day: "Seg", abertos: 45, resolvidos: 38 },
  { day: "Ter", abertos: 52, resolvidos: 48 },
  { day: "Qua", abertos: 38, resolvidos: 42 },
  { day: "Qui", abertos: 65, resolvidos: 55 },
  { day: "Sex", abertos: 48, resolvidos: 50 },
  { day: "Sáb", abertos: 15, resolvidos: 18 },
  { day: "Dom", abertos: 8, resolvidos: 12 },
];

export const TicketVolumeChart = () => (
  <ChartCard title="Volume de Chamados" subtitle="Última semana">
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={ticketData} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: "hsl(0, 0%, 100%)",
            border: "1px solid hsl(220, 13%, 91%)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        />
        <Bar dataKey="abertos" fill="hsl(16, 80%, 58%)" radius={[4, 4, 0, 0]} name="Abertos" />
        <Bar dataKey="resolvidos" fill="hsl(152, 60%, 40%)" radius={[4, 4, 0, 0]} name="Resolvidos" />
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
);

const journeyData = [
  { step: "Matrícula", alunos: 1200 },
  { step: "Onboarding", alunos: 1120 },
  { step: "1º Módulo", alunos: 980 },
  { step: "Meio Curso", alunos: 850 },
  { step: "Último Módulo", alunos: 780 },
  { step: "Formatura", alunos: 720 },
];

export const JourneyFunnelChart = () => (
  <ChartCard title="Funil de Jornada" subtitle="Coorte atual">
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={journeyData} layout="vertical" barSize={20}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
        <YAxis dataKey="step" type="category" tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} width={90} />
        <Tooltip
          contentStyle={{
            background: "hsl(0, 0%, 100%)",
            border: "1px solid hsl(220, 13%, 91%)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        />
        <Bar dataKey="alunos" fill="hsl(222, 59%, 20%)" radius={[0, 4, 4, 0]} name="Alunos" />
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
);
