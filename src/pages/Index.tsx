/**
 * Index — layout raiz do dashboard
 * Cada seção é uma página independente importada de src/pages/dashboard/
 * Dados compartilhados vivem em src/data/ — nunca hardcodados aqui.
 */
import { useState } from "react";
import SidebarNav from "@/components/SidebarNav";
import IESTabs from "@/components/IESTabs";
import VisaoGeral from "@/pages/dashboard/VisaoGeral";
import Retencao from "@/pages/dashboard/Retencao";
import Atendimento from "@/pages/dashboard/Atendimento";
import Jornada from "@/pages/dashboard/Jornada";
import NPS from "@/pages/dashboard/NPS";

type TabId = "overview" | "retention" | "support" | "journey" | "nps";

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [activeIES, setActiveIES] = useState<string[]>(["geral"]);

  const renderPage = () => {
    switch (activeTab) {
      case "retention":
        return <Retencao />;
      case "support":
        return <Atendimento activeIES={activeIES} />;
      case "journey":
        return <Jornada activeIES={activeIES} />;
      case "nps":
        return <NPS activeIES={activeIES} />;
      default:
        return <VisaoGeral activeIES={activeIES} onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as TabId)} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="mb-6">
            <IESTabs
              activeIES={activeIES}
              onIESChange={setActiveIES}
              singleSelect={activeTab === "overview"}
            />
          </div>
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default Index;
