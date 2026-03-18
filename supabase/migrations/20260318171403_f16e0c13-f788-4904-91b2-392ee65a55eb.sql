CREATE POLICY "comercial_tabela_precos_select"
ON public.comercial_tabela_precos
FOR SELECT
TO authenticated
USING (true);