package com.gigmatcher.gig;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "gig_listings")
public class GigListing {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(name = "platform_name", nullable = false)
    private String platformName;

    @Column(name = "platform_logo", length = 500)
    private String platformLogo;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    private Boolean remote;

    @Column(name = "pay_amount", precision = 10, scale = 2)
    private BigDecimal payAmount;

    @Column(name = "pay_currency", length = 10)
    private String payCurrency;

    @Column(name = "pay_unit", length = 50)
    private String payUnit;

    @Column(name = "pay_terms_note", columnDefinition = "TEXT")
    private String payTermsNote;

    @Column(name = "payment_verification", nullable = false, length = 50)
    private String paymentVerification;

    @Column(name = "eligibility_verification", nullable = false, length = 50)
    private String eligibilityVerification;

    @Column(name = "official_url", nullable = false, length = 500)
    private String officialUrl;

    private Boolean sponsored;

    @Column(name = "availability_status", length = 50)
    private String availabilityStatus;

    @Column(name = "estimated_effort")
    private String estimatedEffort;

    @Column(name = "experience_level", length = 50)
    private String experienceLevel;

    @Column(name = "eligibility_source_note", columnDefinition = "TEXT")
    private String eligibilitySourceNote;

    @Column(name = "affiliate_disclosure", columnDefinition = "TEXT")
    private String affiliateDisclosure;

    @Column(precision = 3, scale = 2)
    private BigDecimal rating;

    @Column(name = "active_projects_count")
    private Integer activeProjectsCount;

    @Column(name = "skills_required_json", columnDefinition = "TEXT")
    private String skillsRequiredJson;

    @Column(name = "eligible_countries_json", columnDefinition = "TEXT")
    private String eligibleCountriesJson;

    @Column(name = "onboarding_steps_json", columnDefinition = "TEXT")
    private String onboardingStepsJson;

    @Column(name = "overview_highlights_json", columnDefinition = "TEXT")
    private String overviewHighlightsJson;

    @Column(name = "last_reviewed_at")
    private Instant lastReviewedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public GigListing() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getPlatformName() {
        return platformName;
    }

    public void setPlatformName(String platformName) {
        this.platformName = platformName;
    }

    public String getPlatformLogo() {
        return platformLogo;
    }

    public void setPlatformLogo(String platformLogo) {
        this.platformLogo = platformLogo;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getRemote() {
        return remote;
    }

    public void setRemote(Boolean remote) {
        this.remote = remote;
    }

    public BigDecimal getPayAmount() {
        return payAmount;
    }

    public void setPayAmount(BigDecimal payAmount) {
        this.payAmount = payAmount;
    }

    public String getPayCurrency() {
        return payCurrency;
    }

    public void setPayCurrency(String payCurrency) {
        this.payCurrency = payCurrency;
    }

    public String getPayUnit() {
        return payUnit;
    }

    public void setPayUnit(String payUnit) {
        this.payUnit = payUnit;
    }

    public String getPayTermsNote() {
        return payTermsNote;
    }

    public void setPayTermsNote(String payTermsNote) {
        this.payTermsNote = payTermsNote;
    }

    public String getPaymentVerification() {
        return paymentVerification;
    }

    public void setPaymentVerification(String paymentVerification) {
        this.paymentVerification = paymentVerification;
    }

    public String getEligibilityVerification() {
        return eligibilityVerification;
    }

    public void setEligibilityVerification(String eligibilityVerification) {
        this.eligibilityVerification = eligibilityVerification;
    }

    public String getOfficialUrl() {
        return officialUrl;
    }

    public void setOfficialUrl(String officialUrl) {
        this.officialUrl = officialUrl;
    }

    public Boolean getSponsored() {
        return sponsored;
    }

    public void setSponsored(Boolean sponsored) {
        this.sponsored = sponsored;
    }

    public String getAvailabilityStatus() {
        return availabilityStatus;
    }

    public void setAvailabilityStatus(String availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
    }

    public String getEstimatedEffort() {
        return estimatedEffort;
    }

    public void setEstimatedEffort(String estimatedEffort) {
        this.estimatedEffort = estimatedEffort;
    }

    public String getExperienceLevel() {
        return experienceLevel;
    }

    public void setExperienceLevel(String experienceLevel) {
        this.experienceLevel = experienceLevel;
    }

    public String getEligibilitySourceNote() {
        return eligibilitySourceNote;
    }

    public void setEligibilitySourceNote(String eligibilitySourceNote) {
        this.eligibilitySourceNote = eligibilitySourceNote;
    }

    public String getAffiliateDisclosure() {
        return affiliateDisclosure;
    }

    public void setAffiliateDisclosure(String affiliateDisclosure) {
        this.affiliateDisclosure = affiliateDisclosure;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public void setRating(BigDecimal rating) {
        this.rating = rating;
    }

    public Integer getActiveProjectsCount() {
        return activeProjectsCount;
    }

    public void setActiveProjectsCount(Integer activeProjectsCount) {
        this.activeProjectsCount = activeProjectsCount;
    }

    public String getSkillsRequiredJson() {
        return skillsRequiredJson;
    }

    public void setSkillsRequiredJson(String skillsRequiredJson) {
        this.skillsRequiredJson = skillsRequiredJson;
    }

    public String getEligibleCountriesJson() {
        return eligibleCountriesJson;
    }

    public void setEligibleCountriesJson(String eligibleCountriesJson) {
        this.eligibleCountriesJson = eligibleCountriesJson;
    }

    public String getOnboardingStepsJson() {
        return onboardingStepsJson;
    }

    public void setOnboardingStepsJson(String onboardingStepsJson) {
        this.onboardingStepsJson = onboardingStepsJson;
    }

    public String getOverviewHighlightsJson() {
        return overviewHighlightsJson;
    }

    public void setOverviewHighlightsJson(String overviewHighlightsJson) {
        this.overviewHighlightsJson = overviewHighlightsJson;
    }

    public Instant getLastReviewedAt() {
        return lastReviewedAt;
    }

    public void setLastReviewedAt(Instant lastReviewedAt) {
        this.lastReviewedAt = lastReviewedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
