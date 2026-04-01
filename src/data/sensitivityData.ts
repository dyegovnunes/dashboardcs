/**
 * SENSITIVITY_DATA — Conta Corrente por IES
 * Fonte única de verdade para waterfall, conta corrente e análise de sensibilidade.
 *
 * si = Saldo Inicial Jan/26 (denominador oficial do churn FP&A)
 * captMonthly/evasMonthly/formMonthly = movimentação mensal Jan/Fev/Mar 2026
 *
 * DISCREPÂNCIAS CONHECIDAS baseAtiva vs si (validar com FP&A):
 *   PUC PR: 7495 vs 7366 (Δ129)   PUC Campinas: 3894 vs 3713 (Δ181)
 *   PUC Rio: 1727 vs 1763 (Δ-36)  Pós Artmed: 6193 vs 6074 (Δ119)
 *   HCor: 1337 vs 1250 (Δ87)      FDC: 936 vs 689 (Δ247)
 */

export interface SensitivityRow {
  si: number;
  siMeta: number;
  capt: number;
  captMeta: number;
  evas: number;
  evasMeta: number;
  form: number;
  formMeta: number;
  churnReal: number;
  churnMeta: number;
  // Elasticidades (impacto de 1pp em cada variável sobre o churn)
  efEvasao: number;
  efSI: number;
  efCaptacao: number;
  efFormandos: number;
  // Movimentação mensal Jan/Fev/Mar 2026
  captMonthly: [number, number, number];
  evasMonthly: [number, number, number];
  formMonthly: [number, number, number];
}

export const SENSITIVITY_DATA: Record<string, SensitivityRow> = {
  'pucpr': {
    si: 7366, siMeta: 7742,
    capt: 2725, captMeta: 2942,
    evas: 719,  evasMeta: 641,
    form: 1877, formMeta: 1951,
    churnReal: 9.42, churnMeta: 7.34,
    efEvasao: 0.89, efSI: 0.33, efCaptacao: 0.19, efFormandos: -0.06,
    captMonthly: [1113, 826, 786],
    evasMonthly: [281, 320, 118],
    formMonthly: [1186, 368, 323],
  },
  'puccampinas': {
    si: 3713, siMeta: 3820,
    capt: 1470, captMeta: 1634,
    evas: 269,  evasMeta: 323,
    form: 1020, formMeta: 1011,
    churnReal: 6.84, churnMeta: 7.27,
    efEvasao: -1.22, efSI: 0.18, efCaptacao: 0.28, efFormandos: 0.01,
    captMonthly: [584, 409, 477],
    evasMonthly: [101, 111, 57],
    formMonthly: [488, 274, 258],
  },
  'pucrio': {
    si: 1763, siMeta: 1858,
    capt: 559,  captMeta: 619,
    evas: 161,  evasMeta: 217,
    form: 434,  formMeta: 455,
    churnReal: 8.65, churnMeta: 10.73,
    efEvasao: -2.77, efSI: 0.53, efCaptacao: 0.33, efFormandos: -0.11,
    captMonthly: [269, 151, 139],
    evasMonthly: [65, 69, 27],
    formMonthly: [159, 183, 92],
  },
  'posartmed': {
    si: 6074, siMeta: 6288,
    capt: 2028, captMeta: 2216,
    evas: 387,  evasMeta: 440,
    form: 1522, formMeta: 1553,
    churnReal: 5.97, churnMeta: 6.33,
    efEvasao: -0.76, efSI: 0.20, efCaptacao: 0.18, efFormandos: -0.03,
    captMonthly: [990, 556, 482],
    evasMonthly: [152, 150, 85],
    formMonthly: [608, 547, 367],
  },
  'hcor': {
    si: 1250, siMeta: 1346,
    capt: 464,  captMeta: 510,
    evas: 118,  evasMeta: 95,
    form: 259,  formMeta: 288,
    churnReal: 8.47, churnMeta: 6.06,
    efEvasao: 1.47, efSI: 0.39, efCaptacao: 0.18, efFormandos: -0.11,
    captMonthly: [205, 143, 116],
    evasMonthly: [47, 47, 24],
    formMonthly: [99, 98, 62],
  },
  'fdc': {
    si: 689,  siMeta: 633,
    capt: 394,  captMeta: 298,
    evas: 45,   evasMeta: 54,
    form: 102,  formMeta: 98,
    churnReal: 4.99, churnMeta: 6.48,
    efEvasao: -1.08, efSI: -0.41, efCaptacao: -0.67, efFormandos: 0.03,
    captMonthly: [138, 126, 130],
    evasMonthly: [18, 19, 8],
    formMonthly: [0, 0, 102],
  },
};

/** Meses disponíveis na movimentação mensal */
export const MONTHLY_LABELS = ['Jan/26', 'Fev/26', 'Mar/26'] as const;

/** Mapeamento de IES key (iesConfig) → sensitivity key */
export const IES_TO_SENSITIVITY: Record<string, string> = {
  'puc-pr':       'pucpr',
  'puc-campinas': 'puccampinas',
  'puc-rio':      'pucrio',
  'pos-artmed':   'posartmed',
  'hcor':         'hcor',
  'fdc':          'fdc',
};
