/* ==============================================================================
   AI Scope Assistant (Non-Binding Requirement Structuring)
   Analyzes client description, flags missing details, suggests skills,
   and formats structured project briefs.
   ============================================================================== */

export interface ScopeAnalysisResult {
  structuredTitle: string;
  suggestedCategory: string;
  suggestedSkills: string[];
  missingElements: string[];
  clarifyingQuestions: string[];
  structuredBrief: {
    overview: string;
    keyDeliverables: string[];
    technicalConsiderations: string[];
    estimatedTimeline: string;
  };
  disclaimer: string;
}

const COMMON_SKILL_KEYWORDS: Record<string, string[]> = {
  "next.js": ["Next.js", "React", "TypeScript"],
  react: ["React", "TypeScript", "Tailwind CSS"],
  flutter: ["Flutter", "Dart", "Mobile App Development"],
  "react native": ["React Native", "TypeScript", "Mobile App"],
  ios: ["Swift", "iOS", "Xcode"],
  android: ["Kotlin", "Android Studio"],
  figma: ["Figma", "UI/UX Design", "Wireframing"],
  design: ["UI/UX Design", "Design Systems"],
  python: ["Python", "FastAPI", "Backend Architecture"],
  node: ["Node.js", "TypeScript", "Express"],
  supabase: ["Supabase", "PostgreSQL", "Row Level Security"],
  postgres: ["PostgreSQL", "SQL", "Database Design"],
  ai: ["OpenAI API", "Python", "LLM Integration", "RAG"],
  llm: ["OpenAI API", "LangChain", "Vector Databases"],
  seo: ["SEO", "Content Strategy", "Technical SEO"],
  marketing: ["Digital Marketing", "Meta Ads", "Google Ads"],
  testing: ["QA Testing", "Playwright", "Test Automation"],
};

export function analyzeProjectScope(
  rawTitle: string,
  rawDescription: string,
  selectedCategory?: string
): ScopeAnalysisResult {
  const combined = `${rawTitle} ${rawDescription}`.toLowerCase();
  const suggestedSkillsSet = new Set<string>();

  // Extract skills from keywords
  for (const [key, skills] of Object.entries(COMMON_SKILL_KEYWORDS)) {
    if (combined.includes(key)) {
      skills.forEach((s) => suggestedSkillsSet.add(s));
    }
  }

  // Detect missing elements
  const missingElements: string[] = [];
  const clarifyingQuestions: string[] = [];

  const hasTimeline = /\b(week|month|day|deadline|timeline|by\s+[a-z]+|asap|urgent|launch)\b/i.test(combined);
  if (!hasTimeline) {
    missingElements.push("Target delivery date or preferred timeline");
    clarifyingQuestions.push("When do you need this project completed, or what is your target launch date?");
  }

  const hasDeliverables = /\b(deliverable|features?|pages?|screens?|api|endpoints?|design|wireframe|app)\b/i.test(combined);
  if (!hasDeliverables) {
    missingElements.push("Specific list of core deliverables or milestones");
    clarifyingQuestions.push("What specific milestones or key deliverables do you expect at each stage?");
  }

  const hasDesignOrSpec = /\b(figma|wireframe|mockup|spec|prd|documented|design|reference)\b/i.test(combined);
  if (!hasDesignOrSpec && (!selectedCategory || selectedCategory === "software-web" || selectedCategory === "mobile-apps")) {
    missingElements.push("Design assets or product specifications");
    clarifyingQuestions.push("Do you have existing Figma designs or wireframes ready, or will the specialist need to design the UI?");
  }

  const hasBudgetOrHours = /\b(\$|usd|budget|rate|hourly|fixed|estimate|cost)\b/i.test(combined);
  if (!hasBudgetOrHours) {
    missingElements.push("Indicative budget or target hourly rate");
    clarifyingQuestions.push("What is your approximate budget range or target hourly investment?");
  }

  // Determine category recommendation if not selected
  let suggestedCategory = selectedCategory || "software-web";
  if (!selectedCategory) {
    if (combined.includes("mobile") || combined.includes("ios") || combined.includes("android") || combined.includes("flutter")) {
      suggestedCategory = "mobile-apps";
    } else if (combined.includes("design") || combined.includes("figma") || combined.includes("logo") || combined.includes("ui/ux")) {
      suggestedCategory = "ui-ux-design";
    } else if (combined.includes("marketing") || combined.includes("seo") || combined.includes("ads") || combined.includes("growth")) {
      suggestedCategory = "digital-marketing";
    } else if (combined.includes("ai") || combined.includes("llm") || combined.includes("gpt") || combined.includes("automation")) {
      suggestedCategory = "ai-automation";
    } else if (combined.includes("test") || combined.includes("qa") || combined.includes("audit") || combined.includes("security")) {
      suggestedCategory = "qa-testing-consulting";
    }
  }

  // Extract key sentences for deliverables
  const sentences = rawDescription
    .split(/[.\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  const keyDeliverables = sentences.slice(0, 4).map((s) => s.replace(/^[-*•]\s*/, ""));

  return {
    structuredTitle: rawTitle.trim() || "Technical Engagement Request",
    suggestedCategory,
    suggestedSkills: Array.from(suggestedSkillsSet).slice(0, 8),
    missingElements,
    clarifyingQuestions,
    structuredBrief: {
      overview: rawDescription.trim().slice(0, 400),
      keyDeliverables: keyDeliverables.length > 0 ? keyDeliverables : ["Detailed scope definition & implementation plan"],
      technicalConsiderations: [
        "Code quality and test coverage standards",
        "Clear communication and weekly progress checkpoints",
        "Adherence to modern architectural best practices",
      ],
      estimatedTimeline: hasTimeline ? "As outlined in client requirements" : "2 to 8 weeks (subject to milestone agreement)",
    },
    disclaimer:
      "This scope outline is generated as a structured recommendation to assist requirement gathering. Final deliverables, pricing, and deadlines are subject to mutual agreement between client and professional.",
  };
}
