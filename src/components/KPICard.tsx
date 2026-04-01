import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  subInfo?: { label: string; value: string };
}

const variantStyles = {
  default: "border-l-primary",
  success: "border-l-success",
  warning: "border-l-warning",
  danger: "border-l-destructive",
};

const KPICard = ({ title, value, change, changeLabel, icon, variant = "default", subInfo }: KPICardProps) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-5 border-l-4 transition-shadow hover:shadow-md",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-card-foreground">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1.5">
              {isPositive && <TrendingUp className="h-3.5 w-3.5 text-success" />}
              {isNegative && <TrendingDown className="h-3.5 w-3.5 text-destructive" />}
              {!isPositive && !isNegative && <Minus className="h-3.5 w-3.5 text-muted-foreground" />}
              <span
                className={cn(
                  "text-xs font-semibold",
                  isPositive && "text-success",
                  isNegative && "text-destructive",
                  !isPositive && !isNegative && "text-muted-foreground"
                )}
              >
                {isPositive ? "+" : ""}
                {change}%
              </span>
              {changeLabel && (
                <span className="text-xs text-muted-foreground">{changeLabel}</span>
              )}
            </div>
          )}
          {subInfo && (
            <div className="mt-1.5 text-[11px] text-muted-foreground border-t border-border/50 pt-1.5">
              {subInfo.label}: <span className="font-medium">{subInfo.value}</span>
            </div>
          )}
        </div>
        <div className="rounded-lg bg-secondary p-2.5 text-muted-foreground">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default KPICard;
