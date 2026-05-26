-- Issue #10 — Cleanup de policies legadas em pt-BR
-- ROD QUEM: Founder no SQL Editor do Supabase
-- QUANDO: depois de aplicar 2026-05-26-issue-10-imobiliarias-ativo.sql e antes do merge final
-- CONTEXTO: a tabela imobiliarias herdou 4 policies em pt-BR do Lovable que permitiam
--           qualquer usuário autenticado criar/editar imobiliárias. O issue #10 implica
--           admin-only — então dropamos as legadas para que as novas (imobiliarias_admin_*)
--           passem a valer sozinhas (no Postgres, policies do mesmo comando se combinam
--           com OR, então uma policy permissiva basta para liberar acesso).
--
-- Idempotente: DROP IF EXISTS.

DROP POLICY IF EXISTS "Apenas admins podem excluir imobiliárias"  ON public.imobiliarias;
DROP POLICY IF EXISTS "Autenticados podem atualizar imobiliárias" ON public.imobiliarias;
DROP POLICY IF EXISTS "Autenticados podem criar imobiliárias"     ON public.imobiliarias;
DROP POLICY IF EXISTS "Todos autenticados podem ver imobiliárias" ON public.imobiliarias;

-- Verificação esperada — apenas as 4 policies snake_case devem permanecer:
-- SELECT polname, polcmd FROM pg_policy
-- WHERE polrelid = 'public.imobiliarias'::regclass ORDER BY polname;
