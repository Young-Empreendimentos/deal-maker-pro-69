-- Adicionar campos de data específicos para rastrear quando foi vendido/perdido
ALTER TABLE crm_deals 
ADD COLUMN IF NOT EXISTS data_vendido TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS data_perdido TIMESTAMP WITH TIME ZONE;

-- Criar função que atualiza essas datas automaticamente quando status muda
CREATE OR REPLACE FUNCTION update_deal_status_dates()
RETURNS TRIGGER AS $$
BEGIN
  -- Se status mudou para 'vendido' e data_vendido está NULL, preencher agora
  IF NEW.status = 'vendido' AND OLD.status != 'vendido' THEN
    NEW.data_vendido = NOW();
  END IF;
  
  -- Se status mudou para 'perdido' e data_perdido está NULL, preencher agora
  IF NEW.status = 'perdido' AND OLD.status != 'perdido' THEN
    NEW.data_perdido = NOW();
  END IF;
  
  -- Se status voltou para algo que não é 'vendido', limpar data_vendido
  IF NEW.status != 'vendido' AND OLD.status = 'vendido' THEN
    NEW.data_vendido = NULL;
  END IF;
  
  -- Se status voltou para algo que não é 'perdido', limpar data_perdido
  IF NEW.status != 'perdido' AND OLD.status = 'perdido' THEN
    NEW.data_perdido = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger anterior se existir
DROP TRIGGER IF EXISTS update_deal_status_dates_trigger ON crm_deals;

-- Criar trigger
CREATE TRIGGER update_deal_status_dates_trigger
BEFORE UPDATE ON crm_deals
FOR EACH ROW
EXECUTE FUNCTION update_deal_status_dates();
