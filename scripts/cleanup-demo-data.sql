-- Script to clean up demo data (useful for testing)
DO $$
DECLARE
    demo_user_id UUID;
BEGIN
    -- Get the demo user ID
    SELECT id INTO demo_user_id 
    FROM auth.users 
    WHERE email = 'demo@cosmictasks.app' 
    LIMIT 1;
    
    IF demo_user_id IS NOT NULL THEN
        -- Delete demo data in correct order (respecting foreign keys)
        DELETE FROM daily_reflections WHERE user_id = demo_user_id;
        DELETE FROM daily_focuses WHERE user_id = demo_user_id;
        DELETE FROM todos WHERE user_id = demo_user_id;
        DELETE FROM projects WHERE user_id = demo_user_id;
        DELETE FROM profiles WHERE id = demo_user_id;
        
        RAISE NOTICE 'Demo data cleaned up for user: %', demo_user_id;
    ELSE
        RAISE NOTICE 'Demo user not found';
    END IF;
END $$;
