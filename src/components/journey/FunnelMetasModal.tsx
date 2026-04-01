import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FunnelMetas } from "./FunnelChart";

interface FunnelMetasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metas: FunnelMetas;
  onSave: (metas: FunnelMetas) => void;
}

const FunnelMetasModal = ({ open, onOpenChange, metas, onSave }: FunnelMetasModalProps) => {
  const [draft, setDraft] = useState<FunnelMetas>(metas);

  const handleOpen = (v: boolean) => {
    if (v) setDraft(metas);
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Metas de Conversão do Funil</DialogTitle>
          <DialogDescription className="text-xs">Defina a meta (%) de conversão entre cada etapa. Conversões abaixo da meta ficam em vermelho.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <label className="space-y-1 block">
            <span className="text-xs text-muted-foreground">Matriculados → Login (%)</span>
            <Input type="number" min={0} max={100} value={draft.loginMeta} onChange={e => setDraft(p => ({ ...p, loginMeta: Number(e.target.value) }))} className="h-8 text-xs" />
          </label>
          <label className="space-y-1 block">
            <span className="text-xs text-muted-foreground">Login → Ativação (%)</span>
            <Input type="number" min={0} max={100} value={draft.ativacaoMeta} onChange={e => setDraft(p => ({ ...p, ativacaoMeta: Number(e.target.value) }))} className="h-8 text-xs" />
          </label>
          <label className="space-y-1 block">
            <span className="text-xs text-muted-foreground">Ativação → Questionário (%)</span>
            <Input type="number" min={0} max={100} value={draft.questionarioMeta} onChange={e => setDraft(p => ({ ...p, questionarioMeta: Number(e.target.value) }))} className="h-8 text-xs" />
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button size="sm" onClick={() => { onSave(draft); onOpenChange(false); }}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FunnelMetasModal;
