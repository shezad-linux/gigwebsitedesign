package com.gigmatcher.matching;

import com.gigmatcher.gig.GigListing;

import java.util.List;

public class MatchResultDto {
    private GigListing gig;
    private int matchScore;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private boolean countryEligible;
    private String countryNote;
    private ScoreBreakdown scoreBreakdown;

    public static class ScoreBreakdown {
        private int skillScore;
        private int experienceScore;
        private int categoryScore;
        private int countryFitScore;

        public ScoreBreakdown(int skillScore, int experienceScore, int categoryScore, int countryFitScore) {
            this.skillScore = skillScore;
            this.experienceScore = experienceScore;
            this.categoryScore = categoryScore;
            this.countryFitScore = countryFitScore;
        }

        public int getSkillScore() {
            return skillScore;
        }

        public int getExperienceScore() {
            return experienceScore;
        }

        public int getCategoryScore() {
            return categoryScore;
        }

        public int getCountryFitScore() {
            return countryFitScore;
        }
    }

    public MatchResultDto() {
    }

    public MatchResultDto(GigListing gig, int matchScore, List<String> matchedSkills,
                          List<String> missingSkills, boolean countryEligible,
                          String countryNote, ScoreBreakdown scoreBreakdown) {
        this.gig = gig;
        this.matchScore = matchScore;
        this.matchedSkills = matchedSkills;
        this.missingSkills = missingSkills;
        this.countryEligible = countryEligible;
        this.countryNote = countryNote;
        this.scoreBreakdown = scoreBreakdown;
    }

    public GigListing getGig() {
        return gig;
    }

    public int getMatchScore() {
        return matchScore;
    }

    public List<String> getMatchedSkills() {
        return matchedSkills;
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }

    public boolean isCountryEligible() {
        return countryEligible;
    }

    public String getCountryNote() {
        return countryNote;
    }

    public ScoreBreakdown getScoreBreakdown() {
        return scoreBreakdown;
    }
}
