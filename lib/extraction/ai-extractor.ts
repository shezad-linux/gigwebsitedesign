import { CANONICAL_SKILLS, SKILL_ALIASES } from "@/data/taxonomy";
import { canonicalizeSkillList, normalizeSkill } from "@/lib/taxonomy";

export interface SkillEvidence {
  skill: string;
  sourceSection: string;
  contextSnippet?: string;
  confidence?: number;
}

export interface ExtractedProfileData {
  fullName?: string;
  email?: string;
  skills: string[];
  tools: string[];
  experienceLevel: "entry_level" | "mid_level" | "senior" | "expert";
  yearsOfExperience: number;
  evidence: SkillEvidence[];
  summary: string;
  needsUserReview: boolean;
}

/**
 * Parses resume text into standard sections
 */
function identifySections(text: string): Record<string, string> {
  const sections: Record<string, string> = {
    summary: "",
    skills: "",
    experience: "",
    projects: "",
    education: "",
    general: text,
  };

  const lines = text.split("\n");
  let currentSection = "general";
  let sectionBuffers: Record<string, string[]> = {
    summary: [],
    skills: [],
    experience: [],
    projects: [],
    education: [],
    general: [],
  };

  for (const line of lines) {
    const trimmed = line.trim();
    const lower = trimmed.toLowerCase();

    if (
      lower.includes("technical skills") ||
      lower.includes("skills & technologies") ||
      lower === "skills"
    ) {
      currentSection = "skills";
    } else if (
      lower.includes("work experience") ||
      lower.includes("employment") ||
      lower.includes("professional experience")
    ) {
      currentSection = "experience";
    } else if (
      lower.includes("projects") ||
      lower.includes("personal projects") ||
      lower.includes("key projects")
    ) {
      currentSection = "projects";
    } else if (lower.includes("education") || lower.includes("academic")) {
      currentSection = "education";
    } else if (lower.includes("summary") || lower.includes("about me") || lower.includes("profile")) {
      currentSection = "summary";
    }

    sectionBuffers[currentSection].push(trimmed);
  }

  for (const key of Object.keys(sectionBuffers)) {
    sections[key] = sectionBuffers[key].join("\n");
  }

  return sections;
}

/**
 * Rule-based semantic extraction with evidence mapping
 */
function heuristicExtract(text: string): ExtractedProfileData {
  const sections = identifySections(text);
  const foundSkillsSet = new Set<string>();
  const toolsSet = new Set<string>();
  const evidenceList: SkillEvidence[] = [];

  // Check section by section for skills
  const checkSection = (content: string, sectionName: string) => {
    if (!content) return;
    const lower = content.toLowerCase();

    for (const canonical of CANONICAL_SKILLS) {
      const idMatch = new RegExp(`\\b${canonical.id}\\b`, "i").test(content);
      const nameMatch = new RegExp(`\\b${canonical.name.replace("+", "\\+")}\\b`, "i").test(content);

      if (idMatch || nameMatch) {
        if (!foundSkillsSet.has(canonical.name)) {
          foundSkillsSet.add(canonical.name);
          evidenceList.push({
            skill: canonical.name,
            sourceSection: sectionName,
            confidence: sectionName === "Projects" || sectionName === "Work Experience" ? 0.95 : 0.85,
          });
        }
      }
    }

    // Check aliases
    for (const [alias, canonicalId] of Object.entries(SKILL_ALIASES)) {
      if (new RegExp(`\\b${alias.replace("+", "\\+")}\\b`, "i").test(content)) {
        const canonical = CANONICAL_SKILLS.find((s) => s.id === canonicalId);
        if (canonical && !foundSkillsSet.has(canonical.name)) {
          foundSkillsSet.add(canonical.name);
          evidenceList.push({
            skill: canonical.name,
            sourceSection: sectionName,
            contextSnippet: `Mentioned as "${alias}"`,
            confidence: 0.9,
          });
        }
      }
    }

    // Common tools check
    const commonTools = ["Git", "Docker", "Postman", "VS Code", "IntelliJ", "Jira", "Kubernetes", "Linux"];
    for (const tool of commonTools) {
      if (new RegExp(`\\b${tool}\\b`, "i").test(content)) {
        toolsSet.add(tool);
      }
    }
  };

  checkSection(sections.projects, "Projects");
  checkSection(sections.experience, "Work Experience");
  checkSection(sections.skills, "Technical Skills");
  checkSection(sections.education, "Education");
  checkSection(sections.general, "Resume Overview");

  // Infer experience level & years
  let years = 1.5;
  let level: ExtractedProfileData["experienceLevel"] = "entry_level";

  const yearMatches = text.match(/\b(201[5-9]|202[0-6])\b/g);
  if (yearMatches && yearMatches.length >= 2) {
    const sorted = yearMatches.map(Number).sort();
    const diff = sorted[sorted.length - 1] - sorted[0];
    if (diff > 0) years = Math.min(diff, 10);
  }

  if (years >= 5 || text.toLowerCase().includes("senior") || text.toLowerCase().includes("lead")) {
    level = "senior";
  } else if (years >= 2) {
    level = "mid_level";
  }

  const { canonicalNames } = canonicalizeSkillList(Array.from(foundSkillsSet));

  return {
    skills: canonicalNames,
    tools: Array.from(toolsSet),
    experienceLevel: level,
    yearsOfExperience: years,
    evidence: evidenceList,
    summary: `Candidate with demonstrated background in ${canonicalNames.slice(0, 3).join(", ")}.`,
    needsUserReview: true,
  };
}

/**
 * Main server-side AI skill extraction entrypoint
 */
export async function extractStructuredProfile(resumeText: string): Promise<ExtractedProfileData> {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (geminiApiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an expert AI talent recruiter. Analyze the following resume text and extract facts supported strictly by the resume.
Return a valid JSON object matching this schema:
{
  "skills": ["Java", "Python", "SQL", "Code Review"],
  "tools": ["Git", "Docker"],
  "experienceLevel": "entry_level" | "mid_level" | "senior" | "expert",
  "yearsOfExperience": number,
  "evidence": [
    { "skill": "Java", "sourceSection": "Projects" | "Work Experience" | "Skills", "contextSnippet": "..." }
  ],
  "summary": "1-2 sentence factual summary",
  "needsUserReview": true
}

Resume Text:
${resumeText.slice(0, 12000)}`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.1,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          const { canonicalNames } = canonicalizeSkillList(parsed.skills || []);

          return {
            skills: canonicalNames,
            tools: parsed.tools || [],
            experienceLevel: parsed.experienceLevel || "mid_level",
            yearsOfExperience: Number(parsed.yearsOfExperience) || 2,
            evidence: parsed.evidence || [],
            summary: parsed.summary || "Extracted via Gemini AI.",
            needsUserReview: true,
          };
        }
      }
    } catch (llmErr) {
      console.warn("LLM API call failed, falling back to heuristic parsing:", llmErr);
    }
  }

  // Graceful fallback to section-aware heuristic extraction
  return heuristicExtract(resumeText);
}
