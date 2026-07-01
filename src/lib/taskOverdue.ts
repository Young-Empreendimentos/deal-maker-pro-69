// Calcula se uma tarefa está atrasada SEMPRE no fuso de São Paulo
// (America/Sao_Paulo), independente do fuso configurado na máquina do usuário.
//
// Regra:
// - Só data (sem hora): o dia inteiro é prazo -> atrasada apenas se a data de
//   vencimento é anterior a hoje (em SP).
// - Com hora: atrasada se já passou do dia + hora (em SP).
//
// Como data_vencimento ("YYYY-MM-DD") e hora_vencimento ("HH:MM[:SS]") são
// valores "de parede" (sem fuso), comparamos como strings de largura fixa
// contra o "agora" também formatado em SP — evitando qualquer conversão de
// fuso baseada na máquina do cliente.

const SP_TZ = "America/Sao_Paulo";

/** Data e hora atuais em São Paulo, como strings comparáveis ("YYYY-MM-DD", "HH:MM:SS"). */
function agoraSaoPaulo(): { data: string; hora: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SP_TZ,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const p: Record<string, string> = {};
  for (const { type, value } of parts) p[type] = value;
  return { data: `${p.year}-${p.month}-${p.day}`, hora: `${p.hour}:${p.minute}:${p.second}` };
}

export type TaskOverdueInput = {
  data_vencimento: string | null;
  hora_vencimento: string | null;
  concluida: boolean;
};

export function isTaskOverdue(t: TaskOverdueInput): boolean {
  if (!t.data_vencimento || t.concluida) return false;
  const agora = agoraSaoPaulo();
  if (t.hora_vencimento) {
    // Normaliza "HH:MM" -> "HH:MM:00" para comparar largura fixa
    const hora = t.hora_vencimento.length === 5 ? `${t.hora_vencimento}:00` : t.hora_vencimento;
    return `${t.data_vencimento}T${hora}` < `${agora.data}T${agora.hora}`;
  }
  // Só data: atrasada apenas se venceu antes de hoje (SP)
  return t.data_vencimento < agora.data;
}
