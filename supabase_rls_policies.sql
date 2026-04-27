-- ============================================
-- POLÍTICAS RLS PARA DYNOPOS
-- Ejecutar en el SQL Editor de Supabase
-- ============================================

-- 1. profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. businesses
CREATE POLICY "Users can view own business" ON businesses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own business" ON businesses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own business" ON businesses
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own business" ON businesses
  FOR DELETE USING (auth.uid() = user_id);

-- 3. categories
CREATE POLICY "Users can view own categories" ON categories
  FOR SELECT USING (auth.uid() = business_id);
CREATE POLICY "Users can create own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = business_id);
CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (auth.uid() = business_id);
CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (auth.uid() = business_id);

-- 4. products
CREATE POLICY "Users can view own products" ON products
  FOR SELECT USING (auth.uid() = business_id);
CREATE POLICY "Users can create own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = business_id);
CREATE POLICY "Users can update own products" ON products
  FOR UPDATE USING (auth.uid() = business_id);
CREATE POLICY "Users can delete own products" ON products
  FOR DELETE USING (auth.uid() = business_id);

-- 5. inventory
CREATE POLICY "Users can view own inventory" ON inventory
  FOR SELECT USING (
    auth.uid() = (SELECT business_id FROM products WHERE id = product_id)
  );
CREATE POLICY "Users can update own inventory" ON inventory
  FOR UPDATE USING (
    auth.uid() = (SELECT business_id FROM products WHERE id = product_id)
  );
CREATE POLICY "Users can delete own inventory" ON inventory
  FOR DELETE USING (
    auth.uid() = (SELECT business_id FROM products WHERE id = product_id)
  );

-- 6. salesTickets
CREATE POLICY "Users can view own sales" ON salesTickets
  FOR SELECT USING (auth.uid() = business_id);
CREATE POLICY "Users can create own sales" ON salesTickets
  FOR INSERT WITH CHECK (auth.uid() = business_id);
CREATE POLICY "Users can update own sales" ON salesTickets
  FOR UPDATE USING (auth.uid() = business_id);

-- 7. salesItems
CREATE POLICY "Users can view own sales items" ON salesItems
  FOR SELECT USING (
    auth.uid() = (SELECT business_id FROM salesTickets WHERE id = sale_id)
  );
CREATE POLICY "Users can insert own sales items" ON salesItems
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT business_id FROM salesTickets WHERE id = sale_id)
  );

-- 8. returns
CREATE POLICY "Users can view own returns" ON returns
  FOR SELECT USING (auth.uid() = business_id);
CREATE POLICY "Users can insert own returns" ON returns
  FOR INSERT WITH CHECK (auth.uid() = business_id);

-- 9. returns_items
CREATE POLICY "Users can view own return items" ON returns_items
  FOR SELECT USING (
    auth.uid() = (SELECT business_id FROM returns WHERE id = return_id)
  );
CREATE POLICY "Users can insert own return items" ON returns_items
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT business_id FROM returns WHERE id = return_id)
  );

-- 10. Storage bucket 'logos'
CREATE POLICY "Anyone can view logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "Users can upload own logo" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'logos'
    AND auth.role() = 'authenticated'
  );
