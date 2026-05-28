ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variations_disabled BOOLEAN DEFAULT false NOT NULL;
