-- Create wiki_entries table
CREATE TABLE IF NOT EXISTS public.wiki_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    tags TEXT[] DEFAULT '{}',
    category TEXT DEFAULT 'general',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    is_public BOOLEAN DEFAULT false,
    rating INTEGER DEFAULT NULL CHECK (rating >= 1 AND rating <= 5),
    file_urls TEXT[] DEFAULT '{}',
    related_links TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS wiki_entries_user_id_idx ON public.wiki_entries(user_id);
CREATE INDEX IF NOT EXISTS wiki_entries_category_idx ON public.wiki_entries(category);
CREATE INDEX IF NOT EXISTS wiki_entries_status_idx ON public.wiki_entries(status);
CREATE INDEX IF NOT EXISTS wiki_entries_tags_idx ON public.wiki_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS wiki_entries_updated_at_idx ON public.wiki_entries(updated_at DESC);

-- Enable RLS
ALTER TABLE public.wiki_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own wiki entries" ON public.wiki_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wiki entries" ON public.wiki_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wiki entries" ON public.wiki_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wiki entries" ON public.wiki_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_wiki_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_wiki_entries_updated_at
    BEFORE UPDATE ON public.wiki_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_wiki_entries_updated_at();
