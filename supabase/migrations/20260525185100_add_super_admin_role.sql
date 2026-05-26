-- Add super_admin role to profiles
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check
CHECK (role = ANY (ARRAY['admin'::text, 'cajero'::text, 'supervisor'::text, 'super_admin'::text]));

-- Helper function to check super_admin without RLS recursion
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin');
$$;

-- Allow super_admin to view all support tickets
DROP POLICY IF EXISTS "Users can view their own tickets" ON support_tickets;
CREATE POLICY "Users can view their own tickets"
  ON support_tickets FOR SELECT
  USING (business_id = auth.uid() OR is_super_admin());

-- Allow super_admin to update support tickets
DROP POLICY IF EXISTS "Super admin can update tickets" ON support_tickets;
CREATE POLICY "Super admin can update tickets"
  ON support_tickets FOR UPDATE
  USING (is_super_admin());

-- Allow super_admin to view all businesses
DROP POLICY IF EXISTS "Users can view own business" ON businesses;
CREATE POLICY "Users can view own business"
  ON businesses FOR SELECT
  USING (user_id = auth.uid() OR is_super_admin());

-- Allow super_admin to view all subscriptions
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (business_id = auth.uid() OR is_super_admin());

-- Allow super_admin to view all payment transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON payment_transactions;
CREATE POLICY "Users can view own transactions"
  ON payment_transactions FOR SELECT
  USING (business_id = auth.uid() OR is_super_admin());

-- Allow super_admin to view all profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid() OR is_super_admin());

-- Index for super_admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_business_id ON profiles(business_id);
