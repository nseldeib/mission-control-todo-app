-- Check if the demo user exists and get details
SELECT 
    'Demo user status:' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo@cosmictasks.app') 
        THEN 'EXISTS' 
        ELSE 'NOT FOUND' 
    END as status;

-- If user exists, show details
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'CONFIRMED'
        ELSE 'NOT CONFIRMED'
    END as email_status
FROM auth.users 
WHERE email = 'demo@cosmictasks.app';

-- Check if demo data exists
DO $$
DECLARE
    demo_user_id UUID;
    project_count INTEGER;
    todo_count INTEGER;
    focus_count INTEGER;
    reflection_count INTEGER;
BEGIN
    SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@cosmictasks.app';
    
    IF demo_user_id IS NOT NULL THEN
        SELECT COUNT(*) INTO project_count FROM projects WHERE user_id = demo_user_id;
        SELECT COUNT(*) INTO todo_count FROM todos WHERE user_id = demo_user_id;
        SELECT COUNT(*) INTO focus_count FROM daily_focuses WHERE user_id = demo_user_id;
        SELECT COUNT(*) INTO reflection_count FROM daily_reflections WHERE user_id = demo_user_id;
        
        RAISE NOTICE 'Demo data summary:';
        RAISE NOTICE '- Projects: %', project_count;
        RAISE NOTICE '- Todos: %', todo_count;
        RAISE NOTICE '- Daily Focuses: %', focus_count;
        RAISE NOTICE '- Daily Reflections: %', reflection_count;
    ELSE
        RAISE NOTICE 'Demo user not found - cannot check demo data';
    END IF;
END $$;
