package com.gigmatcher.auth;

import com.gigmatcher.common.BadRequestException;
import com.gigmatcher.profile.UserProfile;
import com.gigmatcher.profile.UserProfileRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       UserProfileRepository profileRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new BadRequestException("An account with email " + request.getEmail() + " already exists.");
        }

        String userId = "usr_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        String profileId = "prof_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        User user = new User(
                userId,
                request.getEmail().toLowerCase().trim(),
                passwordEncoder.encode(request.getPassword()),
                "ROLE_USER",
                "active"
        );
        userRepository.save(user);

        UserProfile profile = new UserProfile();
        profile.setId(profileId);
        profile.setUserId(userId);
        profile.setFullName(request.getFullName().trim());
        profile.setCountry(request.getCountry() != null ? request.getCountry().trim() : "India");
        profile.setCountryCode(request.getCountryCode() != null ? request.getCountryCode().trim().toUpperCase() : "IN");
        profile.setExperienceLevel("mid");
        profile.setYearsOfExperience(2);
        profile.setRemoteOnly(true);
        profile.setWeeklyHoursAvailable(20);
        profile.setSkillsJson("[\"Python\", \"Code Review\", \"Prompt Engineering\"]");
        profile.setLanguagesJson("[{\"name\": \"English\", \"proficiency\": \"fluent\"}]");
        profile.setDesiredCategoriesJson("[\"AI Coding\", \"AI Evaluation\"]");
        profile.setPreferredPayoutMethodsJson("[\"PayPal\", \"Wise\"]");
        profile.setHasCompletedOnboarding(true);
        profile.setCreatedAt(Instant.now());
        profile.setUpdatedAt(Instant.now());

        profileRepository.save(profile);

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getRole(), profile.getFullName());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String fullName = profileRepository.findByUserId(user.getId())
                .map(UserProfile::getFullName)
                .orElse("User");

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getRole(), fullName);
    }
}
