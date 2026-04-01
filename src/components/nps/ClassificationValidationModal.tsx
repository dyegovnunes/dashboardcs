import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NPSRecord, NPSClassification } from "@/data/npsData";
import { exportRecordsToCsv } from "@/data/npsData";

interface ClassificationValidationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  records: NPSRecord[];
  classifications: Map<string, NPSClassification>;
}

const ClassificationValidationModal = ({
  open,
  onOpenChange,
  records,
  classifications,
}: ClassificationValidationModalProps) => {
  const [search, setSearch] = useState("");

  const filteredRecords = useMemo(() => {
    if (!search.trim()) return records;
    const q = search.toLowerCase();
    return records.filter(
      (r) =>
        r.response_id.toLowerCase().includes(q) ||
        r.answer?.toLowerCase().includes(q) ||
        r.classificacao.toLowerCase().includes(q) ||
        (classifications.get(r.response_id)?.categoria || "").toLowerCase().includes(q) ||
        (classifications.get(r.response_id)?.subcategoria || "").toLowerCase().includes(q)
    );
  }, [records, classifications, search]);

  const classifiedCount = filteredRecords.filter((r) => classifications.has(r.response_id)).length;
  const pendingCount = filteredRecords.length - classifiedCount;

  const handleDownload = () => {
    const csv = exportRecordsToCsv(filteredRecords, classifications.size > 0 ? classifications : undefined);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nps_validacao_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-sm">Validar Categorizações</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {filteredRecords.length} registros · {classifiedCount} classificados · {pendingCount} pendentes
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 mt-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar por resposta, categoria, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={handleDownload}>
            <Download className="h-3.5 w-3.5" />
            CSV
          </Button>
        </div>

        <div className="overflow-auto flex-1 mt-2 border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px] w-[100px]">ID</TableHead>
                <TableHead className="text-[10px]">Resposta</TableHead>
                <TableHead className="text-[10px] w-[80px] text-center">Classificação</TableHead>
                <TableHead className="text-[10px] w-[110px] text-center">Categoria</TableHead>
                <TableHead className="text-[10px] w-[120px] text-center">Subcategoria</TableHead>
                <TableHead className="text-[10px] w-[60px] text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.slice(0, 200).map((r) => {
                const cls = classifications.get(r.response_id);
                const isClassified = !!cls;
                return (
                  <TableRow key={r.response_id}>
                    <TableCell className="text-[9px] font-mono text-muted-foreground truncate max-w-[100px]">
                      {r.response_id}
                    </TableCell>
                    <TableCell className="text-[10px] max-w-[300px]">
                      <span className="line-clamp-2">{r.answer || "—"}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={cn(
                          "text-[9px] font-semibold px-1.5 py-0.5 rounded-full",
                          r.classificacao === "Promotor" && "bg-success/10 text-success",
                          r.classificacao === "Neutro" && "bg-warning/10 text-warning",
                          r.classificacao === "Detrator" && "bg-destructive/10 text-destructive"
                        )}
                      >
                        {r.classificacao}
                      </span>
                    </TableCell>
                    <TableCell className="text-[10px] text-center">{cls?.categoria || "—"}</TableCell>
                    <TableCell className="text-[10px] text-center">{cls?.subcategoria || "—"}</TableCell>
                    <TableCell className="text-center">
                      <span
                        className={cn(
                          "inline-block h-2 w-2 rounded-full",
                          isClassified ? "bg-success" : "bg-warning"
                        )}
                        title={isClassified ? "Classificado" : "Pendente"}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredRecords.length > 200 && (
            <div className="text-center text-[10px] text-muted-foreground py-2">
              Exibindo 200 de {filteredRecords.length} registros. Baixe o CSV para ver todos.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClassificationValidationModal;
