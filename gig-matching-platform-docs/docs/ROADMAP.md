# Product Roadmap

## Phase 1 --- Frontend prototype

**Goal:** Demonstrate the end-to-end user experience with mock data.

Deliverables: - Landing page and responsive design system. - Multi-step
onboarding with manual profile entry. - Simulated local resume selection
and validation. - Matching dashboard, search, filters, and sorting. -
Gig detail pages with source and disclosure fields. - Saved gigs and
application tracker. - Editable profile and reset behavior. - Demo admin
for mock listing management. - Accessibility, responsive, and acceptance
checks.

Exit criteria: the core user journey works end-to-end with no dead
buttons and no backend dependency.

## Phase 2 --- Backend, database, and accounts

**Goal:** Replace browser-only demo state with persistent server-side
data.

Deliverables: - Spring Boot REST API. - PostgreSQL schema and migrations
using Flyway. - User registration and login. - Secure password hashing
and authorization. - Profile CRUD endpoints. - Gig listing CRUD
endpoints. - Saved gigs and application tracking endpoints. -
Server-side validation, consistent error responses, logging, and health
checks. - Role-based authorization for admin routes. - Integration tests
and API documentation. - Frontend API client and loading/error handling.

Suggested order: 1. Agree on API contracts and domain types. 2. Create
Spring Boot project and database migrations. 3. Implement profile and
gig read endpoints. 4. Implement authentication and ownership checks. 5.
Implement saved gigs and application tracking. 6. Add admin operations
and tests. 7. Connect frontend feature-by-feature.

Exit criteria: user data persists in the database, protected endpoints
enforce ownership/roles, and the frontend can complete its core journey
through the API.

## Phase 3 --- Resume intelligence and matching

**Goal:** Extract profile signals from resumes and improve explanations
of opportunity fit.

Deliverables: - Resume upload API and private file storage. -
File-type/size checks and malware-scanning strategy. - Resume parsing
with a clear manual-correction step. - Skill taxonomy and
normalization. - Versioned, deterministic matching algorithm. - Optional
LLM-generated extraction or explanations with schema validation. -
Evaluation set for matching quality and regression tests. - Consent,
retention, deletion, and data-access controls.

Principles: - Treat parsed information as suggestions until the user
confirms it. - Never let an LLM alone make unsupported claims about
eligibility or payment. - Keep matching explainable and distinguish
eligibility from skill fit. - Do not expose private resumes through
public URLs.

Exit criteria: users can review and correct extracted data, matching is
evaluated against test cases, and privacy controls are implemented.

## Phase 4 --- Gig data operations and verification

**Goal:** Keep opportunity data useful, traceable, and current.

Deliverables: - Admin workflow for adding and updating opportunities. -
Source URL, source type, reviewer, and last-reviewed timestamp. -
Separate evidence statuses for country eligibility and payment. -
Expiry/re-review queue for stale listings. - User reporting workflow for
incorrect information. - Listing status management and audit history. -
Carefully reviewed integrations or licensed data sources where
available.

Principles: - Do not assume a platform accepts workers from a country
based only on a generic marketing page. - Separate platform
availability, project-specific eligibility, and current task
availability. - Do not guarantee task volume, acceptance, or earnings. -
Review third-party terms before crawling, copying, or republishing
information.

Exit criteria: every material eligibility/payment claim has a traceable
source and review state, and stale listings can be identified and
updated.

## Phase 5 --- Monetization and public launch

**Goal:** Launch a trustworthy product with transparent commercial
relationships.

Deliverables: - Affiliate link management and attribution where
permitted. - Clear affiliate disclosures near relevant links. - Clearly
labelled sponsored listings. - Sponsored inventory kept distinct from
organic relevance ranking. - Basic product analytics with
privacy-conscious event design. - SEO, sitemap, metadata, and
performance optimization. - Production deployment, backups, monitoring,
and error reporting. - Security review, privacy policy, terms, and data
deletion process. - Abuse reporting and operational support process.

Exit criteria: production monitoring and data protection are in place,
commercial placements are disclosed, and core flows are tested on mobile
and desktop.

## Technical strategy

Start with a **modular monolith**: - Next.js frontend. - Java/Spring
Boot backend. - PostgreSQL database. - Flyway migrations. - REST API
contracts. - Optional external LLM API for bounded tasks.

Avoid microservices until load, team boundaries, or operational needs
justify them.
