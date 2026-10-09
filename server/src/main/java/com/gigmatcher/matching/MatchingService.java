package com.gigmatcher.matching;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gigmatcher.gig.GigListing;
import com.gigmatcher.gig.GigRepository;
import com.gigmatcher.profile.UserProfile;
import com.gigmatcher.profile.UserProfileRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class MatchingService {

    private final GigRepository gigRepository;
    private final UserProfileRepository profileRepository;
    private final ObjectMapper objectMapper;

    public MatchingService(GigRepository gigRepository,
                           UserProfileRepository profileRepository,
                           ObjectMapper objectMapper) {
        this.gigRepository = gigRepository;
        this.profileRepository = profileRepository;
        this.objectMapper = objectMapper;
    }

    public List<MatchResultDto> getMatchesForUser(String userId) {
        UserProfile profile = profileRepository.findByUserId(userId).orElse(null);
        List<GigListing> gigs = gigRepository.findAll();

        List<MatchResultDto> results = new ArrayList<>();
        for (GigListing gig : gigs) {
            results.add(calculateMatch(profile, gig));
        }

        // Sort descending by score, prioritizing sponsored among equal scores
        results.sort((a, b) -> Integer.compare(b.getMatchScore(), a.getMatchScore()));
        return results;
    }

    public MatchResultDto calculateMatch(UserProfile profile, GigListing gig) {
        List<String> userSkills = parseJsonList(profile != null ? profile.getSkillsJson() : null);
        List<String> userCategories = parseJsonList(profile != null ? profile.getDesiredCategoriesJson() : null);
        List<String> reqSkills = parseJsonList(gig.getSkillsRequiredJson());
        List<String> eligibleCountries = parseJsonList(gig.getEligibleCountriesJson());

        List<String> matchedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        for (String req : reqSkills) {
            boolean matched = userSkills.stream().anyMatch(u -> isSkillMatch(u, req));
            if (matched) {
                matchedSkills.add(req);
            } else {
                missingSkills.add(req);
            }
        }

        // 1. Skill Score (Weight 55%)
        int skillRatioPoints = reqSkills.isEmpty() ? 55 : (int) Math.round(((double) matchedSkills.size() / reqSkills.size()) * 55);

        // 2. Experience Score (Weight 15%)
        int expScore = 10;
        if (profile != null && gig.getExperienceLevel() != null) {
            if (gig.getExperienceLevel().equalsIgnoreCase(profile.getExperienceLevel())) {
                expScore = 15;
            } else {
                expScore = 10;
            }
        }

        // 3. Category Score (Weight 15%)
        boolean wantsCategory = userCategories.stream().anyMatch(c -> c.equalsIgnoreCase(gig.getCategory()));
        int catScore = wantsCategory ? 15 : 8;

        // 4. Country Fit (Weight 15%)
        String userCountry = profile != null && profile.getCountry() != null ? profile.getCountry().toLowerCase().trim() : "";
        String userCode = profile != null && profile.getCountryCode() != null ? profile.getCountryCode().toLowerCase().trim() : "";

        boolean isGlobal = eligibleCountries.stream().anyMatch(c -> c.equalsIgnoreCase("global") || c.equalsIgnoreCase("all"));
        boolean explicitEligible = eligibleCountries.stream().anyMatch(c -> {
            String cl = c.toLowerCase().trim();
            return cl.equals(userCountry) || cl.equals(userCode) ||
                   (userCountry.equals("india") && cl.equals("in")) ||
                   (userCountry.contains("united states") && (cl.equals("us") || cl.equals("usa")));
        });

        boolean countryEligible = isGlobal || explicitEligible;
        int countryScore = explicitEligible ? 15 : (isGlobal ? 13 : 3);
        String countryNote = explicitEligible ? (profile.getCountry() + " eligible") :
                (isGlobal ? "Worldwide eligible" : "Restricted location");

        int total = skillRatioPoints + expScore + catScore + countryScore;
        total = Math.min(99, Math.max(15, total));

        MatchResultDto.ScoreBreakdown breakdown = new MatchResultDto.ScoreBreakdown(
                skillRatioPoints, expScore, catScore, countryScore
        );

        return new MatchResultDto(gig, total, matchedSkills, missingSkills, countryEligible, countryNote, breakdown);
    }

    private boolean isSkillMatch(String u, String r) {
        String un = u.trim().toLowerCase();
        String rn = r.trim().toLowerCase();
        if (un.equals(rn) || un.contains(rn) || rn.contains(un)) return true;
        if ((un.equals("js") || un.equals("javascript")) && (rn.equals("js") || rn.equals("javascript"))) return true;
        if ((un.equals("py") || un.equals("python")) && (rn.equals("py") || rn.equals("python"))) return true;
        return false;
    }

    private List<String> parseJsonList(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
