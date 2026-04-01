/**
 * IES_CONFIG — Fonte única de verdade para configuração e dados por IES
 * Migrado de dados.js (Dashboard CS +A.html)
 *
 * COMO ATUALIZAR: edite apenas este arquivo.
 * Todas as páginas importam daqui — uma mudança propaga para todo o dashboard.
 */

export interface ChurnYearly {
  [year: string]: number[];
}

export interface IESStatus {
  [status: string]: number;
}

export interface IESConfig {
  nome: string;
  cor: string;
  sigla: string;
  // Retenção
  baseAtiva: number | null;
  baseAtivaMeta: number | null;
  captacao: number | null;
  captacaoMeta: number | null;
  evasao: number | null;
  evasaoMeta: number | null;
  formandos: number | null;
  formandosMeta: number | null;
  churnAcum: number | null;
  churnMeta: number | null;
  churnDesvio: number | null;
  churnMeta2026: number[] | null;
  churnYearly: ChurnYearly;
  status: IESStatus;
}

export const IES_CONFIG: Record<string, IESConfig> = {
  'puc-pr': {
    nome: 'PUC PR', cor: '#1e3a5f', sigla: 'PR',
    baseAtiva: 7495, baseAtivaMeta: 8091,
    captacao: 2725, captacaoMeta: 2942,
    evasao: 719, evasaoMeta: 641,
    formandos: 1877, formandosMeta: 1951,
    churnAcum: 9.42, churnMeta: 7.34, churnDesvio: 28.3,
    churnMeta2026: [2.85, 5.28, 7.34, 9.42, 11.06, 12.69, 14.03, 15.93, 16.88, 18.2, 19.16, 19.63],
    churnYearly: {
      '2024': [1.66, 3.63, 4.79, 6.03, 6.84, 7.94, 9.49, 10.98, 12.55, 13.89, 15.39, 16.12],
      '2025': [3.05, 6.72, 8.92, 10.15, 10.85, 11.59, 13.94, 15.39, 16.53, 18.22, 18.7, 20.26],
      '2026': [3.85, 7.98, 9.42],
    },
    status: { Cancelado: 5762, Jubilado: 3130, Concluido: 12180, Evadido: 3143, Ativo: 7495 },
  },
  'puc-campinas': {
    nome: 'PUC Campinas', cor: '#f97316', sigla: 'CAM',
    baseAtiva: 3894, baseAtivaMeta: 4125,
    captacao: 1470, captacaoMeta: 1634,
    evasao: 269, evasaoMeta: 323,
    formandos: 1020, formandosMeta: 1011,
    churnAcum: 6.84, churnMeta: 7.27, churnDesvio: -5.9,
    churnMeta2026: [2.67, 5.07, 7.27, 9.06, 10.82, 12.78, 13.79, 15.49, 16.79, 18.57, 19.64, 20.31],
    churnYearly: {
      '2024': [1.29, 4.28, 7.46, 8.61, 9.6, 10.86, 12.52, 12.37, 13.87, 14.78, 15.85, 17.08],
      '2025': [3.58, 8.23, 10.82, 12.42, 13.6, 14.17, 15.87, 18.98, 20.36, 22.3, 22.84, 23.73],
      '2026': [2.65, 5.46, 6.84],
    },
    status: { Cancelado: 1307, Concluido: 3129, Evadido: 679, Ativo: 3894 },
  },
  'puc-rio': {
    nome: 'PUC Rio', cor: '#22c55e', sigla: 'RIO',
    baseAtiva: 1727, baseAtivaMeta: 1810,
    captacao: 559, captacaoMeta: 619,
    evasao: 161, evasaoMeta: 217,
    formandos: 434, formandosMeta: 455,
    churnAcum: 8.65, churnMeta: 10.73, churnDesvio: -19.4,
    churnMeta2026: [3.58, 7.59, 10.73, 14.35, 16.75, 18.83, 22.5, 23.97, 25.45, 28.73, 30.42, 31.78],
    churnYearly: {
      '2024': [3.11, 5.9, 8.45, 10.26, 11.38, 12.33, 15.08, 16.01, 18.39, 20.93, 22.95, 24.86],
      '2025': [4.81, 12.67, 15.86, 18.67, 20.57, 21.73, 26.43, 28.37, 29.72, 33.61, 34.58, 36.1],
      '2026': [3.47, 7.22, 8.65],
    },
    status: { Concluido: 2911, Cancelado: 1431, Evadido: 699, Ativo: 1727 },
  },
  'pos-artmed': {
    nome: 'Pós Artmed', cor: '#f59e0b', sigla: 'ART',
    baseAtiva: 6201, baseAtivaMeta: 6509,
    captacao: 2028, captacaoMeta: 2216,
    evasao: 387, evasaoMeta: 440,
    formandos: 1522, formandosMeta: 1553,
    churnAcum: 5.97, churnMeta: 6.33, churnDesvio: -5.7,
    churnMeta2026: [2.21, 4.42, 6.33, 8.39, 10.06, 11.38, 12.55, 13.68, 14.78, 15.94, 16.65, 17.91],
    churnYearly: {
      '2024': [2.89, 4.27, 5.3, 6.87, 8.43, 9.97, 11.54, 12.8, 13.99, 14.94, 15.86, 16.62],
      '2025': [2.97, 6.06, 7.38, 8.7, 9.6, 10.49, 12.74, 14.52, 16.24, 17.67, 17.97, 19.75],
      '2026': [2.35, 4.67, 5.97],
    },
    status: { Concluido: 9070, Cancelado: 3599, Evadido: 1944, Jubilado: 1752, Ativo: 6201, Transferido: 2 },
  },
  'hcor': {
    nome: 'HCor', cor: '#3b82f6', sigla: 'HC',
    baseAtiva: 1337, baseAtivaMeta: 1479,
    captacao: 464, captacaoMeta: 510,
    evasao: 118, evasaoMeta: 95,
    formandos: 259, formandosMeta: 288,
    churnAcum: 8.47, churnMeta: 6.06, churnDesvio: 39.8,
    churnMeta2026: [2.25, 4.39, 6.06, 7.52, 8.87, 10.29, 11.3, 12.33, 13.48, 14.67, 15.53, 16.81],
    churnYearly: {
      '2024': [8.38, 8.68, 9.93, 12.02, 13.0, 12.84, 14.02, 14.72, 14.91, 16.32, 17.15, 17.58],
      '2025': [4.4, 8.54, 11.47, 13.33, 13.39, 13.92, 17.09, 19.61, 21.37, 23.93, 23.39, 25.64],
      '2026': [3.47, 6.82, 8.47],
    },
    status: { Concluido: 841, Cancelado: 524, Evadido: 191, Ativo: 1337 },
  },
  'fdc': {
    nome: 'FDC', cor: '#7c3aed', sigla: 'FDC',
    baseAtiva: 936, baseAtivaMeta: 778,
    captacao: 394, captacaoMeta: 298,
    evasao: 45, evasaoMeta: 54,
    formandos: 102, formandosMeta: 98,
    churnAcum: 4.99, churnMeta: 6.48, churnDesvio: -23.0,
    churnMeta2026: [2.2, 4.14, 6.48, 8.41, 10.12, 12.02, 13.35, 14.66, 15.71, 18.02, 19.62, 20.18],
    churnYearly: {
      '2024': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      '2025': [0.0, 1.06, 6.76, 6.7, 8.11, 8.52, 9.76, 9.51, 11.27, 10.98, 11.42, 11.78],
      '2026': [2.18, 4.17, 4.99],
    },
    status: { Concluido: 102, Cancelado: 105, Evadido: 32, Ativo: 936 },
  },
  'secad': {
    nome: 'SECAD', cor: '#ef4444', sigla: 'SE',
    baseAtiva: null, baseAtivaMeta: null,
    captacao: null, captacaoMeta: null,
    evasao: null, evasaoMeta: null,
    formandos: null, formandosMeta: null,
    churnAcum: null, churnMeta: null, churnDesvio: null,
    churnMeta2026: null,
    churnYearly: {},
    status: {},
  },
};

/** Chaves das IES com dados reais (exclui SECAD) */
export const IES_KEYS_ATIVOS = ['puc-pr', 'puc-campinas', 'puc-rio', 'pos-artmed', 'hcor', 'fdc'] as const;
export type IESKey = typeof IES_KEYS_ATIVOS[number];

/** Todas as chaves incluindo SECAD */
export const IES_KEYS_TODAS = [...IES_KEYS_ATIVOS, 'secad'] as const;
