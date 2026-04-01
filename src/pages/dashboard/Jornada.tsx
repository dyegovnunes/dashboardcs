/**
 * Jornada — página independente
 * Dados: src/data/engagementData.ts + Supabase (via JourneyDetailPage)
 * Delega para JourneyDetailPage que já tem toda a lógica de jornada.
 */
import JourneyDetailPage from "@/components/JourneyDetailPage";

interface JornadaProps {
  activeIES: string[];
}

const Jornada = ({ activeIES }: JornadaProps) => (
  <JourneyDetailPage activeIES={activeIES} />
);

export default Jornada;
