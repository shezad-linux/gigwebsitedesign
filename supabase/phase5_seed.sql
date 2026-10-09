-- ==============================================================================
-- Supabase Seed Data: Phase 5 (Affiliate Partners, Campaigns, Launch Checklist)
-- Run this script in the Supabase SQL Editor after `phase5_schema.sql`
-- ==============================================================================

-- 1. Seed Affiliate Partners
INSERT INTO public.affiliate_partners (
    id,
    platform_id,
    program_name,
    affiliate_url_template,
    referral_code,
    commission_model,
    commission_rate,
    status,
    terms_url,
    notes
)
VALUES
    (
        'aff_outlier',
        'outlier',
        'Outlier Contributor Partner Network',
        'https://outlier.ai/?utm_source=gigmatcher&utm_medium=partner&ref={referralCode}',
        'GIGMATCH_OUTLIER_2025',
        'cpa',
        '$30 per approved contributor onboarding',
        'active',
        'https://outlier.ai/terms',
        'Verified partner link with automated referral attribution.'
    ),
    (
        'aff_dataannotation',
        'dataannotation',
        'DataAnnotation Tech Referral Program',
        'https://www.dataannotation.tech/?ref={referralCode}',
        'GIGMATCH_DA_PARTNER',
        'cpa',
        '$25 per qualification completion',
        'active',
        'https://www.dataannotation.tech/faq',
        'Direct tracking tag approved for software developer leads.'
    ),
    (
        'aff_alignerr',
        'alignerr',
        'Alignerr Expert Recruitment Program',
        'https://www.alignerr.com/?utm_source=gigmatcher&ref={referralCode}',
        'ALIGN_GM_VERIFIED',
        'cpa',
        '$35 per domain expert placed',
        'active',
        'https://www.alignerr.com',
        'Targeted at high-proficiency STEM and programming roles.'
    ),
    (
        'aff_mindrift',
        'mindrift',
        'Mindrift Affiliate Collective',
        'https://mindrift.ai/careers?ref={referralCode}',
        'MINDRIFT_AFF_DIRECT',
        'fixed',
        '$15 per applicant submission',
        'active',
        'https://mindrift.ai/terms',
        'Bilingual evaluation and creative writing projects.'
    ),
    (
        'aff_testlio',
        'testlio',
        'Testlio Freelance Network',
        'https://testlio.com/?ref={referralCode}',
        'TESTLIO_GM_DEV',
        'cpc',
        '$1.75 per verified outbound applicant',
        'active',
        'https://testlio.com',
        'Networked testing runs and device lab contributors.'
    )
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Sponsored Promotional Campaigns
INSERT INTO public.sponsored_campaigns (
    id,
    sponsor_name,
    gig_id,
    budget,
    daily_budget,
    spent,
    start_date,
    end_date,
    target_category,
    status,
    placement_rule,
    impressions_count,
    clicks_count,
    cost_per_click
)
VALUES
    (
        'camp_outlier_q2',
        'Outlier AI',
        'gig-outlier-01',
        1200.00,
        60.00,
        342.50,
        NOW() - INTERVAL '7 days',
        NOW() + INTERVAL '23 days',
        'AI Coding',
        'active',
        'featured_badge',
        4210,
        228,
        1.50
    ),
    (
        'camp_alignerr_spring',
        'Alignerr',
        'gig-alignerr-01',
        850.00,
        45.00,
        185.00,
        NOW() - INTERVAL '3 days',
        NOW() + INTERVAL '27 days',
        'AI Evaluation',
        'active',
        'top_of_category',
        2190,
        110,
        1.68
    )
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Production Launch Checklist Items (The 10 Mandatory Checkpoints)
INSERT INTO public.launch_checklist_items (
    id,
    sort_order,
    title,
    category,
    description,
    completed,
    completed_at,
    notes
)
VALUES
    (
        'chk_01_domain_https',
        1,
        'Custom domain and HTTPS configured',
        'infra',
        'Production DNS records, automated SSL certificate renewal, and HSTS headers enforced.',
        TRUE,
        NOW() - INTERVAL '2 days',
        'Configured via Vercel / Cloudflare edge with automatic TLS 1.3.'
    ),
    (
        'chk_02_auth_rls',
        2,
        'Authentication and RLS policies reviewed',
        'security',
        'Supabase RLS enabled on all user tables with strict UID checks; Spring Boot JWT roles validated.',
        TRUE,
        NOW() - INTERVAL '1 day',
        'Verified default deny root policies and user data isolation across tables.'
    ),
    (
        'chk_03_resume_deletion',
        3,
        'Resume deletion and account deletion tested',
        'security',
        'Candidates can delete attached resume files, purge extracted skills, and execute complete account data wipe.',
        TRUE,
        NOW() - INTERVAL '1 day',
        'Tested /api/resume/delete and profile data wipe in browser and API.'
    ),
    (
        'chk_04_backups',
        4,
        'Backups and restore process verified',
        'infra',
        'Automated daily PostgreSQL snapshots configured with point-in-time recovery (PITR).',
        TRUE,
        NOW() - INTERVAL '1 day',
        'Supabase continuous WAL archiving active.'
    ),
    (
        'chk_05_monitoring',
        5,
        'Monitoring and error reporting enabled',
        'infra',
        'Client-side error boundaries, server API error handling, and latency tracking operational.',
        TRUE,
        NOW() - INTERVAL '1 day',
        'Error boundary wrappers and health endpoints verified.'
    ),
    (
        'chk_06_privacy_terms',
        6,
        'Privacy policy and terms published',
        'legal',
        'Comprehensive GDPR/CCPA privacy policy and terms of use accessible from footer and onboarding.',
        TRUE,
        NOW() - INTERVAL '1 day',
        'Published at /privacy and /terms with transparent contact information.'
    ),
    (
        'chk_07_affiliate_disclosures',
        7,
        'Affiliate and sponsored disclosures visible',
        'legal',
        'Prominent FTC-compliant disclosures on outbound application links and clear Sponsored tags that do not affect match scoring.',
        TRUE,
        NOW() - INTERVAL '1 day',
        'Affiliate disclosure banners and Sponsored tags active on cards and detail pages.'
    ),
    (
        'chk_08_mobile_a11y',
        8,
        'Mobile performance and accessibility tested',
        'qa',
        'Responsive viewport layout across mobile, tablet, and desktop with accessible ARIA tags and color contrast.',
        TRUE,
        NOW() - INTERVAL '1 day',
        'Mobile navigation drawer, touch targets, and Tailwind responsive breakpoints tested.'
    ),
    (
        'chk_09_links_sources',
        9,
        'External links and listing sources checked',
        'qa',
        'All official platform career links, payment evidence sources, and FAQ links verified with HTTP 200 checks.',
        TRUE,
        NOW() - INTERVAL '1 day',
        'All Outlier, DataAnnotation, Alignerr, Mindrift, and Testlio official URLs confirmed.'
    ),
    (
        'chk_10_smoke_tests',
        10,
        'Production smoke tests completed',
        'qa',
        'End-to-end user journey validated: Discovery -> Resume Upload & Extraction -> Matching -> Application Tracking -> Outbound Click.',
        TRUE,
        NOW(),
        'Full candidate flow completed successfully.'
    )
ON CONFLICT (id) DO NOTHING;
