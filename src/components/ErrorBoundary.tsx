import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, ArrowLeft } from "lucide-react";

type Props = {
  children: ReactNode;
  /** Quando muda (ex.: rota), o boundary se reseta — permite sair da tela quebrada sem recarregar tudo. */
  resetKey?: string;
};
type State = { hasError: boolean; error: Error | null };

/**
 * Rede de segurança do app: se qualquer tela estourar um erro em tempo de render,
 * mostra um aviso amigável (com o detalhe técnico) em vez de deixar a TELA BRANCA.
 * Sem isto, um único erro derruba todo o React e o usuário vê só o branco.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Fica no console do navegador — é o que a gente vai ler pra achar a causa.
    console.error("[ErrorBoundary] tela quebrou:", error, info.componentStack);
  }

  componentDidUpdate(prev: Props) {
    // Mudou de tela (rota) depois de um erro → limpa o estado e tenta renderizar de novo.
    if (this.state.hasError && prev.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const msg = this.state.error?.message || "Erro desconhecido";
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-md rounded-xl border bg-card p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Algo deu errado nesta tela</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A tela encontrou um erro e não carregou. Isso é do sistema, não do seu aparelho —
            tente recarregar. Se continuar, me mande o detalhe abaixo.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={() => window.location.reload()} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Recarregar
            </Button>
            <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
          </div>
          <details className="mt-5 text-left">
            <summary className="cursor-pointer text-xs text-muted-foreground">Detalhe técnico</summary>
            <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-md bg-muted p-3 text-[11px] text-muted-foreground">
              {msg}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
