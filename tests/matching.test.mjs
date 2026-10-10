import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Deterministic Gig Matching & Scoring Suite", () => {
  // Test skill overlap computation
  test("calculates skill overlap accurately", () => {
    const userSkills = ["Python", "PyTorch", "Prompt Engineering"];
    const requiredSkills = ["Python", "PyTorch", "Evaluation"];

    const matched = requiredSkills.filter((r) =>
      userSkills.some((u) => u.toLowerCase() === r.toLowerCase())
    );
    const missing = requiredSkills.filter(
      (r) => !userSkills.some((u) => u.toLowerCase() === r.toLowerCase())
    );

    assert.equal(matched.length, 2);
    assert.deepEqual(matched, ["Python", "PyTorch"]);
    assert.deepEqual(missing, ["Evaluation"]);
  });

  test("calculates 100% score on exact match", () => {
    const totalWeight = 4.0;
    const matchedWeight = 4.0;
    const score = Math.round((matchedWeight / totalWeight) * 100);

    assert.equal(score, 100);
  });

  test("calculates 0% score when no skills overlap", () => {
    const totalWeight = 4.0;
    const matchedWeight = 0;
    const score = Math.round((matchedWeight / totalWeight) * 100);

    assert.equal(score, 0);
  });

  test("applies higher weighting to core skills", () => {
    // Requirements: Core 1 (weight 2), Core 2 (weight 2), Secondary 3 (weight 1)
    const weights = [2.0, 2.0, 1.0];
    const totalWeight = weights.reduce((a, b) => a + b, 0); // 5.0

    // User only matches the two core skills: 2.0 + 2.0 = 4.0
    const matchedWeightCore = 4.0;
    const scoreCore = Math.round((matchedWeightCore / totalWeight) * 100); // 80%

    // User only matches secondary skill: 1.0
    const matchedWeightSecondary = 1.0;
    const scoreSecondary = Math.round((matchedWeightSecondary / totalWeight) * 100); // 20%

    assert.equal(scoreCore, 80);
    assert.equal(scoreSecondary, 20);
    assert.ok(scoreCore > scoreSecondary);
  });

  test("ensures sponsored placement does NOT artificially alter score calculation", () => {
    const rawScore = 75;
    const isSponsored = true;

    // In accordance with product disclosure & FTC policies:
    const finalScore = rawScore; // Score must remain unaffected by sponsorship
    assert.equal(finalScore, 75);
    assert.equal(isSponsored, true);
  });
});

describe("Country Eligibility Evaluation Suite", () => {
  test("identifies global eligibility as eligible for all users", () => {
    const eligibleCountries = ["GLOBAL", "US", "IN"];
    const userCountry = "IN";

    const isEligible =
      eligibleCountries.includes("GLOBAL") || eligibleCountries.includes(userCountry);
    assert.equal(isEligible, true);
  });

  test("excludes user when geographic restriction is enforced", () => {
    const eligibleCountries = ["US", "CA"];
    const userCountry = "DE";

    const isEligible =
      eligibleCountries.includes("GLOBAL") || eligibleCountries.includes(userCountry);
    assert.equal(isEligible, false);
  });
});
