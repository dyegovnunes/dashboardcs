import { cn } from "@/lib/utils";

const iesList = [
  { id: "geral", label: "GERAL" },
  { id: "puc-pr", label: "PUC PR" },
  { id: "puc-campinas", label: "PUC CAMPINAS" },
  { id: "puc-rio", label: "PUC RIO" },
  { id: "pos-artmed", label: "PÓS ARTMED" },
  { id: "hcor", label: "HCOR" },
  { id: "fdc", label: "FDC" },
];

interface IESTabsProps {
  activeIES: string[];
  onIESChange: (ies: string[]) => void;
  singleSelect?: boolean;
}

const IESTabs = ({ activeIES, onIESChange, singleSelect = false }: IESTabsProps) => {
  const handleClick = (id: string, e: React.MouseEvent) => {
    if (id === "geral") {
      onIESChange(["geral"]);
      return;
    }

    if (singleSelect) {
      // Single select mode: toggle between this IES and geral
      if (activeIES.includes(id) && activeIES.length === 1) {
        onIESChange(["geral"]);
      } else {
        onIESChange([id]);
      }
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      const withoutGeral = activeIES.filter((i) => i !== "geral");
      if (withoutGeral.includes(id)) {
        const next = withoutGeral.filter((i) => i !== id);
        onIESChange(next.length === 0 ? ["geral"] : next);
      } else {
        onIESChange([...withoutGeral, id]);
      }
    } else {
      onIESChange([id]);
    }
  };

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
      {iesList.map((ies) => (
        <button
          key={ies.id}
          onClick={(e) => handleClick(ies.id, e)}
          className={cn(
            "px-4 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-all duration-200",
            activeIES.includes(ies.id)
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
          )}
        >
          {ies.label}
        </button>
      ))}
    </div>
  );
};

export default IESTabs;
