/**
 * IDs de usuários que devem ser ocultados de filtros e selects
 * de consultor/responsável em todo o CRM.
 */
export const EXCLUDED_USER_IDS = new Set([
  "a76e717c-dfeb-47a9-a8fa-dfdefb9a6cd2", // maximo@youngempreendimentos.com.br
  "e7446638-a312-41b5-8730-65a55dccf4ee", // caroline.freiberger@youngempreendimentos.com.br
  "ba833343-39ea-453e-a338-a7d2a015a0cf", // daiane@youngempreendimentos.com.br
  "b9829e6a-3e84-492a-b29f-7f1c57cebbf6", // samara@youngempreendimentos.com.br
  "65e3f371-6d2b-433f-811b-1d9f22077cd3", // joana@youngempreendimentos.com.br (gestora — não recebe leads)
]);

/** Verifica se um user_id deve ser exibido em filtros/selects */
export function isVisibleUser(userId: string): boolean {
  return !EXCLUDED_USER_IDS.has(userId);
}
