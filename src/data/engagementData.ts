export interface EngagementRecord {
  ra: number;
  curso: string;
  codigo_disciplina: number;
  nome_disciplina: string;
  modalidade: string;
  codigo_turma: string;
  situacao_atual_aluno: string;
  curso_iniciado: string;
  data_ingresso: string;
  data_matricula: string;
  data_inicio_disciplina: string;
  data_final_disciplina: string;
  apto_ativacao: number;
  disciplina_atual: number;
  ordem_disciplina: number;
  disciplina_regular: number;
  realizou_ativacao: number;
  dias_aulas_ativacao: number | null;
  primeiro_acesso_disciplina: string;
  ultimo_acesso_disciplina: string;
  progresso: number;
  faixa_progresso: string;
  qtd_acessos: number;
  realizou_questionario: number;
  nota_questionario: number | null;
  primeiro_login_plataforma: string;
  ultimo_login_plataforma: string;
  realizou_login: number;
  dias_mat_login: number | null;
  ies: string;
  ordem_aluno: number;
}

// Map IES display name → tab id (matching IESTabs)
export const iesDisplayToTabId: Record<string, string> = {
  "PUC PR": "puc-pr",
  "PUC Campinas": "puc-campinas",
  "PUC Rio": "puc-rio",
  "Pós Artmed": "pos-artmed",
  "HCOR": "hcor",
  "FDC": "fdc",
};

export const tabIdToEngIES: Record<string, string> = Object.fromEntries(
  Object.entries(iesDisplayToTabId).map(([display, tab]) => [tab, display])
);

// ─── Mock data generator ───
const IES_COURSES: Record<string, string[]> = {
  "PUC PR": ["MBA Gestão Empresarial", "Pós Direito Digital", "MBA Liderança"],
  "PUC Campinas": ["MBA Marketing Digital", "Pós Educação", "MBA Finanças"],
  "PUC Rio": ["MBA Data Science", "Pós Eng. Software", "MBA Inovação"],
  "Pós Artmed": ["Pós Pediatria", "Pós Cardiologia", "Pós Enfermagem"],
  "HCOR": ["Pós Cardiologia Intervencionista", "Pós UTI Adulto", "Pós Hemodinâmica"],
  "FDC": ["MBA Gestão Estratégica", "Pós Liderança", "MBA Negócios"],
};

const DISCIPLINAS = [
  "Fundamentos", "Metodologia", "Gestão de Projetos", "Liderança",
  "Análise de Dados", "Estratégia", "Inovação", "Comunicação",
  "Finanças", "Marketing", "Ética Profissional", "TCC",
];

const CODE_PREFIX: Record<string, string> = {
  "PUC PR": "3113", "PUC Campinas": "4093", "PUC Rio": "4053",
  "Pós Artmed": "5013", "HCOR": "6023", "FDC": "4103",
};

function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

function generateMockRecords(): EngagementRecord[] {
  const records: EngagementRecord[] = [];
  const rand = seededRandom(42);
  let raCounter = 100000;
  const iesList = Object.keys(IES_COURSES);

  for (const ies of iesList) {
    const courses = IES_COURSES[ies];
    const studentsPerIES = 30 + Math.floor(rand() * 10);

    for (let s = 0; s < studentsPerIES; s++) {
      const ra = raCounter++;
      const curso = courses[Math.floor(rand() * courses.length)];
      const numDisc = 2 + Math.floor(rand() * 4); // 2-5 disciplines per student
      const didLogin = rand() > 0.1 ? 1 : 0;
      const diasMatLogin = didLogin ? Math.floor(rand() * 30) : null;
      const loginDate = didLogin ? "2025-01-15" : "";
      const lastLogin = didLogin ? "2026-02-20" : "";

      for (let d = 0; d < numDisc; d++) {
        const ordemDisc = d + 1;
        const isCurrent = d === numDisc - 1 ? 1 : 0;
        const isRegular = rand() > 0.15 ? 1 : 0;
        const didActivation = isRegular && rand() > 0.25 ? 1 : 0;
        const diasAtivacao = didActivation ? 1 + Math.floor(rand() * 20) : null;
        const progresso = didLogin ? Math.round(rand() * 100) / 100 : 0;
        const didQuiz = progresso > 0.5 && rand() > 0.3 ? 1 : 0;
        const prefix = CODE_PREFIX[ies];
        const codDisc = Number(`${prefix}${String(100 + d).padStart(3, "0")}`);

        const faixa = progresso < 0.2 ? "0-20%" : progresso < 0.4 ? "20-40%" : progresso < 0.6 ? "40-60%" : progresso < 0.8 ? "60-80%" : "80-100%";

        records.push({
          ra,
          curso,
          codigo_disciplina: codDisc,
          nome_disciplina: DISCIPLINAS[d % DISCIPLINAS.length],
          modalidade: "EAD",
          codigo_turma: `T${ies.replace(/\s/g, "").substring(0, 3)}-${2025}-${ordemDisc}`,
          situacao_atual_aluno: "Ativo",
          curso_iniciado: "Sim",
          data_ingresso: "2025-01-10",
          data_matricula: "2025-01-05",
          data_inicio_disciplina: `2025-0${1 + d}-01`,
          data_final_disciplina: `2025-0${2 + d}-28`,
          apto_ativacao: isRegular,
          disciplina_atual: isCurrent,
          ordem_disciplina: ordemDisc,
          disciplina_regular: isRegular,
          realizou_ativacao: didActivation,
          dias_aulas_ativacao: diasAtivacao,
          primeiro_acesso_disciplina: didLogin ? "2025-01-16" : "",
          ultimo_acesso_disciplina: didLogin ? "2026-02-18" : "",
          progresso,
          faixa_progresso: faixa,
          qtd_acessos: Math.floor(rand() * 50),
          realizou_questionario: didQuiz,
          nota_questionario: didQuiz ? Math.round(rand() * 100) / 10 : null,
          primeiro_login_plataforma: loginDate,
          ultimo_login_plataforma: lastLogin,
          realizou_login: didLogin,
          dias_mat_login: diasMatLogin,
          ies,
          ordem_aluno: 0, // computed below
        });
      }
    }
  }

  // Post-process: compute ordem_aluno per student (RA)
  const byRA = new Map<number, EngagementRecord[]>();
  for (const r of records) {
    let arr = byRA.get(r.ra);
    if (!arr) { arr = []; byRA.set(r.ra, arr); }
    arr.push(r);
  }
  byRA.forEach(recs => {
    const minOrdem = Math.min(...recs.map(r => r.ordem_disciplina));
    for (const r of recs) {
      r.ordem_aluno = r.ordem_disciplina - minOrdem + 1;
    }
  });

  return records;
}

const _records: EngagementRecord[] = generateMockRecords();

export async function loadEngagementData(): Promise<EngagementRecord[]> {
  return _records;
}

export function getEngagementRecords(): EngagementRecord[] {
  return _records;
}

// Unique students (by RA)
export function uniqueStudents(records: EngagementRecord[]): Map<number, EngagementRecord> {
  const map = new Map<number, EngagementRecord>();
  for (const r of records) {
    if (!map.has(r.ra)) map.set(r.ra, r);
  }
  return map;
}

// Score engine
export interface ScoreRules {
  penaltyNoLogin: number;
  penaltyNoActivation: number;
  penaltyLowProgress: number;
  penaltyOldLogin: number;
  penaltyNoQuiz: number;
  progressThreshold: number;
  loginDaysThreshold: number;
  requireActivation: boolean;
  requireQuiz: boolean;
}

export const defaultScoreRules: ScoreRules = {
  penaltyNoLogin: -2,
  penaltyNoActivation: -2,
  penaltyLowProgress: -1,
  penaltyOldLogin: -1,
  penaltyNoQuiz: -1,
  progressThreshold: 20,
  loginDaysThreshold: 14,
  requireActivation: true,
  requireQuiz: true,
};

export function calcEngagementScore(records: EngagementRecord[], rules: ScoreRules): number {
  let score = 0;
  const hasLogin = records.some(r => r.realizou_login === 1);
  if (!hasLogin) score += rules.penaltyNoLogin;
  const regularRecords = records.filter(r => r.disciplina_regular === 1);
  const hasActivation = regularRecords.some(r => r.realizou_ativacao === 1);
  if (rules.requireActivation && !hasActivation) score += rules.penaltyNoActivation;
  const avgProgress = regularRecords.length > 0
    ? regularRecords.reduce((s, r) => s + r.progresso, 0) / regularRecords.length
    : 0;
  if (avgProgress < rules.progressThreshold) score += rules.penaltyLowProgress;
  const lastLogin = records.map(r => r.ultimo_login_plataforma).filter(Boolean).sort().pop();
  if (lastLogin) {
    const daysSince = Math.floor((Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince > rules.loginDaysThreshold) score += rules.penaltyOldLogin;
  } else {
    score += rules.penaltyOldLogin;
  }
  const hasQuiz = records.some(r => r.realizou_questionario === 1);
  if (rules.requireQuiz && !hasQuiz) score += rules.penaltyNoQuiz;
  return score;
}

export function classifyScore(score: number): "Saudável" | "Atenção" | "Alto risco" {
  if (score >= -1) return "Saudável";
  if (score >= -3) return "Atenção";
  return "Alto risco";
}

export function getCourses(records: EngagementRecord[]): string[] {
  return Array.from(new Set(records.map(r => r.curso))).filter(Boolean).sort();
}

export function getTurmas(records: EngagementRecord[]): string[] {
  return Array.from(new Set(records.map(r => r.codigo_turma))).filter(Boolean).sort();
}

export function getOrdens(records: EngagementRecord[]): number[] {
  return Array.from(new Set(records.map(r => r.ordem_disciplina))).sort((a, b) => a - b);
}

export function getOrdensAluno(records: EngagementRecord[]): number[] {
  return Array.from(new Set(records.map(r => r.ordem_aluno))).sort((a, b) => a - b);
}
