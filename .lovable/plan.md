

## CRM Personalizado — Plano Atualizado

### 1. Autenticação e Controle de Acesso
- Login com e-mail e senha via Supabase Auth
- Dois perfis: **Admin** (vê tudo) e **Vendedor** (vê apenas suas negociações)
- Tabela de roles separada (admin/vendedor)
- Admin pode convidar novos usuários

### 2. Cadastro de Empreendimentos (Admin)
- Campos: Nome, Cidade, Status (ativo/inativo)

### 3. Cadastro de Fontes de Lead (Admin)
- Lista fixa gerenciável + opção de adicionar novas

### 4. Página de Negociações
- **Kanban** (Lead Recebido → Contato Feito → Visita Agendada → Visita Realizada → Ficha Assinada → Proposta Recebida) e **Planilha**
- Campos: Nome do cliente, Fonte, Qualificação (Frio/Morno/Quente), Data criação (auto), Telefone(s), E-mail, Empreendimento, Status, Responsável
- Filtros: usuário, status, empreendimento, cidade
- Ordenação: contato recente, data criação, nome, qualificação
- **Galeria de imagens**: na página de detalhes da negociação, seção mostrando todas as imagens das tarefas vinculadas, com data de upload e nome da tarefa associada

### 5. Tarefas (vinculadas a negociações)
- Campos: Título, Descrição, Data de vencimento, Status, Responsável
- **Upload de imagens**: permitir anexar múltiplas imagens a cada tarefa
- Imagens armazenadas no Supabase Storage (bucket `task-images`)
- Cada imagem registra data de upload e referência à tarefa
- Visualização das imagens dentro da tarefa e também na página da negociação

### 6. Layout
- Sidebar: Negociações, Empreendimentos, Configurações
- Header com usuário e logout
- Design responsivo e limpo

### 7. Backend (Supabase)
- Tabelas: profiles, user_roles, deals, deal_phones, tasks, task_images, enterprises, lead_sources
- Storage bucket `task-images` com RLS
- RLS: vendedor vê só seus deals/tarefas, admin vê todos

