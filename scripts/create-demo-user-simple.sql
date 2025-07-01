-- Simple script to create demo user data after you've created the auth user
-- Run this AFTER creating the demo user in Supabase Auth Dashboard

-- Check if demo user exists first
DO $$
DECLARE
    demo_user_id UUID;
BEGIN
    -- Try to find the demo user
    SELECT id INTO demo_user_id 
    FROM auth.users 
    WHERE email = 'demo@cosmictasks.app' 
    LIMIT 1;
    
    IF demo_user_id IS NULL THEN
        RAISE EXCEPTION 'Demo user not found! Please create user with email demo@cosmictasks.app in Supabase Auth Dashboard first.';
    END IF;
    
    RAISE NOTICE 'Demo user found with ID: %', demo_user_id;
    
    -- Create profile
    INSERT INTO profiles (id, email, full_name, created_at, updated_at) 
    VALUES (
        demo_user_id,
        'demo@cosmictasks.app',
        'Demo Astronaut',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        full_name = 'Demo Astronaut',
        updated_at = NOW();
    
    RAISE NOTICE 'Demo profile created/updated';
    
    -- Create a simple project first
    INSERT INTO projects (id, user_id, title, description, emoji, color, completed, created_at, updated_at) VALUES
        (gen_random_uuid(), demo_user_id, 'Demo Project', 'Sample project for testing', '🚀', '#6366f1', false, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Demo project created';
    
    -- Create a simple todo
    INSERT INTO todos (id, user_id, title, description, emoji, priority, completed, starred, due_date, created_at, updated_at) VALUES
        (gen_random_uuid(), demo_user_id, 'Welcome to Cosmic Tasks!', 'This is your first demo task', '👋', 'medium', false, true, CURRENT_DATE, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Demo todo created';
    
    -- Create today's focus
    INSERT INTO daily_focuses (id, user_id, focus_date, title, description, completed, created_at, updated_at) VALUES
        (gen_random_uuid(), demo_user_id, CURRENT_DATE, 'Explore Cosmic Tasks', 'Get familiar with the space-themed productivity app', false, NOW(), NOW())
    ON CONFLICT (user_id, focus_date) DO UPDATE SET
        title = 'Explore Cosmic Tasks',
        description = 'Get familiar with the space-themed productivity app',
        updated_at = NOW();
    
    RAISE NOTICE 'Demo daily focus created';
    
    RAISE NOTICE 'Demo setup complete! You can now use the demo login.';
    
END $$;
