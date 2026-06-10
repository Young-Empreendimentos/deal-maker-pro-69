---
name: Identidade visual da marca
description: Paleta oficial, tipografia e tokens de gradiente/sombra usados em todo o CRM
type: design
---
Paleta oficial (aplicada em `src/index.css` como tokens HSL):
- Laranja principal `#FE5009` → `--primary` (18 99% 52%)
- Laranja escuro `#751900` → `--primary-deep` (13 100% 23%)
- Azul corporativo `#061B39` → `--accent` e `--sidebar-background` (218 81% 12%)
- Cinza espacial `#0D0D0D` → `--foreground`
- Cinza claro `#F2F2F2` → `--background`
- Branco `#FFFFFF` → `--card`

Tipografia:
- Display/headings: **Space Grotesk** (`font-display`)
- Body/UI: **Be Vietnam Pro** (`font-sans`) — importadas em `src/index.css`

Utilities prontas: `bg-gradient-brand` (azul→laranja escuro), `bg-gradient-ember` (laranja vibrante), `shadow-brand`, `shadow-ember`. Usar em heros, CTAs principais e cards de destaque. Nunca hardcodar hex em componentes — sempre via tokens.