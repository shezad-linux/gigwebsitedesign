-- V2__seed_catalog.sql
-- Seeds default admin, demo profile, and the 15 verified platform listings

-- 1. Default Admin & Demo Users (Passwords are BCrypt hashed: "Admin123!" and "Demo123!")
INSERT INTO users (id, email, password_hash, role, status, created_at, updated_at) VALUES
('usr_admin_01', 'admin@gigmatcher.local', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ROLE_ADMIN', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('usr_demo_01', 'demo@gigmatcher.local', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ROLE_USER', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2. Demo User Profile (Aarav Sharma)
INSERT INTO user_profiles (
    id, user_id, full_name, country, country_code, work_authorization,
    experience_level, years_of_experience, portfolio_url, github_url, linkedin_url,
    remote_only, weekly_hours_available, bio, skills_json, languages_json,
    desired_categories_json, preferred_payout_methods_json, has_completed_onboarding,
    created_at, updated_at
) VALUES (
    'prof_demo_01', 'usr_demo_01', 'Aarav Sharma', 'India', 'IN',
    'Independent Contractor (W-8BEN compliant)', 'mid', 3,
    'https://github.com/aaravsharma-dev', 'https://github.com/aaravsharma-dev', 'https://linkedin.com/in/aarav-sharma-demo',
    TRUE, 20,
    'Full-stack engineer and AI code evaluator with 3 years background in Java, Python, and API development.',
    '["Python", "Java", "Code Review", "SQL", "Git", "Prompt Engineering", "Debugging", "Unit Testing"]',
    '[{"name": "English", "proficiency": "fluent"}, {"name": "Hindi", "proficiency": "native"}]',
    '["AI Coding", "AI Evaluation", "Software & QA Testing"]',
    '["PayPal", "Wise", "Direct Deposit"]',
    TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- 3. Seed Catalog Gig Listings (15 Realistic Listings)
INSERT INTO gig_listings (
    id, slug, platform_name, title, category, description, remote,
    pay_amount, pay_currency, pay_unit, pay_terms_note, payment_verification,
    eligibility_verification, official_url, sponsored, availability_status,
    estimated_effort, experience_level, eligibility_source_note, affiliate_disclosure,
    rating, active_projects_count, skills_required_json, eligible_countries_json,
    onboarding_steps_json, overview_highlights_json, last_reviewed_at, created_at, updated_at
) VALUES
(
    'gig-outlier-01', 'ai-coding-evaluation-outlier', 'Outlier AI',
    'AI Coding Evaluation & Code Review', 'AI Coding',
    'Evaluate complex code responses produced by cutting-edge frontier LLMs. You will test solutions, craft failing test cases, verify algorithmic efficiency, and rewrite suboptimal code across Java, Python, and SQL.',
    TRUE, 40.00, 'USD', 'hour',
    'Weekly payouts upon approved review milestones via PayPal or Direct Deposit.',
    'verified', 'partial', 'https://outlier.ai', TRUE, 'open',
    '2 - 3 hours qualification', 'mid',
    'Community verified via contributor onboarding threads. South Asia & North America queues active.',
    'Transparent match disclosure: GigMatcher receives no bounty for this direct link.',
    4.4, 142,
    '["Java", "Python", "Code Review", "Unit Testing", "Algorithms"]',
    '["Global", "India", "United States", "United Kingdom", "Canada", "Germany"]',
    '["Submit resume and technical summary", "Complete 60-min algorithmic coding assessment", "Pass guideline qualification quiz", "Receive project queue assignment"]',
    '["Highest paying tier for Python & Java developers", "Flexible schedule with weekly disbursements", "Direct code critique for leading research labs"]',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    'gig-dataannotation-01', 'full-stack-code-generator-dataannotation', 'DataAnnotation Tech',
    'Full-Stack AI Code Generation Evaluator', 'AI Coding',
    'Review and evaluate coding assistants solving frontend, backend, and database queries. Assess functional accuracy, adherence to user prompts, and security vulnerabilities.',
    TRUE, 42.50, 'USD', 'hour',
    'Hourly pay tracked via internal timer. Automatic disbursement via verified PayPal every 7 days.',
    'verified', 'verified', 'https://www.dataannotation.tech', FALSE, 'selective',
    '1.5 - 2 hours assessment', 'mid',
    'Strict IP and country check on registration. Primary accepted locations are US, CA, UK, IE, AU, NZ.',
    'Informational listing only. DataAnnotation Tech does not offer an affiliate program.',
    4.6, 89,
    '["Python", "JavaScript", "Algorithms", "Debugging", "Git"]',
    '["United States", "Canada", "United Kingdom", "Ireland", "Australia", "New Zealand"]',
    '["Initial starter assessment (~45 mins)", "Coding specialization sandbox assessment (~60 mins)", "Account verification", "Dashboard access unlocked"]',
    '["Reliable hourly timer with instantaneous logging", "Consistently high project volume for accepted coders", "Real-world coding assistant benchmarks"]',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    'gig-alignerr-01', 'senior-code-reviewer-alignerr', 'Alignerr',
    'Senior Software Engineer LLM Benchmarking', 'AI Coding',
    'High-bar engineering evaluation for advanced models. Review generated multi-file repositories, assess architectural trade-offs, identify concurrency bugs, and formulate adversarial prompts.',
    TRUE, 50.00, 'USD', 'hour',
    'Bi-weekly contractor disbursements via Deel. Verified contracts require W-8BEN clearance.',
    'verified', 'verified', 'https://www.alignerr.com', FALSE, 'open',
    '2 hours technical exam', 'expert',
    'Verified contract via Deel. Open to global developers scoring above 85th percentile.',
    'Direct link to company careers portal. No promotional kickback.',
    4.7, 64,
    '["Java", "Python", "C++", "Code Review", "Algorithms"]',
    '["Global", "India", "United States", "United Kingdom", "Germany", "Canada"]',
    '["Create profile and sync LinkedIn / GitHub", "Take remote proctored assessment in chosen language", "Complete Slack onboarding and identity verification", "Join project calibration queue"]',
    '["Highest hourly compensation for senior engineers", "Deel contract with global currency withdrawal options", "Challenging architectural prompt evaluations"]',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    'gig-mindrift-01', 'llm-reasoning-evaluator-mindrift', 'Mindrift',
    'LLM Reasoning & Factuality Evaluator', 'AI Evaluation',
    'Evaluate complex multi-step reasoning chains in AI responses. Verify truthfulness against scholarly sources, ensure adherence to logical constraints, and grade hallucination severity.',
    TRUE, 22.00, 'USD', 'hour',
    'Monthly invoicing based on approved work hours via Wise or Payoneer.',
    'verified', 'verified', 'https://mindrift.ai', TRUE, 'open',
    '1 - 1.5 hours onboarding', 'mid',
    'Community verified hiring sprint across 40+ countries. Remote contractor agreement.',
    'Sponsored listing tag for visibility. Direct link to recruitment portal.',
    4.3, 110,
    '["Prompt Engineering", "Critical Thinking", "Fact-Checking", "Logic Evaluation"]',
    '["Global", "India", "United States", "United Kingdom", "Germany", "Brazil"]',
    '["Register with resume and language details", "Pass reasoning & fact-checking test", "Sign freelance NDA", "Complete 5 supervised trial tasks"]',
    '["Global onboarding including India, LATAM, and EU", "Structured feedback loops to improve grading tier", "Predictable weekly volume on general reasoning tracks"]',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    'gig-testlio-01', 'exploratory-mobile-ai-tester-testlio', 'Testlio',
    'Exploratory Mobile App & AI Assistant Tester', 'Software & QA Testing',
    'Join scheduled test runs for consumer mobile applications and conversational AI plugins. Reproduce crashes, record screen logs with network payloads, and formulate clear bug reports.',
    TRUE, 28.00, 'USD', 'hour',
    'Guaranteed hourly rate for reserved test cycles. Bonus payments for verified critical defects.',
    'verified', 'verified', 'https://testlio.com', FALSE, 'open',
    '2 hours test cycle qualification', 'mid',
    'Transparent global roster. Testers assigned runs based on device inventory matches.',
    'Unpaid community reference.',
    4.6, 84,
    '["Functional Testing", "Mobile QA", "Bug Reporting", "Debugging", "Code Review"]',
    '["Global", "India", "United States", "United Kingdom", "Germany", "Estonia"]',
    '["Sign up and register testing devices", "Complete practice test run and submit mock bug report", "Pass peer review and join freelancer Slack", "Accept scheduled testing invitations"]',
    '["Paid for testing time, not just approved bugs", "Friendly community test managers and helpful feedback", "Test latest features before public release"]',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);
