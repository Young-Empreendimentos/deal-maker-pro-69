
-- Enum para status do deal (kanban)
CREATE TYPE public.crm_deal_status AS ENUM (
  'lead_recebido',
  'contato_feito',
  'visita_agendada',
  'visita_realizada',
  'ficha_assinada',
  'proposta_recebida'
);

-- Enum para qualificação
CREATE TYPE public.crm_qualificacao AS ENUM ('frio', 'morno', 'quente');

-- Empreendimentos do CRM
CREATE TABLE public.crm_empreendimentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cidade TEXT NOT NULL DEFAULT '',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_empreendimentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_emp_select" ON public.crm_empreendimentos FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "crm_emp_admin" ON public.crm_empreendimentos FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Fontes de lead
CREATE TABLE public.crm_fontes_lead (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_fontes_lead ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_fontes_select" ON public.crm_fontes_lead FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "crm_fontes_admin" ON public.crm_fontes_lead FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Deals (negociações)
CREATE TABLE public.crm_deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_nome TEXT NOT NULL,
  cliente_email TEXT,
  fonte_id UUID REFERENCES public.crm_fontes_lead(id),
  qualificacao public.crm_qualificacao NOT NULL DEFAULT 'frio',
  status public.crm_deal_status NOT NULL DEFAULT 'lead_recebido',
  empreendimento_id UUID REFERENCES public.crm_empreendimentos(id),
  responsavel_id UUID NOT NULL,
  ordem_kanban INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;

-- Admin vê todos, vendedor vê apenas seus deals
CREATE POLICY "crm_deals_select" ON public.crm_deals FOR SELECT USING (
  public.has_role(auth.uid(), 'admin') OR responsavel_id = auth.uid()
);
CREATE POLICY "crm_deals_insert" ON public.crm_deals FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND responsavel_id = auth.uid()
);
CREATE POLICY "crm_deals_update" ON public.crm_deals FOR UPDATE USING (
  public.has_role(auth.uid(), 'admin') OR responsavel_id = auth.uid()
);
CREATE POLICY "crm_deals_delete" ON public.crm_deals FOR DELETE USING (
  public.has_role(auth.uid(), 'admin')
);

-- Telefones do deal
CREATE TABLE public.crm_deal_phones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.crm_deals(id) ON DELETE CASCADE,
  telefone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_deal_phones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_phones_select" ON public.crm_deal_phones FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.crm_deals d WHERE d.id = deal_id AND (public.has_role(auth.uid(), 'admin') OR d.responsavel_id = auth.uid()))
);
CREATE POLICY "crm_phones_insert" ON public.crm_deal_phones FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.crm_deals d WHERE d.id = deal_id AND (public.has_role(auth.uid(), 'admin') OR d.responsavel_id = auth.uid()))
);
CREATE POLICY "crm_phones_update" ON public.crm_deal_phones FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.crm_deals d WHERE d.id = deal_id AND (public.has_role(auth.uid(), 'admin') OR d.responsavel_id = auth.uid()))
);
CREATE POLICY "crm_phones_delete" ON public.crm_deal_phones FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.crm_deals d WHERE d.id = deal_id AND (public.has_role(auth.uid(), 'admin') OR d.responsavel_id = auth.uid()))
);

-- Tarefas vinculadas a deals
CREATE TABLE public.crm_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.crm_deals(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  data_vencimento DATE,
  concluida BOOLEAN NOT NULL DEFAULT false,
  responsavel_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_tasks_select" ON public.crm_tasks FOR SELECT USING (
  public.has_role(auth.uid(), 'admin') OR responsavel_id = auth.uid()
);
CREATE POLICY "crm_tasks_insert" ON public.crm_tasks FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND responsavel_id = auth.uid()
);
CREATE POLICY "crm_tasks_update" ON public.crm_tasks FOR UPDATE USING (
  public.has_role(auth.uid(), 'admin') OR responsavel_id = auth.uid()
);
CREATE POLICY "crm_tasks_delete" ON public.crm_tasks FOR DELETE USING (
  public.has_role(auth.uid(), 'admin') OR responsavel_id = auth.uid()
);

-- Imagens das tarefas
CREATE TABLE public.crm_task_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.crm_tasks(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  nome_arquivo TEXT NOT NULL DEFAULT '',
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_task_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_images_select" ON public.crm_task_images FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.crm_tasks t WHERE t.id = task_id AND (public.has_role(auth.uid(), 'admin') OR t.responsavel_id = auth.uid()))
);
CREATE POLICY "crm_images_insert" ON public.crm_task_images FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.crm_tasks t WHERE t.id = task_id AND (public.has_role(auth.uid(), 'admin') OR t.responsavel_id = auth.uid()))
);
CREATE POLICY "crm_images_delete" ON public.crm_task_images FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.crm_tasks t WHERE t.id = task_id AND (public.has_role(auth.uid(), 'admin') OR t.responsavel_id = auth.uid()))
);

-- Triggers para updated_at
CREATE TRIGGER crm_empreendimentos_updated_at BEFORE UPDATE ON public.crm_empreendimentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER crm_deals_updated_at BEFORE UPDATE ON public.crm_deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER crm_tasks_updated_at BEFORE UPDATE ON public.crm_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket para imagens de tarefas
INSERT INTO storage.buckets (id, name, public) VALUES ('task-images', 'task-images', true) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "crm_task_images_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'task-images' AND auth.uid() IS NOT NULL);
CREATE POLICY "crm_task_images_select" ON storage.objects FOR SELECT USING (bucket_id = 'task-images');
CREATE POLICY "crm_task_images_delete" ON storage.objects FOR DELETE USING (bucket_id = 'task-images' AND auth.uid() IS NOT NULL);
