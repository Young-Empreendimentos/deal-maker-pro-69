CREATE INDEX IF NOT EXISTS idx_crm_deals_responsavel_id_status_created_at ON public.crm_deals (responsavel_id, status, created_at DESC) WHERE responsavel_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_deals_status_updated_at ON public.crm_deals (status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_deals_status_data_perdido_created_at ON public.crm_deals (status, data_perdido DESC, created_at DESC) WHERE data_perdido IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_deals_status_data_vendido_created_at ON public.crm_deals (status, data_vendido DESC, created_at DESC) WHERE data_vendido IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_deals_status_interesse_created_at ON public.crm_deals (status, interesse, created_at DESC) WHERE interesse IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_deals_status_preco_lote_created_at ON public.crm_deals (status, preco_lote, created_at DESC) WHERE preco_lote IS NOT NULL;
ANALYZE public.crm_deals;