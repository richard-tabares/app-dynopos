-- Create product_variations table
CREATE TABLE IF NOT EXISTS public.product_variations (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variation_name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    unit_cost NUMERIC DEFAULT 0 NOT NULL,
    sku TEXT,
    barcode TEXT,
    stock BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT true NOT NULL,
    sort_order INT DEFAULT 0,
    created_at DATE DEFAULT now() NOT NULL
);

-- Index for fast lookups by product
CREATE INDEX IF NOT EXISTS idx_product_variations_product ON public.product_variations(product_id);

-- Add variation_type to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variation_type TEXT;

-- Add variation columns to salesItems
ALTER TABLE public."salesItems" ADD COLUMN IF NOT EXISTS variation_id UUID REFERENCES public.product_variations(id);
ALTER TABLE public."salesItems" ADD COLUMN IF NOT EXISTS variation_name TEXT;

-- Add variation columns to returns_items
ALTER TABLE public.returns_items ADD COLUMN IF NOT EXISTS variation_id UUID REFERENCES public.product_variations(id);
ALTER TABLE public.returns_items ADD COLUMN IF NOT EXISTS variation_name TEXT;

-- Add variation_id to inventory_movements
ALTER TABLE public.inventory_movements ADD COLUMN IF NOT EXISTS variation_id UUID REFERENCES public.product_variations(id);

-- RLS: enable with policy through products join
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can do ALL on their own variations" ON public.product_variations
    USING (
        EXISTS (
            SELECT 1 FROM public.products
            WHERE products.id = product_variations.product_id
            AND products.business_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.products
            WHERE products.id = product_variations.product_id
            AND products.business_id = auth.uid()
        )
    );

GRANT ALL ON public.product_variations TO anon, authenticated;
