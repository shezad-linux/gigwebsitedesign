import { CANONICAL_SKILLS, SKILL_ALIASES, CanonicalSkill } from "@/data/taxonomy";

const CANONICAL_MAP = new Map<string, CanonicalSkill>();
const LOWERCASE_MAP = new Map<string, CanonicalSkill>();

// Initialize fast lookup maps
CANONICAL_SKILLS.forEach((skill) => {
  CANONICAL_MAP.set(skill.id, skill);
  LOWERCASE_MAP.set(skill.name.toLowerCase(), skill);
});

/**
 * Normalizes an arbitrary skill name string to its canonical skill object
 * using exact match, alias lookup, or fuzzy normalization.
 */
export function normalizeSkill(raw: string): CanonicalSkill | null {
  if (!raw || typeof raw !== "string") return null;
  const clean = raw.trim().toLowerCase();

  // 1. Direct lowercase match on canonical name
  if (LOWERCASE_MAP.has(clean)) {
    return LOWERCASE_MAP.get(clean)!;
  }

  // 2. Direct match on canonical slug ID
  if (CANONICAL_MAP.has(clean)) {
    return CANONICAL_MAP.get(clean)!;
  }

  // 3. Alias dictionary resolution
  const resolvedId = SKILL_ALIASES[clean];
  if (resolvedId && CANONICAL_MAP.has(resolvedId)) {
    return CANONICAL_MAP.get(resolvedId)!;
  }

  // 4. Substring heuristics
  for (const skill of CANONICAL_SKILLS) {
    if (clean.includes(skill.id) || clean.includes(skill.name.toLowerCase())) {
      return skill;
    }
  }

  return null;
}

/**
 * Canonicalizes an array of skills, deduping and recording alias mapping
 */
export function canonicalizeSkillList(rawSkills: string[]): {
  canonicalNames: string[];
  canonicalIds: string[];
  unmatched: string[];
  resolvedMap: Record<string, string>;
} {
  const seenIds = new Set<string>();
  const canonicalNames: string[] = [];
  const canonicalIds: string[] = [];
  const unmatched: string[] = [];
  const resolvedMap: Record<string, string> = {};

  for (const raw of rawSkills) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    const matched = normalizeSkill(trimmed);
    if (matched) {
      if (!seenIds.has(matched.id)) {
        seenIds.add(matched.id);
        canonicalNames.push(matched.name);
        canonicalIds.push(matched.id);
      }
      resolvedMap[trimmed] = matched.name;
    } else {
      unmatched.push(trimmed);
    }
  }

  return {
    canonicalNames,
    canonicalIds,
    unmatched,
    resolvedMap,
  };
}
