-- Table for direct deal gallery images (not linked to tasks)
CREATE TABLE public.crm_deal_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES public.crm_deals(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  nome_arquivo text NOT NULL DEFAULT '',
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  uploaded_by uuid NOT NULL
);

ALTER TABLE public.crm_deal_images ENABLE ROW LEVEL SECURITY;

-- SELECT: admin sees all, user sees own deals
CREATE POLICY "crm_deal_images_select" ON public.crm_deal_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM crm_deals d
      WHERE d.id = crm_deal_images.deal_id
        AND (has_role(auth.uid(), 'admin'::app_role) OR d.responsavel_id = auth.uid())
    )
  );

-- INSERT: admin or deal owner
CREATE POLICY "crm_deal_images_insert" ON public.crm_deal_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM crm_deals d
      WHERE d.id = crm_deal_images.deal_id
        AND (has_role(auth.uid(), 'admin'::app_role) OR d.responsavel_id = auth.uid())
    )
  );

-- DELETE: admin or deal owner
CREATE POLICY "crm_deal_images_delete" ON public.crm_deal_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM crm_deals d
      WHERE d.id = crm_deal_images.deal_id
        AND (has_role(auth.uid(), 'admin'::app_role) OR d.responsavel_id = auth.uid())
    )
  );