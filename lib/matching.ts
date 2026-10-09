import { GigListing, GigMatchScore } from "@/types/gig";
import { UserProfile } from "@/types/profile";
import { normalizeSkill } from "@/lib/taxonomy";
import { evaluateCountryEligibility } from "@/lib/eligibility";

/**
 * Checks whether user skills contain or closely match required skill
 * using canonical taxonomy resolution and alias lookups.
 */
export function matchesSkill(userSkill: string, reqSkill: string): boolean {
  const uCanonical = normalizeSkill(userSkill);
  const rCanonical = normalizeSkill(reqSkill);

  if (uCanonical && rCanonical && uCanonical.id === rCanonical.id) {
    return true;
  }

  const u = userSkill.trim().toLowerCase();
  const r = reqSkill.trim().toLowerCase();
  if (u === r) return true;
  if (u.includes(r) || r.includes(u)) return true;

  return false;
}

/**
 * Phase 3 Deterministic Matching Engine:
 * Skill Fit = (Sum(w_i * m_i) / Sum(w_i)) * 100
 *
 * Sourced Country Eligibility is evaluated independently via reviewable evidence.
 */
export function calculateGigMatch(profile: UserProfile, gig: GigListing): GigMatchScore {
  const userSkills = profile.skills || [];
  const requiredSkills = gig.skillsRequired || [];

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  let totalWeight = 0;
  let matchedWeight = 0;

  requiredSkills.forEach((reqSkill, idx) => {
    // Core requirements weighted higher (weight: 2 for first 2 items, 1 for remaining)
    const weight = idx < 2 ? 2.0 : 1.0;
    totalWeight += weight;

    const isMatched = userSkills.some((u) => matchesSkill(u, reqSkill));
    if (isMatched) {
      matchedWeight += weight;
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  });

  // Calculate deterministic skill fit score (0 - 100)
  const rawSkillFit = totalWeight > 0 ? (matchedWeight / totalWeight) * 100 : 100;
  const skillScore = Math.round(rawSkillFit);

  // Country eligibility evaluated via maintained evidence (not AI guess)
  const eligibility = evaluateCountryEligibility(gig.id, profile.countryCode || "IN");

  // Experience level alignment (informational breakdown)
  let experienceScore = 12;
  if (gig.experienceLevel && profile.experienceLevel) {
    if (gig.experienceLevel === profile.experienceLevel) {
      experienceScore = 15;
    } else if (profile.experienceLevel === "expert") {
      experienceScore = 14;
    } else {
      experienceScore = 8;
    }
  }

  const desiresCategory = (profile.desiredCategories || []).some(
    (c) => c.toLowerCase() === gig.category.toLowerCase()
  );
  const categoryScore = desiresCategory ? 15 : 10;
  const countryFitScore = eligibility.isEligible ? 15 : 5;

  return {
    gigId: gig.id,
    matchScore: skillScore, // Deterministic Skill Fit Formula
    matchedSkills,
    missingSkills,
    isCountryEligible: eligibility.isEligible,
    countryNote: eligibility.label,
    scoreBreakdown: {
      skillScore,
      experienceScore,
      categoryScore,
      countryFitScore,
    },
  };
}

/**
 * Calculate match scores for all catalog listings
 */
export function calculateAllMatches(
  profile: UserProfile,
  gigs: GigListing[]
): Record<string, GigMatchScore> {
  const results: Record<string, GigMatchScore> = {};
  for (const gig of gigs) {
    results[gig.id] = calculateGigMatch(profile, gig);
  }
  return results;
}
