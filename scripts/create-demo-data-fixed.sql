-- This script will automatically find the demo user and create demo data
-- First, let's create a function to get the demo user ID
DO $$
DECLARE
    demo_user_id UUID;
    productivity_project_id UUID;
    learning_project_id UUID;
    health_project_id UUID;
    creative_project_id UUID;
BEGIN
    -- Get the demo user ID
    SELECT id INTO demo_user_id 
    FROM auth.users 
    WHERE email = 'demo@cosmictasks.app' 
    LIMIT 1;
    
    -- If demo user doesn't exist, raise an error
    IF demo_user_id IS NULL THEN
        RAISE EXCEPTION 'Demo user with email demo@cosmictasks.app not found. Please create the user first in Supabase Auth dashboard.';
    END IF;
    
    -- Insert demo profile
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
    
    -- Insert demo projects and get their IDs
    INSERT INTO projects (id, user_id, title, description, emoji, color, completed, created_at, updated_at) VALUES
        (gen_random_uuid(), demo_user_id, 'Cosmic Productivity', 'Master the art of space-age task management', '🚀', '#6366f1', false, NOW(), NOW()),
        (gen_random_uuid(), demo_user_id, 'Learning Journey', 'Expand knowledge across the universe', '📚', '#8b5cf6', false, NOW(), NOW()),
        (gen_random_uuid(), demo_user_id, 'Health & Wellness', 'Maintain astronaut-level fitness', '💪', '#10b981', false, NOW(), NOW()),
        (gen_random_uuid(), demo_user_id, 'Creative Projects', 'Express creativity in the cosmos', '🎨', '#f59e0b', false, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Get project IDs
    SELECT id INTO productivity_project_id FROM projects WHERE user_id = demo_user_id AND title = 'Cosmic Productivity';
    SELECT id INTO learning_project_id FROM projects WHERE user_id = demo_user_id AND title = 'Learning Journey';
    SELECT id INTO health_project_id FROM projects WHERE user_id = demo_user_id AND title = 'Health & Wellness';
    SELECT id INTO creative_project_id FROM projects WHERE user_id = demo_user_id AND title = 'Creative Projects';
    
    -- Insert demo todos
    INSERT INTO todos (id, user_id, title, description, emoji, priority, completed, starred, due_date, project_id, created_at, updated_at) VALUES
        -- Today's tasks
        (gen_random_uuid(), demo_user_id, 'Review mission objectives', 'Check today''s goals and priorities', '🎯', 'high', false, true, CURRENT_DATE, productivity_project_id, NOW(), NOW()),
        (gen_random_uuid(), demo_user_id, 'Complete space training module', 'Finish the advanced navigation course', '🧑‍🚀', 'medium', false, false, CURRENT_DATE, learning_project_id, NOW(), NOW()),
        (gen_random_uuid(), demo_user_id, 'Morning cosmic meditation', 'Center yourself for the day ahead', '🧘', 'low', true, false, CURRENT_DATE, health_project_id, NOW(), NOW()),
        
        -- Upcoming tasks
        (gen_random_uuid(), demo_user_id, 'Design new galaxy interface', 'Create mockups for the stellar dashboard', '🌌', 'high', false, false, CURRENT_DATE + INTERVAL '1 day', creative_project_id, NOW(), NOW()),
        (gen_random_uuid(), demo_user_id, 'Research black hole physics', 'Deep dive into event horizon mechanics', '🕳️', 'medium', false, true, CURRENT_DATE + INTERVAL '2 days', learning_project_id, NOW(), NOW()),
        (gen_random_uuid(), demo_user_id, 'Plan weekend space walk', 'Prepare equipment and route for EVA', '🚶‍♂️', 'low', false, false, CURRENT_DATE + INTERVAL '3 days', health_project_id, NOW(), NOW()),
        
        -- Completed tasks
        (gen_random_uuid(), demo_user_id, 'Launch sequence checklist', 'Verify all systems are go for launch', '✅', 'high', true, false, CURRENT_DATE - INTERVAL '1 day', productivity_project_id, NOW(), NOW()),
        (gen_random_uuid(), demo_user_id, 'Update star charts', 'Refresh navigation database with latest data', '🗺️', 'medium', true, false, CURRENT_DATE - INTERVAL '1 day', learning_project_id, NOW(), NOW()),
        
        -- More variety in tasks
        (gen_random_uuid(), demo_user_id, 'Calibrate telescope array', 'Fine-tune deep space observation equipment', '🔭', 'medium', false, false, CURRENT_DATE + INTERVAL '4 days', creative_project_id, NOW(), NOW()),
        (gen_random_uuid(), demo_user_id, 'Zero-gravity workout routine', 'Maintain muscle mass in space environment', '🏋️', 'high', false, true, CURRENT_DATE, health_project_id, NOW(), NOW()),
        (gen_random_uuid(), demo_user_id, 'Document alien encounters', 'Log and categorize first contact protocols', '👽', 'low', false, false, CURRENT_DATE + INTERVAL '5 days', learning_project_id, NOW(), NOW()),
        (gen_random_uuid(), demo_user_id, 'Compose cosmic symphony', 'Create music inspired by stellar phenomena', '🎵', 'low', true, false, CURRENT_DATE - INTERVAL '2 days', creative_project_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Insert demo daily focus for today
    INSERT INTO daily_focuses (id, user_id, focus_date, title, description, completed, created_at, updated_at) VALUES
        (gen_random_uuid(), demo_user_id, CURRENT_DATE, 'Master Cosmic Productivity', 'Focus on completing high-priority mission objectives and maintaining stellar performance throughout the day', false, NOW(), NOW())
    ON CONFLICT (user_id, focus_date) DO UPDATE SET
        title = 'Master Cosmic Productivity',
        description = 'Focus on completing high-priority mission objectives and maintaining stellar performance throughout the day',
        updated_at = NOW();
    
    -- Insert demo daily focus for yesterday (completed)
    INSERT INTO daily_focuses (id, user_id, focus_date, title, description, completed, completed_at, created_at, updated_at) VALUES
        (gen_random_uuid(), demo_user_id, CURRENT_DATE - INTERVAL '1 day', 'Successful Mission Launch', 'Execute perfect launch sequence and establish orbital trajectory', true, NOW(), NOW() - INTERVAL '1 day', NOW())
    ON CONFLICT (user_id, focus_date) DO UPDATE SET
        title = 'Successful Mission Launch',
        description = 'Execute perfect launch sequence and establish orbital trajectory',
        completed = true,
        completed_at = NOW(),
        updated_at = NOW();
    
    -- Insert demo daily focus for 2 days ago (completed)
    INSERT INTO daily_focuses (id, user_id, focus_date, title, description, completed, completed_at, created_at, updated_at) VALUES
        (gen_random_uuid(), demo_user_id, CURRENT_DATE - INTERVAL '2 days', 'Deep Space Exploration', 'Chart unknown territories and discover new cosmic phenomena', true, NOW(), NOW() - INTERVAL '2 days', NOW())
    ON CONFLICT (user_id, focus_date) DO UPDATE SET
        title = 'Deep Space Exploration',
        description = 'Chart unknown territories and discover new cosmic phenomena',
        completed = true,
        completed_at = NOW(),
        updated_at = NOW();
    
    -- Insert demo daily reflection for yesterday
    INSERT INTO daily_reflections (id, user_id, reflection_date, accomplishments, learnings, improvements, mood_rating, created_at, updated_at) VALUES
        (gen_random_uuid(), demo_user_id, CURRENT_DATE - INTERVAL '1 day', 
         'Successfully completed launch sequence and achieved stable orbit. All systems performed nominally and crew morale remains high. Completed 4 out of 5 planned tasks.',
         'Learned that proper preparation and systematic approach are crucial for complex operations. The importance of clear communication during critical phases cannot be overstated. Time-blocking helped maintain focus.',
         'Could improve pre-flight briefing efficiency and consider implementing automated checklists for routine procedures. Need to allocate more buffer time for unexpected issues.',
         4, NOW() - INTERVAL '1 day', NOW())
    ON CONFLICT (user_id, reflection_date) DO UPDATE SET
        accomplishments = 'Successfully completed launch sequence and achieved stable orbit. All systems performed nominally and crew morale remains high. Completed 4 out of 5 planned tasks.',
        learnings = 'Learned that proper preparation and systematic approach are crucial for complex operations. The importance of clear communication during critical phases cannot be overstated. Time-blocking helped maintain focus.',
        improvements = 'Could improve pre-flight briefing efficiency and consider implementing automated checklists for routine procedures. Need to allocate more buffer time for unexpected issues.',
        mood_rating = 4,
        updated_at = NOW();
    
    -- Insert demo daily reflection for 2 days ago
    INSERT INTO daily_reflections (id, user_id, reflection_date, accomplishments, learnings, improvements, mood_rating, created_at, updated_at) VALUES
        (gen_random_uuid(), demo_user_id, CURRENT_DATE - INTERVAL '2 days', 
         'Discovered three new star systems and catalogued 15 unique cosmic phenomena. Team collaboration was exceptional during the exploration phase.',
         'Realized the value of maintaining detailed logs during exploration. Pattern recognition skills improved significantly when analyzing stellar data.',
         'Should dedicate more time to equipment maintenance checks. Consider implementing a buddy system for dangerous EVA operations.',
         5, NOW() - INTERVAL '2 days', NOW())
    ON CONFLICT (user_id, reflection_date) DO UPDATE SET
        accomplishments = 'Discovered three new star systems and catalogued 15 unique cosmic phenomena. Team collaboration was exceptional during the exploration phase.',
        learnings = 'Realized the value of maintaining detailed logs during exploration. Pattern recognition skills improved significantly when analyzing stellar data.',
        improvements = 'Should dedicate more time to equipment maintenance checks. Consider implementing a buddy system for dangerous EVA operations.',
        mood_rating = 5,
        updated_at = NOW();
    
    RAISE NOTICE 'Demo data created successfully for user: %', demo_user_id;
    
END $$;
