-- Fix infinite recursion on users SELECT policy
DROP POLICY IF EXISTS "Users can view partner profile" ON public.users;

CREATE POLICY "Users can view partner profile" ON public.users FOR SELECT
  USING (
    couple_id IN (
      SELECT id FROM public.couples WHERE partner_a = auth.uid() OR partner_b = auth.uid()
    )
  );
