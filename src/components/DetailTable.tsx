import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface DetailTableProps {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  expandable?: boolean;
  defaultExpanded?: boolean;
}

const DetailTable = ({ title, headers, rows, expandable = true, defaultExpanded = false }: DetailTableProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const displayRows = expanded ? rows : rows.slice(0, 3);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border">
        <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {headers.map((h) => (
                <th key={h} className="px-5 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className={cn("px-5 py-3 text-card-foreground", j === 0 ? "font-medium" : "font-mono text-xs")}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {expandable && rows.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-5 py-2.5 text-xs font-medium text-muted-foreground hover:text-card-foreground hover:bg-muted/30 transition-colors flex items-center justify-center gap-1 border-t border-border"
        >
          {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          {expanded ? "Ver menos" : `Ver todos (${rows.length})`}
        </button>
      )}
    </div>
  );
};

export default DetailTable;
