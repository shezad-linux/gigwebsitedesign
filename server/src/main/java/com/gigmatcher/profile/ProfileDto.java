package com.gigmatcher.profile;

public class ProfileDto {
    private String id;
    private String userId;
    private String fullName;
    private String country;
    private String countryCode;
    private String workAuthorization;
    private String experienceLevel;
    private Integer yearsOfExperience;
    private String portfolioUrl;
    private String githubUrl;
    private String linkedinUrl;
    private Boolean remoteOnly;
    private Integer weeklyHoursAvailable;
    private String bio;
    private String skillsJson;
    private String languagesJson;
    private String desiredCategoriesJson;
    private String preferredPayoutMethodsJson;
    private Boolean hasCompletedOnboarding;

    public ProfileDto() {
    }

    public static ProfileDto fromEntity(UserProfile entity) {
        ProfileDto dto = new ProfileDto();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setFullName(entity.getFullName());
        dto.setCountry(entity.getCountry());
        dto.setCountryCode(entity.getCountryCode());
        dto.setWorkAuthorization(entity.getWorkAuthorization());
        dto.setExperienceLevel(entity.getExperienceLevel());
        dto.setYearsOfExperience(entity.getYearsOfExperience());
        dto.setPortfolioUrl(entity.getPortfolioUrl());
        dto.setGithubUrl(entity.getGithubUrl());
        dto.setLinkedinUrl(entity.getLinkedinUrl());
        dto.setRemoteOnly(entity.getRemoteOnly());
        dto.setWeeklyHoursAvailable(entity.getWeeklyHoursAvailable());
        dto.setBio(entity.getBio());
        dto.setSkillsJson(entity.getSkillsJson());
        dto.setLanguagesJson(entity.getLanguagesJson());
        dto.setDesiredCategoriesJson(entity.getDesiredCategoriesJson());
        dto.setPreferredPayoutMethodsJson(entity.getPreferredPayoutMethodsJson());
        dto.setHasCompletedOnboarding(entity.getHasCompletedOnboarding());
        return dto;
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
}
