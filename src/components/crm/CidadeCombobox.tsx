import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Cidade = { id: string; nome: string };

let cidadesCache: Cidade[] | null = null;

export function CidadeCombobox({
  value,
  onSelect,
  className,
}: {
  value: string;
  onSelect: (nome: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [cidades, setCidades] = useState<Cidade[]>(cidadesCache ?? []);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (cidadesCache) return;
    supabase
      .from("cidades")
      .select("id, nome")
      .order("nome")
      .then(({ data }) => {
        const list = (data as Cidade[]) ?? [];
        cidadesCache = list;
        setCidades(list);
      });
  }, []);

  const filtered = useMemo(() => {
    if (!search) return cidades.slice(0, 50);
    const lower = search.toLowerCase();
    return cidades.filter((c) => c.nome.toLowerCase().includes(lower)).slice(0, 50);
  }, [cidades, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between font-normal", className)}
        >
          <span className="truncate">{value || "Cidade..."}</span>
          <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar cidade..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
            <CommandGroup>
              {filtered.map((c) => (
                <CommandItem
                  key={c.id}
                  value={c.nome}
                  onSelect={() => {
                    onSelect(c.nome);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === c.nome ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {c.nome}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
