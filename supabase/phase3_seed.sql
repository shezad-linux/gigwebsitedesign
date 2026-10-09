-- ==============================================================================
-- Supabase Seed Data: Phase 3 (Skills Taxonomy, Aliases, and Eligibility Evidence)
-- ==============================================================================

-- 1. Canonical Skills Taxonomy
INSERT INTO public.skills (id, name, category, description) VALUES
('python', 'Python', 'Programming Languages', 'Python scripting, data processing, backend automation, and LLM benchmarking.'),
('java', 'Java', 'Programming Languages', 'Core Java, JVM performance, multithreading, and enterprise OOP architecture.'),
('javascript', 'JavaScript', 'Programming Languages', 'Modern ECMAScript, DOM manipulation, asynchronous programming, and web scripting.'),
('typescript', 'TypeScript', 'Programming Languages', 'Static typing, TypeScript interfaces, generics, and frontend/backend type systems.'),
('c-plus-plus', 'C++', 'Programming Languages', 'Systems programming, memory management, pointers, and high-performance algorithms.'),
('sql', 'SQL', 'Databases & Querying', 'Relational database schema design, complex JOINs, indexing, and SQL queries.'),
('algorithms', 'Algorithms', 'Computer Science Fundamentals', 'Algorithmic efficiency, time/space complexity analysis (Big-O), and data structures.'),
('code-review', 'Code Review', 'Software Engineering', 'Analyzing pull requests, identifying logic and security flaws, and code refactoring.'),
('unit-testing', 'Unit Testing', 'Software Engineering', 'Writing automated test suites using JUnit, pytest, Jest, and edge-case verification.'),
('debugging', 'Debugging', 'Software Engineering', 'Isolating race conditions, syntax/runtime exceptions, and root cause analysis.'),
('git', 'Git', 'Tools & DevOps', 'Version control branching, merges, rebase, and GitHub/GitLab collaboration.'),
('docker', 'Docker', 'Tools & DevOps', 'Containerization, Dockerfile compilation, and environment reproduction.'),
('rest-apis', 'REST APIs', 'Backend Architecture', 'HTTP endpoints, JSON schemas, authentication tokens, and API integration.'),
('prompt-engineering', 'Prompt Engineering', 'AI & LLM Evaluation', 'Formulating system prompts, chain-of-thought instructions, and few-shot calibration.'),
('logic-evaluation', 'Logic Evaluation', 'AI & LLM Evaluation', 'Verifying syllogistic reasoning, mathematical proofs, and factual consistency in LLM outputs.'),
('fact-checking', 'Fact-Checking', 'AI & LLM Evaluation', 'Cross-referencing claims against authoritative primary sources, patents, and scientific literature.'),
('data-labeling', 'Data Labeling', 'Data Annotation', 'Bounding boxes, semantic segmentation, text classification, and entity extraction.'),
('rlhf', 'RLHF Evaluation', 'AI & LLM Evaluation', 'Reinforcement Learning from Human Feedback: ranking outputs and evaluating model safety.'),
('technical-writing', 'Technical Writing', 'Writing & Content', 'Authoring developer documentation, API specs, and educational software tutorials.'),
('translation', 'Translation', 'Language & Translation', 'Translating idiomatic expressions, localization, and grammar verification.'),
('functional-testing', 'Functional Testing', 'Software & QA Testing', 'Manual exploratory QA, regression testing, and bug report authoring.'),
('mobile-qa', 'Mobile QA', 'Software & QA Testing', 'Testing iOS and Android applications, device matrix verification, and gesture validations.')
ON CONFLICT (id) DO NOTHING;

-- 2. Skill Aliases (Normalization Synonyms)
INSERT INTO public.skill_aliases (canonical_skill_id, alias) VALUES
('python', 'py'),
('python', 'python3'),
('python', 'python 3'),
('java', 'core java'),
('java', 'jvm'),
('java', 'java 17'),
('javascript', 'js'),
('javascript', 'es6'),
('typescript', 'ts'),
('c-plus-plus', 'cpp'),
('c-plus-plus', 'c/c++'),
('sql', 'postgres'),
('sql', 'postgresql'),
('sql', 'mysql'),
('algorithms', 'data structures'),
('algorithms', 'dsa'),
('algorithms', 'leetcode'),
('code-review', 'pr review'),
('code-review', 'code audit'),
('unit-testing', 'pytest'),
('unit-testing', 'junit'),
('unit-testing', 'jest'),
('prompt-engineering', 'prompt design'),
('prompt-engineering', 'prompt tuning'),
('logic-evaluation', 'reasoning assessment'),
('logic-evaluation', 'llm evaluation'),
('data-labeling', 'data annotation'),
('data-labeling', 'image tagging'),
('rlhf', 'model alignment'),
('technical-writing', 'tech writing'),
('functional-testing', 'qa testing'),
('functional-testing', 'manual testing')
ON CONFLICT (alias) DO NOTHING;

-- 3. Country Eligibility Evidence Records
INSERT INTO public.eligibility_evidence (
    gig_id, country_code, eligibility_status, scope, source_url, evidence_notes, reviewed_at, next_review_at
) VALUES
-- Outlier AI (gig-outlier-01)
('gig-outlier-01', 'IN', 'confirmed', 'platform_wide', 'https://outlier.ai/careers', 'Verified active contractor queues for India developers via PayPal and Airwallex payouts.', NOW(), NOW() + INTERVAL '30 days'),
('gig-outlier-01', 'US', 'confirmed', 'platform_wide', 'https://outlier.ai/careers', 'Direct 1099 contracts verified for US residents across coding and STEM queues.', NOW(), NOW() + INTERVAL '30 days'),
('gig-outlier-01', 'UK', 'confirmed', 'platform_wide', 'https://outlier.ai/careers', 'UK resident contractor pool confirmed active with weekly disbursements.', NOW(), NOW() + INTERVAL '30 days'),
('gig-outlier-01', 'GLOBAL', 'confirmed', 'platform_wide', 'https://outlier.ai/careers', 'Open to international developers meeting language and ID verification requirements.', NOW(), NOW() + INTERVAL '30 days'),

-- DataAnnotation Tech (gig-dataannotation-01)
('gig-dataannotation-01', 'US', 'confirmed', 'platform_wide', 'https://www.dataannotation.tech/faq', 'Primary operating country with verified PayPal instant disbursements.', NOW(), NOW() + INTERVAL '30 days'),
('gig-dataannotation-01', 'CA', 'confirmed', 'platform_wide', 'https://www.dataannotation.tech/faq', 'Canada accounts supported with standard registration assessment.', NOW(), NOW() + INTERVAL '30 days'),
('gig-dataannotation-01', 'UK', 'confirmed', 'platform_wide', 'https://www.dataannotation.tech/faq', 'UK residents fully eligible with IP address verification.', NOW(), NOW() + INTERVAL '30 days'),
('gig-dataannotation-01', 'IN', 'excluded', 'platform_wide', 'https://www.dataannotation.tech/faq', 'Signups from India are currently excluded by strict platform IP gatekeeper rules.', NOW(), NOW() + INTERVAL '14 days'),

-- Alignerr (gig-alignerr-01)
('gig-alignerr-01', 'GLOBAL', 'confirmed', 'platform_wide', 'https://www.alignerr.com', 'Global recruitment active via Deel contractor compliance in 100+ countries.', NOW(), NOW() + INTERVAL '30 days'),
('gig-alignerr-01', 'IN', 'confirmed', 'platform_wide', 'https://www.alignerr.com', 'Contractors in India accepted upon passing 80th percentile technical exam.', NOW(), NOW() + INTERVAL '30 days'),
('gig-alignerr-01', 'US', 'confirmed', 'platform_wide', 'https://www.alignerr.com', 'US engineering contributors active with W-9 contractor verification.', NOW(), NOW() + INTERVAL '30 days')
ON CONFLICT (gig_id, country_code, scope) DO UPDATE SET
    eligibility_status = EXCLUDED.eligibility_status,
    source_url = EXCLUDED.source_url,
    evidence_notes = EXCLUDED.evidence_notes,
    reviewed_at = NOW(),
    next_review_at = EXCLUDED.next_review_at;
