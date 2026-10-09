package com.gigmatcher.profile;

import com.gigmatcher.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/me/profile")
public class UserProfileController {

    private final UserProfileService profileService;

    public UserProfileController(UserProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<ProfileDto>> getMyProfile(Authentication auth) {
        String userId = auth.getName();
        ProfileDto profile = profileService.getProfileByUserId(userId);
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<ProfileDto>> updateMyProfile(@RequestBody ProfileDto dto,
                                                                   Authentication auth) {
        String userId = auth.getName();
        ProfileDto updated = profileService.updateProfile(userId, dto);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", updated));
    }
}
