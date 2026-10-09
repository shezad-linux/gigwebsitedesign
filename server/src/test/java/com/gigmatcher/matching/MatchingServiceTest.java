package com.gigmatcher.matching;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gigmatcher.gig.GigListing;
import com.gigmatcher.gig.GigRepository;
import com.gigmatcher.profile.UserProfile;
import com.gigmatcher.profile.UserProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;

class MatchingServiceTest {

    private MatchingService matchingService;
    private GigRepository gigRepository;
    private UserProfileRepository profileRepository;

    @BeforeEach
    void setUp() {
        gigRepository = Mockito.mock(GigRepository.class);
        profileRepository = Mockito.mock(UserProfileRepository.class);
        matchingService = new MatchingService(gigRepository, profileRepository, new ObjectMapper());
    }

    @Test
    void testCalculateMatch_FullSkillsAndIndiaEligible() {
        UserProfile user = new UserProfile();
        user.setFullName("Aarav Sharma");
        user.setCountry("India");
        user.setCountryCode("IN");
        user.setExperienceLevel("mid");
        user.setSkillsJson("[\"Python\", \"Java\", \"Code Review\", \"Unit Testing\"]");
        user.setDesiredCategoriesJson("[\"AI Coding\"]");

        GigListing gig = new GigListing();
        gig.setId("gig-outlier-01");
        gig.setTitle("AI Coding Evaluation");
        gig.setCategory("AI Coding");
        gig.setExperienceLevel("mid");
        gig.setSkillsRequiredJson("[\"Python\", \"Java\", \"Code Review\", \"Unit Testing\"]");
        gig.setEligibleCountriesJson("[\"Global\", \"India\", \"United States\"]");

        MatchResultDto result = matchingService.calculateMatch(user, gig);

        assertNotNull(result);
        assertTrue(result.getMatchScore() >= 90, "Expected match score to be >= 90%, but was: " + result.getMatchScore());
        assertTrue(result.isCountryEligible());
        assertEquals(4, result.getMatchedSkills().size());
        assertEquals(0, result.getMissingSkills().size());
    }
}
