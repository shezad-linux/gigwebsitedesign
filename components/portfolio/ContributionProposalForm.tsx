"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GitPullRequest,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Send,
  Loader2,
  Code2,
  FileCode,
  Layers,
} from "lucide-react";
import { PortfolioApp, ContributionType } from "@/types/portfolio";
import { PORTFOLIO_APPS } from "@/data/portfolio-apps";

const CONTRIBUTION_TYPES: ContributionType[] = [
  "Suggest a New Feature",
  "Improve an Existing Feature",
  "Fix a Bug",
  "UI/UX Improvements",
  "Performance Optimization",
  "Android Development",
  "Backend Development",
  "API Integration",
  "AI/ML Integration",
  "Testing & Quality Assurance",
  "Documentation",
  "Accessibility Improvements",
  "Security Improvements",
];

interface ContributionProposalFormProps {
  initialSelectedAppId?: string;
  apps?: PortfolioApp[];
}

export const ContributionProposalForm: React.FC<ContributionProposalFormProps> = ({
  initialSelectedAppId,
  apps = PORTFOLIO_APPS,
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    githubProfile: "",
    linkedinProfile: "",
    portfolioUrl: "",
    qualification: "",
    technicalSkills: "",
    projectIds: initialSelectedAppId ? [initialSelectedAppId] : ([] as string[]),
    contributionTypes: [] as ContributionType[],
    proposalTitle: "",
    detailedDescription: "",
    problemSolved: "",
    technicalApproach: "",
    expectedOutcome: "",
    repoReferenceUrl: "",
    estimatedCompletionTime: "",
    additionalComments: "",
    consentReviewed: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedProposal, setSubmittedProposal] = useState<{
    id: string;
    title: string;
    email: string;
  } | null>(null);

  const toggleProject = (appId: string) => {
    setFormData((prev) => {
      const exists = prev.projectIds.includes(appId);
      return {
        ...prev,
        projectIds: exists
          ? prev.projectIds.filter((id) => id !== appId)
          : [...prev.projectIds, appId],
      };
    });
  };

  const toggleContributionType = (type: ContributionType) => {
    setFormData((prev) => {
      const exists = prev.contributionTypes.includes(type);
      return {
        ...prev,
        contributionTypes: exists
          ? prev.contributionTypes.filter((t) => t !== type)
          : [...prev.contributionTypes, type],
      };
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim() || formData.fullName.length < 2) {
      newErrors.fullName = "Please enter your full name (minimum 2 characters)";
    }
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (
      !formData.githubProfile.trim() ||
      !formData.githubProfile.toLowerCase().includes("github.com")
    ) {
      newErrors.githubProfile = "Please provide your valid GitHub profile URL";
    }
    if (!formData.qualification.trim()) {
      newErrors.qualification = "Please specify your qualification or background";
    }
    if (!formData.technicalSkills.trim()) {
      newErrors.technicalSkills = "Please list your primary technical skills";
    }
    if (formData.projectIds.length === 0) {
      newErrors.projectIds = "Please select at least one application or project to contribute to";
    }
    if (formData.contributionTypes.length === 0) {
      newErrors.contributionTypes = "Please select at least one contribution type";
    }
    if (!formData.proposalTitle.trim() || formData.proposalTitle.length < 10) {
      newErrors.proposalTitle = "Title must be at least 10 characters long";
    }
    if (!formData.detailedDescription.trim() || formData.detailedDescription.length < 30) {
      newErrors.detailedDescription = "Detailed description must be at least 30 characters";
    }
    if (!formData.problemSolved.trim() || formData.problemSolved.length < 15) {
      newErrors.problemSolved = "Please describe the problem being solved (at least 15 characters)";
    }
    if (!formData.technicalApproach.trim() || formData.technicalApproach.length < 20) {
      newErrors.technicalApproach = "Please detail your proposed technical approach (at least 20 characters)";
    }
    if (!formData.expectedOutcome.trim() || formData.expectedOutcome.length < 15) {
      newErrors.expectedOutcome = "Please outline the expected outcome (at least 15 characters)";
    }
    if (!formData.estimatedCompletionTime.trim()) {
      newErrors.estimatedCompletionTime = "Please provide an estimated completion timeline";
    }
    if (!formData.consentReviewed) {
      newErrors.consentReviewed = "You must confirm that your proposal may be reviewed by the development team";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 300, behavior: "smooth" });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("/api/portfolio/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to submit proposal");
      }

      setSubmittedProposal({
        id: json.data.id,
        title: formData.proposalTitle,
        email: formData.email,
      });
      window.scrollTo({ top: 150, behavior: "smooth" });
    } catch (err: any) {
      setErrors({ form: err.message || "An unexpected error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Group apps by category for selection
  const appsByCategory = apps.reduce((acc, app) => {
    if (!acc[app.category]) acc[app.category] = [];
    acc[app.category].push(app);
    return acc;
  }, {} as Record<string, PortfolioApp[]>);

  if (submittedProposal) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 sm:p-12 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200 mb-3">
          Proposal Registered Successfully
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
          Thank you for your proposal!
        </h2>
        <p className="mt-3 text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed">
          Your contribution proposal <strong className="text-neutral-900">&quot;{submittedProposal.title}&quot;</strong> has been assigned tracking ID:
        </p>

        <div className="my-6 inline-block rounded-xl border border-neutral-200 bg-neutral-50 px-6 py-3 font-mono text-base font-bold text-neutral-900 shadow-inner">
          {submittedProposal.id}
        </div>

        <p className="text-xs text-neutral-500 max-w-md mx-auto">
          An acknowledgement email has been dispatched to <strong>{submittedProposal.email}</strong>. Our core development team reviews submissions weekly and will update your proposal status as it advances.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              setSubmittedProposal(null);
              setFormData({
                fullName: "",
                email: "",
                phoneNumber: "",
                githubProfile: "",
                linkedinProfile: "",
                portfolioUrl: "",
                qualification: "",
                technicalSkills: "",
                projectIds: [],
                contributionTypes: [],
                proposalTitle: "",
                detailedDescription: "",
                problemSolved: "",
                technicalApproach: "",
                expectedOutcome: "",
                repoReferenceUrl: "",
                estimatedCompletionTime: "",
                additionalComments: "",
                consentReviewed: false,
              });
            }}
            className="rounded-lg bg-black px-5 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors"
          >
            Submit Another Proposal
          </button>
          <Link
            href="/apps"
            className="rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-xs font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
          >
            Explore Apps Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-10 shadow-sm">
      {errors.form && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errors.form}</span>
        </div>
      )}

      {/* Section 1: Contributor Profile */}
      <div>
        <div className="border-b border-neutral-100 pb-3 mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Section 1 of 3</span>
          <h3 className="text-lg font-bold text-neutral-900">Contributor Information</h3>
          <p className="text-xs text-neutral-500">Tell us about your background and technical experience.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Maya Lin"
              className={`w-full rounded-xl border bg-neutral-50/50 px-3.5 py-2 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black ${
                errors.fullName ? "border-red-300" : "border-neutral-200"
              }`}
            />
            {errors.fullName && <p className="mt-1 text-[11px] text-red-600">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="maya@example.com"
              className={`w-full rounded-xl border bg-neutral-50/50 px-3.5 py-2 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black ${
                errors.email ? "border-red-300" : "border-neutral-200"
              }`}
            />
            {errors.email && <p className="mt-1 text-[11px] text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              Phone Number <span className="text-neutral-400 font-normal">(Optional)</span>
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="+1 555 019 2834"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              GitHub Profile URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formData.githubProfile}
              onChange={(e) => setFormData({ ...formData, githubProfile: e.target.value })}
              placeholder="https://github.com/username"
              className={`w-full rounded-xl border bg-neutral-50/50 px-3.5 py-2 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black ${
                errors.githubProfile ? "border-red-300" : "border-neutral-200"
              }`}
            />
            {errors.githubProfile && <p className="mt-1 text-[11px] text-red-600">{errors.githubProfile}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              LinkedIn Profile <span className="text-neutral-400 font-normal">(Optional)</span>
            </label>
            <input
              type="url"
              value={formData.linkedinProfile}
              onChange={(e) => setFormData({ ...formData, linkedinProfile: e.target.value })}
              placeholder="https://linkedin.com/in/username"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              Personal Portfolio / Website <span className="text-neutral-400 font-normal">(Optional)</span>
            </label>
            <input
              type="url"
              value={formData.portfolioUrl}
              onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
              placeholder="https://mayalin.dev"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              Current Qualification or Professional Background <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              placeholder="e.g. 3rd-year CS Undergrad / Senior Android Engineer / Self-taught Mobile Developer"
              className={`w-full rounded-xl border bg-neutral-50/50 px-3.5 py-2 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black ${
                errors.qualification ? "border-red-300" : "border-neutral-200"
              }`}
            />
            {errors.qualification && <p className="mt-1 text-[11px] text-red-600">{errors.qualification}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              Technical Skills & Tech Stack Experience <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.technicalSkills}
              onChange={(e) => setFormData({ ...formData, technicalSkills: e.target.value })}
              placeholder="e.g. Kotlin, Jetpack Compose, Room SQLite, OpenCV, C++ NDK, Coroutines, Git"
              className={`w-full rounded-xl border bg-neutral-50/50 px-3.5 py-2 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black ${
                errors.technicalSkills ? "border-red-300" : "border-neutral-200"
              }`}
            />
            {errors.technicalSkills && <p className="mt-1 text-[11px] text-red-600">{errors.technicalSkills}</p>}
          </div>
        </div>
      </div>

      {/* Section 2: Project Selection & Contribution Types */}
      <div>
        <div className="border-b border-neutral-100 pb-3 mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Section 2 of 3</span>
          <h3 className="text-lg font-bold text-neutral-900">Project & Contribution Target</h3>
          <p className="text-xs text-neutral-500">
            Select the specific application(s) you wish to collaborate on and your intended contribution areas.
          </p>
        </div>

        {/* Project Selection with Categories */}
        <div className="space-y-4">
          <label className="block text-xs font-semibold text-neutral-800">
            Target Application / Project Selection <span className="text-red-500">*</span> (Select one or multiple)
          </label>
          {errors.projectIds && <p className="text-[11px] text-red-600 -mt-2">{errors.projectIds}</p>}

          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 border border-neutral-200 rounded-xl p-3 bg-neutral-50/30">
            {Object.entries(appsByCategory).map(([category, catApps]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  {category}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {catApps.map((app) => {
                    const isSelected = formData.projectIds.includes(app.id);
                    return (
                      <div
                        key={app.id}
                        onClick={() => toggleProject(app.id)}
                        className={`flex items-center gap-3 rounded-lg border p-2.5 cursor-pointer select-none transition-all ${
                          isSelected
                            ? "border-black bg-black text-white shadow-sm"
                            : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300"
                        }`}
                      >
                        <div className="h-8 w-8 rounded-lg overflow-hidden shrink-0 border border-neutral-200 bg-neutral-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={app.iconUrl}
                            alt=""
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate leading-tight">{app.name}</p>
                          <p className={`text-[10px] truncate ${isSelected ? "text-neutral-300" : "text-neutral-400"}`}>
                            {app.packageName}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="h-4 w-4 rounded border-neutral-300"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contribution Types Selection */}
        <div className="mt-6 space-y-3">
          <label className="block text-xs font-semibold text-neutral-800">
            Contribution Type <span className="text-red-500">*</span> (Select all that apply)
          </label>
          {errors.contributionTypes && (
            <p className="text-[11px] text-red-600 -mt-1">{errors.contributionTypes}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {CONTRIBUTION_TYPES.map((type) => {
              const isSelected = formData.contributionTypes.includes(type);
              return (
                <label
                  key={type}
                  onClick={() => toggleContributionType(type)}
                  className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs font-medium cursor-pointer select-none transition-colors ${
                    isSelected
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="h-3.5 w-3.5 rounded"
                  />
                  <span>{type}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 3: Technical Proposal Details */}
      <div>
        <div className="border-b border-neutral-100 pb-3 mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Section 3 of 3</span>
          <h3 className="text-lg font-bold text-neutral-900">Technical Proposal Specifications</h3>
          <p className="text-xs text-neutral-500">Provide actionable architectural and implementation details.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              Proposed Feature or Improvement Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.proposalTitle}
              onChange={(e) => setFormData({ ...formData, proposalTitle: e.target.value })}
              placeholder="e.g. Implement Hardware-Accelerated Perspective Correction in DocuScan"
              className={`w-full rounded-xl border bg-neutral-50/50 px-3.5 py-2 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black ${
                errors.proposalTitle ? "border-red-300" : "border-neutral-200"
              }`}
            />
            {errors.proposalTitle && <p className="mt-1 text-[11px] text-red-600">{errors.proposalTitle}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              Detailed Description of the Proposal <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={formData.detailedDescription}
              onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
              placeholder="Describe what you plan to build or optimize in depth, including architecture, edge cases, and behavior..."
              className={`w-full rounded-xl border bg-neutral-50/50 px-3.5 py-2 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black ${
                errors.detailedDescription ? "border-red-300" : "border-neutral-200"
              }`}
            />
            {errors.detailedDescription && (
              <p className="mt-1 text-[11px] text-red-600">{errors.detailedDescription}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Problem Being Solved <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={formData.problemSolved}
                onChange={(e) => setFormData({ ...formData, problemSolved: e.target.value })}
                placeholder="What user pain point, performance bottleneck, or limitation does this resolve?"
                className={`w-full rounded-xl border bg-neutral-50/50 px-3.5 py-2 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black ${
                  errors.problemSolved ? "border-red-300" : "border-neutral-200"
                }`}
              />
              {errors.problemSolved && (
                <p className="mt-1 text-[11px] text-red-600">{errors.problemSolved}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Proposed Technical Approach <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={formData.technicalApproach}
                onChange={(e) => setFormData({ ...formData, technicalApproach: e.target.value })}
                placeholder="Which libraries, APIs, algorithms, or architectural patterns will you use?"
                className={`w-full rounded-xl border bg-neutral-50/50 px-3.5 py-2 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black ${
                  errors.technicalApproach ? "border-red-300" : "border-neutral-200"
                }`}
              />
              {errors.technicalApproach && (
                <p className="mt-1 text-[11px] text-red-600">{errors.technicalApproach}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              Expected Outcome & Verification Criteria <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={formData.expectedOutcome}
              onChange={(e) => setFormData({ ...formData, expectedOutcome: e.target.value })}
              placeholder="e.g. 50% lower memory footprint, zero crashes under Android 14, automated unit tests passing"
              className={`w-full rounded-xl border bg-neutral-50/50 px-3.5 py-2 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black ${
                errors.expectedOutcome ? "border-red-300" : "border-neutral-200"
              }`}
            />
            {errors.expectedOutcome && (
              <p className="mt-1 text-[11px] text-red-600">{errors.expectedOutcome}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Relevant GitHub Repo / Reference URL <span className="text-neutral-400 font-normal">(Optional)</span>
              </label>
              <input
                type="url"
                value={formData.repoReferenceUrl}
                onChange={(e) => setFormData({ ...formData, repoReferenceUrl: e.target.value })}
                placeholder="https://github.com/reference-or-fork"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Estimated Completion Time <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.estimatedCompletionTime}
                onChange={(e) => setFormData({ ...formData, estimatedCompletionTime: e.target.value })}
                placeholder="e.g. 10 days / 3 weeks"
                className={`w-full rounded-xl border bg-neutral-50/50 px-3.5 py-2 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black ${
                  errors.estimatedCompletionTime ? "border-red-300" : "border-neutral-200"
                }`}
              />
              {errors.estimatedCompletionTime && (
                <p className="mt-1 text-[11px] text-red-600">{errors.estimatedCompletionTime}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              Additional Comments <span className="text-neutral-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={formData.additionalComments}
              onChange={(e) => setFormData({ ...formData, additionalComments: e.target.value })}
              placeholder="Any other notes, timeline considerations, or mentorship requests..."
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Consent Checkbox */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.consentReviewed}
                onChange={(e) => setFormData({ ...formData, consentReviewed: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-black focus:ring-black"
              />
              <span className="text-xs text-neutral-700 leading-relaxed">
                I confirm that this proposal represents my original thought or collaboration plan. I understand that submitted proposals are reviewed by the development team and that submission does not guarantee automatic acceptance, integration, certificate issuance, or an internship offer.
              </span>
            </label>
            {errors.consentReviewed && (
              <p className="mt-2 text-[11px] text-red-600 font-medium">{errors.consentReviewed}</p>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-black px-8 py-3.5 text-sm font-bold text-white shadow-md hover:bg-neutral-800 disabled:opacity-50 transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting Proposal...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Contribution Proposal
            </>
          )}
        </button>
      </div>
    </form>
  );
};

