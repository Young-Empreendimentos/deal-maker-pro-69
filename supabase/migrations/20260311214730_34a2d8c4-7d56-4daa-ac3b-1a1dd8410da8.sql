-- Drop existing restrictive policies
DROP POLICY IF EXISTS "crm_emp_admin" ON public.crm_empreendimentos;
DROP POLICY IF EXISTS "crm_emp_select" ON public.crm_empreendimentos;

-- Recreate as PERMISSIVE policies
CREATE POLICY "crm_emp_select"
ON public.crm_empreendimentos
FOR SELECT
TO public
USING (auth.uid() IS NOT NULL);

CREATE POLICY "crm_emp_admin_insert"
ON public.crm_empreendimentos
FOR INSERT
TO public
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "crm_emp_admin_update"
ON public.crm_empreendimentos
FOR UPDATE
TO public
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "crm_emp_admin_delete"
ON public.crm_empreendimentos
FOR DELETE
TO public
USING (has_role(auth.uid(), 'admin'::app_role));