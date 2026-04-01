import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const evasionReasons = [
  { name: "Financeiro", value: 35, color: "hsl(16, 80%, 58%)" },
  { name: "Tempo", value: 25, color: "hsl(222, 59%, 20%)" },
  { name: "Insatisfação", value: 20, color: "hsl(38, 92%, 50%)" },
  { name: "Pessoal", value: 12, color: "hsl(152, 60%, 40%)" },
  { name: "Outro", value: 8, color: "hsl(210, 80%, 55%)" },
];

const EvasionCard = () => (
  <div className="rounded-lg border border-border bg-card p-4">
    <h3 className="text-sm font-semibold text-card-foreground mb-2">Motivos de Evasão</h3>
    <div className="flex items-center gap-2">
      <ResponsiveContainer width="45%" height={120}>
        <PieChart>
          <Pie
            data={evasionReasons}
            cx="50%"
            cy="50%"
            innerRadius={28}
            outerRadius={48}
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
      <div className="space-y-1.5 flex-1">
        {evasionReasons.map((reason) => (
          <div key={reason.name} className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: reason.color }} />
              <span className="text-muted-foreground">{reason.name}</span>
            </div>
            <span className="font-semibold text-card-foreground">{reason.value}%</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default EvasionCard;
