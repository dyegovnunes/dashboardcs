/**
 * NPS — página independente
 * Dados: src/data/npsData.ts (NPS_SERIES_DATA, NPS_TREND_DATA, NPS_CYCLES)
 * Delega para NPSDetailPage que já tem toda a lógica de NPS.
 */
import NPSDetailPage from "@/components/NPSDetailPage";

interface NPSProps {
  activeIES: string[];
}

const NPS = ({ activeIES }: NPSProps) => (
  <NPSDetailPage activeIES={activeIES} />
);

export default NPS;
