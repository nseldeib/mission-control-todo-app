-- First, you'll need to create the demo user in Supabase Auth Dashboard:
-- Email: demo@cosmictasks.app
-- Password: demo123456
-- Then run this script to populate demo data

-- Insert demo profile (replace 'DEMO_USER_ID' with actual demo user ID from auth.users)
INSERT INTO profiles (id, email, full_name, created_at, updated_at) 
VALUES (
  'DEMO_USER_ID', -- Replace with actual demo user ID
  'demo@cosmictasks.app',
  'Demo Astronaut',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  full_name = 'Demo Astronaut',
  updated_at = NOW();

-- Insert demo projects
INSERT INTO projects (id, user_id, title, description, emoji, color, completed, created_at, updated_at) VALUES
  (gen_random_uuid(), 'DEMO_USER_ID', 'Cosmic Productivity', 'Master the art of space-age task management', '🚀', '#6366f1', false, NOW(), NOW()),
  (gen_random_uuid(), 'DEMO_USER_ID', 'Learning Journey', 'Expand knowledge across the universe', '📚', '#8b5cf6', false, NOW(), NOW()),
  (gen_random_uuid(), 'DEMO_USER_ID', 'Health & Wellness', 'Maintain astronaut-level fitness', '💪', '#10b981', false, NOW(), NOW()),
  (gen_random_uuid(), 'DEMO_USER_ID', 'Creative Projects', 'Express creativity in the cosmos', '🎨', '#f59e0b', false, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Get project IDs for demo todos (you'll need to run this after the projects are inserted)
-- Insert demo todos
WITH demo_projects AS (
  SELECT id, title FROM projects WHERE user_id = 'DEMO_USER_ID'
)
INSERT INTO todos (id, user_id, title, description, emoji, priority, completed, starred, due_date, project_id, created_at, updated_at) VALUES
  -- Today's tasks
  (gen_random_uuid(), 'DEMO_USER_ID', 'Review mission objectives', 'Check today''s goals and priorities', '🎯', 'high', false, true, CURRENT_DATE, (SELECT id FROM demo_projects WHERE title = 'Cosmic Productivity'), NOW(), NOW()),
  (gen_random_uuid(), 'DEMO_USER_ID', 'Complete space training module', 'Finish the advanced navigation course', '🧑‍🚀', 'medium', false, false, CURRENT_DATE, (SELECT id FROM demo_projects WHERE title = 'Learning Journey'), NOW(), NOW()),
  (gen_random_uuid(), 'DEMO_USER_ID', 'Morning cosmic meditation', 'Center yourself for the day ahead', '🧘', 'low', true, false, CURRENT_DATE, (SELECT id FROM demo_projects WHERE title = 'Health & Wellness'), NOW(), NOW()),
  
  -- Upcoming tasks
  (gen_random_uuid(), 'DEMO_USER_ID', 'Design new galaxy interface', 'Create mockups for the stellar dashboard', '🌌', 'high', false, false, CURRENT_DATE + INTERVAL '1 day', (SELECT id FROM demo_projects WHERE title = 'Creative Projects'), NOW(), NOW()),
  (gen_random_uuid(), 'DEMO_USER_ID', 'Research black hole physics', 'Deep dive into event horizon mechanics', '🕳️', 'medium', false, true, CURRENT_DATE + INTERVAL '2 days', (SELECT id FROM demo_projects WHERE title = 'Learning Journey'), NOW(), NOW()),
  (gen_random_uuid(), 'DEMO_USER_ID', 'Plan weekend space walk', 'Prepare equipment and route for EVA', '🚶‍♂️', 'low', false, false, CURRENT_DATE + INTERVAL '3 days', (SELECT id FROM demo_projects WHERE title = 'Health & Wellness'), NOW(), NOW()),
  
  -- Completed tasks
  (gen_random_uuid(), 'DEMO_USER_ID', 'Launch sequence checklist', 'Verify all systems are go for launch', '✅', 'high', true, false, CURRENT_DATE - INTERVAL '1 day', (SELECT id FROM demo_projects WHERE title = 'Cosmic Productivity'), NOW(), NOW()),
  (gen_random_uuid(), 'DEMO_USER_ID', 'Update star charts', 'Refresh navigation database with latest data', '🗺️', 'medium', true, false, CURRENT_DATE - INTERVAL '1 day', (SELECT id FROM demo_projects WHERE title = 'Learning Journey'), NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insert demo daily focus for today
INSERT INTO daily_focuses (id, user_id, focus_date, title, description, completed, created_at, updated_at) VALUES
  (gen_random_uuid(), 'DEMO_USER_ID', CURRENT_DATE, 'Master Cosmic Productivity', 'Focus on completing high-priority mission objectives and maintaining stellar performance throughout the day', false, NOW(), NOW())
ON CONFLICT (user_id, focus_date) DO UPDATE SET
  title = 'Master Cosmic Productivity',
  description = 'Focus on completing high-priority mission objectives and maintaining stellar performance throughout the day',
  updated_at = NOW();

-- Insert demo daily focus for yesterday (completed)
INSERT INTO daily_focuses (id, user_id, focus_date, title, description, completed, completed_at, created_at, updated_at) VALUES
  (gen_random_uuid(), 'DEMO_USER_ID', CURRENT_DATE - INTERVAL '1 day', 'Successful Mission Launch', 'Execute perfect launch sequence and establish orbital trajectory', true, NOW(), NOW() - INTERVAL '1 day', NOW())
ON CONFLICT (user_id, focus_date) DO UPDATE SET
  title = 'Successful Mission Launch',
  description = 'Execute perfect launch sequence and establish orbital trajectory',
  completed = true,
  completed_at = NOW(),
  updated_at = NOW();

-- Insert demo daily reflection for yesterday
INSERT INTO daily_reflections (id, user_id, reflection_date, accomplishments, learnings, improvements, mood_rating, created_at, updated_at) VALUES
  (gen_random_uuid(), 'DEMO_USER_ID', CURRENT_DATE - INTERVAL '1 day', 
   'Successfully completed launch sequence and achieved stable orbit. All systems performed nominally and crew morale remains high.',
   'Learned that proper preparation and systematic approach are crucial for complex operations. The importance of clear communication during critical phases cannot be overstated.',
   'Could improve pre-flight briefing efficiency and consider implementing automated checklists for routine procedures.',
   4, NOW() - INTERVAL '1 day', NOW())
ON CONFLICT (user_id, reflection_date) DO UPDATE SET
  accomplishments = 'Successfully completed launch sequence and achieved stable orbit. All systems performed nominally and crew morale remains high.',
  learnings = 'Learned that proper preparation and systematic approach are crucial for complex operations. The importance of clear communication during critical phases cannot be overstated.',
  improvements = 'Could improve pre-flight briefing efficiency and consider implementing automated checklists for routine procedures.',
  mood_rating = 4,
  updated_at = NOW();
