-- Create daily_focuses table (this is new for our app)
CREATE TABLE IF NOT EXISTS daily_focuses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  focus_date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, focus_date)
);

-- Create daily_reflections table (this is new for our app)
CREATE TABLE IF NOT EXISTS daily_reflections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reflection_date DATE NOT NULL,
  accomplishments TEXT,
  learnings TEXT,
  improvements TEXT,
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, reflection_date)
);

-- Enable RLS on new tables
ALTER TABLE daily_focuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reflections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Users can manage own daily focuses" ON daily_focuses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own daily reflections" ON daily_reflections FOR ALL USING (auth.uid() = user_id);

-- Add RLS policies for existing tables if they don't exist
DO $$ 
BEGIN
    -- Check if RLS policies exist for existing tables, if not create them
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'todos' AND policyname = 'Users can manage own todos') THEN
        CREATE POLICY "Users can manage own todos" ON todos FOR ALL USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Users can manage own projects') THEN
        CREATE POLICY "Users can manage own projects" ON projects FOR ALL USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile') THEN
        CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
        CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
        CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Enable RLS on existing tables if not already enabled
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
