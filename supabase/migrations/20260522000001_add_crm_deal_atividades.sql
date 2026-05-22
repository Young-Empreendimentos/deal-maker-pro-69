create table crm_deal_atividades (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references crm_deals(id) on delete cascade,
  user_id uuid not null,
  tipo text not null,
  descricao text not null,
  created_at timestamptz not null default now()
);

create index crm_deal_atividades_deal_id_idx on crm_deal_atividades(deal_id);
