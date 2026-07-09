import { useState, useEffect } from "react";
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

// Data (YYYY-MM-DD) em America/Sao_Paulo, com offset em dias. Ancoramos ao meio-dia
// UTC da data-calendário de SP para o offset não virar o dia por causa do fuso.
function spDate(offsetDays = 0): string {
  const todaySp = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  if (offsetDays === 0) return todaySp;
  const base = new Date(`${todaySp}T12:00:00Z`);
  base.setUTCDate(base.getUTCDate() + offsetDays);
  return base.toISOString().slice(0, 10);
}

// Campo de digitar data que completa o ANO ATUAL quando você não digita o ano
// (ex.: "01/01" vira "01/01/2026"). Aceita dd/mm ou dd/mm/aaaa.
function DigitaData({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const [txt, setTxt] = useState(fmt(value));
  useEffect(() => { setTxt(fmt(value)); }, [value]);

  const commit = () => {
    const clean = txt.trim();
    if (!clean) { onChange(""); return; }
    const parts = clean.split(/\D+/).filter(Boolean);
    const [d, m, y] = parts;
    if (!d || !m) { setTxt(fmt(value)); return; }
    const dd = parseInt(d, 10);
    const mm = parseInt(m, 10);
    let yyyy = y ? parseInt(y, 10) : new Date().getFullYear();
    if (y && y.length === 2) yyyy = 2000 + parseInt(y, 10);
    if (isNaN(dd) || isNaN(mm) || dd < 1 || dd > 31 || mm < 1 || mm > 12 || yyyy < 2000 || yyyy > 2100) {
      setTxt(fmt(value)); // reverte se inválido
      return;
    }
    const iso = `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
    onChange(iso);
    setTxt(fmt(iso));
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={txt}
      placeholder="dd/mm/aaaa"
      onChange={(e) => setTxt(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); (e.target as HTMLInputElement).blur(); } }}
      className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    />
  );
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
              ? "border-primary bg-primary/5 text-primary font-medium hover:bg-accent hover:text-accent-foreground"
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
        <div className="flex gap-1.5">
          {[
            { lbl: "Hoje", off: 0 },
            { lbl: "Ontem", off: -1 },
          ].map((p) => {
            const d = spDate(p.off);
            const ativo = value.from === d && value.to === d;
            return (
              <Button
                key={p.lbl}
                variant={ativo ? "default" : "outline"}
                size="sm"
                className="h-7 flex-1 text-xs"
                onClick={() => { onChange({ from: d, to: d }); setOpen(false); }}
              >
                {p.lbl}
              </Button>
            );
          })}
        </div>
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">De</label>
            <DigitaData value={value.from} onChange={(iso) => onChange({ ...value, from: iso })} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Até</label>
            <DigitaData value={value.to} onChange={(iso) => onChange({ ...value, to: iso })} />
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
