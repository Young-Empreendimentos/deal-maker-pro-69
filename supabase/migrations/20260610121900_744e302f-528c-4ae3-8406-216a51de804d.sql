
CREATE OR REPLACE VIEW public.crm_relatorio_vendas_diario AS
WITH base AS (
  SELECT
    (d.created_at AT TIME ZONE 'America/Sao_Paulo')::date AS data,
    d.empreendimento_id,
    d.responsavel_id,
    d.id AS deal_id,
    NULL::text AS status_novo
  FROM public.crm_deals d
  UNION ALL
  SELECT
    (l.created_at AT TIME ZONE 'America/Sao_Paulo')::date AS data,
    l.empreendimento_id,
    l.responsavel_id,
    l.deal_id,
    l.status_novo::text
  FROM public.crm_deal_status_log l
)
SELECT
  data,
  empreendimento_id,
  responsavel_id,
  COUNT(DISTINCT CASE WHEN status_novo IS NULL THEN deal_id END) AS negociacoes_criadas,
  COUNT(*) FILTER (WHERE status_novo = 'lead_recebido')   AS leads_recebidos,
  COUNT(*) FILTER (WHERE status_novo = 'contato_feito')   AS contatos_feitos,
  COUNT(*) FILTER (WHERE status_novo = 'visita_agendada') AS visitas_agendadas,
  COUNT(*) FILTER (WHERE status_novo = 'visita_realizada')AS visitas_realizadas,
  COUNT(*) FILTER (WHERE status_novo = 'ficha_assinada')  AS fichas_assinadas,
  COUNT(*) FILTER (WHERE status_novo = 'vendido')         AS vendas,
  COUNT(*) FILTER (WHERE status_novo = 'perdido')         AS perdas
FROM base
WHERE data IS NOT NULL
GROUP BY data, empreendimento_id, responsavel_id;

GRANT SELECT ON public.crm_relatorio_vendas_diario TO authenticated;
GRANT ALL    ON public.crm_relatorio_vendas_diario TO service_role;
