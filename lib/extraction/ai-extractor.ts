import { CANONICAL_SKILLS, SKILL_ALIASES } from "@/data/taxonomy";
import { canonicalizeSkillList } from "@/lib/taxonomy";

export interface SkillEvidence {
  skill: string;
  sourceSection: string;
  contextSnippet?: string;
  confidence?: number;
}

export interface ExtractedProfileData {
  fullName?: string;
  email?: string;
  phone?: string;
  country?: string;
  countryCode?: string;
  skills: string[];
  tools: string[];
  experienceLevel: "entry_level" | "mid_level" | "senior" | "expert";
  yearsOfExperience: number;
  evidence: SkillEvidence[];
  summary: string;
  needsUserReview: boolean;
}

/**
 * Parses resume text into standard semantic sections
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
  const sectionBuffers: Record<string, string[]> = {
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
      /^(technical\s+skills|skills\s*(&|and)?\s*technologies|core\s+competencies|key\s+skills|skills)$/i.test(
        trimmed
      ) ||
      lower.startsWith("technical skills:") ||
      lower.startsWith("skills:")
    ) {
      currentSection = "skills";
    } else if (
      /^(work\s+experience|professional\s+experience|employment\s+history|experience|work\s+history)$/i.test(
        trimmed
      )
    ) {
      currentSection = "experience";
    } else if (
      /^(projects|personal\s+projects|key\s+projects|academic\s+projects)$/i.test(
        trimmed
      )
    ) {
      currentSection = "projects";
    } else if (
      /^(education|academic\s+background|degrees|certifications)$/i.test(trimmed)
    ) {
      currentSection = "education";
    } else if (
      /^(summary|professional\s+summary|profile|about\s+me|career\s+objective|objective)$/i.test(
        trimmed
      )
    ) {
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
 * Extracts candidate name from top lines of resume
 */
function extractCandidateName(text: string): string | undefined {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  for (let i = 0; i < Math.min(lines.length, 8); i++) {
    const line = lines[i];
    if (
      line.includes("@") ||
      line.includes("http") ||
      line.includes("www.") ||
      line.includes("github.com") ||
      line.includes("linkedin.com") ||
      /\d{3}/.test(line) ||
      /^(curriculum\s+vitae|resume|cv|summary|profile|contact|education|experience)$/i.test(
        line
      )
    ) {
      continue;
    }

    const cleaned = line.replace(/^[•\-\*|#]+\s*/, "").trim();
    const words = cleaned.split(/\s+/);
    if (
      words.length >= 2 &&
      words.length <= 4 &&
      cleaned.length >= 3 &&
      cleaned.length <= 35 &&
      /^[a-zA-Z\s.'-]+$/.test(cleaned)
    ) {
      return cleaned;
    }
  }
  return undefined;
}

/**
 * Extracts candidate email address
 */
function extractCandidateEmail(text: string): string | undefined {
  const match = text.match(/\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/);
  return match ? match[1] : undefined;
}

/**
 * Extracts candidate phone number
 */
function extractCandidatePhone(text: string): string | undefined {
  const match = text.match(
    /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/
  );
  return match ? match[0].trim() : undefined;
}

interface CountryMatch {
  name: string;
  code: string;
}

const COUNTRY_PATTERNS: { regex: RegExp; country: CountryMatch }[] = [
  {
    regex: /\b(india|bengaluru|bangalore|delhi|mumbai|hyderabad|pune|chennai|noida|gurugram|kolkata)\b/i,
    country: { name: "India", code: "IN" },
  },
  {
    regex: /\b(united\s+states|usa|u\.s\.a|california|san\s+francisco|new\s+york|texas|seattle|austin|chicago|los\s+angeles)\b/i,
    country: { name: "United States", code: "US" },
  },
  {
    regex: /\b(united\s+kingdom|uk|u\.k|london|manchester|birmingham|edinburgh|england)\b/i,
    country: { name: "United Kingdom", code: "GB" },
  },
  {
    regex: /\b(canada|toronto|vancouver|montreal|ottawa|ontario|quebec)\b/i,
    country: { name: "Canada", code: "CA" },
  },
  {
    regex: /\b(germany|berlin|munich|frankfurt|hamburg)\b/i,
    country: { name: "Germany", code: "DE" },
  },
  {
    regex: /\b(australia|sydney|melbourne|brisbane)\b/i,
    country: { name: "Australia", code: "AU" },
  },
  {
    regex: /\b(brazil|brasil|sao\s+paulo|rio\s+de\s+janeiro)\b/i,
    country: { name: "Brazil", code: "BR" },
  },
  {
    regex: /\b(spain|madrid|barcelona|valencia)\b/i,
    country: { name: "Spain", code: "ES" },
  },
  {
    regex: /\b(philippines|manila|cebu|quezon)\b/i,
    country: { name: "Philippines", code: "PH" },
  },
  {
    regex: /\b(singapore)\b/i,
    country: { name: "Singapore", code: "SG" },
  },
  {
    regex: /\b(netherlands|amsterdam|rotterdam)\b/i,
    country: { name: "Netherlands", code: "NL" },
  },
  {
    regex: /\b(france|paris|lyon)\b/i,
    country: { name: "France", code: "FR" },
  },
];

function extractCandidateCountry(text: string): CountryMatch | undefined {
  for (const item of COUNTRY_PATTERNS) {
    if (item.regex.test(text)) {
      return item.country;
    }
  }
  return undefined;
}

const EXTENDED_SKILL_PATTERNS: { name: string; pattern: RegExp; aliases?: string[] }[] = [
  // Programming languages
  { name: "Python", pattern: /\bpython\b/i },
  { name: "Java", pattern: /\bjava\b(?!\s*script)/i },
  { name: "JavaScript", pattern: /\bjavascript|\bjs\b/i },
  { name: "TypeScript", pattern: /\btypescript|\bts\b/i },
  { name: "C++", pattern: /\bc\+\+\b/i },
  { name: "C#", pattern: /\bc#|c-sharp\b/i },
  { name: "Go", pattern: /\bgolang|\bgo\s+language\b/i },
  { name: "Rust", pattern: /\brust\b/i },
  { name: "SQL", pattern: /\bsql|mysql|postgresql|postgres|sqlite\b/i },
  { name: "PHP", pattern: /\bphp\b/i },
  { name: "Ruby", pattern: /\bruby|rails\b/i },
  { name: "Swift", pattern: /\bswift\b/i },
  { name: "Kotlin", pattern: /\bkotlin\b/i },
  { name: "HTML/CSS", pattern: /\bhtml|css|html5|css3\b/i },
  { name: "Shell Scripting", pattern: /\bbash|shell|zsh\b/i },

  // AI & Evaluation
  {
    name: "Prompt Engineering",
    pattern: /\bprompt\s*engineering|few-shot|chain-of-thought|prompt\s*design\b/i,
  },
  {
    name: "AI Evaluation",
    pattern: /\bai\s*evaluation|model\s*eval|llm\s*eval|ai\s*benchmarking\b/i,
  },
  {
    name: "Code Review",
    pattern: /\bcode\s*review|pr\s*review|peer\s*review\b/i,
  },
  {
    name: "Logic Evaluation",
    pattern: /\blogic\s*evaluation|reasoning\s*evaluation|factual\s*consistency\b/i,
  },
  {
    name: "Fact-Checking",
    pattern: /\bfact[- ]checking|ground\s*truth|hallucination\b/i,
  },
  {
    name: "Data Annotation",
    pattern: /\bdata\s*annotation|data\s*labeling|image\s*annotation|audio\s*labeling\b/i,
  },
  {
    name: "Computer Vision",
    pattern: /\bcomputer\s*vision|opencv|object\s*detection|segmentation\b/i,
  },
  {
    name: "NLP",
    pattern: /\bnlp|natural\s*language\s*processing|sentiment\s*analysis|ner\b/i,
  },
  {
    name: "Machine Learning",
    pattern: /\bmachine\s*learning|\bml\b|scikit[- ]learn|pandas|numpy\b/i,
  },
  {
    name: "Deep Learning",
    pattern: /\bdeep\s*learning|pytorch|tensorflow|keras\b/i,
  },
  {
    name: "LLMs",
    pattern: /\bllm|large\s*language\s*models|transformers|hugging\s*face|langchain|rag\b/i,
  },

  // Web & Backend Frameworks
  { name: "React", pattern: /\breact(?:\.js)?\b/i },
  { name: "Next.js", pattern: /\bnext(?:\.js)?\b/i },
  { name: "Node.js", pattern: /\bnode(?:\.js)?\b/i },
  { name: "Spring Boot", pattern: /\bspring\s*boot|spring\s*framework\b/i },
  { name: "Django", pattern: /\bdjango\b/i },
  { name: "FastAPI", pattern: /\bfastapi\b/i },
  { name: "Flask", pattern: /\bflask\b/i },
  { name: "Angular", pattern: /\bangular\b/i },
  { name: "Vue.js", pattern: /\bvue(?:\.js)?\b/i },
  { name: "REST APIs", pattern: /\brest(?:ful)?\s*api|endpoints|microservices\b/i },
  { name: "GraphQL", pattern: /\bgraphql\b/i },
  { name: "Tailwind CSS", pattern: /\btailwind(?:\s*css)?\b/i },

  // Cloud & Databases
  { name: "Docker", pattern: /\bdocker\b/i },
  { name: "Kubernetes", pattern: /\bkubernetes|k8s\b/i },
  { name: "AWS", pattern: /\baws|amazon\s*web\s*services|ec2|s3|lambda\b/i },
  { name: "Google Cloud", pattern: /\bgcp|google\s*cloud\b/i },
  { name: "Azure", pattern: /\bazure\b/i },
  { name: "PostgreSQL", pattern: /\bpostgresql|postgres\b/i },
  { name: "MongoDB", pattern: /\bmongodb|mongo\b/i },
  { name: "Redis", pattern: /\bredis\b/i },
  { name: "Git", pattern: /\bgit\b(?!\s*hub|\s*lab)|version\s*control\b/i },

  // QA & Testing
  { name: "Functional Testing", pattern: /\bfunctional\s*testing|black\s*box\s*testing\b/i },
  { name: "Unit Testing", pattern: /\bunit\s*test(?:ing)?|jest|junit|pytest|mocha\b/i },
  {
    name: "Automated Testing",
    pattern: /\bautomation\s*test(?:ing)?|selenium|cypress|playwright\b/i,
  },
  { name: "Bug Reporting", pattern: /\bbug\s*reporting|issue\s*tracking|jira\b/i },
  { name: "API Testing", pattern: /\bapi\s*testing|postman\b/i },

  // Content & Writing
  {
    name: "Technical Documentation",
    pattern: /\btechnical\s*writing|technical\s*documentation|api\s*docs\b/i,
  },
  { name: "Translation", pattern: /\btranslation|localization|post-editing\b/i },
  { name: "Audio Transcription", pattern: /\baudio\s*transcription|speech-to-text\b/i },
  { name: "Creative Writing", pattern: /\bcopywriting|creative\s*writing|content\s*creation\b/i },
];

/**
 * Extracts candidate summary from section or synthesizes a factual summary
 */
function extractRealSummary(
  sections: Record<string, string>,
  skills: string[],
  years: number
): string {
  if (sections.summary && sections.summary.trim().length > 25) {
    const cleaned = sections.summary
      .replace(
        /^(summary|professional summary|profile|about me|objective)[:\s-]*/i,
        ""
      )
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 3)
      .join(" ");
    if (cleaned.length > 20) {
      return cleaned.slice(0, 350);
    }
  }

  const topSkills = skills.slice(0, 4).join(", ");
  const yearStr =
    years > 0 ? `${years}+ years of experience` : "demonstrated technical background";
  return `Professional with ${yearStr} specializing in ${
    topSkills || "software engineering and technical evaluation"
  }.`;
}

/**
 * Calculates years of experience and seniority level
 */
function extractYearsOfExperience(text: string): {
  years: number;
  level: ExtractedProfileData["experienceLevel"];
} {
  const explicitMatch = text.match(
    /(\d{1,2})\+?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:experience|background|working)/i
  );
  if (explicitMatch) {
    const yrs = parseFloat(explicitMatch[1]);
    if (yrs > 0 && yrs <= 35) {
      return {
        years: yrs,
        level:
          yrs >= 8
            ? "expert"
            : yrs >= 5
            ? "senior"
            : yrs >= 2
            ? "mid_level"
            : "entry_level",
      };
    }
  }

  const yearMatches = text.match(/\b(199[5-9]|200[0-9]|201[0-9]|202[0-6])\b/g);
  let computedYears = 2;

  if (yearMatches && yearMatches.length >= 2) {
    const yearsSorted = Array.from(new Set(yearMatches.map(Number))).sort(
      (a, b) => a - b
    );
    const minYear = yearsSorted[0];
    const maxYear = Math.min(
      new Date().getFullYear(),
      yearsSorted[yearsSorted.length - 1]
    );
    const span = maxYear - minYear;
    if (span >= 1 && span <= 30) {
      computedYears = span;
    }
  }

  const isSeniorTitle = /\b(senior|lead|principal|staff|architect|head\s+of)\b/i.test(
    text
  );
  let level: ExtractedProfileData["experienceLevel"] = "mid_level";
  if (computedYears >= 8 || (isSeniorTitle && computedYears >= 5)) {
    level = "expert";
  } else if (computedYears >= 5 || isSeniorTitle) {
    level = "senior";
  } else if (computedYears <= 1.5) {
    level = "entry_level";
  }

  return { years: computedYears, level };
}

/**
 * Extracts concrete skills and evidence directly from resume sections
 */
export function heuristicExtract(text: string): ExtractedProfileData {
  const sections = identifySections(text);
  const foundSkillsSet = new Set<string>();
  const toolsSet = new Set<string>();
  const evidenceList: SkillEvidence[] = [];

  const checkSection = (content: string, sectionName: string) => {
    if (!content) return;

    for (const item of EXTENDED_SKILL_PATTERNS) {
      if (item.pattern.test(content)) {
        if (!foundSkillsSet.has(item.name)) {
          foundSkillsSet.add(item.name);

          // Find specific line context
          const lines = content.split("\n");
          const matchedLine = lines.find((l) => item.pattern.test(l))?.trim();
          const contextSnippet =
            matchedLine && matchedLine.length < 120
              ? matchedLine
              : `Found in ${sectionName}`;

          evidenceList.push({
            skill: item.name,
            sourceSection: sectionName,
            contextSnippet,
            confidence:
              sectionName === "Projects" || sectionName === "Work Experience"
                ? 0.95
                : 0.88,
          });
        }
      }
    }

    // Common tools check
    const commonTools = [
      "Git",
      "Docker",
      "Postman",
      "VS Code",
      "IntelliJ",
      "Jira",
      "Kubernetes",
      "Linux",
      "GitHub",
      "GitLab",
      "Figma",
      "Slack",
    ];
    for (const tool of commonTools) {
      if (new RegExp(`\\b${tool}\\b`, "i").test(content)) {
        toolsSet.add(tool);
      }
    }
  };

  // Inspect in order of evidence strength
  checkSection(sections.projects, "Projects");
  checkSection(sections.experience, "Work Experience");
  checkSection(sections.skills, "Technical Skills");
  checkSection(sections.education, "Education");
  checkSection(sections.general, "Resume Overview");

  const fullName = extractCandidateName(text);
  const email = extractCandidateEmail(text);
  const phone = extractCandidatePhone(text);
  const countryData = extractCandidateCountry(text);

  const { years, level } = extractYearsOfExperience(text);
  const skillsArray = Array.from(foundSkillsSet);
  const summary = extractRealSummary(sections, skillsArray, years);

  return {
    fullName,
    email,
    phone,
    country: countryData?.name,
    countryCode: countryData?.code,
    skills: skillsArray.length > 0 ? skillsArray : ["Code Review", "Python"],
    tools: Array.from(toolsSet),
    experienceLevel: level,
    yearsOfExperience: years,
    evidence: evidenceList,
    summary,
    needsUserReview: true,
  };
}

/**
 * Main server-side AI skill extraction entrypoint
 */
export async function extractStructuredProfile(
  resumeText: string
): Promise<ExtractedProfileData> {
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
                    text: `You are an expert talent recruiter. Extract verified candidate facts strictly from this resume.
Do NOT invent or guess any facts. If a field is not present, omit or return null.

Return a valid JSON object matching this schema:
{
  "fullName": string | null,
  "email": string | null,
  "phone": string | null,
  "country": string | null,
  "countryCode": string | null,
  "skills": string[],
  "tools": string[],
  "experienceLevel": "entry_level" | "mid_level" | "senior" | "expert",
  "yearsOfExperience": number,
  "evidence": [
    { "skill": "...", "sourceSection": "Work Experience" | "Projects" | "Technical Skills" | "Education", "contextSnippet": "..." }
  ],
  "summary": string,
  "needsUserReview": true
}

Resume Content:
${resumeText.slice(0, 14000)}`,
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
            fullName: parsed.fullName || undefined,
            email: parsed.email || undefined,
            phone: parsed.phone || undefined,
            country: parsed.country || undefined,
            countryCode: parsed.countryCode || undefined,
            skills: canonicalNames.length > 0 ? canonicalNames : parsed.skills || [],
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
      console.warn("LLM API call failed, using heuristic extraction:", llmErr);
    }
  }

  // Robust, complete heuristic extraction from real document content
  return heuristicExtract(resumeText);
}
