-- ==============================================================================
-- Supabase Seed Data: Phase 4 (Platforms, Payment Evidence, Reports & Audit Events)
-- Run this script in the Supabase SQL Editor after `phase4_schema.sql`
-- ==============================================================================

-- 1. Platforms Seed
INSERT INTO public.platforms (id, name, website_url, careers_url, logo_url, description, headquarters, verified)
VALUES
    ('outlier', 'Outlier AI', 'https://outlier.ai', 'https://outlier.ai/careers', NULL, 'Generative AI training platform specializing in STEM and coding alignment.', 'San Francisco, CA', TRUE),
    ('dataannotation', 'DataAnnotation Tech', 'https://www.dataannotation.tech', 'https://www.dataannotation.tech/faq', NULL, 'Premier flexible work platform for chatbot training, coding tasks, and evaluation.', 'New York, NY', TRUE),
    ('alignerr', 'Alignerr', 'https://www.alignerr.com', 'https://www.alignerr.com', NULL, 'Labelbox ecosystem platform hiring specialized domain experts for AI model evaluation.', 'San Francisco, CA', TRUE),
    ('mindrift', 'Mindrift', 'https://mindrift.ai', 'https://mindrift.ai/careers', NULL, 'Global AI freelancing platform focused on writing, editing, and prompt evaluation.', 'London, UK', TRUE),
    ('invisible', 'Invisible Technologies', 'https://invisible.co', 'https://invisible.co/careers', NULL, 'AI-driven operations platform coordinating advanced human-in-the-loop workflows.', 'Remote / Global', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 2. Payment Evidence Seed
INSERT INTO public.payment_evidence (
    gig_id,
    advertised_rate,
    currency,
    unit,
    rate_type,
    payout_methods,
    source_url,
    evidence_notes,
    verification_status,
    reviewed_at,
    next_review_at
)
VALUES
    (
        'gig-outlier-01',
        40.00,
        'USD',
        'hour',
        'official_advertised',
        ARRAY['PayPal', 'Airwallex'],
        'https://outlier.ai/careers',
        'Advertised starting rates verified for tier-3 software developers. Weekly disbursements on Tuesdays.',
        'verified',
        NOW() - INTERVAL '5 days',
        NOW() + INTERVAL '55 days'
    ),
    (
        'gig-dataannotation-01',
        38.00,
        'USD',
        'hour',
        'official_advertised',
        ARRAY['PayPal'],
        'https://www.dataannotation.tech/faq',
        'Direct coding prompt projects pay $35-$42/hr; funds disbursed via instant PayPal transfer.',
        'verified',
        NOW() - INTERVAL '10 days',
        NOW() + INTERVAL '50 days'
    ),
    (
        'gig-alignerr-01',
        36.00,
        'USD',
        'hour',
        'official_advertised',
        ARRAY['Deel'],
        'https://www.alignerr.com',
        'Contractor agreement sets baseline pay at $36/hr for approved technical evaluators.',
        'verified',
        NOW() - INTERVAL '3 days',
        NOW() + INTERVAL '57 days'
    ),
    (
        'gig-mindrift-01',
        22.00,
        'USD',
        'hour',
        'worker_reported',
        ARRAY['Wise', 'PayPal'],
        'https://mindrift.ai',
        'Rate based on verified community paystubs for bilingual reasoning evaluations.',
        'partial',
        NOW() - INTERVAL '25 days',
        NOW() + INTERVAL '35 days'
    ),
    (
        'gig-testlio-01',
        28.00,
        'USD',
        'hour',
        'official_advertised',
        ARRAY['PayPal', 'Payoneer'],
        'https://testlio.com',
        'Exploratory testing runs compensate $25-$32/hr depending on device and run scope.',
        'verified',
        NOW() - INTERVAL '20 days',
        NOW() + INTERVAL '40 days'
    )
ON CONFLICT (gig_id) DO NOTHING;

-- 3. Initial Listing Reports Seed (Open and Triaged Community Reports)
INSERT INTO public.listing_reports (
    id,
    gig_id,
    reporter_email,
    report_type,
    description,
    status,
    created_at
)
VALUES
    (
        'rep_001_seed',
        'gig-outlier-01',
        'community_worker@example.com',
        'changed_country_restriction',
        'Outlier recently updated their contractor queue requirements for specific states in the US.',
        'open',
        NOW() - INTERVAL '2 days'
    ),
    (
        'rep_002_seed',
        'gig-dataannotation-01',
        'dev_tester@example.com',
        'incorrect_payment',
        'Rates for non-coding conversational prompt annotators are $20/hr instead of the coding track $38/hr.',
        'triaged',
        NOW() - INTERVAL '4 days'
    ),
    (
        'rep_003_seed',
        'gig-mindrift-01',
        'freelance_eval@example.com',
        'closed_application',
        'The bilingual German language track is currently marked waitlist only on the career page.',
        'open',
        NOW() - INTERVAL '1 day'
    )
ON CONFLICT (id) DO NOTHING;

-- 4. Initial Audit Events Seed
INSERT INTO public.audit_events (
    id,
    entity_type,
    entity_id,
    actor_email,
    action,
    changes,
    justification,
    created_at
)
VALUES
    (
        'audit_001_seed',
        'gig_listing',
        'gig-outlier-01',
        'operations@gigmatcher.io',
        'publish',
        '{"status": {"before": "draft", "after": "published"}}'::jsonb,
        'Initial platform verification completed with official careers URL proof.',
        NOW() - INTERVAL '15 days'
    ),
    (
        'audit_002_seed',
        'eligibility_evidence',
        'gig-dataannotation-01',
        'verifier@gigmatcher.io',
        'verify_evidence',
        '{"country_status": {"before": "unknown", "after": "excluded"}}'::jsonb,
        'Confirmed India IP signups are currently restricted by platform security policy.',
        NOW() - INTERVAL '12 days'
    ),
    (
        'audit_003_seed',
        'payment_evidence',
        'gig-alignerr-01',
        'verifier@gigmatcher.io',
        'verify_evidence',
        '{"rate": {"before": 30.00, "after": 36.00}}'::jsonb,
        'Updated to match published contractor agreement terms via Deel.',
        NOW() - INTERVAL '3 days'
    )
ON CONFLICT (id) DO NOTHING;
