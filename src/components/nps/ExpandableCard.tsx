import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Maximize2 } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ExpandableCardProps {
  children: ReactNode;
  title: string;
  className?: string;
}

const ExpandableCard = ({ children, title, className }: ExpandableCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div className={`relative group ${className || ""}`}>
        <button
          onClick={() => setExpanded(true)}
          className="absolute top-2 right-2 z-10 p-1 rounded-md bg-card/80 border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
          title="Expandir"
        >
          <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        {children}
      </div>

      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="max-w-[90vw] w-[90vw] max-h-[85vh] overflow-auto p-6">
          <VisuallyHidden>
            <DialogTitle>{title}</DialogTitle>
          </VisuallyHidden>
          <h3 className="text-base font-semibold text-foreground mb-4">{title}</h3>
          {children}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExpandableCard;
