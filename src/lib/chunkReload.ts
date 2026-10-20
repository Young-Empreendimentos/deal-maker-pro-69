// Auto-recuperação quando um "pedaço" (chunk) do app falha ao baixar.
// Acontece com aba ANTIGA aberta depois de um deploy novo (o nome/hash do chunk muda),
// ou quando o GitHub Pages fica instável. Sintoma: "Failed to fetch dynamically imported module".
// A gente recarrega a página 1x sozinho — com trava de tempo pra NUNCA entrar em loop.

export function ehErroDeChunk(e: unknown): boolean {
  const msg = String((e as { message?: string } | null | undefined)?.message ?? e ?? "");
  return /dynamically imported module|importing a module script failed|failed to fetch dynamically|chunkloaderror|loading chunk|css chunk/i.test(msg);
}

/** Recarrega a página 1x; trava de 10s impede loop se a falha persistir. Retorna true se recarregou. */
export function recarregarPorChunkUmaVez(): boolean {
  let podeRecarregar = true;
  try {
    const agora = Date.now();
    const ultimo = Number(sessionStorage.getItem("chunk-reload-ts") || "0");
    if (agora - ultimo < 10000) podeRecarregar = false; // já tentou há pouco → mostra o erro em vez de recarregar de novo
    else sessionStorage.setItem("chunk-reload-ts", String(agora));
  } catch { /* sem sessionStorage (aba privada etc.) → segue e recarrega uma vez */ }
  if (podeRecarregar) window.location.reload();
  return podeRecarregar;
}

/** Liga os ouvintes globais (chamar uma vez no boot do app). */
export function instalarAutoReloadDeChunk(): void {
  // O Vite dispara este evento quando um import() de chunk falha — pega ANTES de estourar no React.
  window.addEventListener("vite:preloadError", (e: Event) => {
    if (recarregarPorChunkUmaVez()) e.preventDefault(); // preventDefault = não deixa o Vite relançar o erro
  });
  // Rede extra: promessas rejeitadas (ex.: import dinâmico fora do fluxo do Vite).
  window.addEventListener("unhandledrejection", (e: PromiseRejectionEvent) => {
    if (ehErroDeChunk(e.reason)) recarregarPorChunkUmaVez();
  });
}
