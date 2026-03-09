-- Waitlist table for TrustMarket landing page
-- Run this in Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT CHECK (role IN ('buyer', 'seller', 'both')) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    source TEXT DEFAULT 'landing_page',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts
CREATE POLICY "Allow anonymous inserts" ON public.waitlist
    FOR INSERT WITH CHECK (true);

-- Allow authenticated reads for admin
CREATE POLICY "Allow authenticated reads" ON public.waitlist
    FOR SELECT USING (auth.role() = 'authenticated');

-- Index for fast lookups
CREATE INDEX idx_waitlist_email ON public.waitlist(email);
CREATE INDEX idx_waitlist_created ON public.waitlist(created_at DESC);

-- Insert a test row (optional)
-- INSERT INTO public.waitlist (name, email, role) VALUES ('Test User', 'test@example.com', 'buyer');
