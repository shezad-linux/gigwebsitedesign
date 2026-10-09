"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Upload,
  CheckCircle2,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Globe,
  Code2,
  Sliders,
  CheckSquare,
  AlertCircle,
  Plus,
  X,
  ExternalLink,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserProfile, UserLanguage, UserResume } from "@/types/profile";
import { getStoredProfile, saveStoredProfile } from "@/lib/storage";

const POPULAR_SKILLS = [
  "Python",
  "Java",
  "Code Review",
  "SQL",
  "JavaScript",
  "TypeScript",
  "Prompt Engineering",
  "Logic Evaluation",
  "Fact-Checking",
  "Data Labeling",
  "Computer Vision Tagging",
  "Functional Testing",
  "Mobile QA",
  "Bug Reporting",
  "Translation",
  "Audio Transcription",
  "Creative Writing",
  "Technical Documentation",
];

const CATEGORY_OPTIONS = [
  "AI Coding",
  "AI Evaluation",
  "Data Annotation",
  "Writing & Content",
  "Language & Translation",
  "Software & QA Testing",
];

const PAYOUT_OPTIONS = ["PayPal", "Wise", "Direct Deposit", "Payoneer", "Deel"];

const SAMPLE_COUNTRIES = [
  { name: "India", code: "IN" },
  { name: "United States", code: "US" },
  { name: "United Kingdom", code: "GB" },
  { name: "Canada", code: "CA" },
  { name: "Germany", code: "DE" },
  { name: "Australia", code: "AU" },
  { name: "Brazil", code: "BR" },
  { name: "Spain", code: "ES" },
  { name: "Philippines", code: "PH" },
  { name: "Global / Other", code: "OTHER" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSimulatingParse, setIsSimulatingParse] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState("Aarav Sharma");
  const [email, setEmail] = useState("aarav.sharma@example.com");
  const [resume, setResume] = useState<UserResume | undefined>(undefined);
  const [customSkillInput, setCustomSkillInput] = useState("");

  const [country, setCountry] = useState("India");
  const [countryCode, setCountryCode] = useState("IN");
  const [workAuth, setWorkAuth] = useState("Independent Contractor (W-8BEN compliant)");

  const [languages, setLanguages] = useState<UserLanguage[]>([
    { name: "English", proficiency: "fluent" },
    { name: "Hindi", proficiency: "native" },
  ]);
  const [newLangName, setNewLangName] = useState("");
  const [newLangProf, setNewLangProf] = useState<UserLanguage["proficiency"]>("fluent");

  const [skills, setSkills] = useState<string[]>([
    "Python",
    "Java",
    "Code Review",
    "SQL",
    "Git",
    "Prompt Engineering",
  ]);
  const [experienceLevel, setExperienceLevel] = useState<"entry" | "mid" | "expert">("mid");
  const [yearsOfExperience, setYearsOfExperience] = useState(3);
  const [portfolioUrl, setPortfolioUrl] = useState("https://github.com/aaravsharma-dev");

  const [desiredCategories, setDesiredCategories] = useState<string[]>([
    "AI Coding",
    "AI Evaluation",
    "Software & QA Testing",
  ]);
  const [remoteOnly, setRemoteOnly] = useState(true);
  const [weeklyHours, setWeeklyHours] = useState(20);
  const [preferredPayouts, setPreferredPayouts] = useState<string[]>([
    "PayPal",
    "Wise",
    "Direct Deposit",
  ]);
  const [bio, setBio] = useState(
    "Full-stack engineer and AI code evaluator with 3 years background in Java, Python, and API development."
  );

  useEffect(() => {
    const existing = getStoredProfile();
    if (existing) {
      setFullName(existing.fullName || "Aarav Sharma");
      setEmail(existing.email || "aarav.sharma@example.com");
      if (existing.resume) setResume(existing.resume);
      if (existing.country) setCountry(existing.country);
      if (existing.countryCode) setCountryCode(existing.countryCode);
      if (existing.workAuthorization) setWorkAuth(existing.workAuthorization);
      if (existing.languages && existing.languages.length > 0) setLanguages(existing.languages);
      if (existing.skills && existing.skills.length > 0) setSkills(existing.skills);
      if (existing.experienceLevel) setExperienceLevel(existing.experienceLevel);
      if (existing.yearsOfExperience !== undefined) setYearsOfExperience(existing.yearsOfExperience);
      if (existing.desiredCategories && existing.desiredCategories.length > 0)
        setDesiredCategories(existing.desiredCategories);
      if (existing.preferredPayoutMethods && existing.preferredPayoutMethods.length > 0)
        setPreferredPayouts(existing.preferredPayoutMethods);
      if (existing.bio) setBio(existing.bio);
    }
  }, []);

  // Simulated File Upload Handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    const isPdf = file.name.endsWith(".pdf");
    const isDoc = file.name.endsWith(".docx") || file.name.endsWith(".doc");

    if (!validTypes.includes(file.type) && !isPdf && !isDoc) {
      setErrorMsg("Please upload a supported PDF or Word document (.pdf, .docx, .doc).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("File size exceeds 10 MB limit.");
      return;
    }

    setIsSimulatingParse(true);
    setTimeout(() => {
      const extracted = [
        "Python",
        "Java",
        "Code Review",
        "SQL",
        "Git",
        "REST APIs",
        "Debugging",
        "Unit Testing",
      ];
      setResume({
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        extractedSkills: extracted,
        extractedSummary: `Software engineer profile parsed from ${file.name}. High algorithmic proficiency detected.`,
        simulatedScore: 92,
      });

      // Merge extracted skills
      const merged = Array.from(new Set([...skills, ...extracted]));
      setSkills(merged);
      setIsSimulatingParse(false);
    }, 700);
  };

  const handleUseSampleResume = () => {
    setIsSimulatingParse(true);
    setTimeout(() => {
      const extracted = [
        "Python",
        "Java",
        "Code Review",
        "SQL",
        "Git",
        "Unit Testing",
        "Prompt Engineering",
      ];
      setResume({
        fileName: "Aarav_Sharma_Resume_2025.pdf",
        fileSize: 184500,
        uploadedAt: new Date().toISOString(),
        extractedSkills: extracted,
        extractedSummary: "Full-stack developer experienced with Java Spring and Python code benchmarking.",
        simulatedScore: 92,
      });
      setSkills(Array.from(new Set([...skills, ...extracted])));
      setIsSimulatingParse(false);
    }, 500);
  };

  const handleRemoveResume = () => {
    setResume(undefined);
  };

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const addCustomSkill = () => {
    if (!customSkillInput.trim()) return;
    const trimmed = customSkillInput.trim();
    if (!skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setCustomSkillInput("");
  };

  const addLanguage = () => {
    if (!newLangName.trim()) return;
    setLanguages([...languages, { name: newLangName.trim(), proficiency: newLangProf }]);
    setNewLangName("");
  };

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const toggleCategory = (cat: string) => {
    if (desiredCategories.includes(cat)) {
      if (desiredCategories.length > 1) {
        setDesiredCategories(desiredCategories.filter((c) => c !== cat));
      }
    } else {
      setDesiredCategories([...desiredCategories, cat]);
    }
  };

  const togglePayout = (method: string) => {
    if (preferredPayouts.includes(method)) {
      if (preferredPayouts.length > 1) {
        setPreferredPayouts(preferredPayouts.filter((m) => m !== method));
      }
    } else {
      setPreferredPayouts([...preferredPayouts, method]);
    }
  };

  const handleFinishOnboarding = () => {
    const finalProfile: UserProfile = {
      id: "user_demo_01",
      fullName: fullName.trim() || "Candidate",
      email: email.trim() || "candidate@example.com",
      country,
      countryCode,
      workAuthorization: workAuth,
      languages,
      skills,
      experienceLevel,
      yearsOfExperience,
      portfolioUrl,
      desiredCategories,
      remoteOnly,
      weeklyHoursAvailable: weeklyHours,
      preferredPayoutMethods: preferredPayouts,
      bio,
      resume,
      hasCompletedOnboarding: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveStoredProfile(finalProfile);
    router.push("/dashboard?onboarded=true");
  };

  const stepTitles = [
    { num: 1, label: "Resume & Parsing" },
    { num: 2, label: "Country & Languages" },
    { num: 3, label: "Skills & Experience" },
    { num: 4, label: "Work Preferences" },
    { num: 5, label: "Review & Match" },
  ];

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>Profile Onboarding · Phase 1</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          Let’s Personalize Your AI Gig Matches
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1 max-w-xl mx-auto">
          Upload a resume or enter details manually. Your profile is stored locally in your browser.
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="mb-8 bg-white p-4 rounded-xl border border-border shadow-xs">
        <div className="flex items-center justify-between">
          {stepTitles.map((st) => (
            <div
              key={st.num}
              onClick={() => setCurrentStep(st.num)}
              className={`flex flex-col items-center cursor-pointer transition-colors ${
                currentStep === st.num
                  ? "text-brand-600 font-bold"
                  : currentStep > st.num
                  ? "text-emerald-700 font-medium"
                  : "text-slate-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-all ${
                  currentStep === st.num
                    ? "bg-brand-600 text-white ring-4 ring-brand-100"
                    : currentStep > st.num
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {currentStep > st.num ? <CheckCircle2 className="w-4 h-4" /> : st.num}
              </div>
              <span className="text-[11px] hidden sm:block text-center">{st.label}</span>
            </div>
          ))}
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-brand-600 h-full transition-all duration-300"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: RESUME UPLOAD OR MANUAL */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Step 1: Resume & Extraction</CardTitle>
            <CardDescription>
              Simulate uploading a PDF or DOCX resume to auto-populate skills, or choose to enter details manually.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {!resume ? (
              <div className="space-y-4">
                {/* Upload Box */}
                <div className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl p-8 text-center bg-slate-50/50 transition-colors">
                  <div className="h-12 w-12 rounded-full bg-brand-50 text-brand-600 mx-auto flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-ink">
                    Drop your resume here, or{" "}
                    <label className="text-brand-600 hover:underline cursor-pointer">
                      browse
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.doc"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </h3>
                  <p className="text-xs text-ink-muted mt-1">Supports PDF, DOCX, or DOC (up to 10 MB)</p>

                  <div className="mt-4 pt-4 border-t border-slate-200/60 flex flex-wrap items-center justify-center gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleUseSampleResume}
                      isLoading={isSimulatingParse}
                    >
                      <FileText className="w-3.5 h-3.5 mr-1 text-brand-600" />
                      Load Sample Resume (Aarav Sharma)
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(2)}
                    >
                      Skip & Enter Manually →
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-brand-50/70 border border-brand-200/60 rounded-xl flex items-start gap-2.5 text-xs text-brand-800">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Local-First Sandbox:</span> Files uploaded in Phase 1 are strictly inspected in your local browser sandbox. No resume files are transferred to external cloud or LLM endpoints.
                  </div>
                </div>
              </div>
            ) : (
              /* Uploaded State */
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-ink">{resume.fileName}</h4>
                      <p className="text-xs text-slate-500">
                        {(resume.fileSize / 1024).toFixed(1)} KB · Simulated extract complete
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveResume}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>

                <div className="p-4 rounded-xl border border-border bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Extracted Skills from Resume
                    </span>
                    <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {resume.extractedSkills.length} skills identified
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {resume.extractedSkills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2.5 py-1 text-xs rounded-md bg-brand-50 text-brand-700 font-medium border border-brand-200 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-brand-600" />
                        {sk}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-slate-500 pt-1 italic">
                    {resume.extractedSummary}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button onClick={() => setCurrentStep(2)} size="md">
                Next: Country & Languages <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: COUNTRY AND LANGUAGES */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Step 2: Country & Spoken Languages</CardTitle>
            <CardDescription>
              Platform eligibility and payout availability strongly depend on your country of residence.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Country of Residence *
                </label>
                <select
                  value={country}
                  onChange={(e) => {
                    const sel = SAMPLE_COUNTRIES.find((c) => c.name === e.target.value);
                    setCountry(e.target.value);
                    if (sel) setCountryCode(sel.code);
                  }}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm focus:ring-2 focus:ring-brand-500"
                >
                  {SAMPLE_COUNTRIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Matched listings will verify whether this country is eligible.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Tax / Work Authorization Note
                </label>
                <input
                  type="text"
                  value={workAuth}
                  onChange={(e) => setWorkAuth(e.target.value)}
                  placeholder="e.g. W-8BEN contractor / Resident"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm focus:ring-2 focus:ring-brand-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Standard for cross-border AI contractor payouts.
                </p>
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                Language Proficiencies
              </label>

              <div className="space-y-2">
                {languages.map((lang, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-slate-50 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-brand-600" />
                      <span className="font-semibold text-ink">{lang.name}</span>
                      <span className="text-slate-500 capitalize">({lang.proficiency})</span>
                    </div>
                    {languages.length > 1 && (
                      <button
                        onClick={() => removeLanguage(idx)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Language name (e.g. Spanish, German, Tamil)"
                  value={newLangName}
                  onChange={(e) => setNewLangName(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-border text-xs flex-1"
                />
                <select
                  value={newLangProf}
                  onChange={(e) => setNewLangProf(e.target.value as any)}
                  className="h-9 px-3 rounded-lg border border-border text-xs bg-white"
                >
                  <option value="native">Native</option>
                  <option value="fluent">Fluent</option>
                  <option value="professional">Professional</option>
                  <option value="basic">Basic</option>
                </select>
                <Button type="button" variant="secondary" size="sm" onClick={addLanguage}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setCurrentStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </Button>
              <Button onClick={() => setCurrentStep(3)}>
                Next: Skills & Experience <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: SKILLS AND EXPERIENCE */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Step 3: Skills & Technical Experience</CardTitle>
            <CardDescription>
              Select your strengths. Match scores compare these directly against gig requirements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Experience Level Cards */}
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                Experience Tier
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "entry", title: "Entry / Starter", desc: "0 - 1 years · Annotation & basic QA" },
                  { id: "mid", title: "Mid-Level", desc: "2 - 4 years · Code review & reasoning" },
                  { id: "expert", title: "Expert / Senior", desc: "5+ years · Architecture & benchmarking" },
                ].map((tier) => (
                  <div
                    key={tier.id}
                    onClick={() => setExperienceLevel(tier.id as any)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      experienceLevel === tier.id
                        ? "border-brand-600 bg-brand-50/70 shadow-xs"
                        : "border-border bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="font-bold text-sm text-ink">{tier.title}</div>
                    <div className="text-xs text-ink-muted mt-1">{tier.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Skills Chips */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-ink uppercase tracking-wider">
                  Active Profile Skills ({skills.length})
                </label>
                <span className="text-[11px] text-slate-500">Click a tag to remove</span>
              </div>
              <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-border bg-slate-50 min-h-[50px]">
                {skills.map((s) => (
                  <span
                    key={s}
                    onClick={() => toggleSkill(s)}
                    className="px-2.5 py-1 text-xs rounded-md bg-brand-600 text-white font-medium cursor-pointer hover:bg-red-600 transition-colors flex items-center gap-1 group"
                  >
                    {s}
                    <X className="w-3 h-3 group-hover:block" />
                  </span>
                ))}
              </div>
            </div>

            {/* Popular Skills to Add */}
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Suggested High-Demand AI Skills (Click to Add)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SKILLS.filter((s) => !skills.includes(s)).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSkill(s)}
                    className="px-2.5 py-1 text-xs rounded-md bg-white border border-border text-slate-700 hover:border-brand-500 hover:text-brand-600 transition-colors"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Skill Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add other skill (e.g. C++, PyTorch, Docker)"
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomSkill();
                  }
                }}
                className="h-9 px-3 rounded-lg border border-border text-xs flex-1"
              />
              <Button type="button" variant="secondary" size="sm" onClick={addCustomSkill}>
                Add Skill
              </Button>
            </div>

            {/* Portfolio Link */}
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Optional GitHub or Portfolio URL
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://github.com/your-username"
                className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setCurrentStep(2)}>
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </Button>
              <Button onClick={() => setCurrentStep(4)}>
                Next: Preferences <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 4: PREFERENCES */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Step 4: Work Preferences & Payouts</CardTitle>
            <CardDescription>
              Specify your schedule availability and preferred payout rails.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Desired Categories */}
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                Desired Gig Categories
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CATEGORY_OPTIONS.map((cat) => {
                  const isChecked = desiredCategories.includes(cat);
                  return (
                    <div
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`p-3 rounded-xl border cursor-pointer text-xs flex items-center justify-between transition-all ${
                        isChecked
                          ? "border-brand-600 bg-brand-50/60 font-semibold text-ink"
                          : "border-border bg-white text-slate-600"
                      }`}
                    >
                      <span>{cat}</span>
                      <CheckCircle2
                        className={`w-4 h-4 ${isChecked ? "text-brand-600" : "text-slate-300"}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weekly Hours Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-ink uppercase tracking-wider">
                  Weekly Hours Available
                </label>
                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                  {weeklyHours} hrs / week
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={50}
                step={5}
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>Part-time (5-15 hrs)</span>
                <span>Flexible (20-30 hrs)</span>
                <span>Full commitment (40+ hrs)</span>
              </div>
            </div>

            {/* Preferred Payout Rails */}
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                Preferred Payout Methods
              </label>
              <div className="flex flex-wrap gap-2">
                {PAYOUT_OPTIONS.map((opt) => {
                  const active = preferredPayouts.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => togglePayout(opt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        active
                          ? "bg-brand-600 text-white border-brand-600 shadow-xs"
                          : "bg-white text-slate-700 border-border hover:bg-slate-50"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Profile Summary Bio */}
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Profile Bio & Background
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 rounded-lg border border-border bg-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500"
                placeholder="Briefly describe your expertise..."
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setCurrentStep(3)}>
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </Button>
              <Button onClick={() => setCurrentStep(5)}>
                Review Profile <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 5: REVIEW PROFILE & GENERATE MATCHES */}
      {currentStep === 5 && (
        <Card className="border-brand-200 shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Step 5: Review & Confirm Profile</CardTitle>
                <CardDescription>
                  Your profile details are summarized below. You can jump back to modify any field.
                </CardDescription>
              </div>
              <Badge variant="success" className="font-semibold">
                Ready to Match
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary Box */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
                <div>
                  <h3 className="font-bold text-base text-ink">{fullName}</h3>
                  <p className="text-xs text-ink-muted">{email}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {country} ({countryCode})
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">{workAuth}</p>
                </div>
              </div>

              {/* Resume summary */}
              {resume && (
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-600" />
                    <span className="font-semibold text-ink">{resume.fileName}</span>
                    <span className="text-slate-400">
                      ({resume.extractedSkills.length} skills auto-extracted)
                    </span>
                  </div>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-brand-600 font-semibold hover:underline"
                  >
                    Edit
                  </button>
                </div>
              )}

              {/* Skills */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Skills ({skills.length})
                  </span>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="text-xs text-brand-600 font-semibold hover:underline"
                  >
                    Edit Skills
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 text-xs rounded bg-white text-slate-800 border border-slate-200 font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Categories & Rails */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/70 text-xs">
                <div>
                  <span className="text-slate-500 block mb-1 font-semibold uppercase tracking-wider text-[11px]">
                    Target Categories:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {desiredCategories.map((c) => (
                      <span key={c} className="text-brand-700 bg-brand-50 px-2 py-0.5 rounded font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block mb-1 font-semibold uppercase tracking-wider text-[11px]">
                    Availability & Payouts:
                  </span>
                  <p className="text-ink font-medium">
                    {weeklyHours} hrs/week · {preferredPayouts.join(", ")}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-brand-50/70 border border-brand-200/70 text-xs text-brand-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-600 shrink-0" />
                <span>
                  All match calculations will automatically rank your 15 catalog listings based on these skills.
                </span>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setCurrentStep(4)}>
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleFinishOnboarding}
                className="font-bold shadow-md px-6"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate My Matches Now →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
