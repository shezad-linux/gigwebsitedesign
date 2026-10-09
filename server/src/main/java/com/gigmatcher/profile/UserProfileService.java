package com.gigmatcher.profile;

import com.gigmatcher.common.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class UserProfileService {

    private final UserProfileRepository profileRepository;

    public UserProfileService(UserProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    public ProfileDto getProfileByUserId(String userId) {
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + userId));
        return ProfileDto.fromEntity(profile);
    }

    @Transactional
    public ProfileDto updateProfile(String userId, ProfileDto dto) {
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + userId));

        if (dto.getFullName() != null) profile.setFullName(dto.getFullName());
        if (dto.getCountry() != null) profile.setCountry(dto.getCountry());
        if (dto.getCountryCode() != null) profile.setCountryCode(dto.getCountryCode());
        if (dto.getWorkAuthorization() != null) profile.setWorkAuthorization(dto.getWorkAuthorization());
        if (dto.getExperienceLevel() != null) profile.setExperienceLevel(dto.getExperienceLevel());
        if (dto.getYearsOfExperience() != null) profile.setYearsOfExperience(dto.getYearsOfExperience());
        if (dto.getPortfolioUrl() != null) profile.setPortfolioUrl(dto.getPortfolioUrl());
        if (dto.getGithubUrl() != null) profile.setGithubUrl(dto.getGithubUrl());
        if (dto.getLinkedinUrl() != null) profile.setLinkedinUrl(dto.getLinkedinUrl());
        if (dto.getRemoteOnly() != null) profile.setRemoteOnly(dto.getRemoteOnly());
        if (dto.getWeeklyHoursAvailable() != null) profile.setWeeklyHoursAvailable(dto.getWeeklyHoursAvailable());
        if (dto.getBio() != null) profile.setBio(dto.getBio());
        if (dto.getSkillsJson() != null) profile.setSkillsJson(dto.getSkillsJson());
        if (dto.getLanguagesJson() != null) profile.setLanguagesJson(dto.getLanguagesJson());
        if (dto.getDesiredCategoriesJson() != null) profile.setDesiredCategoriesJson(dto.getDesiredCategoriesJson());
        if (dto.getPreferredPayoutMethodsJson() != null) profile.setPreferredPayoutMethodsJson(dto.getPreferredPayoutMethodsJson());
        if (dto.getHasCompletedOnboarding() != null) profile.setHasCompletedOnboarding(dto.getHasCompletedOnboarding());

        profile.setUpdatedAt(Instant.now());
        profileRepository.save(profile);

        return ProfileDto.fromEntity(profile);
    }
}
