import { cn } from "@/lib/utils";

interface WordCloudCardProps {
  words: { text: string; value: number }[];
  title: string;
  variant: "promotor" | "detrator";
}

const WordCloudCard = ({ words, title, variant }: WordCloudCardProps) => {
  if (words.length === 0) return (
    <div className={cn(
      "rounded-lg border p-5 flex-1",
      variant === "promotor" ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"
    )}>
      <h3 className={cn("text-sm font-semibold mb-3", variant === "promotor" ? "text-success" : "text-destructive")}>{title}</h3>
      <p className="text-xs text-muted-foreground">Sem dados suficientes</p>
    </div>
  );

  const maxVal = Math.max(...words.map((w) => w.value));
  const minVal = Math.min(...words.map((w) => w.value));
  const range = maxVal - minVal || 1;

  const getSize = (val: number) => 11 + ((val - minVal) / range) * 20;
  const getOpacity = (val: number) => 0.4 + ((val - minVal) / range) * 0.6;

  const color = variant === "promotor" ? "text-success" : "text-destructive";

  return (
    <div className={cn(
      "rounded-lg border p-5 flex-1",
      variant === "promotor" ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"
    )}>
      <h3 className={cn("text-sm font-semibold mb-3", variant === "promotor" ? "text-success" : "text-destructive")}>{title}</h3>
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 items-center justify-center py-3">
        {words.map((w) => (
          <span
            key={w.text}
            className={cn(color, "font-semibold cursor-default transition-opacity hover:opacity-100")}
            style={{ fontSize: `${getSize(w.value)}px`, opacity: getOpacity(w.value) }}
            title={`${w.text}: ${w.value} menções`}
          >
            {w.text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default WordCloudCard;
