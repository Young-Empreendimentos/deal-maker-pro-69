-- Issue #11 — Substituição canônica das imobiliárias
-- ROD QUEM: Founder (Rodrigo) no SQL Editor do Supabase
-- QUANDO: depois de aplicar o SQL da #10 e antes do merge deste PR
-- CONTEXTO: as 166 imobiliárias atuais foram inventadas pelo Lovable durante o
--           bootstrap do app (Eduardo) — nenhuma tem vendas vinculadas e nenhuma
--           segue o padrão canônico do RD Station. Decisão Founder 2026-05-26:
--           apagar todas, inserir as 103 canônicas mandadas pela Marketing-Young
--           no PV de 2026-05-25, e deixar admin cadastrar as novas via UI (#10).
--
-- IMPORTANTE: rodar em transação para garantir atomicidade. Se algo falhar,
--             rollback automático.
--
-- Convenção de sigla:
--   BAY = Morada
--   CAY = Erico Verissimo
--   MTC = Montecarlo
--   SAP = Santo Antônio da Patrulha (região guarda-chuva — não é empreendimento
--         individual; engloba SAY/IDA/PGR/JDP cadastrados em crm_empreendimentos)
--   SBY = Parque Lorena guarda-chuva (engloba SBY1+SBY2)
--   SLY = Aurora

BEGIN;

-- 1. Salvaguarda — abortar se alguma imobiliária atual já tem venda vinculada
--    (Founder confirmou que ninguém tem em 2026-05-26, mas defesa em profundidade)
DO $$
DECLARE
  v_count integer;
BEGIN
  SELECT count(*) INTO v_count
  FROM public.crm_deals d
  WHERE d.responsavel_venda_imobiliaria_id IN (SELECT id FROM public.imobiliarias);

  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORTADO: % vendas têm responsavel_venda_imobiliaria_id apontando para imobiliárias existentes — não posso deletar sem perder FK', v_count;
  END IF;
END $$;

-- 2. Limpar imobiliárias atuais (sem FK pra preservar)
DELETE FROM public.imobiliarias;

-- 3. Inserir as 103 canônicas (lista do PV Marketing-Young 2026-05-25)
INSERT INTO public.imobiliarias (nome, ativo) VALUES
  -- MTC (2)
  ('MTC - Fonther', true),
  ('MTC - João Hoffmann', true),

  -- SAP (25)
  ('SAP - Douglas', true),
  ('SAP - Erivelto', true),
  ('SAP - Golden', true),
  ('SAP - Jaqueline', true),
  ('SAP - Maxtile', true),
  ('SAP - Realiza', true),
  ('SAP - Roma', true),
  ('SAP - Savana', true),
  ('SAP - SX', true),
  ('SAP - Urbanize', true),
  ('SAP - Vanessa', true),
  ('SAP - Vilson', true),
  ('SAP - AA vendas e Consórcios', true),
  ('SAP - Andressa Maciel', true),
  ('SAP - João Vitor Bicca', true),
  ('SAP - Karime', true),
  ('SAP - Jonas Andrade Fraga', true),
  ('SAP - Matheus dos Santos Faccini', true),
  ('SAP - Aline Vanessa Kunzler Marques', true),
  ('SAP - Simião', true),
  ('SAP - Erivelto Cunha dos Santos', true),
  ('SAP - Flavio Gomes', true),
  ('SAP - Gian Oliveira', true),
  ('SAP - Alexandre de Lima (Golden)', true),
  ('SAP - Jasmini Vicenci', true),

  -- SBY (6)
  ('SBY - Adenor', true),
  ('SBY - G2', true),
  ('SBY - Ícaro', true),
  ('SBY - Places', true),
  ('SBY - Silva Rillo', true),
  ('SBY - Fernando Oliveira', true),

  -- SLY (12)
  ('SLY - Belleza', true),
  ('SLY - Figueiredo e Mattos', true),
  ('SLY - Invicta', true),
  ('SLY - Mauricio Boff', true),
  ('SLY - Niederauer', true),
  ('SLY - Pereira', true),
  ('SLY - Laurence', true),
  ('SLY - Giane Dutra', true),
  ('SLY - Franco Gabriel Palombo Bottino', true),
  ('SLY - Ruben Matías Machado Lima', true),
  ('SLY - Trento Imóveis e Consórcios', true),
  ('SLY - Elissandro Machado', true),

  -- BAY (35)
  ('BAY - Aline Lopes', true),
  ('BAY - Bia', true),
  ('BAY - Cadora', true),
  ('BAY - Camila Centena', true),
  ('BAY - Campana', true),
  ('BAY - iCasa', true),
  ('BAY - Dewes', true),
  ('BAY - De Bem', true),
  ('BAY - Eder Faria', true),
  ('BAY - Fernanda Romariz', true),
  ('BAY - Ignacio', true),
  ('BAY - Imobilar', true),
  ('BAY - Gladmir Guterres', true),
  ('BAY - Marcos Moreira', true),
  ('BAY - Invista', true),
  ('BAY - JR', true),
  ('BAY - JW', true),
  ('BAY - Leandro Teixeira', true),
  ('BAY - Lisiane Lopes', true),
  ('BAY - Luciana Gugo', true),
  ('BAY - MB', true),
  ('BAY - Novo Lar', true),
  ('BAY - Piragibe', true),
  ('BAY - Planagro', true),
  ('BAY - Predial', true),
  ('BAY - ReMax', true),
  ('BAY - Rochinha', true),
  ('BAY - Sarah Lins', true),
  ('BAY - Kaline Centena', true),
  ('BAY - Innovare', true),
  ('BAY - Viva Bem', true),
  ('BAY - Victor', true),
  ('BAY - Carim', true),
  ('BAY - Wild', true),
  ('BAY - Vivenda', true),

  -- CAY (23)
  ('CAY - Thagner Dorneles', true),
  ('CAY - Profit Imóveis', true),
  ('CAY - Master Cruz', true),
  ('CAY - Pedro Mariano Imóveis', true),
  ('CAY - Jomar Badin Silveira', true),
  ('CAY - Tiago', true),
  ('CAY - Di Bento Imóveis', true),
  ('CAY - Luis Francisco Biaotto', true),
  ('CAY - Imobiliária Domingos', true),
  ('CAY - RG Imóveis', true),
  ('CAY - Imobiliária Cruz Alta', true),
  ('CAY - Imobiliária La Maison', true),
  ('CAY - Personal Imóveis', true),
  ('CAY - Perfil Imóveis', true),
  ('CAY - Erthal Imóveis', true),
  ('CAY - Marquesan Imóveis', true),
  ('CAY - Távola Assessoria Imobiliária', true),
  ('CAY - Valdir Junior e Matheus Pidilha', true),
  ('CAY - Rossano', true),
  ('CAY - Rodrigo', true),
  ('CAY - Matheus Padilha', true),
  ('CAY - Imobiliária Premium', true),
  ('CAY - Aline Imóveis', true);

-- 4. Validação: deve fechar em 103
DO $$
DECLARE
  v_total integer;
BEGIN
  SELECT count(*) INTO v_total FROM public.imobiliarias;
  IF v_total <> 103 THEN
    RAISE EXCEPTION 'ABORTADO: count final = % (esperado 103)', v_total;
  END IF;
END $$;

COMMIT;

-- Validação manual pós-COMMIT (opcional):
-- SELECT split_part(nome,' - ',1) AS sigla, count(*) FROM public.imobiliarias GROUP BY 1 ORDER BY 1;
-- Esperado:
--   BAY | 35
--   CAY | 23
--   MTC | 2
--   SAP | 25
--   SBY | 6
--   SLY | 12
