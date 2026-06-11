
CREATE OR REPLACE VIEW public.crm_relatorio_vendas_diario AS
WITH base AS (
  -- Negociações criadas: pela data de criação do deal
  SELECT
    ((d.created_at AT TIME ZONE 'America/Sao_Paulo')::date) AS data,
    d.empreendimento_id,
    d.responsavel_id,
    d.id AS deal_id,
    'criado'::text AS evento
  FROM crm_deals d

  UNION ALL

  -- Vendas: pela data_vendido do deal (fallback updated_at, depois created_at)
  SELECT
    ((COALESCE(d.data_vendido, d.updated_at, d.created_at) AT TIME ZONE 'America/Sao_Paulo')::date) AS data,
    d.empreendimento_id,
    d.responsavel_id,
    d.id AS deal_id,
    'vendido'::text AS evento
  FROM crm_deals d
  WHERE d.status = 'vendido'

  UNION ALL

  -- Perdas: pela data_perdido do deal (fallback updated_at, depois created_at)
  SELECT
    ((COALESCE(d.data_perdido, d.updated_at, d.created_at) AT TIME ZONE 'America/Sao_Paulo')::date) AS data,
    d.empreendimento_id,
    d.responsavel_id,
    d.id AS deal_id,
    'perdido'::text AS evento
  FROM crm_deals d
  WHERE d.status = 'perdido'

  UNION ALL

  -- Demais marcos de funil continuam vindo do log de status
  SELECT
    ((l.created_at AT TIME ZONE 'America/Sao_Paulo')::date) AS data,
    l.empreendimento_id,
    l.responsavel_id,
    l.deal_id,
    l.status_novo AS evento
  FROM crm_deal_status_log l
  WHERE l.status_novo IN ('lead_recebido','contato_feito','visita_agendada','visita_realizada','ficha_assinada')
)
SELECT
  data,
  empreendimento_id,
  responsavel_id,
  count(DISTINCT CASE WHEN evento = 'criado' THEN deal_id END) AS negociacoes_criadas,
  count(*) FILTER (WHERE evento = 'lead_recebido')    AS leads_recebidos,
  count(*) FILTER (WHERE evento = 'contato_feito')    AS contatos_feitos,
  count(*) FILTER (WHERE evento = 'visita_agendada')  AS visitas_agendadas,
  count(*) FILTER (WHERE evento = 'visita_realizada') AS visitas_realizadas,
  count(*) FILTER (WHERE evento = 'ficha_assinada')   AS fichas_assinadas,
  count(DISTINCT CASE WHEN evento = 'vendido' THEN deal_id END) AS vendas,
  count(DISTINCT CASE WHEN evento = 'perdido' THEN deal_id END) AS perdas
FROM base
WHERE data IS NOT NULL
GROUP BY data, empreendimento_id, responsavel_id;
