
-- Fix overly permissive INSERT policy on support_tickets
DROP POLICY "Allow public insert" ON public.support_tickets;
CREATE POLICY "Admins can insert tickets"
  ON public.support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix overly permissive DELETE policy on support_tickets
DROP POLICY "Allow public delete" ON public.support_tickets;
CREATE POLICY "Admins can delete tickets"
  ON public.support_tickets FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
