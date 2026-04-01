import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface MonthOption {
  value: string; // e.g. "Jan/25"
  raw: string;   // ISO date
  label: string; // e.g. "Janeiro 2025"
}

interface MonthNavigatorProps {
  months: MonthOption[];
  selectedMonth: string;
  onMonthChange: (value: string) => void;
}

const MONTH_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const MonthNavigator = ({ months, selectedMonth, onMonthChange }: MonthNavigatorProps) => {
  const [open, setOpen] = useState(false);

  const currentIdx = months.findIndex((m) => m.value === selectedMonth);
  const currentMonth = months[currentIdx];
  const isFirst = currentIdx <= 0;
  const isLast = currentIdx >= months.length - 1;

  // Parse year from current month for the picker
  const currentRaw = currentMonth?.raw ? new Date(currentMonth.raw) : new Date();
  const [pickerYear, setPickerYear] = useState(currentRaw.getUTCFullYear());

  // Get available years
  const years = Array.from(new Set(months.map((m) => new Date(m.raw).getUTCFullYear()))).sort();

  // Find months available for the picker year
  const availableForYear = months.filter((m) => new Date(m.raw).getUTCFullYear() === pickerYear);
  const availableMonthIndices = new Set(availableForYear.map((m) => new Date(m.raw).getUTCMonth()));

  const handlePrev = () => {
    if (!isFirst) onMonthChange(months[currentIdx - 1].value);
  };

  const handleNext = () => {
    if (!isLast) onMonthChange(months[currentIdx + 1].value);
  };

  const handlePickMonth = (monthIdx: number) => {
    const target = availableForYear.find((m) => new Date(m.raw).getUTCMonth() === monthIdx);
    if (target) {
      onMonthChange(target.value);
      setOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handlePrev}
        disabled={isFirst}
        className="p-1 rounded hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="h-4 w-4 text-muted-foreground" />
      </button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="px-3 py-1 text-sm font-semibold text-foreground hover:bg-secondary rounded transition-colors min-w-[160px]">
            {currentMonth?.label ?? "—"}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[260px] p-3 pointer-events-auto" align="center">
          {/* Year selector */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setPickerYear((y) => Math.max(y - 1, years[0]))}
              disabled={pickerYear <= years[0]}
              className="p-1 rounded hover:bg-secondary disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold">{pickerYear}</span>
            <button
              onClick={() => setPickerYear((y) => Math.min(y + 1, years[years.length - 1]))}
              disabled={pickerYear >= years[years.length - 1]}
              className="p-1 rounded hover:bg-secondary disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          {/* Month grid */}
          <div className="grid grid-cols-3 gap-1.5">
            {MONTH_SHORT.map((name, idx) => {
              const available = availableMonthIndices.has(idx);
              const isActive = currentMonth && new Date(currentMonth.raw).getUTCFullYear() === pickerYear && new Date(currentMonth.raw).getUTCMonth() === idx;
              return (
                <button
                  key={idx}
                  disabled={!available}
                  onClick={() => handlePickMonth(idx)}
                  className={cn(
                    "py-1.5 text-xs font-medium rounded transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : available
                        ? "hover:bg-secondary text-foreground"
                        : "text-muted-foreground/40 cursor-not-allowed"
                  )}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      <button
        onClick={handleNext}
        disabled={isLast}
        className="p-1 rounded hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
};

export default MonthNavigator;
