import { GigListing } from "@/types/gig";
import { UserProfile } from "@/types/profile";
import { normalizeSkill } from "@/lib/taxonomy";
import { evaluateCountryEligibility, EligibilityDecision } from "@/lib/eligibility";

export interface DeterministicMatchResult {
  gigId: string;
  skillFitScore: number; // 0 - 100
  matchedSkills: string[];
  missingSkills: string[];
  explanationReasons: string[];
  missingSkillRecommendations: string[];
  eligibility: EligibilityDecision;
  algorithmVersion: string;
}

/**
 * Deterministic Matching Engine based on:
 * Skill Fit = (Sum(w_i * m_i) / Sum(w_i)) * 100
 */
export function calculateDeterministicMatch(
  profile: UserProfile,
  gig: GigListing
): DeterministicMatchResult {
  const profileSkills = profile.skills || [];

  // Normalize user skills to canonical names for strict matching
  const userSkillCanonicalSet = new Set<string>();
  for (const s of profileSkills) {
    const canonical = normalizeSkill(s);
    if (canonical) {
      userSkillCanonicalSet.add(canonical.name.toLowerCase());
      userSkillCanonicalSet.add(canonical.id.toLowerCase());
    } else {
      userSkillCanonicalSet.add(s.trim().toLowerCase());
    }
  }

  const requiredSkills = gig.skillsRequired || [];
  let totalWeight = 0;
  let matchedWeight = 0;

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  const explanationReasons: string[] = [];
  const missingSkillRecommendations: string[] = [];

  requiredSkills.forEach((reqSkill, index) => {
    // Primary core skill (first 2 required skills) receives weight 2.0; remaining receive 1.0
    const weight = index < 2 ? 2.0 : 1.0;
    totalWeight += weight;

    const canonicalReq = normalizeSkill(reqSkill);
    const reqClean = reqSkill.trim().toLowerCase();

    const isMatched =
      userSkillCanonicalSet.has(reqClean) ||
      (canonicalReq &&
        (userSkillCanonicalSet.has(canonicalReq.name.toLowerCase()) ||
          userSkillCanonicalSet.has(canonicalReq.id.toLowerCase())));

    if (isMatched) {
      matchedWeight += weight;
      matchedSkills.push(reqSkill);
      explanationReasons.push(
        `Strong match for ${reqSkill} supported by confirmed candidate profile.`
      );
    } else {
      missingSkills.push(reqSkill);
      missingSkillRecommendations.push(
        `Platform requires demonstrated ${reqSkill}. Complete our rubric assessment or add past projects to qualify.`
      );
    }
  });

  // Calculate deterministic score percentage
  const rawScore = totalWeight > 0 ? (matchedWeight / totalWeight) * 100 : 0;
  const skillFitScore = Math.round(rawScore * 10) / 10;

  // Evaluate Country Eligibility strictly separately (not modifying the skill score)
  const eligibility = evaluateCountryEligibility(gig.id, profile.countryCode || "IN");

  return {
    gigId: gig.id,
    skillFitScore,
    matchedSkills,
    missingSkills,
    explanationReasons,
    missingSkillRecommendations,
    eligibility,
    algorithmVersion: "v3.0-deterministic",
  };
}

/**
 * Calculates deterministic matches across all catalog listings
 */
export function calculateAllDeterministicMatches(
  profile: UserProfile,
  gigs: GigListing[]
): Record<string, DeterministicMatchResult> {
  const map: Record<string, DeterministicMatchResult> = {};
  for (const gig of gigs) {
    map[gig.id] = calculateDeterministicMatch(profile, gig);
  }
  return map;
}
