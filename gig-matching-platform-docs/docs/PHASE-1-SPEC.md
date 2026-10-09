# Phase 1 --- Frontend Prototype Specification

## 1. Objective

Build a navigable, responsive frontend prototype that demonstrates the
full user journey using seeded mock listings. The prototype must work
without a backend, database, production authentication, or live AI API.

## 2. User journey

1.  A visitor opens the landing page.
2.  They explore the product or begin onboarding.
3.  They enter profile information manually or try a simulated
    resume-upload flow.
4.  The dashboard displays relevant mock opportunities.
5.  They open an opportunity to review its details and source
    information.
6.  They save opportunities and track application statuses.
7.  They can edit their profile and see matching results update.

## 3. Routes and features

### `/` --- Landing page

-   Header and navigation.
-   Hero headline: "Find the Right AI Gigs for Your Skills."
-   Primary CTA: "Find My Matches"; secondary CTA: "Explore
    Opportunities".
-   Category cards: AI evaluation, coding, data annotation, writing,
    language, and software testing.
-   How-it-works section.
-   Featured platform section.
-   Trust and transparency section.
-   FAQ, privacy explanation, and footer.
-   Responsive layout and working navigation.

### `/onboarding` --- Profile setup

Use a clear multi-step flow:

1.  Resume option: simulate PDF/DOCX selection and validate file
    type/size locally; do not upload externally or claim real parsing
    occurred.
2.  Location and languages: country of residence, languages, and
    proficiency.
3.  Skills and experience: selectable skills, experience level, relevant
    background.
4.  Preferences: opportunity categories, work type, and payment
    preferences if applicable.
5.  Review: show the resulting profile and allow editing before
    completion.

Users must be able to complete onboarding without a resume.

### `/dashboard` --- Opportunity discovery

-   Seeded personalized recommendations.
-   Match score and a short explanation of the score.
-   Eligibility label and the evidence/review date available in mock
    data.
-   Payment evidence/status where known.
-   Search by title, platform, category, or skill.
-   Filters for category, country eligibility, skills, payment evidence,
    and other supported listing fields.
-   Sorting by relevance and other meaningful fields.
-   Save/unsave actions.
-   Loading, empty, and error states.
-   Desktop: filter sidebar and central results; optional selected-item
    preview.
-   Mobile: stacked cards and a filter drawer or collapsible filter
    area.

### `/gigs/[slug]` --- Opportunity detail

Show, where available:

-   Platform and opportunity title.
-   Description and opportunity category.
-   Required skills and the user's matched/missing skills.
-   Match explanation.
-   Country eligibility, evidence/source, and last-reviewed date.
-   Payment terms and source; do not invent amounts or imply guaranteed
    earnings.
-   Onboarding steps and availability caveats.
-   Official application URL and a clear external-link label.
-   Affiliate disclosure when applicable.
-   A distinct "Sponsored" label for paid placement.
-   "Report outdated information" interaction (prototype-only is
    acceptable if its limitations are clear).

### `/applications` --- Saved opportunities and tracker

-   Saved opportunities.
-   Application status options: Shortlisted, Applied, Onboarding,
    Qualified, Active, Rejected, and Withdrawn.
-   Notes and relevant dates.
-   Editable status and notes.
-   Empty state with a route back to discovery.

### `/profile` --- Profile management

-   Edit country, languages, skills, experience, and preferences.
-   Display whether a resume was selected in the prototype.
-   Reset/delete mock profile data.
-   Explain that resume contents are not uploaded or parsed in Phase 1.

### `/admin` --- Demo listing management

-   Create and edit mock listings.
-   Maintain eligibility/payment evidence, source URLs, review dates,
    and listing status.
-   Toggle a sponsored flag for demonstration.
-   Clearly state that this is a demo admin screen and is not secure
    production access control.

## 4. Seed data

Create 12--20 mock listings across AI evaluation, AI coding, data
annotation, writing, language work, and software testing.

Each listing should include, as applicable:

-   `id`, `slug`, `platformName`, `title`, `category`, `description`
-   `skillsRequired`
-   `eligibleCountries` and an eligibility evidence/status field
-   `remote`
-   Optional `paymentAmount`, `paymentCurrency`, and `paymentUnit`
-   Payment evidence/status and source
-   `officialUrl`
-   `onboardingSteps`
-   `lastReviewedAt`
-   `sponsored`
-   Listing status and timestamps as needed

Do not store a user's personalized match score as an intrinsic property
of the gig. Calculate it from the user profile and listing data.

Use clearly identified demo data. Do not present mock eligibility or
payment claims as verified real-world facts.

## 5. Matching behavior

For Phase 1, use deterministic client-side logic.

-   Compare profile skills with required skills.
-   Consider selected categories and country eligibility where mock data
    supports it.
-   Produce a score and a human-readable explanation.
-   Make the score's meaning understandable; do not imply it predicts
    acceptance or earnings.
-   Handle missing profile information gracefully.
-   Keep sponsored placement separate from relevance scoring and label
    it clearly.

A simple, documented weighted score is sufficient. Avoid claiming that
an LLM is being used in this phase.

## 6. UI direction

-   Modern SaaS aesthetic with restrained depth.
-   Bento-style cards may be used on the landing page.
-   Use glassmorphism sparingly for decorative elements only.
-   Background: `#F5F7FB`
-   Surface: `#FFFFFF`
-   Primary: `#4F46E5`
-   Main text: `#0F172A`
-   Muted text: `#64748B`
-   Success: `#15803D`
-   Warning: `#B45309`
-   Border: `#E2E8F0`
-   Prioritize readable contrast, keyboard navigation, and clear focus
    states.

## 7. Suggested project structure

``` text
src/
  app/
    page.tsx
    onboarding/page.tsx
    dashboard/page.tsx
    gigs/[slug]/page.tsx
    applications/page.tsx
    profile/page.tsx
    admin/page.tsx
  components/
    layout/
    landing/
    onboarding/
    gigs/
    dashboard/
    profile/
    ui/
  data/
    gigs.ts
    categories.ts
    demo-profile.ts
  lib/
    matching.ts
    filters.ts
    storage.ts
    validation.ts
  types/
    gig.ts
    profile.ts
public/
```

Adapt the structure if the generated Next.js starter uses a different
source directory convention.

## 8. Persistence and privacy

-   Browser-local persistence may be used for demo profile data, saved
    gigs, and tracker entries.
-   Provide a reset function and useful empty states.
-   Do not store secrets in the frontend.
-   Do not send resume files to third-party services.
-   Do not claim that a local demo tracker is synced across devices or
    accounts.

## 9. Out of scope

-   Spring Boot APIs and PostgreSQL.
-   Real resume parsing or LLM calls.
-   Production authentication and authorization.
-   Live scraping or automatic verification of third-party job data.
-   Affiliate attribution, payout processing, or sponsorship billing.
-   Production admin security and audit logging.
-   Email notifications and production analytics.

## 10. Definition of done

A user can navigate from landing page through onboarding, view matching
results, inspect a gig, save it, track an application, and edit/reset
their profile without hitting dead ends or requiring a backend.
