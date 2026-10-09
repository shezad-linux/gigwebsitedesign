# Architecture and Technology Decisions

## 1. High-level architecture

### Phase 1

``` text
Browser
  └── Next.js App Router
      ├── React UI components
      ├── Mock listing/profile data
      ├── Deterministic client-side matching
      └── Browser-local demo persistence
```

No backend or real AI service is required in Phase 1.

### Phase 2 onward

``` text
Browser
  └── Next.js frontend
      └── HTTPS REST API
          └── Spring Boot modular monolith
              ├── Authentication and authorization
              ├── Profile module
              ├── Opportunity module
              ├── Matching module
              ├── Saved-gig module
              ├── Application-tracking module
              └── Admin module
                  └── PostgreSQL
```

An external LLM service may be added for bounded resume-extraction or
explanation tasks. It should not be a source of truth for platform
eligibility, payment terms, or current task availability.

## 2. Frontend

-   Next.js App Router.
-   TypeScript.
-   Tailwind CSS.
-   Reusable accessible components.
-   React Hook Form and Zod where useful for forms and validation.
-   A small API client layer introduced when the backend is ready.
-   Keep presentation components separate from matching and storage
    logic.

## 3. Backend

Use Java and Spring Boot with: - Spring Web for REST endpoints. - Spring
Security for authentication and authorization. - Spring Data JPA for
persistence. - Bean Validation for request validation. - PostgreSQL JDBC
driver. - Flyway for versioned database migrations. - Actuator for
health and operational endpoints. - Testcontainers for database-backed
integration tests.

Keep domain rules in service/domain layers rather than embedding them in
controllers.

## 4. Initial API surface

Exact endpoint names can be finalized before Phase 2 implementation.

  ---------------------------------------------------------------------------------
  Method                  Endpoint                          Purpose
  ----------------------- --------------------------------- -----------------------
  `POST`                  `/api/v1/auth/register`           Register a user

  `POST`                  `/api/v1/auth/login`              Authenticate a user

  `GET`                   `/api/v1/me`                      Get current
                                                            user/profile

  `PUT`                   `/api/v1/me/profile`              Update profile

  `GET`                   `/api/v1/gigs`                    Search/filter published
                                                            listings

  `GET`                   `/api/v1/gigs/{slug}`             Get listing details

  `GET`                   `/api/v1/me/matches`              Get personalized
                                                            matches

  `GET`                   `/api/v1/me/saved-gigs`           List saved gigs

  `PUT`                   `/api/v1/me/saved-gigs/{gigId}`   Save a gig idempotently

  `DELETE`                `/api/v1/me/saved-gigs/{gigId}`   Unsave a gig

  `GET`                   `/api/v1/me/applications`         List tracked
                                                            applications

  `POST`                  `/api/v1/me/applications`         Create a tracker entry

  `PATCH`                 `/api/v1/me/applications/{id}`    Update status, notes,
                                                            or dates

  `GET`                   `/api/v1/admin/gigs`              Admin listing
                                                            management

  `POST`                  `/api/v1/admin/gigs`              Create a listing

  `PATCH`                 `/api/v1/admin/gigs/{id}`         Update a listing
  ---------------------------------------------------------------------------------

Admin endpoints must enforce server-side role checks. Hiding an admin
link in the frontend is not authorization.

## 5. Matching and sponsored placement

Keep separate concepts for: - **Skill fit:** overlap between a profile
and required skills. - **Eligibility:** whether the listing's stated
rules include the user's location and other requirements. - **Evidence
quality:** whether claims are sourced and recently reviewed. -
**Sponsored status:** whether a commercial relationship affects
placement.

Sponsored status must not silently inflate the organic match score. If
sponsored opportunities are shown in a special section, label that
section and each sponsored card.

## 6. Security and privacy baseline

-   Hash passwords using a suitable password-hashing algorithm via
    established security libraries.
-   Use HTTPS in production.
-   Validate and authorize every server-side operation.
-   Enforce record ownership for profile, saved-gig, and application
    endpoints.
-   Restrict admin operations by role.
-   Never commit credentials, API keys, or production secrets.
-   Use private storage for resumes if/when uploads are implemented.
-   Set explicit retention and deletion policies for uploaded files and
    extracted data.
-   Avoid logging passwords, tokens, resume text, or other sensitive
    user content.
-   Add rate limiting and abuse protection before public launch.

## 7. Operational baseline

-   Structured application logs without sensitive payloads.
-   Health checks and error monitoring.
-   Database backups and restore testing.
-   Migration review and rollback planning.
-   Automated unit and integration tests in CI.
-   Separate development, staging, and production configuration.
