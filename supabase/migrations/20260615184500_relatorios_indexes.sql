-- Índices para acelerar a página de Relatórios
CREATE INDEX IF NOT EXISTS idx_crm_deals_data_vendido ON public.crm_deals (data_vendido DESC) WHERE data_vendido IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_deals_status_created_at ON public.crm_deals (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_deals_status_vendido_null ON public.crm_deals (status) WHERE status = 'vendido' AND data_vendido IS NULL;
