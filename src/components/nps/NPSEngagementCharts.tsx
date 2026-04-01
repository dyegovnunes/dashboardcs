import { useMemo, useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { loadEngagementData, uniqueStudents, type EngagementRecord } from "@/data/engagementData";
import type { NPSRecord } from "@/data/npsData";

interface NPSEngagementChartsProps {
  npsRecords: NPSRecord[];
}

const COLORS: Record<string, string> = {
  Promotor: "hsl(152, 60%, 40%)",
  Neutro: "hsl(38, 92%, 50%)",
  Detrator: "hsl(0, 72%, 51%)",
};

const NPSEngagementCharts = ({ npsRecords }: NPSEngagementChartsProps) => {
  const [engData, setEngData] = useState<EngagementRecord[]>([]);

  useEffect(() => {
    loadEngagementData().then(setEngData);
  }, []);

  const engByRA = useMemo(() => {
    const map = new Map<number, EngagementRecord[]>();
    for (const r of engData) {
      if (!map.has(r.ra)) map.set(r.ra, []);
      map.get(r.ra)!.push(r);
    }
    return map;
  }, [engData]);

  // A: NPS Classification × Average Progress
  const progressByNPS = useMemo(() => {
    const groups: Record<string, { sum: number; count: number }> = { Promotor: { sum: 0, count: 0 }, Neutro: { sum: 0, count: 0 }, Detrator: { sum: 0, count: 0 } };
    const seen = new Set<string>();
    for (const r of npsRecords) {
      const key = `${r.ra}-${r.classificacao}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const eng = engByRA.get(r.ra);
      if (!eng) continue;
      const regular = eng.filter(e => e.disciplina_regular === 1);
      if (regular.length === 0) continue;
      const avg = regular.reduce((s, e) => s + e.progresso, 0) / regular.length;
      groups[r.classificacao].sum += avg * 100;
      groups[r.classificacao].count++;
    }
    return ["Promotor", "Neutro", "Detrator"].map(c => ({
      name: c,
      value: groups[c].count > 0 ? Math.round(groups[c].sum / groups[c].count) : 0,
      count: groups[c].count,
    }));
  }, [npsRecords, engByRA]);

  // B: NPS Classification × Average Dias mat/login
  const loginDaysByNPS = useMemo(() => {
    const groups: Record<string, { sum: number; count: number }> = { Promotor: { sum: 0, count: 0 }, Neutro: { sum: 0, count: 0 }, Detrator: { sum: 0, count: 0 } };
    const seen = new Set<string>();
    for (const r of npsRecords) {
      const key = `${r.ra}-${r.classificacao}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const eng = engByRA.get(r.ra);
      if (!eng) continue;
      const student = eng[0];
      if (student.dias_mat_login === null) continue;
      groups[r.classificacao].sum += Math.abs(student.dias_mat_login);
      groups[r.classificacao].count++;
    }
    return ["Promotor", "Neutro", "Detrator"].map(c => ({
      name: c,
      value: groups[c].count > 0 ? Math.round((groups[c].sum / groups[c].count) * 10) / 10 : 0,
      count: groups[c].count,
    }));
  }, [npsRecords, engByRA]);

  // C: NPS Classification × Activation Rate
  const activationByNPS = useMemo(() => {
    const groups: Record<string, { activated: number; total: number }> = { Promotor: { activated: 0, total: 0 }, Neutro: { activated: 0, total: 0 }, Detrator: { activated: 0, total: 0 } };
    const seen = new Set<string>();
    for (const r of npsRecords) {
      const key = `${r.ra}-${r.classificacao}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const eng = engByRA.get(r.ra);
      if (!eng) continue;
      const regular = eng.filter(e => e.disciplina_regular === 1);
      if (regular.length === 0) continue;
      groups[r.classificacao].total++;
      if (regular.some(e => e.realizou_ativacao === 1)) groups[r.classificacao].activated++;
    }
    return ["Promotor", "Neutro", "Detrator"].map(c => ({
      name: c,
      value: groups[c].total > 0 ? Math.round((groups[c].activated / groups[c].total) * 100) : 0,
      count: groups[c].total,
    }));
  }, [npsRecords, engByRA]);

  if (engData.length === 0) return null;

  const chartStyle = { background: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 13%, 91%)", borderRadius: "8px", fontSize: "11px" };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-card-foreground mb-3">NPS × Progresso Médio</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={progressByNPS} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip contentStyle={chartStyle} formatter={(v: number) => [`${v}%`, "Progresso"]} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {progressByNPS.map(d => <Cell key={d.name} fill={COLORS[d.name]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-card-foreground mb-3">NPS × Dias até Login</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={loginDaysByNPS} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={chartStyle} formatter={(v: number) => [`${v} dias`, "Média"]} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {loginDaysByNPS.map(d => <Cell key={d.name} fill={COLORS[d.name]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-card-foreground mb-3">NPS × Taxa de Ativação</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={activationByNPS} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip contentStyle={chartStyle} formatter={(v: number) => [`${v}%`, "Ativação"]} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {activationByNPS.map(d => <Cell key={d.name} fill={COLORS[d.name]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NPSEngagementCharts;
