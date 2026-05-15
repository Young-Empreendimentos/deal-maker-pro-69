-- crm_consultores.user_id + backfill responsavel_id
--
-- Objetivo: ligar cada linha de crm_consultores ao seu auth.users.id correspondente
-- (via email no crm_rd_user_map), permitindo que a Edge Function ingest-lead-sellflux
-- (operada pela Adventure Labs, fora deste repo) preencha crm_deals.responsavel_id
-- corretamente, e que cada vendedora veja seus próprios leads pela RLS canônica
-- (admin OR responsavel_id = auth.uid()).
--
-- Pré-requisito: as 8 contas em auth.users (emails listados no handoff
-- 2026-05-15_leads-invisiveis-pingolead.md, repo ssot Adventure Labs) precisam
-- existir. Sem isso, o passo 2 é no-op silencioso (não falha).
--
-- Idempotente: pode ser rodado várias vezes.

begin;

-- 1. Coluna user_id em crm_consultores
alter table public.crm_consultores
  add column if not exists user_id uuid unique
  references auth.users(id) on delete set null;

comment on column public.crm_consultores.user_id is
  'FK para auth.users — usado pelo ingestor automático Adventure Labs (Edge Function ingest-lead-sellflux) para preencher crm_deals.responsavel_id e habilitar visibilidade da vendedora via RLS.';

-- 2. Popular user_id pelos vendedores ativos via email no crm_rd_user_map
update public.crm_consultores c
set user_id = u.id
from public.crm_rd_user_map m
join auth.users u on u.email = m.rd_user_email
where c.id = m.consultor_id
  and m.ativo = true
  and c.user_id is null;

-- 3. Backfill responsavel_id em leads ingeridos desde 2026-05-11
--    (data de início da operação dual-capture RD + Pingolead)
update public.crm_deals d
set responsavel_id = c.user_id
from public.crm_consultores c
where d.consultor_id = c.id
  and c.user_id is not null
  and d.responsavel_id = 'fb37f75d-124d-43d0-bf79-c49c6e01720f'  -- uid do Eduardo (default atual da Edge Function)
  and d.created_at >= '2026-05-11';

commit;
