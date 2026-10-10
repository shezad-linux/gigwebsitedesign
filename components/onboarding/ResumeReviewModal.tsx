"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Trash2,
  Sparkles,
  FileText,
  Briefcase,
  Layers,
  ArrowRight,
  ShieldCheck,
  User,
  Mail,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExtractedProfileData, SkillEvidence } from "@/lib/extraction/ai-extractor";

interface ResumeReviewModalProps {
  fileName: string;
  fileSize: number;
  extractedProfile: ExtractedProfileData;
  onConfirm: (confirmed: {
    fullName?: string;
    email?: string;
    phone?: string;
    country?: string;
    countryCode?: string;
    skills: string[];
    experienceLevel: string;
    yearsOfExperience: number;
    summary: string;
  }) => void;
  onDeleteResume: () => void;
  onCancel: () => void;
}

export const ResumeReviewModal: React.FC<ResumeReviewModalProps> = ({
  fileName,
  fileSize,
  extractedProfile,
  onConfirm,
  onDeleteResume,
  onCancel,
}) => {
  const [fullName, setFullName] = useState(extractedProfile.fullName || "");
  const [email, setEmail] = useState(extractedProfile.email || "");
  const [phone, setPhone] = useState(extractedProfile.phone || "");
  const [country, setCountry] = useState(extractedProfile.country || "India");
  const [countryCode, setCountryCode] = useState(
    extractedProfile.countryCode || "IN"
  );

  const [skills, setSkills] = useState<string[]>(extractedProfile.skills || []);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<string>(
    extractedProfile.experienceLevel || "mid_level"
  );
  const [years, setYears] = useState<number>(
    extractedProfile.yearsOfExperience || 2
  );
  const [summary, setSummary] = useState<string>(
    extractedProfile.summary || ""
  );

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const addSkill = () => {
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    if (!skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setNewSkillInput("");
  };

  const getEvidenceForSkill = (skill: string): SkillEvidence | undefined => {
    return (extractedProfile.evidence || []).find(
      (e) => e.skill.toLowerCase() === skill.toLowerCase()
    );
  };

  return (
    <div className="rounded-2xl bg-white border border-border p-6 shadow-xl space-y-6 animate-in fade-in-50 duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Real AI Extraction Awaiting Confirmation</span>
          </div>
          <h3 className="text-xl font-bold text-ink tracking-tight">
            Review & Confirm Extracted Resume Facts
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Facts extracted directly from{" "}
            <span className="font-semibold text-slate-700">{fileName}</span> (
            {Math.round(fileSize / 1024)} KB). Confirm or adjust below before saving.
          </p>
        </div>

        <button
          onClick={onDeleteResume}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-black font-semibold p-2 rounded-lg hover:bg-neutral-100 transition-colors self-start sm:self-auto"
          title="Delete uploaded file and parsed data"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remove Resume</span>
        </button>
      </div>

      {/* Extracted Identity & Location Info */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
          Candidate Identity & Geographic Screening
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <span className="text-[11px] text-slate-500 font-medium block mb-1">
              Candidate Name
            </span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full h-9 px-3 rounded-xl border border-border text-xs focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            />
          </div>

          <div>
            <span className="text-[11px] text-slate-500 font-medium block mb-1">
              Email Address
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="candidate@example.com"
              className="w-full h-9 px-3 rounded-xl border border-border text-xs focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            />
          </div>

          <div>
            <span className="text-[11px] text-slate-500 font-medium block mb-1">
              Country & ISO Code
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Country (e.g. India, United States)"
                className="flex-1 h-9 px-3 rounded-xl border border-border text-xs focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
              />
              <input
                type="text"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                placeholder="IN"
                maxLength={3}
                className="w-14 h-9 px-2 rounded-xl border border-border text-xs text-center font-mono font-bold focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section with Evidence Citations */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Identified Technical Skills ({skills.length})
          </label>
          <span className="text-[11px] text-slate-400">
            Click &times; to remove any false positives
          </span>
        </div>

        <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 min-h-[60px]">
          {skills.map((skill) => {
            const ev = getEvidenceForSkill(skill);
            return (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-ink border border-border shadow-2xs hover:border-brand-300 transition-colors"
                title={ev?.contextSnippet ? `Found in: ${ev.contextSnippet}` : undefined}
              >
                <span>{skill}</span>
                {ev && (
                  <span className="text-[10px] text-brand-600 font-semibold bg-brand-50 px-1 py-0.2 rounded border border-brand-100">
                    {ev.sourceSection}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-neutral-400 hover:text-black ml-0.5"
                  aria-label={`Remove ${skill}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>

        {/* Add missing skill */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newSkillInput}
            onChange={(e) => setNewSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            placeholder="Add missing skill (e.g. Prompt Engineering, C++, Rust)..."
            className="flex-1 h-9 px-3 rounded-xl border border-border text-xs focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addSkill}
            disabled={!newSkillInput.trim()}
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Skill
          </Button>
        </div>
      </div>

      {/* Experience Level & Estimated Years */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Experience Level Tier
          </label>
          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs text-ink focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          >
            <option value="entry_level">Entry Level (0 - 2 years)</option>
            <option value="mid_level">Mid Level (2 - 5 years)</option>
            <option value="senior">Senior (5+ years)</option>
            <option value="expert">Expert / Specialist</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Years of Relevant Experience
          </label>
          <input
            type="number"
            min="0"
            max="30"
            step="0.5"
            value={years}
            onChange={(e) => setYears(parseFloat(e.target.value) || 0)}
            className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs text-ink focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          />
        </div>
      </div>

      {/* Inferred Summary */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Extracted Profile Summary
        </label>
        <textarea
          rows={2}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full p-3 rounded-xl border border-border text-xs text-ink focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
        />
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <Button variant="secondary" size="md" onClick={onCancel}>
          Discard & Enter Manually
        </Button>
        <Button
          variant="primary"
          size="md"
          className="bg-brand-600 hover:bg-brand-700 font-semibold"
          onClick={() =>
            onConfirm({
              fullName: fullName.trim() || undefined,
              email: email.trim() || undefined,
              country: country.trim() || undefined,
              countryCode: countryCode.trim() || undefined,
              skills,
              experienceLevel,
              yearsOfExperience: years,
              summary,
            })
          }
        >
          <span>Confirm Profile & Match Gigs</span>
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    </div>
  );
};
