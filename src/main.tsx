import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Blindagem contra o tradutor do navegador (Google Tradutor): ele troca nós de texto do DOM e faz
// o React estourar "removeChild/insertBefore: the node is not a child of this node" → tela branca.
// Se o nó já não é mais filho do pai (o tradutor mexeu), a gente ignora em vez de deixar quebrar.
if (typeof Node === "function" && Node.prototype) {
  const _removeChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) return child;
    return _removeChild.call(this, child) as T;
  };
  const _insertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(this: Node, newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) return this.appendChild(newNode) as T;
    return _insertBefore.call(this, newNode, referenceNode) as T;
  };
}

createRoot(document.getElementById("root")!).render(<App />);
