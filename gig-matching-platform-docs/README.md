# AI Gig-Matching Platform

A platform that helps people discover remote AI and digital gig
opportunities based on their skills, location, language abilities,
experience, and preferences.

The product should make it easier to compare opportunities while clearly
distinguishing verified facts, unverified claims, affiliate links, and
sponsored placements.

## Product goals

-   Help users discover relevant opportunities without searching many
    sites manually.
-   Explain why each opportunity matches a user's profile.
-   Show country eligibility, payment information, onboarding
    requirements, source links, and last-reviewed dates.
-   Let users save opportunities and track application progress.
-   Build a sustainable business through transparent affiliate referrals
    and clearly labelled sponsorships.

## Documentation

-   [Phase 1 specification](docs/PHASE-1-SPEC.md)
-   [Product roadmap](docs/ROADMAP.md)
-   [Architecture and technology decisions](docs/ARCHITECTURE.md)
-   [Initial data model](docs/DATA-MODEL.md)
-   [Acceptance criteria and test
    checklist](docs/ACCEPTANCE-CRITERIA.md)

## Technology direction

**Phase 1:** Next.js App Router, TypeScript, Tailwind CSS, mock data,
and browser-local persistence where appropriate.

**Phase 2 onward:** Java, Spring Boot, PostgreSQL, database migrations,
authentication, and REST APIs.

AI resume parsing and richer matching logic are introduced after the
core data model and API contracts are stable.

## Development principles

1.  Start as a modular monolith; do not introduce microservices without
    a demonstrated need.
2.  Keep sponsored placements visibly labelled and separate from organic
    relevance ranking.
3.  Never guarantee that a user will be accepted, receive tasks, or earn
    a stated amount.
4.  Show a source and review date for eligibility and payment claims.
5.  Do not upload resume files to an external service in Phase 1.
6.  Do not scrape or republish third-party content without reviewing the
    relevant terms and permissions.
7.  Validate external application URLs and provide a way to report
    outdated listings.
