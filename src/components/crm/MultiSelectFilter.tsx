import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface Props {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function MultiSelectFilter({ label, options, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 h-9 px-3 rounded-md border border-input bg-background text-sm hover:bg-accent transition-colors w-full justify-between",
          selected.length > 0 && "border-primary/50"
        )}
      >
        <span className="truncate text-left">
          {selected.length > 0 ? `${label} (${selected.length})` : label}
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-y-auto min-w-[200px]">
          {options.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent cursor-pointer transition-colors">
              <Checkbox checked={selected.includes(opt.value)} onCheckedChange={() => toggle(opt.value)} />
              <span className="truncate">{opt.label}</span>
            </label>
          ))}
          {selected.length > 0 && (
            <button
              className="w-full text-left px-3 py-2 text-xs text-muted-foreground hover:bg-accent transition-colors border-t"
              onClick={() => onChange([])}
            >
              Limpar seleção
            </button>
          )}
        </div>
      )}
    </div>
  );
}
