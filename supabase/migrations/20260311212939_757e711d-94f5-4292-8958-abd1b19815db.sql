
-- Add new status values to crm_deal_status enum
ALTER TYPE crm_deal_status ADD VALUE IF NOT EXISTS 'perdido';
ALTER TYPE crm_deal_status ADD VALUE IF NOT EXISTS 'vendido';

-- Add new fields to crm_deals for proposal stage
ALTER TABLE crm_deals
  ADD COLUMN IF NOT EXISTS numero_lote text,
  ADD COLUMN IF NOT EXISTS preco_lote numeric,
  ADD COLUMN IF NOT EXISTS forma_pagamento text,
  ADD COLUMN IF NOT EXISTS link_contrato text,
  ADD COLUMN IF NOT EXISTS versao_tabela text,
  ADD COLUMN IF NOT EXISTS interesse text,
  ADD COLUMN IF NOT EXISTS satisfacao_atendimento integer,
  ADD COLUMN IF NOT EXISTS satisfacao_produto integer,
  ADD COLUMN IF NOT EXISTS responsavel_venda_user_id uuid,
  ADD COLUMN IF NOT EXISTS responsavel_venda_imobiliaria_id uuid,
  ADD COLUMN IF NOT EXISTS valor_entrada numeric,
  ADD COLUMN IF NOT EXISTS data_nascimento date,
  ADD COLUMN IF NOT EXISTS escolaridade text,
  ADD COLUMN IF NOT EXISTS estado_civil text,
  ADD COLUMN IF NOT EXISTS sexo text,
  ADD COLUMN IF NOT EXISTS nacionalidade text,
  ADD COLUMN IF NOT EXISTS cidade_cliente text,
  ADD COLUMN IF NOT EXISTS logradouro text,
  ADD COLUMN IF NOT EXISTS numero_logradouro text,
  ADD COLUMN IF NOT EXISTS tipo_residencia text,
  ADD COLUMN IF NOT EXISTS renda_familiar text,
  ADD COLUMN IF NOT EXISTS filhos text,
  ADD COLUMN IF NOT EXISTS interesses_pessoais text[] DEFAULT '{}';

-- Add foreign key for responsavel_venda_imobiliaria_id
ALTER TABLE crm_deals
  ADD CONSTRAINT crm_deals_responsavel_venda_imobiliaria_fkey
  FOREIGN KEY (responsavel_venda_imobiliaria_id)
  REFERENCES imobiliarias(id)
  ON DELETE SET NULL;
