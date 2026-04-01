/**
 * CHURN DATA — Fonte única de verdade para todos os valores de churn
 * Migrado de dados.js (Dashboard CS +A.html)
 *
 * REGRA IMUTÁVEL: qualquer exibição de churn acumulado 2026 no dashboard
 * DEVE ler deste arquivo. Nunca hardcodar valores de churn em componentes.
 *
 * Valores corretos Jan→Mar/2026:
 *   PUC PR: 9.42% | PUC Campinas: 6.84% | PUC Rio: 8.65%
 *   Pós Artmed: 5.97% | HCor: 8.47% | FDC: 4.99%
 */

export interface ChurnRow {
  ies: string;
  churn: number;
  meta: number;
  churn2025: number;
  baseAtivaReal: number;
  baseAtivaMeta: number;
  metaBaseDez: number;
  desvio: number;
  yoy: number;
}

// ─── Churn Mensal (Mar/26 — último mês disponível) ───────────────────────────
// desvio = ((churn/meta)-1)*100 | negativo = bom (verde), positivo = ruim (vermelho)
// yoy = ((churn26/churn25)-1)*100 | negativo = melhorou
export const CHURN_MENSAL: ChurnRow[] = [
  { ies: 'PUC PR',       churn: 1.55, meta: 2.58, churn2025: 4.04, baseAtivaReal: 7495, baseAtivaMeta: 8091, metaBaseDez: 9942,  desvio: -39.9, yoy: -61.7 },
  { ies: 'PUC CAMPINAS', churn: 1.44, meta: 2.65, churn2025: 2.60, baseAtivaReal: 3894, baseAtivaMeta: 4125, metaBaseDez: 5366,  desvio: -45.7, yoy: -44.5 },
  { ies: 'PUC RIO',      churn: 1.54, meta: 3.85, churn2025: 4.11, baseAtivaReal: 1727, baseAtivaMeta: 1810, metaBaseDez: 1815,  desvio: -60.0, yoy: -62.6 },
  { ies: 'PÓS ARTMED',   churn: 1.35, meta: 2.19, churn2025: 2.48, baseAtivaReal: 6193, baseAtivaMeta: 6509, metaBaseDez: 8084,  desvio: -38.4, yoy: -45.5 },
  { ies: 'HCOR',         churn: 1.76, meta: 2.06, churn2025: 3.82, baseAtivaReal: 1337, baseAtivaMeta: 1479, metaBaseDez: 1946,  desvio: -14.6, yoy: -53.8 },
  { ies: 'FDC',          churn: 0.85, meta: 2.46, churn2025: 6.12, baseAtivaReal: 936,  baseAtivaMeta: 778,  metaBaseDez: 1114,  desvio: -65.4, yoy: -86.2 },
];

// ─── Churn Acumulado (Jan→Mar/26) ────────────────────────────────────────────
export const CHURN_ACUM: ChurnRow[] = [
  { ies: 'PUC PR',       churn: 9.42, meta: 7.34,  churn2025: 12.97, baseAtivaReal: 7495, baseAtivaMeta: 8091, metaBaseDez: 9942, desvio: 28.3,  yoy: -32.5 },
  { ies: 'PUC CAMPINAS', churn: 6.84, meta: 7.27,  churn2025: 10.82, baseAtivaReal: 3894, baseAtivaMeta: 4125, metaBaseDez: 5366, desvio: -5.9,  yoy: -40.3 },
  { ies: 'PUC RIO',      churn: 8.65, meta: 10.73, churn2025: 15.86, baseAtivaReal: 1727, baseAtivaMeta: 1810, metaBaseDez: 1815, desvio: -19.4, yoy: -46.2 },
  { ies: 'PÓS ARTMED',   churn: 5.97, meta: 6.33,  churn2025: 9.52,  baseAtivaReal: 6193, baseAtivaMeta: 6509, metaBaseDez: 8084, desvio: -5.7,  yoy: -38.3 },
  { ies: 'HCOR',         churn: 8.47, meta: 6.06,  churn2025: 11.47, baseAtivaReal: 1337, baseAtivaMeta: 1479, metaBaseDez: 1946, desvio: 39.8,  yoy: -29.3 },
  { ies: 'FDC',          churn: 4.99, meta: 6.48,  churn2025: 6.76,  baseAtivaReal: 936,  baseAtivaMeta: 778,  metaBaseDez: 1114, desvio: -23.0, yoy: -32.1 },
];

// ─── Retention Trend — churnYearly['2026'] por IES ───────────────────────────
// Gerado diretamente de IES_CONFIG.churnYearly para garantir consistência.
// Fonte única: os arrays abaixo DEVEM ser idênticos a IES_CONFIG[key].churnYearly['2026']
export interface RetentionSeries {
  ies: string;
  key: string;
  color: string;
  data: number[];
}

export const RETENTION_TREND_LABELS = ['Jan/26', 'Fev/26', 'Mar/26'];

export const RETENTION_TREND_SERIES: RetentionSeries[] = [
  { ies: 'PUC PR',      key: 'puc-pr',       color: '#1e3a5f', data: [3.85, 7.98, 9.42] },
  { ies: 'PUC Campinas',key: 'puc-campinas',  color: '#f97316', data: [2.65, 5.46, 6.84] },
  { ies: 'PUC Rio',     key: 'puc-rio',       color: '#22c55e', data: [3.47, 7.22, 8.65] },
  { ies: 'Pós Artmed',  key: 'pos-artmed',    color: '#f59e0b', data: [2.35, 4.67, 5.97] },
  { ies: 'HCor',        key: 'hcor',          color: '#3b82f6', data: [3.47, 6.82, 8.47] },
  { ies: 'FDC',         key: 'fdc',           color: '#7c3aed', data: [2.18, 4.17, 4.99] },
];
