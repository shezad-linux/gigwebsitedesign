import { test, describe } from "node:test";
import assert from "node:assert/strict";

/* ==============================================================================
   Hire Talent Matching & AI Scope Assistant Test Suite
   Verifies multi-factor explainable matching (0-100) and AI scope breakdown
   ============================================================================== */

describe("Hire Talent Matching Engine & AI Scope Suite", () => {
  // Matching Engine Implementation under test
  function evaluateTalentMatch(request, talent) {
    const weights = {
      skills: 40,
      category: 20,
      budget: 15,
      experience: 15,
      availability: 10,
    };

    const details = {
      skillsScore: 0,
      categoryScore: 0,
      budgetScore: 0,
      experienceScore: 0,
      availabilityScore: 0,
      matchedSkills: [],
      missingSkills: [],
      rationaleNotes: [],
    };

    // 1. Skill Overlap (40%)
    const reqSkills = (request.required_skills || []).map((s) => s.toLowerCase());
    const talentSkills = (talent.skills || []).map((s) => s.toLowerCase());

    if (reqSkills.length > 0) {
      const matched = request.required_skills.filter((s) =>
        talentSkills.includes(s.toLowerCase())
      );
      const missing = request.required_skills.filter(
        (s) => !talentSkills.includes(s.toLowerCase())
      );

      details.matchedSkills = matched;
      details.missingSkills = missing;

      const overlapRatio = matched.length / reqSkills.length;
      details.skillsScore = Math.round(overlapRatio * weights.skills);

      if (matched.length > 0) {
        details.rationaleNotes.push(`Strong overlap in ${matched.join(", ")}`);
      }
      if (missing.length > 0) {
        details.rationaleNotes.push(`Could benefit from assistance in ${missing.join(", ")}`);
      }
    } else {
      details.skillsScore = weights.skills;
    }

    // 2. Category Match (20%)
    const talentCats = talent.preferred_categories || [];
    if (talentCats.includes(request.category)) {
      details.categoryScore = weights.category;
      details.rationaleNotes.push(`Direct experience in category (${request.category})`);
    } else {
      details.categoryScore = Math.round(weights.category * 0.3);
    }

    // 3. Budget Fit (15%)
    if (request.hiring_model === "hourly") {
      const budgetMax = request.budget_max || request.budget_min || 0;
      if (budgetMax > 0) {
        if (talent.hourly_rate <= budgetMax) {
          details.budgetScore = weights.budget;
          details.rationaleNotes.push(`Rate of $${talent.hourly_rate}/hr aligns with client budget`);
        } else {
          const ratio = budgetMax / talent.hourly_rate;
          details.budgetScore = Math.max(0, Math.round(ratio * weights.budget));
          details.rationaleNotes.push(`Rate ($${talent.hourly_rate}/hr) slightly above client max ($${budgetMax}/hr)`);
        }
      } else {
        details.budgetScore = weights.budget;
      }
    } else {
      details.budgetScore = weights.budget;
    }

    // 4. Experience Fit (15%)
    const reqExpLevel = request.experience_level || "intermediate";
    const years = talent.experience_years || 0;

    let targetMinYears = 1;
    if (reqExpLevel === "intermediate") targetMinYears = 3;
    if (reqExpLevel === "expert") targetMinYears = 6;

    if (years >= targetMinYears) {
      details.experienceScore = weights.experience;
      details.rationaleNotes.push(`Proven seniority (${years}+ years professional experience)`);
    } else {
      const expRatio = years / targetMinYears;
      details.experienceScore = Math.round(expRatio * weights.experience);
    }

    // 5. Availability (10%)
    if (talent.availability_status === "available_now") {
      details.availabilityScore = weights.availability;
      details.rationaleNotes.push("Available immediately for onboarding");
    } else if (talent.availability_status === "available_part_time") {
      details.availabilityScore = Math.round(weights.availability * 0.7);
    } else if (talent.availability_status === "busy") {
      details.availabilityScore = Math.round(weights.availability * 0.2);
    } else {
      details.availabilityScore = 0;
    }

    const totalScore = Math.min(
      100,
      Math.max(
        0,
        details.skillsScore +
          details.categoryScore +
          details.budgetScore +
          details.experienceScore +
          details.availabilityScore
      )
    );

    return {
      score: totalScore,
      details,
      rationale: details.rationaleNotes.join("; ") || "Verified talent fit for project requirements.",
    };
  }

  // AI Scope Assistant Implementation under test
  function analyzeProjectScope(title, description, category) {
    const text = `${title} ${description}`.toLowerCase();
    const missingItems = [];
    const suggestedSkills = [];
    const clarificationQuestions = [];

    // Deliverables check
    if (!description.includes("deliver") && !description.includes("feature") && !description.includes("screen")) {
      missingItems.push("Specific milestone deliverables or output artifacts");
      clarificationQuestions.push("What concrete deliverables or components are required upon completion?");
    }

    // Timeline check
    if (!text.includes("week") && !text.includes("month") && !text.includes("deadline") && !text.includes("timeline")) {
      missingItems.push("Target delivery date or preferred timeline");
      clarificationQuestions.push("What is your expected timeline or target launch date?");
    }

    // Skill heuristics
    const skillDictionary = [
      { name: "Next.js", keywords: ["next.js", "nextjs", "react", "app router"] },
      { name: "TypeScript", keywords: ["typescript", "ts", "type-safe"] },
      { name: "React Native", keywords: ["react native", "ios", "android", "mobile app"] },
      { name: "Flutter", keywords: ["flutter", "dart"] },
      { name: "PostgreSQL", keywords: ["postgres", "postgresql", "sql", "supabase", "database"] },
      { name: "Figma", keywords: ["figma", "ui", "ux", "wireframe", "prototype"] },
      { name: "Python", keywords: ["python", "django", "fastapi", "ai", "machine learning"] },
      { name: "OpenAI API", keywords: ["openai", "gpt", "llm", "rag", "langchain"] },
      { name: "Google Ads", keywords: ["google ads", "ppc", "ad spend", "sem"] },
    ];

    skillDictionary.forEach((item) => {
      if (item.keywords.some((k) => text.includes(k))) {
        suggestedSkills.push(item.name);
      }
    });

    // Completeness calculation
    let completeness = 40;
    if (description.length > 100) completeness += 20;
    if (suggestedSkills.length >= 2) completeness += 20;
    if (missingItems.length === 0) completeness += 20;

    return {
      completenessScore: Math.min(100, completeness),
      missingItems,
      suggestedSkills,
      clarificationQuestions,
    };
  }

  /* -------------------------------------------------------------------------- */
  /* Matching Engine Unit Tests                                                 */
  /* -------------------------------------------------------------------------- */

  test("calculates near-perfect match score (>=95%) for ideal candidate", () => {
    const request = {
      category: "software-web",
      hiring_model: "hourly",
      budget_max: 95,
      required_skills: ["Next.js", "TypeScript", "PostgreSQL"],
      experience_level: "expert",
    };

    const talent = {
      preferred_categories: ["software-web"],
      hourly_rate: 85, // within budget
      skills: ["Next.js", "TypeScript", "PostgreSQL", "Docker"],
      experience_years: 8, // exceeds expert target of 6
      availability_status: "available_now", // 10 pts
    };

    const result = evaluateTalentMatch(request, talent);
    assert.ok(result.score >= 95, `Expected score >= 95, got ${result.score}`);
    assert.equal(result.details.skillsScore, 40); // 100% of 40
    assert.equal(result.details.categoryScore, 20); // 20
    assert.equal(result.details.budgetScore, 15); // 15
    assert.equal(result.details.experienceScore, 15); // 15
    assert.equal(result.details.availabilityScore, 10); // 10
    assert.equal(result.score, 100);
  });

  test("penalizes score when skills do not overlap", () => {
    const request = {
      category: "software-web",
      hiring_model: "hourly",
      budget_max: 90,
      required_skills: ["Next.js", "TypeScript", "PostgreSQL"],
      experience_level: "intermediate",
    };

    const talent = {
      preferred_categories: ["software-web"],
      hourly_rate: 80,
      skills: ["Python", "PyTorch", "LangChain"], // Disjoint skills
      experience_years: 5,
      availability_status: "available_now",
    };

    const result = evaluateTalentMatch(request, talent);
    assert.equal(result.details.skillsScore, 0);
    assert.ok(result.score <= 60, `Expected score <= 60 without skills, got ${result.score}`);
    assert.ok(result.details.missingSkills.includes("Next.js"));
  });

  test("reduces budget score when talent hourly rate exceeds client maximum", () => {
    const request = {
      category: "software-web",
      hiring_model: "hourly",
      budget_max: 60,
      required_skills: ["React"],
      experience_level: "intermediate",
    };

    const talentWithinBudget = {
      preferred_categories: ["software-web"],
      hourly_rate: 55,
      skills: ["React"],
      experience_years: 4,
      availability_status: "available_now",
    };

    const talentOverBudget = {
      preferred_categories: ["software-web"],
      hourly_rate: 120, // double client max!
      skills: ["React"],
      experience_years: 4,
      availability_status: "available_now",
    };

    const resWithin = evaluateTalentMatch(request, talentWithinBudget);
    const resOver = evaluateTalentMatch(request, talentOverBudget);

    assert.equal(resWithin.details.budgetScore, 15);
    assert.ok(resOver.details.budgetScore < 10, "Expected lower budget score for over-budget talent");
    assert.ok(resWithin.score > resOver.score);
  });

  test("reduces category score when talent preferred categories do not match", () => {
    const request = {
      category: "ai-automation",
      hiring_model: "hourly",
      budget_max: 90,
      required_skills: ["Python"],
      experience_level: "intermediate",
    };

    const talentMatching = {
      preferred_categories: ["ai-automation"],
      hourly_rate: 80,
      skills: ["Python"],
      experience_years: 4,
      availability_status: "available_now",
    };

    const talentNonMatching = {
      preferred_categories: ["digital-marketing"], // different category
      hourly_rate: 80,
      skills: ["Python"],
      experience_years: 4,
      availability_status: "available_now",
    };

    const resMatch = evaluateTalentMatch(request, talentMatching);
    const resNonMatch = evaluateTalentMatch(request, talentNonMatching);

    assert.equal(resMatch.details.categoryScore, 20);
    assert.ok(resNonMatch.details.categoryScore < 10);
    assert.ok(resMatch.score > resNonMatch.score);
  });

  test("reflects availability tiers accurately (available_now > part_time > busy > not_available)", () => {
    const baseRequest = {
      category: "software-web",
      hiring_model: "hourly",
      budget_max: 80,
      required_skills: ["TypeScript"],
      experience_level: "intermediate",
    };

    const makeTalent = (status) => ({
      preferred_categories: ["software-web"],
      hourly_rate: 75,
      skills: ["TypeScript"],
      experience_years: 4,
      availability_status: status,
    });

    const scoreNow = evaluateTalentMatch(baseRequest, makeTalent("available_now")).details.availabilityScore;
    const scorePartTime = evaluateTalentMatch(baseRequest, makeTalent("available_part_time")).details.availabilityScore;
    const scoreBusy = evaluateTalentMatch(baseRequest, makeTalent("busy")).details.availabilityScore;
    const scoreNotAvail = evaluateTalentMatch(baseRequest, makeTalent("not_available")).details.availabilityScore;

    assert.equal(scoreNow, 10);
    assert.equal(scorePartTime, 7);
    assert.equal(scoreBusy, 2);
    assert.equal(scoreNotAvail, 0);
  });

  /* -------------------------------------------------------------------------- */
  /* AI Scope Assistant Tests                                                   */
  /* -------------------------------------------------------------------------- */

  test("identifies missing timeline and deliverables in vague project briefs", () => {
    const analysis = analyzeProjectScope(
      "Need a Next.js Developer",
      "We want to rebuild our application from scratch with modern technology."
    );

    assert.ok(analysis.missingItems.some((m) => m.includes("deliverable")));
    assert.ok(analysis.missingItems.some((m) => m.includes("timeline")));
    assert.ok(analysis.clarificationQuestions.length >= 2);
  });

  test("extracts relevant skills based on technology keywords in brief", () => {
    const analysis = analyzeProjectScope(
      "Healthcare Telehealth Patient Portal (React Native & PostgreSQL)",
      "Build a cross-platform mobile app with iOS and Android support, video calling, and a secure Supabase database."
    );

    assert.ok(analysis.suggestedSkills.includes("React Native"));
    assert.ok(analysis.suggestedSkills.includes("PostgreSQL"));
  });

  test("scores project completeness higher when requirements and timeline are provided", () => {
    const vagueAnalysis = analyzeProjectScope(
      "Short Project",
      "Short brief."
    );

    const detailedAnalysis = analyzeProjectScope(
      "Full-Stack Next.js 15 Platform Redesign",
      "We are looking for a senior full-stack developer to deliver our authentication screen, dashboard components, and customer billing page over a 6-week timeline with TypeScript."
    );

    assert.ok(detailedAnalysis.completenessScore > vagueAnalysis.completenessScore);
    assert.equal(detailedAnalysis.completenessScore, 100);
  });
});
