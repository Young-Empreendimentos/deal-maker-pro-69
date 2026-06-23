/**
 * Busca TODAS as linhas de uma query Supabase, paginando manualmente.
 * Necessário porque o PostgREST do Supabase tem um teto padrão de 1000
 * linhas por request, mesmo quando o cliente pede `.limit(N)` maior.
 *
 * Uso:
 *   const tasks = await fetchAllPaged((from, to) =>
 *     supabase.from("crm_tasks").select("*").eq("concluida", true)
 *       .order("updated_at", { ascending: false })
 *       .range(from, to)
 *   );
 */
export async function fetchAllPaged<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buildQuery: (from: number, to: number) => PromiseLike<{ data: any; error: any }>,
  pageSize = 1000,
): Promise<T[]> {
  const all: T[] = [];
  let from = 0;
  // Safety net: para de iterar após 200k linhas
  for (let i = 0; i < 200; i++) {
    const { data, error } = await buildQuery(from, from + pageSize - 1);
    if (error) {
      console.error("[fetchAllPaged] erro ao paginar:", error);
      break;
    }
    const page = (data ?? []) as T[];
    all.push(...page);
    if (page.length < pageSize) break;
    from += pageSize;
  }
  return all;
}