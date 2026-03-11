
-- Table for loss reasons (pre-defined options)
CREATE TABLE public.crm_motivos_perda (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.crm_motivos_perda ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_motivos_perda_select" ON public.crm_motivos_perda
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "crm_motivos_perda_admin" ON public.crm_motivos_perda
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Add loss reason column to crm_deals
ALTER TABLE public.crm_deals
  ADD COLUMN IF NOT EXISTS motivo_perda_id uuid REFERENCES crm_motivos_perda(id) ON DELETE SET NULL;

-- Add ativo column to user_profiles for toggling users
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS ativo boolean NOT NULL DEFAULT true;

-- Insert default loss reasons
INSERT INTO public.crm_motivos_perda (nome) VALUES
  ('Preço alto'),
  ('Localização'),
  ('Optou por concorrente'),
  ('Desistiu da compra'),
  ('Sem retorno / Não respondeu'),
  ('Financiamento não aprovado'),
  ('Outro');
