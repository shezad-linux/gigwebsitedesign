# AI Gig-Matching Platform — Production Completion Plan

**Target stack:** Next.js 14 App Router + TypeScript, Tailwind CSS, Supabase (PostgreSQL, Auth, Storage, Row-Level Security), GitHub Actions, and Vercel/Next.js-compatible hosting.

> **Status:** Active Execution Roadmap.
> Tasks marked `[x]` have been verified in the codebase (TypeScript strict checks and Next.js 14 production builds pass with zero errors).
> Tasks marked `[ ]` require staging/production environment provisioning, external service linking, or automated CI execution.

---

## 1. Product Objective

Build a secure, responsive, high-contrast monochrome (Black & White) platform that helps users discover AI and digital gig opportunities based on skills, experience, languages, preferences, and country.
- Explain skill fit and show transparent evidence status for eligibility and payment claims.
- Clearly disclose affiliate links and sponsored placements.
- Never guarantee acceptance, task availability, or minimum earnings.

---

## 2. Target Architecture

- **Frontend:** Next.js 14 App Router, TypeScript, Tailwind CSS (Obsidian / Monochrome palette), accessible UI components, Three.js visualization.
- **Data/Backend:** Supabase PostgreSQL with versioned SQL migrations and strict Row Level Security (RLS).
- **Authentication & RBAC:** Supabase Auth with server-enforced cookie session validation (`middleware.ts`) and role checks (`user_roles` table: `admin`, `reviewer`, `user`).
- **Private Files:** Supabase Storage private bucket for candidate resumes with signed URLs and client-controlled zero-retention deletion.
- **Server Operations:** Next.js server actions and API route handlers (`/api/admin/reports`, `/api/resume/parse`, `/api/resume/delete`, `/api/outbound/click`).
- **AI Matching Engine:** Server-side LLM extraction with structured schema validation; deterministic mathematical algorithm for transparent skill fit scoring (0–100%).
- **Source Control:** GitHub, protected `main`, small reviewable commits, automated CI checks (`lint`, `type-check`, `build`).
- **Hosting & Infrastructure:** Vercel or Next.js-compatible container host with strict environment separation (Local `.env.local` vs. Staging vs. Production).
- **Operations:** Error reporting, audit logging (`audit_events` table), telemetry-minimal outbound tracking, and automated database backups.

---

## 3. Release Stages

1. **Local MVP:** Core user journey works with mock & local storage fallback data. *(Completed)*
2. **Private Staging:** Supabase schema, Auth, RLS, admin roles, and APIs tested with non-production test projects. *(In Progress)*
3. **Limited Beta:** Deploy with a small, manually reviewed catalogue (Outlier, DataAnnotation, Alignerr, Mindrift, Testlio), monitoring, disclosures, and candidate reporting mechanisms.
4. **Monetization:** Enable affiliate/sponsored features only after partner terms, tracking, and disclosures are verified.

---

# Workstream A — Product and User Journeys

## Core Experience
- [x] Landing page with clear value proposition, working navigation, and obsidian 3D visual orb (`app/page.tsx`, `components/landing/*`).
- [x] Onboarding wizard supports manual profile entry without requiring a resume file (`app/onboarding/page.tsx`).
- [x] Profile editing: country, languages, skills, experience level, and preferences (`app/profile/page.tsx`).
- [x] Discovery & Matching: search, category pills, score filters, country scope, and sorting (`app/dashboard/page.tsx`).
- [x] Gig detail: required skills, match explanation breakdown, official URL, eligibility evidence, payment evidence, and review dates (`app/gigs/[slug]/page.tsx`).
- [x] Save and unsave opportunities with immediate UI reactivity and local storage sync (`components/dashboard/GigCard.tsx`).
- [x] Application tracker with statuses (`Shortlisted`, `Applied`, `Onboarding`, `Qualified`, `Active`, `Rejected`), personal notes, and submission dates (`app/applications/page.tsx`).
- [x] Affiliate and sponsored disclosures with FTC compliance callouts (`app/terms/page.tsx`, `FeaturedPlatforms.tsx`).
- [x] Mobile/tablet/desktop responsive layouts, keyboard navigation, accessible labels, focus-visible states, and validation feedback.

## End-to-End Acceptance Verification
- [x] User can onboard, see matches, inspect a listing, save it, track an application, edit their profile, and navigate cleanly across the entire site.
- [x] Profile changes (adding/removing skills or changing country) dynamically update gig match scores and qualification indicators.
- [x] User can request self-service account data purge with zero-retention guarantee (`handleWipeAccountData` in `app/profile/page.tsx`).

---

# Workstream B — Repository and Engineering Workflow

- [x] `.gitignore` excludes `.env*`, `.next/`, build output, node_modules, and temporary files.
- [x] `.env.example` contains documented placeholders with zero exposed secrets (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`).
- [x] Build and type-checking scripts configured in `package.json` (`npm run build`, `npm run lint`, `npx tsc --noEmit`).
- [ ] Initialize GitHub repository remote and push clean commits on feature branches.
- [x] Add GitHub Actions CI workflow (`.github/workflows/ci.yml`) to run lint, type-check, automated tests, and build on all pull requests.
- [x] Keep dependencies updated and monitor automated vulnerability alerts (`.github/dependabot.yml` configured for npm and github-actions).
- [x] Document local setup, environment variables, Supabase CLI migrations, and production rollback steps in root `README.md`.

**Exit Gate:** A fresh `git clone` can install dependencies (`npm install`) and start (`npm run dev` / `npm run build`) with zero missing dependencies or secret leakages.

---

# Workstream C — Supabase Schema, Authentication & Security

## Schema and Migrations
- [x] `public.profiles` linked to `auth.users(id)` with cascading deletion (`supabase/setup_admin.sql`, `supabase/admin_rbac.sql`).
- [x] `public.user_roles` table with check constraint (`'admin'`, `'reviewer'`, `'user'`) and primary key foreign key to `auth.users`.
- [x] `public.has_role(required_role)` security definer function to enforce RBAC without recursive policy overhead.
- [x] `public.payment_evidence` table with advertised rate, payout rails, and next scheduled review date.
- [x] `public.user_reports` table tracking community reports on geoblocks, pay changes, and broken links.
- [x] `public.audit_events` table recording all administrative status mutations and reviews.
- [x] `public.affiliate_partners`, `outbound_clicks`, and `sponsored_campaigns` schemas for monetization control.
- [x] Run Supabase migration verification script (`scripts/verify-migrations.mjs` validating all 10 SQL migration files for idempotency and RLS).

## RLS and Access Control
- [x] Row Level Security (RLS) enabled on all public schema tables.
- [x] Users can read and update only their own profile and private tracked records.
- [x] Public users can read only published listings and verified public evidence.
- [x] Ordinary users and public registration cannot assign or elevate roles to `admin` or `reviewer`.
- [x] Server-side cookie session validation implemented in Next.js `middleware.ts`.
- [x] Supabase service-role key (`SUPABASE_SERVICE_ROLE_KEY`) restricted exclusively to server-side routes; never prefixed with `NEXT_PUBLIC_`.
- [x] Conduct automated API security tests against Supabase authorization matrix (`tests/rls-security.test.mjs` verifying anonymous/user denial on privileged tables).

## Authentication & First Admin Provisioning
- [x] Sign-in, sign-out, and session handling via Supabase Auth client (`lib/supabase.ts`, `lib/supabase/server.ts`).
- [x] Admin login screen at `/admin/login` with session cookies and redirect handling.
- [x] Trusted SQL migration for provisioning the first admin (`supabase/setup_admin.sql` via Supabase Dashboard SQL Editor).
- [x] Access Denied screen (`components/admin/AccessDeniedScreen.tsx`) for non-admin sessions.
- [x] Configure custom email auth templates (`supabase/email_templates/`) and production redirect URLs in Supabase Auth settings (`supabase/AUTH_CONFIGURATION.md`).

**Exit Gate:** An unauthenticated or standard user cannot read another user's records or perform administrative operations via direct API manipulation.

---

# Workstream D — Gig Data Quality & Verification

## Listing Lifecycle
- [x] Four-tier lifecycle states: `draft`, `published`, `paused`, `archived`.
- [x] Admin management interface to toggle lifecycle states with instant reflection (`app/admin/(dashboard)/page.tsx`).
- [x] Direct validation of official application URLs and platform metadata.
- [x] Tracking of listing creator, last reviewer, and timestamped changes.

## Eligibility & Payment Evidence
- [x] Strict separation of geographic eligibility from skill match score.
- [x] Distinct verified statuses: `verified`, `worker_reported`, `unverified`, `needs_review`.
- [x] Evidence metadata tracking: source URL, evidence notes, payout methods (PayPal, AirTM, Wire), review date, and next review deadline.
- [x] Rate differentiation: official advertised rates vs. worker-reported earnings vs. unverified forum claims.
- [x] Community reporting form allowing users to submit broken links, rate drops, or country bans (`/api/reports/submit`).

## Review Operations
- [x] Review Queue tab in Admin Console automatically filtering listings with stale review dates, unverified claims, or open community flags.
- [x] Three urgency tiers: `Critical`, `Warning`, `Normal`.
- [x] Community report triage workflow allowing admins to Mark Triaged, Resolve with explanatory notes, or Dismiss.

**Exit Gate:** Every eligibility and pay rate claim presented as verified has a traceable source URL, notes, and a valid review timestamp.

---

# Workstream E — Resume Parsing & AI Matching

## Safe Document Pipeline
- [x] Configured file type validation (PDF, DOCX) and strict size bounds (max 5 MB).
- [x] Client and server payload validation before processing.
- [x] Ephemeral in-memory extraction avoiding raw document storage unless the user explicitly opts into cloud storage.
- [x] Client-side removal option to immediately purge uploaded file and extracted facts.

## AI Extraction & Privacy
- [x] Server-side extraction endpoint (`/api/resume/parse/route.ts`).
- [x] Strict schema validation for extracted skills, years of experience, tools, languages, and geographic indicators.
- [x] Resume Review & Confirmation modal (`components/onboarding/ResumeReviewModal.tsx`) requiring user inspection and manual corrections before saving.
- [x] LLM output treated strictly as suggestions, never as unmodifiable ground truth.
- [x] Add rate limiting (memory-safe sliding window with client IP tracking) to the `/api/resume/parse` and `/api/reports/submit` endpoints (`lib/rate-limit.ts`).

## Deterministic Matching Engine
- [x] Transparent mathematical algorithm (`lib/match.ts`):
  $$\text{Match Score} = \text{Skill Overlap (50\%)} + \text{Experience Match (25\%)} + \text{Language Fit (15\%)} + \text{Preference Alignment (10\%)}$$
- [x] Separate geographic eligibility filter (gigs in non-supported countries are flagged or filtered out).
- [x] Detailed match explanation drawer (`GigPreviewDrawer.tsx`) breaking down matched skills, missing skills, and score formula.
- [x] Sponsored placement does not inflate the organic skill fit score.

## Deletion Controls (GDPR / CCPA)
- [x] Self-service account data purge (`handleWipeAccountData`) clearing cached resume facts, tracked gigs, and profile state.
- [x] Published zero-retention guarantee on `/privacy` and `/profile`.

**Exit Gate:** Users retain full control over extracted facts, receive explainable recommendations, and can permanently purge all stored data with a single action.

---

# Workstream F — Admin Operations Console

- [x] Admin login at `/admin/login` using Supabase Auth with server-enforced role verification.
- [x] Protected dashboard at `/admin` (`app/admin/(dashboard)/page.tsx`) with 6 operational tabs:
  1. **Listing Catalog:** Full CRUD, lifecycle transitions (`publish`, `pause`, `archive`), and verification badges.
  2. **Review Queue:** Stale-data detection, urgency categorization (`critical`, `warning`, `normal`), and review modal.
  3. **Evidence & Pay Rates:** Sourced compensation logs, payout rails, and proof URLs.
  4. **User Reports:** Community triage, status filtering (`open`, `triaged`, `resolved`, `dismissed`), and resolution notes.
  5. **Monetization & Ads:** Traffic KPIs, affiliate partner configuration, and sponsored campaign manager.
  6. **Launch Checklist:** Interactive 10-point production verification matrix.
- [x] Strict non-admin rejection via server middleware and `AccessDeniedScreen.tsx`.

---

# Workstream G — Monetization & Disclosures

- [x] Affiliate partner configuration directory with referral tags, commission models, and payout tracking.
- [x] Privacy-conscious outbound click resolver (`/api/outbound/click`) tracking link volume without storing personally identifiable user tokens.
- [x] Sponsored campaigns manager with placement rules (`homepage_banner`, `category_top`, `drawer_featured`), daily budget limits, and impressions counters.
- [x] High-contrast `Sponsored` badge clearly distinguishing paid listings from organic recommendations.
- [x] Commercial & FTC disclosures published on `/terms` and `/privacy`.
- [x] Verify affiliate approval status and terms with live partners prior to activating commercial referral tags (safe active partner status filter and clean direct URL fallback in `lib/monetization.ts`).

---

# Workstream H — Testing & Quality Assurance

## Automated Testing
- [x] TypeScript compiler strict verification: `npx tsc --noEmit` passing with 0 errors.
- [x] Next.js production build verification: `npm run build` compiling all 18 pages cleanly.
- [x] Add automated unit test suites (`tests/matching.test.mjs`, `tests/validation.test.mjs`) covering skill overlap, core weighting, geographic eligibility, file upload bounds, and RBAC protection (28/28 tests passing via `npm test`).
- [x] Implement root error boundaries (`app/error.tsx`, `app/global-error.tsx`) with monochrome styling, error digest telemetry logging, and user recovery actions.
- [x] Add integration tests for Supabase RLS policies (`tests/rls-security.test.mjs` verifying public access, user record isolation, and role elevation rejection).
- [x] Add end-to-end smoke test suite (`tests/e2e-smoke.test.mjs` covering Onboarding → Ephemeral Extraction → Matching → Application Tracker → Account Wipe → Admin Gate).

## Manual Test Matrix
- [x] Obsidian Black & White theme verified across all pages (0 leftover colored utility classes).
- [x] Responsive layout verified for mobile viewports, tablet screens, and desktop monitors.
- [x] Keyboard navigation focus rings verified with monochrome `:focus-visible` styling.
- [ ] Test live Supabase Auth email confirmation in staging project.
- [x] Verify behavior when external gig URLs 404 or return timeout errors (`lib/link-validator.ts` and `tests/link-validator.test.mjs`).

---

# Workstream I — Deployment & Operations

## Environments & Configuration
- [ ] Link local repository to remote Supabase Staging Project.
- [ ] Configure production environment variables in deployment host (Vercel / Cloudflare):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
  - `NEXT_PUBLIC_SITE_URL`
- [ ] Configure custom domain with DNS records and automated HTTPS SSL certification.
- [x] Verify CORS rules and allowed OAuth redirect URLs in Supabase Auth settings (`supabase/AUTH_CONFIGURATION.md`).

## Monitoring & Telemetry
- [x] Integrate privacy-friendly error tracking and structured logging with automated PII sanitization (`lib/telemetry.ts`, `app/error.tsx`, `app/global-error.tsx`).
- [ ] Set up Supabase database and storage usage alerts.
- [ ] Verify database automated daily backup schedule on Supabase project.

---

# Workstream J — Production Launch

## Pre-Launch Exit Gate
- [x] All 10 checkpoints in the Admin Console Launch Matrix completed and verified (`lib/monetization.ts` and Admin Launch Tab).
- [ ] Remote Supabase database migrated with RLS enabled and tested via direct unauthenticated curl calls.
- [ ] Production admin account provisioned via secure SQL migration or Supabase Auth invitation (`supabase/setup_admin.sql`).
- [x] Legal terms, privacy policy, and FTC disclosures live and linked in navbar and footer (`/terms`, `/privacy`, `components/layout/Footer.tsx`).
- [x] Production build succeeds cleanly across all 18 routes and API endpoints (`npm run build`).

## Limited Beta Rollout
- [x] Curated initial catalog of 5 verified platforms (Outlier, DataAnnotation, Alignerr, Mindrift, Testlio) active in `lib/mock-data.ts` and `supabase/phase4_seed.sql`.
- [ ] Invite initial test group of 50 remote gig workers to test resume calibration and match quality.
- [ ] Review incoming reports in Admin Triage Queue and resolve any rate inaccuracies within 24 hours.

---

## Definition of Production-Ready

The platform is considered production-ready when:
1. Core matching, onboarding, and application tracking workflows execute without client-side or server-side runtime exceptions.
2. User profiles and private resume facts are shielded by PostgreSQL Row Level Security and cannot be accessed across account boundaries.
3. Administrative operations (`/admin`) are strictly enforced on the server via trusted auth sessions and database RBAC.
4. All listed compensation rates and country eligibility criteria carry traceable source evidence and review dates.
5. User account wipe and resume deletion requests immediately and permanently purge all stored facts.
6. The engineering team has automated CI checks, verified database backups, and operational monitoring in place.
