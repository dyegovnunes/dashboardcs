import type { WaterfallItem } from "@/components/ies/WaterfallChart";

function buildWaterfall(
  baseInicial: number,
  formados: number,
  captacao: number,
  cancelamentos: number,
  evasoes: number,
): WaterfallItem[] {
  const totalSaidas = cancelamentos + evasoes;
  const baseFinal = baseInicial - formados + captacao - totalSaidas;
  return [
    { label: "Base Inicial", value: baseInicial, isTotal: true, color: "hsl(220, 13%, 66%)" },
    { label: "Formado", value: -formados, color: "hsl(222, 59%, 35%)" },
    { label: "Captação", value: captacao },
    { label: "Evasão", value: -totalSaidas },
    { label: "Base Final", value: baseFinal, isTotal: true, color: "hsl(220, 13%, 66%)" },
  ];
}

export const waterfallByIES: Record<string, WaterfallItem[]> = {
  "puc-pr": buildWaterfall(7742, 1222, 946, 155, 212),
  "puc-campinas": buildWaterfall(5430, 870, 620, 120, 180),
  "puc-rio": buildWaterfall(3850, 580, 410, 85, 130),
  "pos-artmed": buildWaterfall(2900, 440, 310, 95, 150),
  "hcor": buildWaterfall(2100, 320, 250, 60, 90),
  "fdc": buildWaterfall(1800, 280, 200, 70, 110),
};
