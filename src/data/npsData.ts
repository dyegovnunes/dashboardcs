export interface NPSClassification {
  categoria: string;
  subcategoria: string;
}

export interface NPSRecord {
  response_id: string;
  submitted_at: string;
  email: string;
  ra: number;
  nome_ies: string;
  curso_original: string;
  curso_ajustado: string;
  classificacao: "Promotor" | "Neutro" | "Detrator";
  score: number;
  answer: string;
  ano: number;
  ciclo: number;
  situacao_atual_aluno: string;
  dt_encerramento: string;
  situacao_no_nps: string;
  modalidade: string;
  nome_polo: string;
  data_ingresso: string;
  maturidade: "Calouro" | "Veterano";
  canal: string;
  qtd_atendimentos_nexa: number;
  data_ultimo_atendimento_nexa: string;
  tags_nexa: string;
  categoria?: string;
  subcategoria?: string;
}

export function exportRecordsToCsv(
  records: NPSRecord[],
  classifications?: Map<string, NPSClassification>,
): string {
  const headers = [
    "response_id", "submitted_at", "email", "ra", "nome_ies",
    "curso_original", "curso_ajustado", "classificacao", "score", "answer",
    "ano", "ciclo", "situacao_atual_aluno", "dt_encerramento", "situacao_no_nps",
    "modalidade", "nome_polo", "data_ingresso", "maturidade", "canal",
    "qtd_atendimentos_nexa", "data_ultimo_atendimento_nexa", "tags_nexa",
    "categoria", "subcategoria",
  ];
  const escape = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const lines = [headers.join(";")];
  for (const r of records) {
    const cls = classifications?.get(r.response_id);
    const cat = cls?.categoria || r.categoria || "";
    const sub = cls?.subcategoria || r.subcategoria || "";
    const row = [
      r.response_id, r.submitted_at, r.email, String(r.ra), r.nome_ies,
      r.curso_original, r.curso_ajustado, r.classificacao, String(r.score), r.answer,
      String(r.ano), String(r.ciclo), r.situacao_atual_aluno, r.dt_encerramento, r.situacao_no_nps,
      r.modalidade, r.nome_polo, r.data_ingresso, r.maturidade, r.canal,
      String(r.qtd_atendimentos_nexa), r.data_ultimo_atendimento_nexa, r.tags_nexa,
      cat, sub,
    ];
    lines.push(row.map(escape).join(";"));
  }
  return lines.join("\n");
}

// Map CSV IES names → tab IDs (from IESTabs)
export const iesTabIdMap: Record<string, string> = {
  "PUCPR": "puc-pr",
  "PUC-Campinas": "puc-campinas",
  "PUCRIO": "puc-rio",
  "PUCPR-ARTMED": "pos-artmed",
  "PUCPR - HCOR": "hcor",
  "FUNDAÇÃO DOM CABRAL": "fdc",
};

// Map CSV IES names → display names
export const iesDisplayMap: Record<string, string> = {
  "PUCPR": "PUC PR",
  "PUC-Campinas": "PUC Campinas",
  "PUCRIO": "PUC Rio",
  "PUCPR-ARTMED": "Pós Artmed",
  "PUCPR - HCOR": "HCor",
  "FUNDAÇÃO DOM CABRAL": "FDC",
};

// Reverse: tab ID → CSV IES name
export const tabIdToIes: Record<string, string> = Object.fromEntries(
  Object.entries(iesTabIdMap).map(([csv, tab]) => [tab, csv])
);

// Valid IES names (ones that exist in the CSV)
export const validIESNames = Object.keys(iesDisplayMap);

// Colors per CSV IES name
export const iesColors: Record<string, string> = {
  "PUCPR": "hsl(222, 59%, 20%)",
  "PUC-Campinas": "hsl(16, 80%, 58%)",
  "PUCRIO": "hsl(152, 60%, 40%)",
  "PUCPR-ARTMED": "hsl(38, 92%, 50%)",
  "PUCPR - HCOR": "hsl(210, 80%, 55%)",
  "FUNDAÇÃO DOM CABRAL": "hsl(280, 60%, 50%)",
};

// Minimum valid cycle
const MIN_CYCLE = "2024.1";

// ── localStorage helpers ──

const LS_EXTRA_RECORDS = "nps_extra_records";

export function loadExtraRecordsFromStorage(): NPSRecord[] {
  try {
    const raw = localStorage.getItem(LS_EXTRA_RECORDS);
    if (!raw) return [];
    return JSON.parse(raw) as NPSRecord[];
  } catch { return []; }
}

export function saveExtraRecordsToStorage(records: NPSRecord[]) {
  localStorage.setItem(LS_EXTRA_RECORDS, JSON.stringify(records));
}

/** Merge new records into existing, deduplicating by response_id. Returns { merged, newOnly }. */
export function mergeRecords(existing: NPSRecord[], incoming: NPSRecord[]): { merged: NPSRecord[]; newOnly: NPSRecord[] } {
  const ids = new Set(existing.map((r) => r.response_id));
  const newOnly = incoming.filter((r) => !ids.has(r.response_id));
  return { merged: [...existing, ...newOnly], newOnly };
}

// ── CSV parsing ──

let _npsRecords: NPSRecord[] = [];
let _loaded = false;
let _loadPromise: Promise<NPSRecord[]> | null = null;

function parseCsvLine(line: string): string[] {
  return line.split(";").map((v) => v.trim());
}

export function parseRecords(csvText: string): NPSRecord[] {
  const lines = csvText.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headerLine = lines[0].replace(/^\uFEFF/, "");
  const headers = parseCsvLine(headerLine);

  const records: NPSRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length < headers.length) continue;

    const nome_ies = values[5];
    if (!nome_ies || !validIESNames.includes(nome_ies)) continue;

    const score = parseInt(values[9], 10);
    if (isNaN(score)) continue;

    const ano = parseInt(values[11], 10) || 0;
    const ciclo = parseInt(values[12], 10) || 0;

    const cycleStr = `${ano}.${ciclo}`;
    if (cycleStr < MIN_CYCLE) continue;

    const classificacaoRaw = values[8];
    const classificacao: NPSRecord["classificacao"] =
      classificacaoRaw === "Promotor" ? "Promotor" :
      classificacaoRaw === "Neutro" ? "Neutro" : "Detrator";

    const maturidadeRaw = values[19];
    const maturidade: NPSRecord["maturidade"] =
      maturidadeRaw === "Calouro" ? "Calouro" : "Veterano";

    records.push({
      response_id: values[0],
      submitted_at: values[1],
      email: values[2],
      ra: parseInt(values[3], 10) || 0,
      nome_ies,
      curso_original: values[6],
      curso_ajustado: values[7]?.trim() || "Curso não informado",
      classificacao,
      score,
      answer: values[10],
      ano,
      ciclo,
      situacao_atual_aluno: values[13],
      dt_encerramento: values[14],
      situacao_no_nps: values[15],
      modalidade: values[16],
      nome_polo: values[17],
      data_ingresso: values[18],
      maturidade,
      canal: values[20],
      qtd_atendimentos_nexa: parseInt(values[21], 10) || 0,
      data_ultimo_atendimento_nexa: values[22],
      tags_nexa: values[23] || "",
      categoria: values[24]?.trim() || undefined,
      subcategoria: values[25]?.trim() || undefined,
    });
  }

  return records;
}

export async function loadNpsData(): Promise<NPSRecord[]> {
  if (_loaded) return _npsRecords;
  if (_loadPromise) return _loadPromise;

  _loadPromise = fetch("/data/NPS.csv")
    .then((res) => res.text())
    .then((text) => {
      const csvRecords = parseRecords(text);
      const extras = loadExtraRecordsFromStorage();
      const { merged } = mergeRecords(csvRecords, extras);
      _npsRecords = merged;
      _loaded = true;
      return _npsRecords;
    });

  return _loadPromise;
}

export function getNpsRecords(): NPSRecord[] {
  return _npsRecords;
}

export const npsRecords: NPSRecord[] = [];

loadNpsData().then((records) => {
  npsRecords.length = 0;
  npsRecords.push(...records);
});

export function calcNPS(records: NPSRecord[]): number {
  if (records.length === 0) return 0;
  const promotores = records.filter((r) => r.classificacao === "Promotor").length;
  const detratores = records.filter((r) => r.classificacao === "Detrator").length;
  return Math.round(((promotores - detratores) / records.length) * 100);
}

export function getCycles(records: NPSRecord[]): string[] {
  const set = new Set(records.map((r) => `${r.ano}.${r.ciclo}`));
  return Array.from(set).sort();
}

export function getIESList(records: NPSRecord[]): string[] {
  return Array.from(new Set(records.map((r) => r.nome_ies))).filter((n) => validIESNames.includes(n)).sort();
}

export function getCursoList(records: NPSRecord[]): string[] {
  return Array.from(new Set(records.map((r) => r.curso_ajustado))).filter(Boolean).sort();
}

// Extract top words from answers for word cloud
export function getWordFrequencies(records: NPSRecord[], topN = 60): { text: string; value: number }[] {
  const stopWords = new Set([
    "a", "o", "e", "de", "do", "da", "dos", "das", "em", "no", "na", "nos", "nas",
    "um", "uma", "uns", "umas", "para", "com", "por", "que", "se", "não", "nao",
    "mais", "como", "mas", "foi", "são", "sao", "ser", "está", "esta", "isso",
    "esse", "essa", "este", "esta", "muito", "tem", "ter", "os", "as", "ao", "à",
    "meu", "minha", "seu", "sua", "já", "ja", "eu", "me", "nos", "ele", "ela",
    "eles", "elas", "é", "também", "tambem", "só", "so", "quando", "sobre",
    "entre", "depois", "até", "ate", "ou", "pelo", "pela", "pelos", "pelas",
    "nem", "todo", "toda", "todos", "todas", "bem", "bom", "boa", "lo", "la",
    "lhe", "lhes", "pois", "ainda", "aqui", "ali", "onde", "quem", "qual",
    "sem", "pode", "poderia", "porque", "pra", "num", "numa", "uns", "umas",
    "nós", "vos", "ti", "si", "nos", "lá", "cá", "aí", "ai", "então", "entao",
    "porém", "porem", "contudo", "todavia", "entretanto", "quanto", "cada",
    "outro", "outra", "outros", "outras", "mesmo", "mesma", "nenhum", "nenhuma",
    "algum", "alguma", "alguns", "algumas", "tudo", "nada", "algo", "alguém",
    "ninguém", "vez", "vezes", "dia", "dias", "ano", "anos", "etc", "pois",
  ]);

  const freq = new Map<string, number>();
  for (const r of records) {
    if (!r.answer) continue;
    const words = r.answer
      .toLowerCase()
      .replace(/[^a-záàâãéèêíïóôõöúçñ\s]/gi, "")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));
    for (const w of words) {
      freq.set(w, (freq.get(w) || 0) + 1);
    }
  }

  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([text, value]) => ({ text, value }));
}
