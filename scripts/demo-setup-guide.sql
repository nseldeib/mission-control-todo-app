/*
=== DEMO ACCOUNT SETUP GUIDE ===

Step 1: Create Demo User in Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Authentication → Users
3. Click "Add User" button
4. Fill in the form:
   - Email: demo@cosmictasks.app
   - Password: demo123456
   - Confirm Password: demo123456
   - Auto Confirm User: YES (check this box)
5. Click "Create User"

Step 2: Verify User Creation
Run this query to check if user was created:
*/

SELECT 
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users 
WHERE email = 'demo@cosmictasks.app';

/*
Step 3: Run Demo Data Script
After confirming the user exists, run:
- scripts/create-demo-data-fixed.sql

Step 4: Test Demo Login
- Go to /login page
- Click "🚀 Try Demo Account" button
- Should automatically log in and redirect to dashboard

=== TROUBLESHOOTING ===

If demo login fails:
1. Check if user exists (run query above)
2. Verify email is confirmed (email_confirmed_at should not be null)
3. Try manual login with demo@cosmictasks.app / demo123456
4. Check browser console for detailed error messages
5. Verify RLS policies are set up correctly

If you need to reset demo data:
- Run scripts/cleanup-demo-data.sql
- Then run scripts/create-demo-data-fixed.sql again
*/
