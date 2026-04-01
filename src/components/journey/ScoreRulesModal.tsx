import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { ScoreRules } from "@/data/engagementData";

interface ScoreRulesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rules: ScoreRules;
  onSave: (rules: ScoreRules) => void;
}

const ScoreRulesModal = ({ open, onOpenChange, rules, onSave }: ScoreRulesModalProps) => {
  const [draft, setDraft] = useState<ScoreRules>(rules);

  const handleOpen = (v: boolean) => {
    if (v) setDraft(rules);
    onOpenChange(v);
  };

  const update = (key: keyof ScoreRules, value: number | boolean) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Configurar Score de Engajamento</DialogTitle>
          <DialogDescription className="text-xs">Defina as penalidades e limiares do score. O score é recalculado automaticamente.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-md border border-border bg-muted/50 p-3 space-y-2 text-xs text-muted-foreground">
            <div className="font-semibold text-foreground text-xs">Como funciona o Score?</div>
            <p>Cada aluno inicia com score <strong className="text-foreground">0</strong>. Penalidades são aplicadas conforme critérios não atendidos:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li><strong className="text-foreground">Sem login:</strong> aluno nunca acessou a plataforma.</li>
              <li><strong className="text-foreground">Sem ativação:</strong> não realizou a ativação em disciplinas regulares.</li>
              <li><strong className="text-foreground">Progresso baixo:</strong> progresso médio abaixo do limiar definido.</li>
              <li><strong className="text-foreground">Login antigo:</strong> último login excede o limite de dias configurado.</li>
              <li><strong className="text-foreground">Sem questionário:</strong> não respondeu nenhum questionário.</li>
            </ul>
            <div className="pt-1 border-t border-border mt-1 space-y-0.5">
              <p><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1 align-middle" /> <strong className="text-foreground">Saudável:</strong> Score ≥ −1 (nenhuma ou apenas 1 penalidade leve)</p>
              <p><span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-1 align-middle" /> <strong className="text-foreground">Atenção:</strong> Score entre −2 e −3 (algumas pendências)</p>
              <p><span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1 align-middle" /> <strong className="text-foreground">Alto Risco:</strong> Score ≤ −4 (múltiplas pendências críticas)</p>
            </div>
          </div>
          <div className="text-xs font-semibold text-foreground">Penalidades</div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <label className="space-y-1">
              <span className="text-muted-foreground">Sem login</span>
              <Input type="number" value={draft.penaltyNoLogin} onChange={e => update("penaltyNoLogin", Number(e.target.value))} className="h-8 text-xs" />
            </label>
            <label className="space-y-1">
              <span className="text-muted-foreground">Sem ativação</span>
              <Input type="number" value={draft.penaltyNoActivation} onChange={e => update("penaltyNoActivation", Number(e.target.value))} className="h-8 text-xs" />
            </label>
            <label className="space-y-1">
              <span className="text-muted-foreground">Progresso baixo</span>
              <Input type="number" value={draft.penaltyLowProgress} onChange={e => update("penaltyLowProgress", Number(e.target.value))} className="h-8 text-xs" />
            </label>
            <label className="space-y-1">
              <span className="text-muted-foreground">Login antigo</span>
              <Input type="number" value={draft.penaltyOldLogin} onChange={e => update("penaltyOldLogin", Number(e.target.value))} className="h-8 text-xs" />
            </label>
            <label className="space-y-1">
              <span className="text-muted-foreground">Sem questionário</span>
              <Input type="number" value={draft.penaltyNoQuiz} onChange={e => update("penaltyNoQuiz", Number(e.target.value))} className="h-8 text-xs" />
            </label>
          </div>
          <div className="text-xs font-semibold text-foreground mt-4">Limiares</div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <label className="space-y-1">
              <span className="text-muted-foreground">Progresso mínimo (%)</span>
              <Input type="number" value={draft.progressThreshold} onChange={e => update("progressThreshold", Number(e.target.value))} className="h-8 text-xs" />
            </label>
            <label className="space-y-1">
              <span className="text-muted-foreground">Dias limite login</span>
              <Input type="number" value={draft.loginDaysThreshold} onChange={e => update("loginDaysThreshold", Number(e.target.value))} className="h-8 text-xs" />
            </label>
          </div>
          <div className="text-xs font-semibold text-foreground mt-4">Obrigatoriedade</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Ativação obrigatória</span>
              <Switch checked={draft.requireActivation} onCheckedChange={v => update("requireActivation", v)} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Questionário obrigatório</span>
              <Switch checked={draft.requireQuiz} onCheckedChange={v => update("requireQuiz", v)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button size="sm" onClick={() => { onSave(draft); onOpenChange(false); }}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScoreRulesModal;
