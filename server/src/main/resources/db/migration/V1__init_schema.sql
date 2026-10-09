-- V1__init_schema.sql
-- Initializes core schemas for users, profiles, gig catalog, saved gigs, and application tracking

CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE user_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    country VARCHAR(255),
    country_code VARCHAR(10),
    work_authorization VARCHAR(255),
    experience_level VARCHAR(50) DEFAULT 'mid',
    years_of_experience INT DEFAULT 0,
    portfolio_url VARCHAR(500),
    github_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    remote_only BOOLEAN DEFAULT TRUE,
    weekly_hours_available INT DEFAULT 20,
    bio TEXT,
    skills_json TEXT,
    languages_json TEXT,
    desired_categories_json TEXT,
    preferred_payout_methods_json TEXT,
    has_completed_onboarding BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE gig_listings (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    platform_name VARCHAR(255) NOT NULL,
    platform_logo VARCHAR(500),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    remote BOOLEAN DEFAULT TRUE,
    pay_amount NUMERIC(10, 2),
    pay_currency VARCHAR(10),
    pay_unit VARCHAR(50),
    pay_terms_note TEXT,
    payment_verification VARCHAR(50) NOT NULL,
    eligibility_verification VARCHAR(50) NOT NULL,
    official_url VARCHAR(500) NOT NULL,
    sponsored BOOLEAN DEFAULT FALSE,
    availability_status VARCHAR(50) DEFAULT 'open',
    estimated_effort VARCHAR(255),
    experience_level VARCHAR(50),
    eligibility_source_note TEXT,
    affiliate_disclosure TEXT,
    rating NUMERIC(3, 2),
    active_projects_count INT,
    skills_required_json TEXT,
    eligible_countries_json TEXT,
    onboarding_steps_json TEXT,
    overview_highlights_json TEXT,
    last_reviewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE saved_gigs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    gig_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_saved_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_saved_gig FOREIGN KEY (gig_id) REFERENCES gig_listings(id) ON DELETE CASCADE,
    CONSTRAINT uq_saved_user_gig UNIQUE (user_id, gig_id)
);

CREATE TABLE application_tracker_entries (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    gig_id VARCHAR(64) NOT NULL,
    status VARCHAR(50) NOT NULL,
    applied_date DATE,
    last_updated DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_tracker_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_tracker_gig FOREIGN KEY (gig_id) REFERENCES gig_listings(id) ON DELETE CASCADE,
    CONSTRAINT uq_tracker_user_gig UNIQUE (user_id, gig_id)
);

CREATE INDEX idx_gigs_category ON gig_listings(category);
CREATE INDEX idx_gigs_sponsored ON gig_listings(sponsored);
CREATE INDEX idx_gigs_status ON gig_listings(availability_status);
CREATE INDEX idx_tracker_user ON application_tracker_entries(user_id);
