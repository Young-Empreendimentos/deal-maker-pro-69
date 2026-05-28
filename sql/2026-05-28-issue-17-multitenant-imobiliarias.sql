-- 2026-05-28 — Multi-app imobiliarias (Adventure Labs / Young)
-- ROD QUEM: Founder no SQL Editor do Supabase Young (vvtympzatclvjaqucebr)
-- ESCOPO: Reconstruir multi-app coexistencia da tabela public.imobiliarias.
--   - Pingolead (deal-maker-pro-69)            → filtra WHERE ativo_crm AND ativo
--   - Novos Negocios (perdigueiro / 0050eb8f-) → filtra WHERE ativo_nn  AND ativo
-- Contexto: incidente 2026-05-26 (DELETE+INSERT issue #11) trocou 166 dados reais
-- do Perdigueiro pelas 103 canonicas Marketing-Young, quebrando dropdown do Novos
-- Negocios. Recuperamos as 166 via PITR (backup 26 May 10:14 UTC) e reinjetamos
-- com ativo_nn=true, ativo_crm=false. Universos disjuntos confirmados (0 overlap
-- por nome normalizado).
-- Idempotente. UUIDs originais preservados pra nao quebrar referencias futuras.

BEGIN;

-- ============================================================================
-- 1. Adicionar flags multi-app
-- ============================================================================

ALTER TABLE public.imobiliarias
  ADD COLUMN IF NOT EXISTS ativo_crm boolean NOT NULL DEFAULT false;

ALTER TABLE public.imobiliarias
  ADD COLUMN IF NOT EXISTS ativo_nn  boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.imobiliarias.ativo_crm IS
  'Visibilidade no app Pingolead (deal-maker-pro-69). Admin marca via UI. ativo continua sendo soft-delete global.';

COMMENT ON COLUMN public.imobiliarias.ativo_nn  IS
  'Visibilidade no app Novos Negocios (perdigueiro / Lovable 0050eb8f-...). Admin marca via UI.';

-- ============================================================================
-- 2. Backfill: as 103 atuais (canon Marketing-Young, formato "XXX - Nome") sao
--    o universo CRM Pingolead por construcao.
-- ============================================================================

UPDATE public.imobiliarias
SET ativo_crm = true
WHERE ativo_crm = false
  AND ativo = true
  AND nome ~ '^[A-Z]{2,5} - ';

-- ============================================================================
-- 3. Reinjetar as 166 imobiliarias do Perdigueiro recuperadas via PITR.
--    UUIDs, timestamps e dados originais preservados.
--    ativo_nn=true, ativo_crm=false, ativo=true.
--    ON CONFLICT (id) DO NOTHING garante idempotencia.
-- ============================================================================

INSERT INTO public.imobiliarias
  (id, nome, contato_nome, telefone, link_social, created_at, updated_at, ativo, ativo_crm, ativo_nn)
VALUES
  ('a9d5bf1a-e7e2-4155-adb1-3ddec7b56f1b'::uuid, 'Fábio Manozzo', NULL, NULL, NULL, '2026-02-07T17:43:08.596354+00:00'::timestamptz, '2026-02-07T17:43:08.596354+00:00'::timestamptz, true, false, true),
  ('b26c89bf-5a86-4427-a74a-12756f87300a'::uuid, 'Alto da Serra Imóveis', NULL, NULL, NULL, '2026-02-07T17:43:13.678342+00:00'::timestamptz, '2026-02-07T17:43:13.678342+00:00'::timestamptz, true, false, true),
  ('18a57f2d-ef71-49c9-9631-4e96b353937e'::uuid, 'RG Imoveis', NULL, NULL, NULL, '2026-02-07T17:43:18.15639+00:00'::timestamptz, '2026-02-07T17:43:18.15639+00:00'::timestamptz, true, false, true),
  ('99880cf6-9335-4a21-8bb5-2533089f19bc'::uuid, 'Ijuí Imoveis', NULL, NULL, NULL, '2026-02-07T17:43:22.753522+00:00'::timestamptz, '2026-02-07T17:43:22.753522+00:00'::timestamptz, true, false, true),
  ('9355926b-ffc0-41b9-bdbd-46aeeb33001e'::uuid, 'Renata Corretora', NULL, NULL, NULL, '2026-02-07T17:52:34.84525+00:00'::timestamptz, '2026-02-07T17:52:34.84525+00:00'::timestamptz, true, false, true),
  ('a81c192f-81e5-489a-9c22-5294b63074fb'::uuid, 'Liberty Imoveis', NULL, NULL, NULL, '2026-02-07T17:52:39.578833+00:00'::timestamptz, '2026-02-07T17:52:39.578833+00:00'::timestamptz, true, false, true),
  ('8ae300f5-1acf-42b3-b30e-a02ea0f6445d'::uuid, 'Corretor Mauro', NULL, NULL, NULL, '2026-02-07T17:52:40.269766+00:00'::timestamptz, '2026-02-07T17:52:40.269766+00:00'::timestamptz, true, false, true),
  ('51f1575a-5737-4b2f-854e-dd00ab1f3c2e'::uuid, 'Imob. Klering', NULL, NULL, NULL, '2026-02-07T17:52:41.988346+00:00'::timestamptz, '2026-02-07T17:52:41.988346+00:00'::timestamptz, true, false, true),
  ('a7289486-307e-4195-bc07-a369de639988'::uuid, 'Roma Imoveis', NULL, NULL, NULL, '2026-02-07T17:52:49.989033+00:00'::timestamptz, '2026-02-07T17:52:49.989033+00:00'::timestamptz, true, false, true),
  ('4a6ad181-e938-4048-8ea7-1b7221bee26e'::uuid, 'Athena', NULL, NULL, NULL, '2026-02-07T17:52:54.631136+00:00'::timestamptz, '2026-02-07T17:52:54.631136+00:00'::timestamptz, true, false, true),
  ('3a9e249c-f9e2-4854-af8e-813f271c26de'::uuid, 'Corretor Ivan', NULL, NULL, NULL, '2026-02-07T17:52:57.187848+00:00'::timestamptz, '2026-02-07T17:52:57.187848+00:00'::timestamptz, true, false, true),
  ('e4c03690-fcf6-419f-ab31-09ab73abc21d'::uuid, 'Vagner Uberti Pinto', NULL, NULL, NULL, '2026-02-07T17:53:02.900917+00:00'::timestamptz, '2026-02-07T17:53:02.900917+00:00'::timestamptz, true, false, true),
  ('4c9f35fc-0da6-4442-83a2-6e01ae3144f7'::uuid, 'Triunfo Imóveis', NULL, NULL, NULL, '2026-02-07T17:53:06.002974+00:00'::timestamptz, '2026-02-07T17:53:06.002974+00:00'::timestamptz, true, false, true),
  ('c5190d21-3f38-4115-a727-72c60c06596a'::uuid, 'Serrana Imoveis', NULL, NULL, NULL, '2026-02-07T17:53:20.229993+00:00'::timestamptz, '2026-02-07T17:53:20.229993+00:00'::timestamptz, true, false, true),
  ('a1168201-af83-4b37-8566-f0004a367d2b'::uuid, 'Imobiliária do Gustavo', NULL, NULL, NULL, '2026-02-07T17:53:22.730849+00:00'::timestamptz, '2026-02-07T17:53:22.730849+00:00'::timestamptz, true, false, true),
  ('0c9b5d7b-1305-4f51-a543-5e1e601e9e73'::uuid, 'Julia Inda', NULL, NULL, NULL, '2026-02-07T17:53:32.977518+00:00'::timestamptz, '2026-02-07T17:53:32.977518+00:00'::timestamptz, true, false, true),
  ('715b4289-0ff6-4b8e-8782-30bc797d8291'::uuid, 'Maciel - Vendas e Adm. de Imóveis', NULL, NULL, NULL, '2026-02-07T17:53:59.365267+00:00'::timestamptz, '2026-02-07T17:53:59.365267+00:00'::timestamptz, true, false, true),
  ('06e9c94c-3fbd-4df7-a6fa-8911a8cce181'::uuid, 'CM imóveis', NULL, NULL, NULL, '2026-02-07T17:54:09.940928+00:00'::timestamptz, '2026-02-07T17:54:09.940928+00:00'::timestamptz, true, false, true),
  ('c2ca715a-a254-4d7d-b3e3-ff9d6260b37f'::uuid, 'Bella Vista - Negócios Imobiliarios.', NULL, NULL, NULL, '2026-02-07T17:54:12.271107+00:00'::timestamptz, '2026-02-07T17:54:12.271107+00:00'::timestamptz, true, false, true),
  ('02fc1877-92dd-4a6e-91f7-df8546d92e47'::uuid, 'Pietro Imoveis', NULL, NULL, NULL, '2026-02-07T17:54:14.890175+00:00'::timestamptz, '2026-02-07T17:54:14.890175+00:00'::timestamptz, true, false, true),
  ('5bd023d0-f154-41bd-891f-c2e894cb7956'::uuid, 'Impacto Imóveis', NULL, NULL, NULL, '2026-02-07T17:54:17.969679+00:00'::timestamptz, '2026-02-07T17:54:17.969679+00:00'::timestamptz, true, false, true),
  ('a45500b4-38d3-4fbb-86d3-4d100dcee714'::uuid, 'Paulo Maria Pinheiro', NULL, NULL, NULL, '2026-02-07T17:54:21.274586+00:00'::timestamptz, '2026-02-07T17:54:21.274586+00:00'::timestamptz, true, false, true),
  ('4a2fed39-10b9-41a5-ae6b-efed1e4d6da3'::uuid, 'Marques Imobiliaria', NULL, NULL, NULL, '2026-02-07T17:54:26.488633+00:00'::timestamptz, '2026-02-07T17:54:26.488633+00:00'::timestamptz, true, false, true),
  ('5fc11833-6526-4df7-8ece-598ccdc53cbd'::uuid, 'Imobilar', NULL, NULL, NULL, '2026-02-07T17:54:37.207536+00:00'::timestamptz, '2026-02-07T17:54:37.207536+00:00'::timestamptz, true, false, true),
  ('ebaa8461-4b67-4973-88eb-4e11701d2e1f'::uuid, 'Corretor Adir', NULL, NULL, NULL, '2026-02-07T17:54:38.747535+00:00'::timestamptz, '2026-02-07T17:54:38.747535+00:00'::timestamptz, true, false, true),
  ('2908d49d-6f39-4605-990f-4bc02cd9564a'::uuid, 'Motoshop Imóveis', NULL, NULL, NULL, '2026-02-07T17:54:40.976588+00:00'::timestamptz, '2026-02-07T17:54:40.976588+00:00'::timestamptz, true, false, true),
  ('27a0c7a5-c4ad-4957-ad48-6f57b6750526'::uuid, 'Vasconcelos Imoveis', NULL, NULL, NULL, '2026-02-07T17:54:42.631185+00:00'::timestamptz, '2026-02-07T17:54:42.631185+00:00'::timestamptz, true, false, true),
  ('e643f193-b22a-45d1-96d4-10a7f2b72f15'::uuid, 'Imobiliaria Jaeger', NULL, NULL, NULL, '2026-02-07T17:54:47.910968+00:00'::timestamptz, '2026-02-07T17:54:47.910968+00:00'::timestamptz, true, false, true),
  ('94134f27-ba88-4980-9365-13247e8d4b86'::uuid, 'Paulo Victor Corretor', NULL, NULL, NULL, '2026-02-07T17:55:05.829546+00:00'::timestamptz, '2026-02-07T17:55:05.829546+00:00'::timestamptz, true, false, true),
  ('f30f37a4-6f70-4176-b7e1-a4c9a72591d4'::uuid, 'Shalom Imobiliária', NULL, NULL, NULL, '2026-02-07T18:37:34.308511+00:00'::timestamptz, '2026-02-07T18:37:34.308511+00:00'::timestamptz, true, false, true),
  ('c9bf73bf-5d3f-4532-bfc0-04696457a34c'::uuid, 'Fleck Magalhães Imóveis', NULL, NULL, NULL, '2026-02-07T18:37:37.738416+00:00'::timestamptz, '2026-02-07T18:37:37.738416+00:00'::timestamptz, true, false, true),
  ('8ffcbcd5-1af4-4f18-8261-cc6e9dc9a0b6'::uuid, 'Deldalla Imóveis', NULL, NULL, NULL, '2026-02-07T18:37:45.262242+00:00'::timestamptz, '2026-02-07T18:37:45.262242+00:00'::timestamptz, true, false, true),
  ('5539247a-74ae-462f-8382-0e34ff7bbdc5'::uuid, 'Raphael Imoveis', NULL, NULL, NULL, '2026-02-07T18:37:48.384662+00:00'::timestamptz, '2026-02-07T18:37:48.384662+00:00'::timestamptz, true, false, true),
  ('4e147f30-51db-413a-b561-8c65f2b675c0'::uuid, 'Jairo Imóveis', NULL, NULL, NULL, '2026-02-07T18:37:50.806303+00:00'::timestamptz, '2026-02-07T18:37:50.806303+00:00'::timestamptz, true, false, true),
  ('76aab636-0261-4bc5-80e3-427eb9472d25'::uuid, 'JBem Imóveis', NULL, NULL, NULL, '2026-02-07T18:37:53.494531+00:00'::timestamptz, '2026-02-07T18:37:53.494531+00:00'::timestamptz, true, false, true),
  ('52ea17ab-42e8-41e8-b62d-0cf3697869eb'::uuid, 'dcasa Imoveis', NULL, NULL, NULL, '2026-02-07T18:37:59.001382+00:00'::timestamptz, '2026-02-07T18:37:59.001382+00:00'::timestamptz, true, false, true),
  ('e6d43eeb-bd19-42c0-9e4a-87ef9375b4d6'::uuid, 'Alex Imoveis', NULL, NULL, NULL, '2026-02-07T18:38:02.711405+00:00'::timestamptz, '2026-02-07T18:38:02.711405+00:00'::timestamptz, true, false, true),
  ('ab1e73f7-81c5-48da-8961-7bfe8cf25073'::uuid, 'Achei Serviços imobiliarios', NULL, NULL, NULL, '2026-02-07T18:38:05.419368+00:00'::timestamptz, '2026-02-07T18:38:05.419368+00:00'::timestamptz, true, false, true),
  ('61d31913-f03b-4b90-b9fd-6717f1b026fd'::uuid, 'LCD Imoveis', NULL, NULL, NULL, '2026-02-07T18:38:10.238858+00:00'::timestamptz, '2026-02-07T18:38:10.238858+00:00'::timestamptz, true, false, true),
  ('e017c933-8a66-4a2e-a108-3b77d3695ea1'::uuid, 'Bortolini Imóveis', NULL, NULL, NULL, '2026-02-07T18:38:12.648513+00:00'::timestamptz, '2026-02-07T18:38:12.648513+00:00'::timestamptz, true, false, true),
  ('d4561176-11bf-491a-add0-b3e8603788f0'::uuid, 'Acácio Lira', NULL, NULL, NULL, '2026-02-07T18:38:15.405274+00:00'::timestamptz, '2026-02-07T18:38:15.405274+00:00'::timestamptz, true, false, true),
  ('03e503c8-3651-4961-89ff-08b6e396cb04'::uuid, 'Anderson Corretor', NULL, NULL, NULL, '2026-02-07T18:38:17.853405+00:00'::timestamptz, '2026-02-07T18:38:17.853405+00:00'::timestamptz, true, false, true),
  ('61fa5b2f-ebf6-4923-91b4-1c5e54df7747'::uuid, 'Ivonir Balsanello Corretor', NULL, NULL, NULL, '2026-02-07T18:38:25.920711+00:00'::timestamptz, '2026-02-07T18:38:25.920711+00:00'::timestamptz, true, false, true),
  ('54c216c1-b7bb-49f0-9856-fb2b34b3b10a'::uuid, 'Imobiliaria Inovação', NULL, NULL, NULL, '2026-02-07T18:38:30.677224+00:00'::timestamptz, '2026-02-07T18:38:30.677224+00:00'::timestamptz, true, false, true),
  ('82f35ec3-5466-499f-bad9-3f740ba24727'::uuid, 'Maxtille Rodrigues', NULL, NULL, NULL, '2026-02-07T18:38:52.918433+00:00'::timestamptz, '2026-02-07T18:38:52.918433+00:00'::timestamptz, true, false, true),
  ('e0e7a623-bf64-4220-b1b8-d0c32a5415ce'::uuid, 'Master Imoveis', NULL, NULL, NULL, '2026-02-07T18:38:56.634323+00:00'::timestamptz, '2026-02-07T18:38:56.634323+00:00'::timestamptz, true, false, true),
  ('c2b39e8a-84d5-4e6b-ad4b-e19c624e92a8'::uuid, 'Casabona Imobiliaria', NULL, NULL, NULL, '2026-02-07T18:38:59.479436+00:00'::timestamptz, '2026-02-07T18:38:59.479436+00:00'::timestamptz, true, false, true),
  ('abb08a1b-4b4a-453c-91eb-7370e2fd8473'::uuid, 'Janine Medina Corretora', NULL, NULL, NULL, '2026-02-07T18:39:09.477569+00:00'::timestamptz, '2026-02-07T18:39:09.477569+00:00'::timestamptz, true, false, true),
  ('92572aba-4ccc-4294-a9a6-00d579631f6f'::uuid, 'Imobiliária Sanaiotto', NULL, NULL, NULL, '2026-02-07T18:39:12.115726+00:00'::timestamptz, '2026-02-07T18:39:12.115726+00:00'::timestamptz, true, false, true),
  ('4f5737e8-6c64-4ba4-8492-8a47d90138a6'::uuid, 'Troiani Imoveis', NULL, NULL, NULL, '2026-02-07T18:39:14.600899+00:00'::timestamptz, '2026-02-07T18:39:14.600899+00:00'::timestamptz, true, false, true),
  ('58e1f310-bfa4-4554-9309-68facf1f6c57'::uuid, 'Corretora Karine', NULL, NULL, NULL, '2026-02-07T18:39:40.67752+00:00'::timestamptz, '2026-02-07T18:39:40.67752+00:00'::timestamptz, true, false, true),
  ('4dc91928-ac59-4b8a-bf34-828d0a7f91ea'::uuid, 'Edemar Werner Corretor', NULL, NULL, NULL, '2026-02-07T18:39:43.229086+00:00'::timestamptz, '2026-02-07T18:39:43.229086+00:00'::timestamptz, true, false, true),
  ('0ac7f861-e690-45cf-9415-243c6a7d0f42'::uuid, 'Everton Toledo Corretor', NULL, NULL, NULL, '2026-02-07T18:39:54.679614+00:00'::timestamptz, '2026-02-07T18:39:54.679614+00:00'::timestamptz, true, false, true),
  ('3f0f1878-72c6-4291-bdad-a5a92e9ad980'::uuid, 'Carlos Alberto Ramos Bemf - Corretor', NULL, NULL, NULL, '2026-02-07T18:39:55.389708+00:00'::timestamptz, '2026-02-07T18:39:55.389708+00:00'::timestamptz, true, false, true),
  ('835b5691-17b5-454a-80f6-5f772b5a8667'::uuid, 'Imobiliária JACKSON SOARES', NULL, NULL, NULL, '2026-02-07T18:40:04.281228+00:00'::timestamptz, '2026-02-07T18:40:04.281228+00:00'::timestamptz, true, false, true),
  ('a2fbe4fd-47ed-4a41-ba59-9d5fd1f478ab'::uuid, 'Marina Corretora', NULL, NULL, NULL, '2026-02-07T18:40:04.999801+00:00'::timestamptz, '2026-02-07T18:40:04.999801+00:00'::timestamptz, true, false, true),
  ('65476804-230e-4e7a-8af7-2e5032bfdf8e'::uuid, 'Ana Carla Corretora', NULL, NULL, NULL, '2026-02-07T18:40:15.307275+00:00'::timestamptz, '2026-02-07T18:40:15.307275+00:00'::timestamptz, true, false, true),
  ('e213375c-d4ad-41ae-83f6-638e2ba5c730'::uuid, 'Luciana Imóveis SC', NULL, NULL, NULL, '2026-02-07T18:42:41.87316+00:00'::timestamptz, '2026-02-07T18:42:41.87316+00:00'::timestamptz, true, false, true),
  ('16a3f082-a313-4c81-9536-8df11a65fbe4'::uuid, 'Vandré Batista', NULL, NULL, NULL, '2026-02-07T18:42:56.645789+00:00'::timestamptz, '2026-02-07T18:42:56.645789+00:00'::timestamptz, true, false, true),
  ('a0b56f8b-982a-4ad5-9ce1-c498a17756e3'::uuid, 'Sidonal Oliveira', NULL, NULL, NULL, '2026-02-07T18:43:28.181572+00:00'::timestamptz, '2026-02-07T18:43:28.181572+00:00'::timestamptz, true, false, true),
  ('31f6b09c-25b1-4b23-b29b-812e93a00175'::uuid, 'Imobiliária Gramadense', NULL, NULL, NULL, '2026-02-07T18:43:28.973539+00:00'::timestamptz, '2026-02-07T18:43:28.973539+00:00'::timestamptz, true, false, true),
  ('302d639f-abb4-4d47-b1f6-0dc9e8565f94'::uuid, 'Ezequiel', NULL, NULL, NULL, '2026-02-07T18:43:40.047884+00:00'::timestamptz, '2026-02-07T18:43:40.047884+00:00'::timestamptz, true, false, true),
  ('c7623ffa-4806-436c-9e2c-21efeea86005'::uuid, 'Luiz Carpe', NULL, NULL, NULL, '2026-02-07T18:44:06.420042+00:00'::timestamptz, '2026-02-07T18:44:06.420042+00:00'::timestamptz, true, false, true),
  ('49d1df12-5f9b-4032-b370-ca308223bb82'::uuid, 'Alfredo belleza', NULL, NULL, NULL, '2026-02-07T18:44:14.623158+00:00'::timestamptz, '2026-02-07T18:44:14.623158+00:00'::timestamptz, true, false, true),
  ('8f842edf-7fdf-4428-ad4b-0621508dd85e'::uuid, 'Vinicius Larsen', NULL, NULL, NULL, '2026-02-07T18:45:00.844559+00:00'::timestamptz, '2026-02-07T18:45:00.844559+00:00'::timestamptz, true, false, true),
  ('de862bbe-128a-4f9e-a1b0-7aabb87cb8d0'::uuid, 'Lucas Bernardi', NULL, NULL, NULL, '2026-02-07T18:45:07.379397+00:00'::timestamptz, '2026-02-07T18:45:07.379397+00:00'::timestamptz, true, false, true),
  ('454d0ca1-9343-4199-a235-572bb240ff98'::uuid, 'Eduardo Picoli', NULL, NULL, NULL, '2026-02-07T18:45:13.091028+00:00'::timestamptz, '2026-02-07T18:45:13.091028+00:00'::timestamptz, true, false, true),
  ('fefc8536-53cc-4a02-9293-8f0ce98363f2'::uuid, 'Dejalmo', NULL, NULL, NULL, '2026-02-07T18:45:29.298798+00:00'::timestamptz, '2026-02-07T18:45:29.298798+00:00'::timestamptz, true, false, true),
  ('c9adaf06-adce-43d8-ae95-18a53a1ebd6c'::uuid, 'Giane Dutra', NULL, NULL, NULL, '2026-02-07T18:45:31.757951+00:00'::timestamptz, '2026-02-07T18:45:31.757951+00:00'::timestamptz, true, false, true),
  ('c944b145-902d-4bc5-aa48-6001dde659a2'::uuid, 'Cristiano dos Santos', NULL, NULL, NULL, '2026-02-07T18:45:34.583637+00:00'::timestamptz, '2026-02-07T18:45:34.583637+00:00'::timestamptz, true, false, true),
  ('44f4f4e1-14f9-4c49-8c24-2e38a6182779'::uuid, 'Life Imobiliaria', NULL, NULL, NULL, '2026-02-07T18:45:41.723989+00:00'::timestamptz, '2026-02-07T18:45:41.723989+00:00'::timestamptz, true, false, true),
  ('1d95ad56-be1a-4f83-8db7-0a6f6d05939c'::uuid, 'João Pedro Hoffmman', NULL, NULL, NULL, '2026-02-07T18:45:49.141764+00:00'::timestamptz, '2026-02-07T18:45:49.141764+00:00'::timestamptz, true, false, true),
  ('169b7e10-ee83-47a0-93e5-a534c5ea9374'::uuid, 'Miriam Bueno', NULL, NULL, NULL, '2026-02-07T18:45:54.428155+00:00'::timestamptz, '2026-02-07T18:45:54.428155+00:00'::timestamptz, true, false, true),
  ('060ee9d1-735f-4fe9-abaf-b84ad8453843'::uuid, 'Tadeu Bier', NULL, NULL, NULL, '2026-02-07T18:46:06.212056+00:00'::timestamptz, '2026-02-07T18:46:06.212056+00:00'::timestamptz, true, false, true),
  ('e63f591a-3cb3-4f25-bd00-be73e5eb4d36'::uuid, 'Juliano Souza', NULL, NULL, NULL, '2026-02-07T18:46:09.025093+00:00'::timestamptz, '2026-02-07T18:46:09.025093+00:00'::timestamptz, true, false, true),
  ('492603ed-afbd-42fb-a365-689d7f53c727'::uuid, 'Rosimeri Rodrigues', NULL, NULL, NULL, '2026-02-07T18:46:11.399295+00:00'::timestamptz, '2026-02-07T18:46:11.399295+00:00'::timestamptz, true, false, true),
  ('3f190c55-cdd3-4cc7-b2c5-d65ce5238a5e'::uuid, 'Morretes Imoveis (Bruno)', NULL, NULL, NULL, '2026-02-07T18:46:16.604985+00:00'::timestamptz, '2026-02-07T18:46:16.604985+00:00'::timestamptz, true, false, true),
  ('11566020-d840-4b37-af49-f61d6191a908'::uuid, 'Fabio Virtuale', NULL, NULL, NULL, '2026-02-07T18:46:21.304416+00:00'::timestamptz, '2026-02-07T18:46:21.304416+00:00'::timestamptz, true, false, true),
  ('65502c28-53ff-43d6-8ab8-22f7a702c900'::uuid, 'Jaqueline de Oliveira', NULL, NULL, NULL, '2026-02-07T18:46:24.141489+00:00'::timestamptz, '2026-02-07T18:46:24.141489+00:00'::timestamptz, true, false, true),
  ('228a9844-b86d-422e-aa98-4565a8ef7741'::uuid, 'Diego Pias', NULL, NULL, NULL, '2026-02-07T18:46:34.138948+00:00'::timestamptz, '2026-02-07T18:46:34.138948+00:00'::timestamptz, true, false, true),
  ('2108e4a5-7256-4195-9184-ea4ba921c22d'::uuid, 'Tijucas Imobiliaria (Wendell)', NULL, NULL, NULL, '2026-02-07T18:46:39.27897+00:00'::timestamptz, '2026-02-07T18:46:39.27897+00:00'::timestamptz, true, false, true),
  ('8dd85628-46a4-4ba5-b64d-689e9f7437be'::uuid, 'Eduardo Garcia', NULL, NULL, NULL, '2026-02-07T18:46:46.563216+00:00'::timestamptz, '2026-02-07T18:46:46.563216+00:00'::timestamptz, true, false, true),
  ('eff0c19d-fe91-4e9d-9c8a-ece91fe59f74'::uuid, 'Gesiel (Navegantes)', NULL, NULL, NULL, '2026-02-07T18:47:02.915751+00:00'::timestamptz, '2026-02-07T18:47:02.915751+00:00'::timestamptz, true, false, true),
  ('083ae31b-441f-4d83-a109-6cdfb6eb7f77'::uuid, 'Imobiliária Auro de Paula a intermediação', NULL, NULL, NULL, '2026-02-07T18:47:17.582017+00:00'::timestamptz, '2026-02-07T18:47:17.582017+00:00'::timestamptz, true, false, true),
  ('9bb854eb-eec3-4a0e-99c0-4e80edf88409'::uuid, 'Pamela Bianquini', NULL, NULL, NULL, '2026-02-07T18:47:27.048846+00:00'::timestamptz, '2026-02-07T18:47:27.048846+00:00'::timestamptz, true, false, true),
  ('8a2e39b9-d8c8-48b4-85bd-edc8a6602f36'::uuid, 'Antônio Paixão', NULL, NULL, NULL, '2026-02-07T18:47:38.172996+00:00'::timestamptz, '2026-02-07T18:47:38.172996+00:00'::timestamptz, true, false, true),
  ('bc02b46f-838a-4665-bb1a-9ffc57adecd4'::uuid, 'Sandro Nunes', NULL, NULL, NULL, '2026-02-07T18:48:11.50301+00:00'::timestamptz, '2026-02-07T18:48:11.50301+00:00'::timestamptz, true, false, true),
  ('4681774b-f116-493c-a95b-d19c10165c29'::uuid, 'Cassiano Bringmann', NULL, NULL, NULL, '2026-02-07T18:48:14.09212+00:00'::timestamptz, '2026-02-07T18:48:14.09212+00:00'::timestamptz, true, false, true),
  ('118b95a7-11ee-44c5-be60-9cc4d3829bf4'::uuid, 'Celso Silveira', NULL, NULL, NULL, '2026-02-07T18:48:40.071332+00:00'::timestamptz, '2026-02-07T18:48:40.071332+00:00'::timestamptz, true, false, true),
  ('fa80dd49-3751-4d5f-a08f-c267e9f89c6d'::uuid, 'Klein Imoveis', NULL, NULL, NULL, '2026-02-07T18:48:47.423319+00:00'::timestamptz, '2026-02-07T18:48:47.423319+00:00'::timestamptz, true, false, true),
  ('7b5db0bf-d88d-478c-b1af-06acd97f4fba'::uuid, 'Tubarão Imoveis', NULL, NULL, NULL, '2026-02-07T18:48:52.133456+00:00'::timestamptz, '2026-02-07T18:48:52.133456+00:00'::timestamptz, true, false, true),
  ('cd3d2047-d940-4010-a59c-62231ff60012'::uuid, 'Raviili', NULL, NULL, NULL, '2026-02-07T18:48:54.846842+00:00'::timestamptz, '2026-02-07T18:48:54.846842+00:00'::timestamptz, true, false, true),
  ('32d1313e-005e-4173-80a1-a4182bd7c450'::uuid, 'Sonia Gusso (Beto)', NULL, NULL, NULL, '2026-02-07T18:49:00.05888+00:00'::timestamptz, '2026-02-07T18:49:00.05888+00:00'::timestamptz, true, false, true),
  ('b5bb3b69-2716-43ff-bc5e-3c9dd4bf719d'::uuid, 'Samuel Martins', NULL, NULL, NULL, '2026-02-07T18:49:12.384802+00:00'::timestamptz, '2026-02-07T18:49:12.384802+00:00'::timestamptz, true, false, true),
  ('bb840a99-a867-493d-abdc-136309fb7432'::uuid, 'Moacir Ribeiro', NULL, NULL, NULL, '2026-02-07T18:49:15.140738+00:00'::timestamptz, '2026-02-07T18:49:15.140738+00:00'::timestamptz, true, false, true),
  ('a834035f-d703-4d3d-8710-9f258816db41'::uuid, 'Acacia', NULL, NULL, NULL, '2026-02-07T18:49:17.669425+00:00'::timestamptz, '2026-02-07T18:49:17.669425+00:00'::timestamptz, true, false, true),
  ('7342eaf0-eefe-4841-8242-9c54cb67e684'::uuid, 'Exata Imoveis', NULL, NULL, NULL, '2026-02-07T18:49:46.130272+00:00'::timestamptz, '2026-02-07T18:49:46.130272+00:00'::timestamptz, true, false, true),
  ('378c9776-f605-4520-a759-8181a93256c6'::uuid, 'Miriam Bueno, Rosimeri Rodrigues', NULL, NULL, NULL, '2026-02-07T18:50:02.660481+00:00'::timestamptz, '2026-02-07T18:50:02.660481+00:00'::timestamptz, true, false, true),
  ('85bb8aa3-982b-4652-9ee0-bb075351600f'::uuid, 'Anderson Venturi', NULL, NULL, NULL, '2026-02-07T18:50:11.134039+00:00'::timestamptz, '2026-02-07T18:50:11.134039+00:00'::timestamptz, true, false, true),
  ('ce9aaef7-c086-4c0a-beab-7d4c56dcfa30'::uuid, 'Alex (Guaiba)', NULL, NULL, NULL, '2026-02-07T18:50:45.618784+00:00'::timestamptz, '2026-02-07T18:50:45.618784+00:00'::timestamptz, true, false, true),
  ('5963fea7-31b1-405f-a795-831d91a94ea9'::uuid, 'Augusto', NULL, NULL, NULL, '2026-02-07T18:50:57.622747+00:00'::timestamptz, '2026-02-07T18:50:57.622747+00:00'::timestamptz, true, false, true),
  ('1d4ada8a-6694-43cf-9124-e4791d517e24'::uuid, 'Evaldo', NULL, NULL, NULL, '2026-02-07T18:51:02.456837+00:00'::timestamptz, '2026-02-07T18:51:02.456837+00:00'::timestamptz, true, false, true),
  ('65bd9876-fb52-409d-b62b-b62bd552ee32'::uuid, 'Rafão Imóveis', NULL, NULL, NULL, '2026-02-07T18:51:09.712519+00:00'::timestamptz, '2026-02-07T18:51:09.712519+00:00'::timestamptz, true, false, true),
  ('4c5f3233-617b-4a7f-8638-6c03a07db45d'::uuid, 'Fabricio Safiti', NULL, NULL, NULL, '2026-02-07T18:51:35.879162+00:00'::timestamptz, '2026-02-07T18:51:35.879162+00:00'::timestamptz, true, false, true),
  ('20e1868f-6059-4db0-9dc0-c578e738f756'::uuid, 'Adriana Figueiredo', NULL, NULL, NULL, '2026-02-07T18:51:48.130688+00:00'::timestamptz, '2026-02-07T18:51:48.130688+00:00'::timestamptz, true, false, true),
  ('7576f9bf-8eb1-4ed8-9f8e-fc85a0e195f6'::uuid, 'Glauber  (Otávio Vaz)', NULL, NULL, NULL, '2026-02-07T18:52:21.938492+00:00'::timestamptz, '2026-02-07T18:52:21.938492+00:00'::timestamptz, true, false, true),
  ('4ecacd55-fd9e-4d6a-8e19-77e8f12bfbdb'::uuid, 'Airton Tuapraia', NULL, NULL, NULL, '2026-02-07T18:52:26.787938+00:00'::timestamptz, '2026-02-07T18:52:26.787938+00:00'::timestamptz, true, false, true),
  ('395cee8e-2dd1-40b6-88ef-c25ae6d3f9cd'::uuid, 'Itaivan (Anna)', NULL, NULL, NULL, '2026-02-07T18:52:43.593246+00:00'::timestamptz, '2026-02-07T18:52:43.593246+00:00'::timestamptz, true, false, true),
  ('69335367-ab52-4150-bdaa-fb13a3a4db2c'::uuid, 'Mario Paulo Hawnstein', NULL, NULL, NULL, '2026-02-07T18:52:57.41071+00:00'::timestamptz, '2026-02-07T18:52:57.41071+00:00'::timestamptz, true, false, true),
  ('5714178d-afdc-4aeb-ac34-bdb86b828411'::uuid, 'Diego (Lamaison)', NULL, NULL, NULL, '2026-02-07T18:53:26.098979+00:00'::timestamptz, '2026-02-07T18:53:26.098979+00:00'::timestamptz, true, false, true),
  ('edc4e3a5-045d-48bf-b6c7-fc9471b10733'::uuid, 'MasterCruz', NULL, NULL, NULL, '2026-02-07T18:53:31.835824+00:00'::timestamptz, '2026-02-07T18:53:31.835824+00:00'::timestamptz, true, false, true),
  ('c15e9229-a0e0-4cb9-8b68-0fcb59a17f0b'::uuid, 'Victor Pacheco', NULL, NULL, NULL, '2026-02-07T18:53:34.460362+00:00'::timestamptz, '2026-02-07T18:53:34.460362+00:00'::timestamptz, true, false, true),
  ('17d982a6-3143-4312-97f2-426c8a83ed1b'::uuid, 'Nikolas', NULL, NULL, NULL, '2026-02-07T18:54:06.444329+00:00'::timestamptz, '2026-02-07T18:54:06.444329+00:00'::timestamptz, true, false, true),
  ('6a13a694-f259-4d96-b9a0-8326b8066d9b'::uuid, 'Everton', NULL, NULL, NULL, '2026-02-07T18:54:08.91972+00:00'::timestamptz, '2026-02-07T18:54:08.91972+00:00'::timestamptz, true, false, true),
  ('c9f8be83-f1d0-4c6e-950d-4bea609fde5f'::uuid, 'Alfredo Neto', NULL, NULL, NULL, '2026-02-07T18:54:18.731885+00:00'::timestamptz, '2026-02-07T18:54:18.731885+00:00'::timestamptz, true, false, true),
  ('94ec9253-3940-4a77-83eb-03a299528ab6'::uuid, 'Construtora Safari', NULL, NULL, NULL, '2026-02-07T18:54:44.199512+00:00'::timestamptz, '2026-02-07T18:54:44.199512+00:00'::timestamptz, true, false, true),
  ('68963d9b-f910-4804-b1de-8dbefad412b8'::uuid, 'Vitor Gustavo', NULL, NULL, NULL, '2026-02-07T18:55:07.21047+00:00'::timestamptz, '2026-02-07T18:55:07.21047+00:00'::timestamptz, true, false, true),
  ('12a90203-4123-4b49-af0a-49fb46708de5'::uuid, 'Rafael Piva', NULL, NULL, NULL, '2026-02-07T18:55:12.592666+00:00'::timestamptz, '2026-02-07T18:55:12.592666+00:00'::timestamptz, true, false, true),
  ('b0a817be-3eae-425d-8048-2a13a217bca2'::uuid, 'Paulo Motta', NULL, NULL, NULL, '2026-02-07T18:56:20.41951+00:00'::timestamptz, '2026-02-07T18:56:20.41951+00:00'::timestamptz, true, false, true),
  ('2a662835-7947-4f1a-9ae5-9b65179f06e7'::uuid, 'Adriana Antoniezzi', NULL, NULL, NULL, '2026-02-07T18:56:22.855237+00:00'::timestamptz, '2026-02-07T18:56:22.855237+00:00'::timestamptz, true, false, true),
  ('06cbf28b-094c-4a43-8c67-6702a8fc61e0'::uuid, 'Diego Bonifacio', NULL, NULL, NULL, '2026-02-07T18:56:37.514873+00:00'::timestamptz, '2026-02-07T18:56:37.514873+00:00'::timestamptz, true, false, true),
  ('e9c295e1-15bb-4407-89e8-ded53a99e261'::uuid, 'Vanio Berkenbrock', NULL, NULL, NULL, '2026-02-07T18:56:42.503274+00:00'::timestamptz, '2026-02-07T18:56:42.503274+00:00'::timestamptz, true, false, true),
  ('12ade58d-8dce-49da-8ae8-d1ccc4046777'::uuid, 'Grupo Castelo', NULL, NULL, NULL, '2026-02-07T18:58:04.100704+00:00'::timestamptz, '2026-02-07T18:58:04.100704+00:00'::timestamptz, true, false, true),
  ('2cdc3de6-9bfe-4944-b720-e5203387619b'::uuid, 'Sandro Freitas', NULL, NULL, NULL, '2026-02-07T18:58:47.14642+00:00'::timestamptz, '2026-02-07T18:58:47.14642+00:00'::timestamptz, true, false, true),
  ('7047047a-06e0-4c2f-a410-3a2efc25a4d3'::uuid, 'Miguel', NULL, NULL, NULL, '2026-02-07T18:58:51.000368+00:00'::timestamptz, '2026-02-07T18:58:51.000368+00:00'::timestamptz, true, false, true),
  ('e1fe031c-dd04-4de7-8da4-edc857ea7585'::uuid, 'Liberomar Bicca', NULL, NULL, NULL, '2026-02-07T18:58:56.122504+00:00'::timestamptz, '2026-02-07T18:58:56.122504+00:00'::timestamptz, true, false, true),
  ('9edf655f-36ee-49dd-a8a1-b22b631aad9e'::uuid, 'Zilmar Corretor', NULL, NULL, NULL, '2026-02-07T19:01:58.485418+00:00'::timestamptz, '2026-02-07T19:01:58.485418+00:00'::timestamptz, true, false, true),
  ('14346fda-d77c-48c1-b136-49792cfc85e0'::uuid, 'Imoveis Life', NULL, NULL, NULL, '2026-02-07T19:02:12.400645+00:00'::timestamptz, '2026-02-07T19:02:12.400645+00:00'::timestamptz, true, false, true),
  ('7c8bef07-c0e0-4194-b250-d2321deecd3b'::uuid, 'Felipe Costa (Rafael Rabelo)', NULL, NULL, NULL, '2026-02-07T19:02:25.049984+00:00'::timestamptz, '2026-02-07T19:02:25.049984+00:00'::timestamptz, true, false, true),
  ('71d7aa6f-a13a-4f42-a7d1-75350d5606e0'::uuid, 'Vinicius de Liz', NULL, NULL, NULL, '2026-02-07T19:02:47.127242+00:00'::timestamptz, '2026-02-07T19:02:47.127242+00:00'::timestamptz, true, false, true),
  ('d7015980-ac6b-45fc-9233-abbfcbc39908'::uuid, 'Lindomar (Imobiliaria Plano A)', NULL, NULL, NULL, '2026-02-07T19:03:04.946948+00:00'::timestamptz, '2026-02-07T19:03:04.946948+00:00'::timestamptz, true, false, true),
  ('3d5ea782-8760-4a00-8dc7-25764ec38076'::uuid, 'Fabíola', NULL, NULL, NULL, '2026-02-07T19:03:10.309333+00:00'::timestamptz, '2026-02-07T19:03:10.309333+00:00'::timestamptz, true, false, true),
  ('040127c1-0610-4993-a4a1-10287d3fac1e'::uuid, 'Julio Bravo''s', NULL, NULL, NULL, '2026-02-07T19:03:22.644308+00:00'::timestamptz, '2026-02-07T19:03:22.644308+00:00'::timestamptz, true, false, true),
  ('fa6f44b3-21ef-4c55-bd8e-504523a8e1e9'::uuid, 'Laerson', NULL, NULL, NULL, '2026-02-07T19:03:27.427036+00:00'::timestamptz, '2026-02-07T19:03:27.427036+00:00'::timestamptz, true, false, true),
  ('f3af47d5-98fd-421b-9eae-3888a890fa23'::uuid, 'Wilson', NULL, NULL, NULL, '2026-02-07T19:03:32.119239+00:00'::timestamptz, '2026-02-07T19:03:32.119239+00:00'::timestamptz, true, false, true),
  ('3b2acdea-12b7-4700-b8e6-79b2bb6680da'::uuid, 'Cristiane Bezerra', NULL, NULL, NULL, '2026-02-07T19:03:48.953755+00:00'::timestamptz, '2026-02-07T19:03:48.953755+00:00'::timestamptz, true, false, true),
  ('be888af1-ddca-4665-81ff-054d0165fe73'::uuid, 'Miguel Costa', NULL, NULL, NULL, '2026-02-07T19:04:05.851901+00:00'::timestamptz, '2026-02-07T19:04:05.851901+00:00'::timestamptz, true, false, true),
  ('d10e2a3b-732d-43de-9ad7-14ae25224b35'::uuid, 'Juliano Teixeira', NULL, NULL, NULL, '2026-02-07T19:04:13.705328+00:00'::timestamptz, '2026-02-07T19:04:13.705328+00:00'::timestamptz, true, false, true),
  ('2941e0dd-b4c2-487c-9a6f-216153a9da8b'::uuid, 'Janquiel Dresch', NULL, NULL, NULL, '2026-02-07T19:04:31.598535+00:00'::timestamptz, '2026-02-07T19:04:31.598535+00:00'::timestamptz, true, false, true),
  ('eb19b80e-272a-4b11-a918-e9ea7b73c115'::uuid, 'Iria Erechim imoveis', NULL, NULL, NULL, '2026-02-07T19:04:43.850946+00:00'::timestamptz, '2026-02-07T19:04:43.850946+00:00'::timestamptz, true, false, true),
  ('4e039da5-27c4-471b-8674-63e5c926d492'::uuid, 'Ângelo Winck', NULL, NULL, NULL, '2026-02-07T19:04:49.198124+00:00'::timestamptz, '2026-02-07T19:04:49.198124+00:00'::timestamptz, true, false, true),
  ('9e422c13-33f8-4b36-a29f-7c58ecaaf6d7'::uuid, 'Nildo Paraiba', NULL, NULL, NULL, '2026-02-07T19:04:53.587861+00:00'::timestamptz, '2026-02-07T19:04:53.587861+00:00'::timestamptz, true, false, true),
  ('b9fe6981-c189-4615-b24e-a770a5288535'::uuid, 'Junior Paraiba', NULL, NULL, NULL, '2026-02-07T19:04:56.499811+00:00'::timestamptz, '2026-02-07T19:04:56.499811+00:00'::timestamptz, true, false, true),
  ('c9e79c01-0687-4ca8-9f16-d516ccc798eb'::uuid, 'Renan Eusébio', NULL, NULL, NULL, '2026-02-07T19:05:11.947692+00:00'::timestamptz, '2026-02-07T19:05:11.947692+00:00'::timestamptz, true, false, true),
  ('15d40cc4-6c93-4804-b553-7f01979c209f'::uuid, 'Zé costa', NULL, NULL, NULL, '2026-02-07T19:05:32.0629+00:00'::timestamptz, '2026-02-07T19:05:32.0629+00:00'::timestamptz, true, false, true),
  ('dcc08747-bca9-43ab-8f3c-75772e17ccb8'::uuid, 'Felipe Banco de áreas', NULL, NULL, NULL, '2026-02-07T19:05:48.068447+00:00'::timestamptz, '2026-02-07T19:05:48.068447+00:00'::timestamptz, true, false, true),
  ('b7baa8c0-7e5d-407a-9a5c-c6cad90d8b62'::uuid, 'Daniel Freire', NULL, NULL, NULL, '2026-02-07T19:05:58.480602+00:00'::timestamptz, '2026-02-07T19:05:58.480602+00:00'::timestamptz, true, false, true),
  ('e3f2f496-c18b-47a3-8275-d8eb9178a71e'::uuid, 'Jordão', NULL, NULL, NULL, '2026-02-07T19:06:01.2765+00:00'::timestamptz, '2026-02-07T19:06:01.2765+00:00'::timestamptz, true, false, true),
  ('6212d441-87e8-40a1-ad92-a54028c9e403'::uuid, 'Valmir Cardoso', NULL, NULL, NULL, '2026-02-07T19:06:24.173878+00:00'::timestamptz, '2026-02-07T19:06:24.173878+00:00'::timestamptz, true, false, true),
  ('ef11a9ec-8f49-4ef6-b2e8-9721d70b1f79'::uuid, 'Volcato', NULL, NULL, NULL, '2026-02-07T19:07:06.080274+00:00'::timestamptz, '2026-02-07T19:07:06.080274+00:00'::timestamptz, true, false, true),
  ('7e6ed27f-a847-4b8e-b986-ff0d4208529f'::uuid, 'Talita', 'Talita Moraes', '(55) 9 9950-0631', NULL, '2026-02-18T14:59:01.590908+00:00'::timestamptz, '2026-02-18T16:34:22.738858+00:00'::timestamptz, true, false, true),
  ('8018106b-16cd-41a6-9d54-ce37ad3c6855'::uuid, 'Douglas Carraro', 'Douglas Carraro', '49 9 9809-7027', NULL, '2026-02-25T17:40:03.465814+00:00'::timestamptz, '2026-02-25T17:40:03.465814+00:00'::timestamptz, true, false, true),
  ('70483bda-48e9-4b4a-8f66-23ed89b8a3d1'::uuid, 'Sem imobiliária', NULL, '00000000000', NULL, '2026-03-05T11:14:24.936915+00:00'::timestamptz, '2026-03-05T11:14:24.936915+00:00'::timestamptz, true, false, true),
  ('e994d005-125e-4372-acfa-2bd46addf9f5'::uuid, 'Fábio Berriel', NULL, '51 9 93390555', NULL, '2026-03-19T11:14:57.965911+00:00'::timestamptz, '2026-03-19T11:14:57.965911+00:00'::timestamptz, true, false, true),
  ('32349132-12fd-4d31-ac19-c466b5528050'::uuid, 'Suzana Kern', NULL, '51 9 9991-0966', NULL, '2026-03-24T17:34:21.822217+00:00'::timestamptz, '2026-03-24T17:34:21.822217+00:00'::timestamptz, true, false, true),
  ('e4bd2b83-67b7-4e51-b18e-6fafa91706eb'::uuid, 'Falcão', NULL, '51 9 9188-3366', NULL, '2026-03-24T17:34:35.351258+00:00'::timestamptz, '2026-03-24T17:34:35.351258+00:00'::timestamptz, true, false, true),
  ('ecce02d9-7b1c-4a27-aa87-7afbde4a36f6'::uuid, 'Nataniel Oliveira', NULL, '54 9 9667-3533', NULL, '2026-03-24T17:34:58.479899+00:00'::timestamptz, '2026-03-24T17:34:58.479899+00:00'::timestamptz, true, false, true),
  ('37ad1aa8-2e66-46a2-801f-fdb4c84be4c4'::uuid, 'Eduardo Andrade', NULL, '55984317275', NULL, '2026-03-25T12:08:11.185259+00:00'::timestamptz, '2026-03-25T12:08:11.185259+00:00'::timestamptz, true, false, true),
  ('90530f4f-4fcf-460e-b9e2-268afb02da83'::uuid, 'Jonas ', NULL, '49 9 8409-4760', NULL, '2026-03-27T20:03:36.197416+00:00'::timestamptz, '2026-03-27T20:03:36.197416+00:00'::timestamptz, true, false, true),
  ('88f2ecb9-d0f7-4c66-b12c-c60ebeeee0f6'::uuid, 'Cristiano', 'Cristiano', '47999782849', NULL, '2026-04-09T18:37:20.211305+00:00'::timestamptz, '2026-04-09T18:37:20.211305+00:00'::timestamptz, true, false, true),
  ('8a758532-e849-4128-bea9-6abc06ebbd65'::uuid, 'Luiz Augusto', 'Luiz Augusto', '82 9 9690-6863', NULL, '2026-04-13T13:27:00.503488+00:00'::timestamptz, '2026-04-13T13:27:00.503488+00:00'::timestamptz, true, false, true),
  ('db398111-9bec-43ec-a2af-9524e35cecf6'::uuid, 'Matheus Gonçalves', 'Matheus Gonçalves', '51 9 9998-1849', NULL, '2026-04-20T11:26:02.640056+00:00'::timestamptz, '2026-04-20T11:26:02.640056+00:00'::timestamptz, true, false, true),
  ('aa67e2ec-7d2e-4711-8779-c0bed3d5cdd4'::uuid, 'Wilson Piovesan', 'Wilson Piovesan', '4984290299', NULL, '2026-04-29T17:35:43.915457+00:00'::timestamptz, '2026-04-29T17:35:43.915457+00:00'::timestamptz, true, false, true),
  ('44e63422-379c-4318-9a46-d36a808d4af9'::uuid, 'Nivaldo Vargas', 'Nivaldo Vargas', '48 9 9938-1438', NULL, '2026-05-04T12:38:45.90995+00:00'::timestamptz, '2026-05-04T12:38:45.90995+00:00'::timestamptz, true, false, true),
  ('a60068b4-2a0a-4e52-83da-570a361c4358'::uuid, 'Camila', 'Camila Nino', '51 9 9138-8759', NULL, '2026-05-11T14:47:15.966003+00:00'::timestamptz, '2026-05-11T14:47:15.966003+00:00'::timestamptz, true, false, true),
  ('f2b5bdb9-3420-4d33-8c82-e04903b6f9ed'::uuid, 'Thiago Nino Imóveis', 'Thiago Nino', '51992639738', NULL, '2026-05-22T19:34:43.206931+00:00'::timestamptz, '2026-05-22T19:34:43.206931+00:00'::timestamptz, true, false, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 4. Indices compostos pros dropdowns de cada app
-- ============================================================================

CREATE INDEX IF NOT EXISTS imobiliarias_ativo_crm_nome_idx
  ON public.imobiliarias (ativo_crm, ativo, nome)
  WHERE ativo_crm = true AND ativo = true;

CREATE INDEX IF NOT EXISTS imobiliarias_ativo_nn_nome_idx
  ON public.imobiliarias (ativo_nn, ativo, nome)
  WHERE ativo_nn = true AND ativo = true;

-- ============================================================================
-- 5. RLS — herda padrao da issue #10. Sem alteracoes.
-- ============================================================================

COMMIT;

-- ============================================================================
-- VALIDACAO (rodar manualmente apos COMMIT, NAO commitar):
-- SELECT
--   count(*) AS total,
--   count(*) FILTER (WHERE ativo)      AS ativas,
--   count(*) FILTER (WHERE ativo_crm)  AS no_pingolead,
--   count(*) FILTER (WHERE ativo_nn)   AS no_novos_negocios,
--   count(*) FILTER (WHERE ativo_crm AND ativo_nn) AS em_ambos
-- FROM public.imobiliarias;
-- Esperado: total=269, ativas=269, no_pingolead=103, no_novos_negocios=166, em_ambos=0
