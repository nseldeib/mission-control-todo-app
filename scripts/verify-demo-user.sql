-- Comprehensive demo user verification script

-- 1. Check if demo user exists in auth.users
SELECT 
    'AUTH USER CHECK' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo@cosmictasks.app') 
        THEN '✅ EXISTS' 
        ELSE '❌ NOT FOUND' 
    END as status;

-- 2. Get demo user details if exists
SELECT 
    'AUTH USER DETAILS' as info,
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ CONFIRMED'
        ELSE '❌ NOT CONFIRMED'
    END as email_status
FROM auth.users 
WHERE email = 'demo@cosmictasks.app';

-- 3. Check demo data
DO $$
DECLARE
    demo_user_id UUID;
    profile_exists BOOLEAN := FALSE;
    project_count INTEGER := 0;
    todo_count INTEGER := 0;
    focus_count INTEGER := 0;
BEGIN
    -- Get demo user ID
    SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@cosmictasks.app';
    
    IF demo_user_id IS NOT NULL THEN
        -- Check if profile exists
        SELECT EXISTS(SELECT 1 FROM profiles WHERE id = demo_user_id) INTO profile_exists;
        
        -- Count demo data
        SELECT COUNT(*) INTO project_count FROM projects WHERE user_id = demo_user_id;
        SELECT COUNT(*) INTO todo_count FROM todos WHERE user_id = demo_user_id;
        SELECT COUNT(*) INTO focus_count FROM daily_focuses WHERE user_id = demo_user_id;
        
        RAISE NOTICE '=== DEMO DATA STATUS ===';
        RAISE NOTICE 'User ID: %', demo_user_id;
        RAISE NOTICE 'Profile exists: %', CASE WHEN profile_exists THEN '✅ YES' ELSE '❌ NO' END;
        RAISE NOTICE 'Projects: %', project_count;
        RAISE NOTICE 'Todos: %', todo_count;
        RAISE NOTICE 'Daily Focuses: %', focus_count;
        
        IF NOT profile_exists OR project_count = 0 OR todo_count = 0 THEN
            RAISE NOTICE '⚠️  Demo data incomplete - run create-demo-user-simple.sql';
        ELSE
            RAISE NOTICE '✅ Demo setup appears complete!';
        END IF;
    ELSE
        RAISE NOTICE '❌ Demo user not found in auth.users table';
        RAISE NOTICE '📝 Create user in Supabase Dashboard: Authentication → Users → Add User';
        RAISE NOTICE '   Email: demo@cosmictasks.app';
        RAISE NOTICE '   Password: demo123456';
        RAISE NOTICE '   ✅ Auto Confirm User: YES';
    END IF;
END $$;
