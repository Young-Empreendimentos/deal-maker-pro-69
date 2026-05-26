-- Issue #10 — Admin CRUD imobiliárias
-- ROD QUEM: Founder (Rodrigo) no SQL Editor do Supabase
-- QUANDO: antes do merge do PR feat/10-crud-imobiliarias
-- ESCOPO: adicionar coluna `ativo` (suporte a soft-delete) e RLS mínima para a
--         tela admin operar com a chave anon do app (que sempre tem usuário
--         autenticado, e mutações restritas a role=admin).
--
-- Idempotente: pode ser rodado mais de uma vez sem efeito colateral.

-- 1. Coluna ativo (soft-delete: preserva FK em vendas históricas)
ALTER TABLE public.imobiliarias
  ADD COLUMN IF NOT EXISTS ativo boolean NOT NULL DEFAULT true;

-- 2. Índice para o dropdown "Responsável pela venda → Imobiliária"
--    (filtra ativas + ordena por nome)
CREATE INDEX IF NOT EXISTS imobiliarias_ativo_nome_idx
  ON public.imobiliarias (ativo, nome);

-- 3. Trigger updated_at (se ainda não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'imobiliarias_set_updated_at'
      AND tgrelid = 'public.imobiliarias'::regclass
  ) THEN
    CREATE OR REPLACE FUNCTION public.set_updated_at_imobiliarias()
    RETURNS trigger LANGUAGE plpgsql AS $fn$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $fn$;

    CREATE TRIGGER imobiliarias_set_updated_at
      BEFORE UPDATE ON public.imobiliarias
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_imobiliarias();
  END IF;
END $$;

-- 4. RLS — SELECT para qualquer usuário autenticado, mutações apenas para admin.
--    Padrão idêntico ao usado em crm_empreendimentos / crm_fontes_lead.
ALTER TABLE public.imobiliarias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS imobiliarias_select ON public.imobiliarias;
CREATE POLICY imobiliarias_select ON public.imobiliarias
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS imobiliarias_admin_insert ON public.imobiliarias;
CREATE POLICY imobiliarias_admin_insert ON public.imobiliarias
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS imobiliarias_admin_update ON public.imobiliarias;
CREATE POLICY imobiliarias_admin_update ON public.imobiliarias
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS imobiliarias_admin_delete ON public.imobiliarias;
CREATE POLICY imobiliarias_admin_delete ON public.imobiliarias
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- 5. Verificação rápida (executar manualmente após o ALTER):
-- SELECT count(*) AS total, count(*) FILTER (WHERE ativo) AS ativas FROM public.imobiliarias;
-- SELECT polname, polcmd FROM pg_policy WHERE polrelid = 'public.imobiliarias'::regclass;
