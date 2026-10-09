export interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  typicalRate: string;
  popularSkills: string[];
  samplePlatforms: string[];
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: "ai-coding",
    name: "AI Coding",
    slug: "ai-coding",
    description: "Evaluate code generation models, debug AI outputs, write unit tests, and create algorithmic coding benchmarks.",
    iconName: "Code2",
    typicalRate: "$25 - $55 / hour",
    popularSkills: ["Python", "Java", "JavaScript", "C++", "Code Review", "Algorithms", "Debugging"],
    samplePlatforms: ["Outlier AI", "DataAnnotation Tech", "Alignerr", "Invisible Tech"],
  },
  {
    id: "ai-evaluation",
    name: "AI Evaluation",
    slug: "ai-evaluation",
    description: "Rate LLM responses for reasoning accuracy, truthfulness, instruction following, safety, and conciseness.",
    iconName: "BrainCircuit",
    typicalRate: "$18 - $40 / hour",
    popularSkills: ["Prompt Engineering", "Critical Thinking", "Fact-Checking", "Safety Guidelines", "Logic Evaluation"],
    samplePlatforms: ["Mindrift", "Outlier AI", "Telus International", "Remotasks"],
  },
  {
    id: "data-annotation",
    name: "Data Annotation",
    slug: "data-annotation",
    description: "Classify text, label bounding boxes for vision models, categorize intents, and structure datasets.",
    iconName: "Tags",
    typicalRate: "$12 - $25 / hour",
    popularSkills: ["Data Labeling", "NER Annotation", "Computer Vision Tagging", "Detail Oriented", "Dataset Curation"],
    samplePlatforms: ["OneForma", "Appen", "Toloka", "Scale AI"],
  },
  {
    id: "writing",
    name: "Writing & Content",
    slug: "writing",
    description: "Craft high-quality prompts, critique AI-generated essays and marketing copy, and assess nuance and voice.",
    iconName: "PenTool",
    typicalRate: "$15 - $35 / hour",
    popularSkills: ["Creative Writing", "Copywriting", "Grammar", "Technical Documentation", "Editorial Review"],
    samplePlatforms: ["DataAnnotation Tech", "Mindrift", "Alignerr"],
  },
  {
    id: "language",
    name: "Language & Translation",
    slug: "language",
    description: "Assess machine translation accuracy, evaluate cultural nuance, transcribe multi-dialect audio, and score fluency.",
    iconName: "Languages",
    typicalRate: "$14 - $30 / hour",
    popularSkills: ["Translation", "Localization", "Audio Transcription", "Bilingual Proficiency", "Grammar Check"],
    samplePlatforms: ["OneForma", "Telus International", "Appen"],
  },
  {
    id: "software-testing",
    name: "Software & QA Testing",
    slug: "software-testing",
    description: "Perform exploratory bug hunting on live web/mobile apps, verify edge cases, and execute test cycles.",
    iconName: "ShieldCheck",
    typicalRate: "$15 - $45 / hour",
    popularSkills: ["Functional Testing", "Bug Reporting", "Mobile QA", "Cross-Browser Testing", "Test Case Execution"],
    samplePlatforms: ["Testlio", "uTest", "Applause"],
  },
];
