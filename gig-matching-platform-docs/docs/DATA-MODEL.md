# Initial Data Model

This is a starting domain model, not a final production schema. Confirm
constraints and relationships before writing migrations.

## 1. Core entities

### User

  Field                      Notes
  -------------------------- -----------------------------------------
  `id`                       UUID or generated primary key
  `email`                    Unique, normalized
  `passwordHash`             Never expose to frontend
  `role`                     User or admin
  `createdAt`, `updatedAt`   Audit timestamps
  `status`                   Active, suspended, or deleted as needed

### UserProfile

  Field               Notes
  ------------------- ---------------------------------------------
  `userId`            One-to-one relationship to user
  `countryCode`       Prefer normalized country codes
  `languages`         Structured language/proficiency values
  `skills`            Prefer normalized skill IDs or a join table
  `experienceLevel`   Controlled enum or taxonomy
  `preferences`       Structured categories and work preferences
  `updatedAt`         Last profile update

### GigListing

  -----------------------------------------------------------------------
  Field                               Notes
  ----------------------------------- -----------------------------------
  `id`                                Primary key

  `slug`                              Unique public identifier

  `platformName`                      Opportunity provider/platform

  `title`                             Listing title

  `category`                          Controlled category

  `description`                       Original summary written/maintained
                                      with appropriate permissions

  `remote`                            Whether remote work is indicated

  `officialUrl`                       Validated destination URL

  `status`                            Draft, published, paused, archived

  `sponsored`                         Commercial placement flag

  `createdAt`, `updatedAt`            Timestamps
  -----------------------------------------------------------------------

### GigSkill

Join table connecting listings to required skills. Suggested fields:
`gigId`, `skillId`, and optional `importance`.

### EligibilityEvidence

Keep eligibility evidence separate from the main listing so each claim
can be sourced and reviewed.

Suggested fields: - `id` - `gigId` - `countryCode` or other applicable
scope - `status` (confirmed, excluded, unknown, needs-review) -
`sourceUrl` - `sourceType` - `evidenceNote` - `reviewedAt` -
`reviewedBy` - `expiresAt` or next-review date, if used

Do not collapse unknown eligibility into "eligible".

### PaymentEvidence

Suggested fields: - `id` - `gigId` - optional amount, currency, and
unit - payment method/terms summary - evidence status - source URL -
evidence note - reviewed date and reviewer

Distinguish advertised rates from guaranteed or actually received
earnings. Avoid presenting one person's report as a universal rate.

### SavedGig

Suggested fields: - `userId` - `gigId` - `createdAt`

Add a unique constraint on `(userId, gigId)`.

### ApplicationTrackerEntry

Suggested fields: - `id` - `userId` - `gigId` - `status` - `notes` -
`appliedAt` - `updatedAt` - optional `lastStatusChangedAt`

Validate allowed status transitions if product requirements later need
them.

### MatchResult (optional persisted entity)

Initially calculate matches dynamically. Persist only if there is a
concrete need for history or analytics.

Possible fields: - `userId` - `gigId` - `algorithmVersion` - `score` -
`explanation` - `calculatedAt`

A score is derived from a user profile and listing; it is not a
permanent property of a listing.

### ListingReview / AuditEvent

For production admin operations, consider an audit record containing
actor, action, entity, timestamp, and a safe summary of the change. Do
not store secrets or unnecessary personal data.

## 2. Controlled values

### Application statuses

-   `SHORTLISTED`
-   `APPLIED`
-   `ONBOARDING`
-   `QUALIFIED`
-   `ACTIVE`
-   `REJECTED`
-   `WITHDRAWN`

### Evidence statuses

-   `CONFIRMED`
-   `UNCONFIRMED`
-   `CONTRADICTED`
-   `NEEDS_REVIEW`
-   `UNKNOWN`

Adapt names as needed, but preserve the distinction between confirmed,
unknown, and contradicted information.

## 3. Data integrity rules

-   Every published listing should have a valid official destination or
    a clearly documented exception.
-   Eligibility and payment claims should have source and review
    metadata.
-   A missing source must not be interpreted as confirmation.
-   Saved-gig and tracker records must belong to the authenticated user.
-   Deleting or archiving a listing should not silently corrupt tracker
    history.
-   Match scores should be reproducible for a given algorithm version
    and input snapshot if persisted.
