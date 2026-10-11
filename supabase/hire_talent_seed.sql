-- ==============================================================================
-- Hire Talent Sample Seed Data
-- Creates representative talent profiles across the 6 core categories
-- Run this script in the Supabase SQL Editor if you wish to populate initial demo talent.
-- ==============================================================================

-- Sample talents (using deterministic UUIDs for demonstration)
DO $$
DECLARE
  engineer_id UUID := '00000000-0000-0000-0000-000000000101';
  mobile_id   UUID := '00000000-0000-0000-0000-000000000102';
  designer_id UUID := '00000000-0000-0000-0000-000000000103';
  ai_id       UUID := '00000000-0000-0000-0000-000000000104';
  marketer_id UUID := '00000000-0000-0000-0000-000000000105';
  qa_id       UUID := '00000000-0000-0000-0000-000000000106';
BEGIN
  -- Insert auth users if not existing
  INSERT INTO auth.users (id, email, raw_user_meta_data, created_at)
  VALUES
    (engineer_id, 'alex.turner@example.com', '{"full_name": "Alex Turner", "country": "United States"}'::jsonb, NOW()),
    (mobile_id, 'elena.rostova@example.com', '{"full_name": "Elena Rostova", "country": "Estonia"}'::jsonb, NOW()),
    (designer_id, 'marcus.vance@example.com', '{"full_name": "Marcus Vance", "country": "United Kingdom"}'::jsonb, NOW()),
    (ai_id, 'priya.sharma@example.com', '{"full_name": "Priya Sharma", "country": "India"}'::jsonb, NOW()),
    (marketer_id, 'david.kim@example.com', '{"full_name": "David Kim", "country": "Canada"}'::jsonb, NOW()),
    (qa_id, 'sophia.lindqvist@example.com', '{"full_name": "Sophia Lindqvist", "country": "Sweden"}'::jsonb, NOW())
  ON CONFLICT (id) DO NOTHING;

  -- 1. Software & Web
  INSERT INTO public.talent_profiles (
    id, user_id, headline, bio, skills, experience_years, hourly_rate, min_project_budget,
    availability_status, availability_hours_per_week, preferred_categories, timezone, languages,
    verification_status, full_name, country
  ) VALUES (
    engineer_id, engineer_id,
    'Senior Full-Stack Engineer & Cloud Architect',
    'Specializing in high-performance web applications using Next.js, TypeScript, PostgreSQL, and scalable microservices. Over 8 years of experience leading technical delivery for seed to Series B venture-backed startups.',
    ARRAY['Next.js', 'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'GraphQL', 'Tailwind CSS'],
    8.5, 85.00, 2500.00,
    'available_now', 40,
    ARRAY['software-web'], 'America/New_York', ARRAY['English'],
    'verified', 'Alex Turner', 'United States'
  ) ON CONFLICT (id) DO NOTHING;

  -- 2. Mobile Applications
  INSERT INTO public.talent_profiles (
    id, user_id, headline, bio, skills, experience_years, hourly_rate, min_project_budget,
    availability_status, availability_hours_per_week, preferred_categories, timezone, languages,
    verification_status, full_name, country
  ) VALUES (
    mobile_id, mobile_id,
    'Lead Mobile Developer (React Native & Flutter)',
    'Building fluid, native-grade iOS and Android applications with offline-first persistence, push notification architecture, and biometrics. Shipped 12+ apps to the App Store and Google Play.',
    ARRAY['React Native', 'Flutter', 'iOS', 'Android', 'TypeScript', 'Firebase', 'Mobile UI', 'REST APIs'],
    6.0, 75.00, 2000.00,
    'available_now', 35,
    ARRAY['mobile-apps'], 'Europe/Tallinn', ARRAY['English', 'Russian'],
    'verified', 'Elena Rostova', 'Estonia'
  ) ON CONFLICT (id) DO NOTHING;

  -- 3. UI/UX & Graphic Design
  INSERT INTO public.talent_profiles (
    id, user_id, headline, bio, skills, experience_years, hourly_rate, min_project_budget,
    availability_status, availability_hours_per_week, preferred_categories, timezone, languages,
    verification_status, full_name, country
  ) VALUES (
    designer_id, designer_id,
    'Principal Product & Design System Designer',
    'Obsessed with craft, typographic hierarchy, and intuitive user experiences. Expert in Figma component architecture, multi-brand design tokens, user testing, and developer handoffs.',
    ARRAY['Figma', 'UI/UX Design', 'Design Systems', 'User Research', 'Prototyping', 'Wireframing', 'Tailwind CSS'],
    7.0, 70.00, 1500.00,
    'available_part_time', 20,
    ARRAY['ui-ux-design'], 'Europe/London', ARRAY['English'],
    'verified', 'Marcus Vance', 'United Kingdom'
  ) ON CONFLICT (id) DO NOTHING;

  -- 4. AI Engineering & Automation
  INSERT INTO public.talent_profiles (
    id, user_id, headline, bio, skills, experience_years, hourly_rate, min_project_budget,
    availability_status, availability_hours_per_week, preferred_categories, timezone, languages,
    verification_status, full_name, country
  ) VALUES (
    ai_id, ai_id,
    'Senior AI Application Engineer & LLM Specialist',
    'Hands-on expertise developing production RAG systems, autonomous agent workflows, model evaluation harnesses, and enterprise workflow integrations using Python, LangChain, and OpenAI.',
    ARRAY['Python', 'OpenAI API', 'LangChain', 'RAG Pipelines', 'Agents', 'Vector Databases', 'PyTorch', 'FastAPI'],
    5.5, 95.00, 3000.00,
    'available_now', 40,
    ARRAY['ai-automation'], 'Asia/Kolkata', ARRAY['English', 'Hindi'],
    'verified', 'Priya Sharma', 'India'
  ) ON CONFLICT (id) DO NOTHING;

  -- 5. Digital Marketing & Growth
  INSERT INTO public.talent_profiles (
    id, user_id, headline, bio, skills, experience_years, hourly_rate, min_project_budget,
    availability_status, availability_hours_per_week, preferred_categories, timezone, languages,
    verification_status, full_name, country
  ) VALUES (
    marketer_id, marketer_id,
    'Technical Growth Marketer & Performance Strategist',
    'Driving profitable customer acquisition across Google, Meta, and programmatic search. Proven track record managing $500K+ monthly ad spend with focus on ROAS and conversion rate optimization.',
    ARRAY['Google Ads', 'Meta Ads', 'SEO', 'Conversion Rate Optimization', 'Google Analytics 4', 'Copywriting'],
    6.0, 65.00, 1200.00,
    'available_now', 30,
    ARRAY['digital-marketing'], 'America/Toronto', ARRAY['English'],
    'verified', 'David Kim', 'Canada'
  ) ON CONFLICT (id) DO NOTHING;

  -- 6. QA & Technical Consulting
  INSERT INTO public.talent_profiles (
    id, user_id, headline, bio, skills, experience_years, hourly_rate, min_project_budget,
    availability_status, availability_hours_per_week, preferred_categories, timezone, languages,
    verification_status, full_name, country
  ) VALUES (
    qa_id, qa_id,
    'QA Automation Architect & Security Auditor',
    'End-to-end browser and API automation test suites using Playwright and Cypress. Security vulnerability assessments, OWASP compliance audits, and performance stress testing.',
    ARRAY['Playwright', 'Cypress', 'Security Audit', 'API Testing', 'Load Testing', 'CI/CD Pipelines', 'TypeScript'],
    7.5, 65.00, 1000.00,
    'available_now', 40,
    ARRAY['qa-testing-consulting'], 'Europe/Stockholm', ARRAY['English', 'Swedish'],
    'verified', 'Sophia Lindqvist', 'Sweden'
  ) ON CONFLICT (id) DO NOTHING;

END $$;
