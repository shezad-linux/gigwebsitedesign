# Acceptance Criteria and Test Checklist

## Phase 1 functional checklist

### Navigation and landing page

-   [ ] All primary navigation links work.
-   [ ] "Find My Matches" starts onboarding.
-   [ ] "Explore Opportunities" opens discovery.
-   [ ] Landing sections are readable on mobile and desktop.
-   [ ] External platform names and claims are not presented as
    endorsements without evidence.

### Onboarding

-   [ ] A user can finish onboarding without a resume.
-   [ ] Required fields show clear validation messages.
-   [ ] Country, languages, skills, experience, and preferences can be
    entered.
-   [ ] Simulated file selection validates permitted file types and file
    size.
-   [ ] The UI does not claim to parse or upload a resume.
-   [ ] The user can review and edit information before completing
    onboarding.
-   [ ] Completing onboarding changes the displayed mock matches.

### Dashboard

-   [ ] Search works across supported fields.
-   [ ] Each filter works and filters can be cleared.
-   [ ] Sorting works and has a visible current selection.
-   [ ] Match score has an understandable explanation.
-   [ ] Unknown eligibility is not shown as confirmed eligibility.
-   [ ] Unknown payment information is not invented.
-   [ ] Sponsored cards are clearly labelled.
-   [ ] Empty and no-results states provide a useful next action.
-   [ ] Save/unsave works and remains consistent across views.

### Gig detail

-   [ ] Detail route resolves using the listing slug.
-   [ ] Required skills and matching/missing skills are displayed
    correctly.
-   [ ] Eligibility and payment evidence/source fields appear when
    available.
-   [ ] Last-reviewed date is displayed when available.
-   [ ] The official application link opens the intended destination.
-   [ ] Affiliate and sponsored disclosures appear where relevant.
-   [ ] The page does not promise acceptance, task availability, or
    earnings.

### Saved gigs and application tracker

-   [ ] Saved opportunities can be viewed and removed.
-   [ ] Application status can be changed.
-   [ ] Notes and dates can be edited.
-   [ ] Empty states work.
-   [ ] Refresh behavior matches the documented persistence approach.

### Profile and demo admin

-   [ ] Profile data can be edited.
-   [ ] Reset/delete demo data works with a confirmation step.
-   [ ] Demo admin can create and edit mock listings.
-   [ ] Demo admin is explicitly identified as non-production and not
    secure.
-   [ ] Changes to mock listings update relevant frontend views.

### Quality

-   [ ] No visible buttons are inert.
-   [ ] Forms have labels and useful error messages.
-   [ ] Keyboard focus is visible and controls are keyboard-accessible.
-   [ ] Layout is usable at narrow mobile widths.
-   [ ] Loading, empty, and error states are intentional.
-   [ ] No secrets or real personal documents are committed to the
    repository.
-   [ ] Seed data is labelled as demo data.
-   [ ] No real backend or AI API is implied where none exists.

## Phase 2 backend checklist

-   [ ] Database migrations create the schema from a clean database.
-   [ ] Registration/login works with secure password handling.
-   [ ] Authentication is required for private endpoints.
-   [ ] Users cannot read or modify another user's profile, saved gigs,
    or tracker entries.
-   [ ] Admin endpoints enforce server-side role checks.
-   [ ] Request payloads are validated.
-   [ ] API errors use a consistent response format.
-   [ ] Gig search and filters work server-side.
-   [ ] Saved-gig creation is idempotent or handles duplicates cleanly.
-   [ ] Tests cover access control and ownership boundaries.
-   [ ] Integration tests use an isolated database environment.
-   [ ] Secrets are configuration-managed and not committed.
-   [ ] Health checks and useful operational logging are present.

## Release gate

Do not call the product production-ready solely because the UI renders.
Verify the full user journey, authorization boundaries, source/evidence
handling, privacy behavior, and failure states for the relevant phase.
