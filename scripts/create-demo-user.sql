-- This script helps you create the demo user
-- Note: You still need to create the user in Supabase Auth Dashboard
-- This is just for reference of the credentials to use:

/*
To create the demo user:
1. Go to your Supabase Dashboard
2. Navigate to Authentication > Users
3. Click "Add User"
4. Use these credentials:
   - Email: demo@cosmictasks.app
   - Password: demo123456
   - Confirm Password: demo123456
5. Click "Create User"
6. Then run the create-demo-data-fixed.sql script

The demo user will have:
- Email: demo@cosmictasks.app
- Password: demo123456
- Full Name: Demo Astronaut
*/

-- Check if demo user exists
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users 
WHERE email = 'demo@cosmictasks.app';
