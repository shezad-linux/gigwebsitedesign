"use client";

/* ==============================================================================
   ProjectRequestForm Component
   Interactive multi-step client project request builder with AI scope assistant,
   hourly vs fixed-price toggles, and live preview mode.
   ============================================================================== */

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Clock,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Edit3,
  HelpCircle,
  Code2,
  Layers,
  Calendar,
  MessageSquare,
  Send,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  HIRE_CATEGORIES,
  HireServiceCategory,
  HiringModel,
  ExperienceLevel,
} from "@/lib/hire-talent/types";
import { createHireRequestAction, analyzeProjectScopeAction } from "@/app/actions/hire-talent";

export function ProjectRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialCategory = (searchParams.get("category") as HireServiceCategory) || "software-web";
  const initialModel = (searchParams.get("model") as HiringModel) || "fixed";

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<HireServiceCategory>(initialCategory);
  const [description, setDescription] = useState("");
  const [hiringModel, setHiringModel] = useState<HiringModel>(initialModel);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("intermediate");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [budgetMin, setBudgetMin] = useState<number | "">("");
  const [budgetMax, setBudgetMax] = useState<number | "">("");
  const [expectedStartDate, setExpectedStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [durationWeeks, setDurationWeeks] = useState<number | "">(4);
  const [communicationPref, setCommunicationPref] = useState<"slack" | "email" | "video_calls" | "flexible">("flexible");

  // Hourly Specifics
  const [hourlyHoursPerWeek, setHourlyHoursPerWeek] = useState<number | "">(20);
  const [hourlyOverlapTimezone, setHourlyOverlapTimezone] = useState("UTC ± 3 hours");

  // Fixed Price Specifics
  const [fixedDeliverables, setFixedDeliverables] = useState<string[]>([
    "Architecture specification & milestone roadmap",
    "Production-ready codebase with test coverage",
    "Deployment documentation and walkthrough",
  ]);
  const [deliverableInput, setDeliverableInput] = useState("");
  const [revisionRounds, setRevisionRounds] = useState<number>(2);

  // Assistant & UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzingScope, setIsAnalyzingScope] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Synchronize category preset skills when category changes and no skills yet added
  useEffect(() => {
    if (requiredSkills.length === 0 && HIRE_CATEGORIES[category]) {
      setRequiredSkills(HIRE_CATEGORIES[category].popularSkills.slice(0, 4));
    }
  }, [category]);

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !requiredSkills.includes(trimmed)) {
      setRequiredSkills([...requiredSkills, trimmed]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skillToRemove));
  };

  const handleAddDeliverable = () => {
    const trimmed = deliverableInput.trim();
    if (trimmed) {
      setFixedDeliverables([...fixedDeliverables, trimmed]);
      setDeliverableInput("");
    }
  };

  const handleRemoveDeliverable = (index: number) => {
    setFixedDeliverables(fixedDeliverables.filter((_, i) => i !== index));
  };

  // AI Scope Assistant trigger
  const handleAnalyzeScope = async () => {
    if (!description || description.length < 20) {
      setErrorMessage("Please enter at least 20 characters in the project description first.");
      return;
    }
    setIsAnalyzingScope(true);
    setErrorMessage(null);
    try {
      const res = await analyzeProjectScopeAction(title, description, category);
      if (res.success && res.data) {
        setAiAnalysis(res.data);
        // Automatically append newly discovered skills if not already present
        if (res.data.suggestedSkills && res.data.suggestedSkills.length > 0) {
          const combined = Array.from(new Set([...requiredSkills, ...res.data.suggestedSkills]));
          setRequiredSkills(combined);
        }
      }
    } catch {
      setErrorMessage("Could not analyze scope at this moment.");
    } finally {
      setIsAnalyzingScope(false);
    }
  };

  // Submission handler
  const handleSubmit = async (isDraft = false) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      title,
      category,
      description,
      hiring_model: hiringModel,
      required_skills: requiredSkills,
      experience_level: experienceLevel,
      budget_min: budgetMin === "" ? undefined : Number(budgetMin),
      budget_max: budgetMax === "" ? undefined : Number(budgetMax),
      currency: "USD",
      expected_start_date: expectedStartDate || undefined,
      deadline: deadline || undefined,
      estimated_duration_weeks: durationWeeks === "" ? undefined : Number(durationWeeks),
      communication_pref: communicationPref,
      hourly_hours_per_week: hiringModel === "hourly" ? (hourlyHoursPerWeek === "" ? undefined : Number(hourlyHoursPerWeek)) : undefined,
      hourly_overlap_timezone: hiringModel === "hourly" ? hourlyOverlapTimezone : undefined,
      fixed_deliverables: hiringModel === "fixed" ? fixedDeliverables : undefined,
      revision_rounds: hiringModel === "fixed" ? revisionRounds : undefined,
      is_draft: isDraft,
    };

    try {
      const result = await createHireRequestAction(payload);
      if (result.success && result.data) {
        router.push(`/hire-talent/requests/${result.data.id}`);
      } else {
        setErrorMessage(result.error || "Failed to submit request.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Mode Header & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            Post a Project Request
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Fill in your requirements below. Our managed team matches top verified professionals to your scope.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="text-xs font-bold gap-1.5 border-neutral-300 hover:bg-neutral-50"
          >
            {isPreviewMode ? (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                Return to Editor
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                Preview Request
              </>
            )}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* PREVIEW MODE VIEW */}
      {isPreviewMode ? (
        <Card className="bg-white border-neutral-300 shadow-xs">
          <CardHeader className="p-6 border-b border-neutral-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 mb-1">
              <span className="uppercase font-bold text-black">{category.replace("-", " ")}</span>
              <span>•</span>
              <span className="capitalize">{hiringModel} Model</span>
              <span>•</span>
              <span className="capitalize">{experienceLevel} Level</span>
            </div>
            <CardTitle className="text-2xl font-black text-black">
              {title || "Untitled Project Request"}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div>
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Project Overview & Requirements
              </h4>
              <p className="text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed">
                {description || "No description provided yet."}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Required Technical Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {requiredSkills.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-neutral-100 text-neutral-800">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
              <div>
                <span className="text-neutral-500 block">Hiring Model</span>
                <span className="font-bold text-black capitalize">{hiringModel}</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Budget Target</span>
                <span className="font-bold text-black">
                  {hiringModel === "hourly"
                    ? `$${budgetMin || 40} - $${budgetMax || 90}/hr`
                    : `$${budgetMin || 1000} - $${budgetMax || 5000} Total`}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Timeline</span>
                <span className="font-bold text-black">{durationWeeks} Weeks</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Communication</span>
                <span className="font-bold text-black capitalize">{communicationPref.replace("_", " ")}</span>
              </div>
            </div>

            {hiringModel === "fixed" && fixedDeliverables.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  Agreed Milestone Deliverables
                </h4>
                <ul className="space-y-1.5 text-xs text-neutral-700">
                  {fixedDeliverables.map((d, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-bold text-black">{i + 1}.</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
              <Button variant="outline" onClick={() => setIsPreviewMode(false)} className="text-xs">
                Back to Edit
              </Button>
              <Button
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="bg-black text-white hover:bg-neutral-800 text-xs font-bold"
              >
                Confirm & Submit Project
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* FORM EDITOR MODE */
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(false);
          }}
          className="space-y-8"
        >
          {/* STEP 1: CATEGORY & TITLE */}
          <Card className="bg-white border-neutral-200 shadow-xs">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-lg font-bold text-black flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold">1</span>
                Project Category & Title
              </CardTitle>
              <CardDescription className="text-xs text-neutral-500">
                Identify the primary field of expertise and give your project a clear headline.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 pt-0 space-y-5">
              {/* Category Grid */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                  Service Category
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                  {Object.values(HIRE_CATEGORIES).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        category === cat.id
                          ? "border-black bg-black text-white shadow-xs"
                          : "border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800"
                      }`}
                    >
                      <span className="text-xs font-bold block">{cat.shortTitle}</span>
                      <span className={`text-[10px] block truncate mt-0.5 ${category === cat.id ? "text-neutral-300" : "text-neutral-500"}`}>
                        {cat.typicalHourlyRange}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js SaaS Authentication & Payment Integration"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-black text-black"
                />
                <span className="text-[11px] text-neutral-400 mt-1 block">5 to 160 characters</span>
              </div>
            </CardContent>
          </Card>

          {/* STEP 2: SCOPE & DESCRIPTION (WITH AI ASSISTANT) */}
          <Card className="bg-white border-neutral-200 shadow-xs">
            <CardHeader className="p-6 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="text-lg font-bold text-black flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold">2</span>
                  Detailed Description & Scope
                </CardTitle>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAnalyzeScope}
                  disabled={isAnalyzingScope || description.length < 20}
                  className="text-xs font-bold gap-1.5 border-neutral-300 hover:bg-neutral-100"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-neutral-700 ${isAnalyzingScope ? "animate-spin" : ""}`} />
                  {isAnalyzingScope ? "Analyzing Scope..." : "AI Scope Assistant"}
                </Button>
              </div>
              <CardDescription className="text-xs text-neutral-500">
                Detail your goals, tech stack, constraints, and success criteria. Click AI Scope Assistant to verify missing requirements.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 pt-0 space-y-4">
              <textarea
                required
                rows={6}
                placeholder="Explain the background, key objectives, technical preferences, existing codebases, and expected deliverables..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-black text-black leading-relaxed"
              />

              {/* AI Scope Analysis Suggestions Banner */}
              {aiAnalysis && (
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3 animate-in fade-in-50">
                  <div className="flex items-center gap-2 text-xs font-bold text-black">
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>AI Scope Assistant Insights</span>
                  </div>

                  {aiAnalysis.missingElements.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                        Recommended Information to Add:
                      </span>
                      <ul className="text-xs text-neutral-700 space-y-1 list-disc list-inside">
                        {aiAnalysis.missingElements.map((m: string, i: number) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiAnalysis.clarifyingQuestions.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                        Questions for your Specialist:
                      </span>
                      <ul className="text-xs text-neutral-600 space-y-1">
                        {aiAnalysis.clarifyingQuestions.slice(0, 2).map((q: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Required Skills Chips */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                  Required Skills & Technologies *
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-neutral-100 text-black border border-neutral-200"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-neutral-400 hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 max-w-sm">
                  <input
                    type="text"
                    placeholder="Add skill (e.g. PostgreSQL, LangChain)"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black text-black"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddSkill}
                    className="text-xs font-bold border-neutral-300"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* STEP 3: HIRING MODEL & COMMERCIAL TERMS */}
          <Card className="bg-white border-neutral-200 shadow-xs">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-lg font-bold text-black flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold">3</span>
                Hiring Model & Budget
              </CardTitle>
              <CardDescription className="text-xs text-neutral-500">
                Choose between hourly capacity or fixed-price milestones.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 pt-0 space-y-6">
              {/* Hiring Model Selector */}
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <button
                  type="button"
                  onClick={() => setHiringModel("hourly")}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    hiringModel === "hourly"
                      ? "border-black bg-black text-white shadow-xs"
                      : "border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-bold">Hourly Hiring</span>
                  </div>
                  <span className={`text-[11px] block mt-1 ${hiringModel === "hourly" ? "text-neutral-300" : "text-neutral-500"}`}>
                    Pay for logged sprint hours
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setHiringModel("fixed")}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    hiringModel === "fixed"
                      ? "border-black bg-black text-white shadow-xs"
                      : "border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm font-bold">Fixed Project</span>
                  </div>
                  <span className={`text-[11px] block mt-1 ${hiringModel === "fixed" ? "text-neutral-300" : "text-neutral-500"}`}>
                    Milestone-based delivery
                  </span>
                </button>
              </div>

              {/* Dynamic Model Configuration */}
              {hiringModel === "hourly" ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1.5">
                      Hourly Rate Min (USD)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1.5">
                      Hourly Rate Max (USD)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 95"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1.5">
                      Target Hours / Week
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 20"
                      value={hourlyHoursPerWeek}
                      onChange={(e) => setHourlyHoursPerWeek(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 mb-1.5">
                        Total Project Budget Min (USD)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 1500"
                        value={budgetMin}
                        onChange={(e) => setBudgetMin(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-600 mb-1.5">
                        Total Project Budget Max (USD)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 4500"
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>
                  </div>

                  {/* Deliverables List */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1.5">
                      Key Deliverables & Milestones
                    </label>
                    <ul className="space-y-1.5 mb-2 text-xs">
                      {fixedDeliverables.map((item, index) => (
                        <li key={index} className="flex items-center justify-between p-2 rounded-lg bg-white border border-neutral-200">
                          <span className="text-neutral-800">{item}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDeliverable(index)}
                            className="text-neutral-400 hover:text-red-600 ml-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Add specific deliverable..."
                        value={deliverableInput}
                        onChange={(e) => setDeliverableInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddDeliverable();
                          }
                        }}
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-black"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleAddDeliverable}
                        className="text-xs font-bold border-neutral-300"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Experience Level & Communication */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1.5">
                    Experience Level Required
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                    className="w-full px-3 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl text-black focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    <option value="entry">Associate / Entry (1-2 years)</option>
                    <option value="intermediate">Intermediate (3-5 years)</option>
                    <option value="expert">Senior / Principal (5+ years)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1.5">
                    Communication Preference
                  </label>
                  <select
                    value={communicationPref}
                    onChange={(e) => setCommunicationPref(e.target.value as any)}
                    className="w-full px-3 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl text-black focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    <option value="flexible">Flexible / Async</option>
                    <option value="slack">Slack / Discord Workspace</option>
                    <option value="video_calls">Regular Video Standups</option>
                    <option value="email">Formal Email Checkpoints</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SUBMISSION BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting || !title}
              className="w-full sm:w-auto text-xs font-bold border-neutral-300 hover:bg-neutral-50 gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              Save as Draft
            </Button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPreviewMode(true)}
                disabled={!title || !description}
                className="w-full sm:w-auto text-xs font-bold border-neutral-300 hover:bg-neutral-50"
              >
                Preview
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting || !title || description.length < 20}
                className="w-full sm:w-auto bg-black text-white hover:bg-neutral-800 text-xs font-bold px-8 shadow-xs gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? "Submitting..." : "Submit Project Request"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
