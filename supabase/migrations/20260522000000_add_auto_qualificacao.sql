-- Colunas preenchidas por automação (separadas dos campos manuais)
ALTER TABLE crm_deals
  ADD COLUMN IF NOT EXISTS auto_interesse text,
  ADD COLUMN IF NOT EXISTS auto_renda_familiar text,
  ADD COLUMN IF NOT EXISTS auto_valor_entrada numeric;
