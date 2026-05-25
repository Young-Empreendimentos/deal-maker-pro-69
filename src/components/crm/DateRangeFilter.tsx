import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type DateRange = { from: string; to: string };

interface Props {
  label: string;
  value: DateRange;
  onChange: (v: DateRange) => void;
}

function fmt(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function DateRangeFilter({ label, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const hasValue = value.from || value.to;

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ from: "", to: "" });
  };

  const displayLabel = hasValue
    ? value.from && value.to
      ? `${fmt(value.from)} – ${fmt(value.to)}`
      : value.from
      ? `A partir de ${fmt(value.from)}`
      : `Até ${fmt(value.to)}`
    : label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 h-9 px-3 rounded-md border text-sm transition-colors w-full truncate",
            hasValue
              ? "border-primary bg-primary/5 text-primary font-medium"
              : "border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="flex-1 text-left truncate">{displayLabel}</span>
          {hasValue && (
            <X className="h-3 w-3 flex-shrink-0 hover:text-destructive" onClick={clear} />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 space-y-3" align="start">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">De</label>
            <input
              type="date"
              value={value.from}
              max={value.to || undefined}
              onChange={(e) => onChange({ ...value, from: e.target.value })}
              className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Até</label>
            <input
              type="date"
              value={value.to}
              min={value.from || undefined}
              onChange={(e) => onChange({ ...value, to: e.target.value })}
              className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          {hasValue && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { onChange({ from: "", to: "" }); setOpen(false); }}>
              Limpar
            </Button>
          )}
          <Button size="sm" className="h-7 text-xs" onClick={() => setOpen(false)}>
            Aplicar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
