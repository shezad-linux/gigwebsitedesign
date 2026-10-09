import { GigListing, GigMatchScore } from "@/types/gig";
import { UserProfile } from "@/types/profile";

/**
 * Normalizes skill string for case-insensitive and punctuation-tolerant comparison
 */
export function normalizeSkill(skill: string): string {
  return skill.trim().toLowerCase().replace(/[\-_.]/g, " ");
}

/**
 * Checks whether user skills contain or closely match required skill
 */
export function matchesSkill(userSkill: string, reqSkill: string): boolean {
  const u = normalizeSkill(userSkill);
  const r = normalizeSkill(reqSkill);
  if (u === r) return true;
  if (u.includes(r) || r.includes(u)) return true;
  // Common aliases
  if ((u === "js" || u === "javascript") && (r === "javascript" || r === "js")) return true;
  if ((u === "py" || u === "python") && (r === "python" || r === "py")) return true;
  if ((u.includes("code review") && r.includes("code review")) || (u.includes("test") && r.includes("test"))) return true;
  return false;
}

/**
 * Computes individual match score and detailed explanations between a user profile and a gig listing
 */
export function calculateGigMatch(profile: UserProfile, gig: GigListing): GigMatchScore {
  const userSkills = profile.skills || [];
  const requiredSkills = gig.skillsRequired || [];

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const req of requiredSkills) {
    const isMatched = userSkills.some((u) => matchesSkill(u, req));
    if (isMatched) {
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  }

  // 1. Skill Score (Weight: 55 points)
  const skillRatio = requiredSkills.length > 0 ? matchedSkills.length / requiredSkills.length : 1;
  const skillScore = Math.round(skillRatio * 55);

  // 2. Experience Level Fit (Weight: 15 points)
  let experienceScore = 10;
  if (gig.experienceLevel) {
    if (gig.experienceLevel === profile.experienceLevel) {
      experienceScore = 15;
    } else if (
      (profile.experienceLevel === "expert" && gig.experienceLevel === "mid") ||
      (profile.experienceLevel === "mid" && gig.experienceLevel === "entry")
    ) {
      experienceScore = 13;
    } else if (profile.experienceLevel === "entry" && gig.experienceLevel === "mid") {
      experienceScore = 8;
    } else {
      experienceScore = 5;
    }
  }

  // 3. Category Fit (Weight: 15 points)
  const desiresCategory = (profile.desiredCategories || []).some(
    (c) => c.toLowerCase() === gig.category.toLowerCase()
  );
  const categoryScore = desiresCategory ? 15 : 8;

  // 4. Country Eligibility Fit (Weight: 15 points)
  const isGlobal = gig.eligibleCountries.some((c) => c.toLowerCase() === "global" || c.toLowerCase() === "all");
  const userCountry = profile.country?.trim().toLowerCase() || "";
  const userCountryCode = profile.countryCode?.trim().toUpperCase() || "";

  const explicitlyEligible = gig.eligibleCountries.some((c) => {
    const cl = c.trim().toLowerCase();
    return cl === userCountry || cl === userCountryCode.toLowerCase() || (userCountry === "india" && cl === "in") || (userCountry === "united states" && (cl === "us" || cl === "usa"));
  });

  const isCountryEligible = isGlobal || explicitlyEligible;
  let countryFitScore = 5;
  let countryNote = "Geographic eligibility requires verification";

  if (explicitlyEligible) {
    countryFitScore = 15;
    countryNote = `${profile.country || "Your country"} eligible`;
  } else if (isGlobal) {
    countryFitScore = 13;
    countryNote = "Worldwide / Global eligibility";
  } else {
    countryFitScore = 2;
    countryNote = `Restricted to: ${gig.eligibleCountries.slice(0, 3).join(", ")}`;
  }

  // Total raw score
  let totalScore = skillScore + experienceScore + categoryScore + countryFitScore;

  // Boundary check
  totalScore = Math.min(99, Math.max(15, totalScore));

  return {
    gigId: gig.id,
    matchScore: totalScore,
    matchedSkills,
    missingSkills,
    isCountryEligible,
    countryNote,
    scoreBreakdown: {
      skillScore,
      experienceScore,
      categoryScore,
      countryFitScore,
    },
  };
}

/**
 * Calculate match scores for an array of gigs against a user profile
 */
export function calculateAllMatches(profile: UserProfile, gigs: GigListing[]): Record<string, GigMatchScore> {
  const results: Record<string, GigMatchScore> = {};
  for (const gig of gigs) {
    results[gig.id] = calculateGigMatch(profile, gig);
  }
  return results;
}
