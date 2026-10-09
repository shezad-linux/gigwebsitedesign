package com.gigmatcher.profile;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "user_id", nullable = false, unique = true, length = 36)
    private String userId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private String country;

    @Column(name = "country_code", length = 10)
    private String countryCode;

    @Column(name = "work_authorization")
    private String workAuthorization;

    @Column(name = "experience_level", length = 50)
    private String experienceLevel;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(name = "portfolio_url", length = 500)
    private String portfolioUrl;

    @Column(name = "github_url", length = 500)
    private String githubUrl;

    @Column(name = "linkedin_url", length = 500)
    private String linkedinUrl;

    @Column(name = "remote_only")
    private Boolean remoteOnly;

    @Column(name = "weekly_hours_available")
    private Integer weeklyHoursAvailable;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "skills_json", columnDefinition = "TEXT")
    private String skillsJson;

    @Column(name = "languages_json", columnDefinition = "TEXT")
    private String languagesJson;

    @Column(name = "desired_categories_json", columnDefinition = "TEXT")
    private String desiredCategoriesJson;

    @Column(name = "preferred_payout_methods_json", columnDefinition = "TEXT")
    private String preferredPayoutMethodsJson;

    @Column(name = "has_completed_onboarding")
    private Boolean hasCompletedOnboarding;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public UserProfile() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getCountryCode() {
        return countryCode;
    }

    public void setCountryCode(String countryCode) {
        this.countryCode = countryCode;
    }

    public String getWorkAuthorization() {
        return workAuthorization;
    }

    public void setWorkAuthorization(String workAuthorization) {
        this.workAuthorization = workAuthorization;
    }

    public String getExperienceLevel() {
        return experienceLevel;
    }

    public void setExperienceLevel(String experienceLevel) {
        this.experienceLevel = experienceLevel;
    }

    public Integer getYearsOfExperience() {
        return yearsOfExperience;
    }

    public void setYearsOfExperience(Integer yearsOfExperience) {
        this.yearsOfExperience = yearsOfExperience;
    }

    public String getPortfolioUrl() {
        return portfolioUrl;
    }

    public void setPortfolioUrl(String portfolioUrl) {
        this.portfolioUrl = portfolioUrl;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }

    public Boolean getRemoteOnly() {
        return remoteOnly;
    }

    public void setRemoteOnly(Boolean remoteOnly) {
        this.remoteOnly = remoteOnly;
    }

    public Integer getWeeklyHoursAvailable() {
        return weeklyHoursAvailable;
    }

    public void setWeeklyHoursAvailable(Integer weeklyHoursAvailable) {
        this.weeklyHoursAvailable = weeklyHoursAvailable;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getSkillsJson() {
        return skillsJson;
    }

    public void setSkillsJson(String skillsJson) {
        this.skillsJson = skillsJson;
    }

    public String getLanguagesJson() {
        return languagesJson;
    }

    public void setLanguagesJson(String languagesJson) {
        this.languagesJson = languagesJson;
    }

    public String getDesiredCategoriesJson() {
        return desiredCategoriesJson;
    }

    public void setDesiredCategoriesJson(String desiredCategoriesJson) {
        this.desiredCategoriesJson = desiredCategoriesJson;
    }

    public String getPreferredPayoutMethodsJson() {
        return preferredPayoutMethodsJson;
    }

    public void setPreferredPayoutMethodsJson(String preferredPayoutMethodsJson) {
        this.preferredPayoutMethodsJson = preferredPayoutMethodsJson;
    }

    public Boolean getHasCompletedOnboarding() {
        return hasCompletedOnboarding;
    }

    public void setHasCompletedOnboarding(Boolean hasCompletedOnboarding) {
        this.hasCompletedOnboarding = hasCompletedOnboarding;
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
