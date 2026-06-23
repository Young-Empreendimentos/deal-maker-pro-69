-- Índices para acelerar Negociações e Relatórios
CREATE INDEX IF NOT EXISTS idx_crm_deals_status_created_at ON public.crm_deals (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_deals_created_at ON public.crm_deals (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_deals_data_vendido ON public.crm_deals (data_vendido DESC) WHERE data_vendido IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_deals_data_perdido ON public.crm_deals (data_perdido DESC) WHERE data_perdido IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_deals_consultor_id ON public.crm_deals (consultor_id) WHERE consultor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_deals_responsavel_venda_user ON public.crm_deals (responsavel_venda_user_id) WHERE responsavel_venda_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_deals_empreendimento_id ON public.crm_deals (empreendimento_id) WHERE empreendimento_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_deals_fonte_id ON public.crm_deals (fonte_id) WHERE fonte_id IS NOT NULL;

-- Busca por telefone (ILIKE) na busca global
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_crm_deal_phones_telefone_trgm ON public.crm_deal_phones USING gin (telefone gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_crm_deal_phones_deal_id ON public.crm_deal_phones (deal_id);

-- Atualiza estatísticas para o planner usar os novos índices
ANALYZE public.crm_deals;
ANALYZE public.crm_deal_phones;