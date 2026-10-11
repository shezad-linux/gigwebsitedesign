/* ==============================================================================
   Explainable Rule-Based Talent Matching Engine
   Evaluates talent-to-request compatibility with clear human rationales
   ============================================================================== */

import { HireRequest, TalentProfile } from "./types";

export interface MatchEvaluationResult {
  score: number; // 0 - 100
  isRecommended: boolean; // score >= 60
  matchedSkills: string[];
  missingSkills: string[];
  rationale: string;
  explanations: string[];
  breakdown: {
    skillsScore: number; // 0 - 40
    categoryScore: number; // 0 - 20
    budgetScore: number; // 0 - 15
    experienceScore: number; // 0 - 15
    availabilityScore: number; // 0 - 10
  };
}

/**
 * Normalizes skill strings for robust matching
 */
function normalizeSkill(skill: string): string {
  return skill
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

/**
 * Checks skill equivalence including common aliases
 */
function areSkillsEquivalent(reqSkill: string, talentSkill: string): boolean {
  const a = normalizeSkill(reqSkill);
  const b = normalizeSkill(talentSkill);
  if (a === b) return true;

  // Synonyms and aliases
  const synonyms: [string, string][] = [
    ["react", "reactjs"],
    ["nextjs", "next"],
    ["nodejs", "node"],
    ["postgresql", "postgres"],
    ["typescript", "ts"],
    ["javascript", "js"],
    ["golang", "go"],
    ["vuejs", "vue"],
    ["tailwind", "tailwindcss"],
    ["ai", "machinelearning"],
    ["uiux", "figma"],
  ];

  return synonyms.some(
    ([x, y]) => (a === x && b === y) || (a === y && b === x)
  );
}

/**
 * Evaluates compatibility between a project request and a professional talent profile
 */
export function evaluateTalentMatch(
  request: HireRequest,
  talent: TalentProfile
): MatchEvaluationResult {
  const explanations: string[] = [];
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  // -------------------------------------------------------------
  // 1. Skill Overlap (0 - 40 points)
  // -------------------------------------------------------------
  const reqSkills = request.required_skills || [];
  const talentSkills = talent.skills || [];

  for (const rSkill of reqSkills) {
    const found = talentSkills.some((tSkill) => areSkillsEquivalent(rSkill, tSkill));
    if (found) {
      matchedSkills.push(rSkill);
    } else {
      missingSkills.push(rSkill);
    }
  }

  const skillCoverage = reqSkills.length > 0 ? matchedSkills.length / reqSkills.length : 1;
  const skillsScore = Math.round(skillCoverage * 40);

  if (matchedSkills.length === reqSkills.length && reqSkills.length > 0) {
    explanations.push(`Matches all required skills: ${matchedSkills.join(", ")}`);
  } else if (matchedSkills.length > 0) {
    explanations.push(
      `Matches ${matchedSkills.length}/${reqSkills.length} required skills (${matchedSkills.join(", ")})`
    );
  } else {
    explanations.push("Does not explicitly list required technical skills");
  }

  if (missingSkills.length > 0 && reqSkills.length > 0) {
    explanations.push(`Lacks listed experience with: ${missingSkills.join(", ")}`);
  }

  // -------------------------------------------------------------
  // 2. Category Alignment (0 - 20 points)
  // -------------------------------------------------------------
  let categoryScore = 0;
  const preferredCats = talent.preferred_categories || [];

  if (preferredCats.includes(request.category)) {
    categoryScore = 20;
    explanations.push(`Primary expertise in ${request.category.replace("-", " ")}`);
  } else {
    categoryScore = 5; // Cross-disciplinary baseline
  }

  // -------------------------------------------------------------
  // 3. Budget Compatibility (0 - 15 points)
  // -------------------------------------------------------------
  let budgetScore = 15;
  if (request.hiring_model === "hourly") {
    const talentRate = talent.hourly_rate;
    const maxBudget = request.budget_max || request.budget_min || 100;

    if (talentRate <= maxBudget) {
      budgetScore = 15;
      explanations.push(`Hourly rate ($${talentRate}/hr) fits within project budget ($${maxBudget}/hr max)`);
    } else if (talentRate <= maxBudget * 1.25) {
      budgetScore = 9;
      explanations.push(`Hourly rate ($${talentRate}/hr) slightly above budget target ($${maxBudget}/hr)`);
    } else {
      budgetScore = 3;
      explanations.push(`Hourly rate ($${talentRate}/hr) exceeds proposed budget range`);
    }
  } else {
    // Fixed project price
    const minProject = talent.min_project_budget || 200;
    const projectBudget = request.budget_max || request.budget_min || 1000;

    if (minProject <= projectBudget) {
      budgetScore = 15;
      explanations.push("Fixed project budget aligns with talent minimum engagement size");
    } else {
      budgetScore = 6;
      explanations.push("Project budget is below typical minimum engagement size");
    }
  }

  // -------------------------------------------------------------
  // 4. Experience Level (0 - 15 points)
  // -------------------------------------------------------------
  let experienceScore = 15;
  const expYears = talent.experience_years;

  if (request.experience_level === "expert") {
    if (expYears >= 5) {
      experienceScore = 15;
      explanations.push(`Senior profile with ${expYears}+ years of hands-on experience`);
    } else if (expYears >= 3) {
      experienceScore = 10;
      explanations.push(`Intermediate profile with ${expYears} years experience (requested senior/expert)`);
    } else {
      experienceScore = 4;
    }
  } else if (request.experience_level === "intermediate") {
    if (expYears >= 2) {
      experienceScore = 15;
      explanations.push(`Matches intermediate experience requirement (${expYears} years)`);
    } else {
      experienceScore = 8;
    }
  } else {
    experienceScore = 15;
    explanations.push("Qualified for entry/associate requirement");
  }

  // -------------------------------------------------------------
  // 5. Availability Status (0 - 10 points)
  // -------------------------------------------------------------
  let availabilityScore = 10;
  if (talent.availability_status === "available_now") {
    availabilityScore = 10;
    explanations.push(`Available immediately (${talent.availability_hours_per_week || 40} hrs/week)`);
  } else if (talent.availability_status === "available_part_time") {
    availabilityScore = 8;
    explanations.push("Available for part-time engagement");
  } else if (talent.availability_status === "busy") {
    availabilityScore = 4;
    explanations.push("Currently busy; start date may require coordination");
  } else {
    availabilityScore = 0;
    explanations.push("Currently marked not available");
  }

  // Verification status bonus / penalty
  if (talent.verification_status === "suspended") {
    return {
      score: 0,
      isRecommended: false,
      matchedSkills: [],
      missingSkills: reqSkills,
      rationale: "Account suspended from marketplace participation",
      explanations: ["Account suspended"],
      breakdown: {
        skillsScore: 0,
        categoryScore: 0,
        budgetScore: 0,
        experienceScore: 0,
        availabilityScore: 0,
      },
    };
  }

  const totalScore = Math.min(
    100,
    skillsScore + categoryScore + budgetScore + experienceScore + availabilityScore
  );

  const rationale = explanations.slice(0, 3).join("; ");

  return {
    score: totalScore,
    isRecommended: totalScore >= 60,
    matchedSkills,
    missingSkills,
    rationale,
    explanations,
    breakdown: {
      skillsScore,
      categoryScore,
      budgetScore,
      experienceScore,
      availabilityScore,
    },
  };
}

/**
 * Ranks a list of talent profiles for a given request
 */
export function rankTalentForRequest(
  request: HireRequest,
  talents: TalentProfile[]
): Array<{ talent: TalentProfile; evaluation: MatchEvaluationResult }> {
  return talents
    .filter((t) => t.verification_status !== "suspended")
    .map((talent) => ({
      talent,
      evaluation: evaluateTalentMatch(request, talent),
    }))
    .sort((a, b) => b.evaluation.score - a.evaluation.score);
}
