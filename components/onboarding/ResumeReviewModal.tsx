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
  Phone,
  Languages as LanguagesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ExtractedProfileData,
  SkillEvidence,
  ExtractedLanguage,
} from "@/lib/extraction/ai-extractor";

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
    languages: ExtractedLanguage[];
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
  const [country, setCountry] = useState(extractedProfile.country || "United States");
  const [countryCode, setCountryCode] = useState(
    extractedProfile.countryCode || "US"
  );

  const [languages, setLanguages] = useState<ExtractedLanguage[]>(
    extractedProfile.languages && extractedProfile.languages.length > 0
      ? extractedProfile.languages
      : [{ name: "English", proficiency: "fluent" }]
  );
  const [newLangName, setNewLangName] = useState("");
  const [newLangProf, setNewLangProf] = useState<ExtractedLanguage["proficiency"]>("fluent");

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

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const addLanguage = () => {
    const trimmed = newLangName.trim();
    if (!trimmed) return;
    setLanguages([...languages, { name: trimmed, proficiency: newLangProf }]);
    setNewLangName("");
  };

  const getEvidenceForSkill = (skill: string): SkillEvidence | undefined => {
    return (extractedProfile.evidence || []).find(
      (e) => e.skill.toLowerCase() === skill.toLowerCase()
    );
  };

  return (
    <div className="rounded-2xl bg-black border border-neutral-800 p-6 shadow-2xl space-y-6 text-white animate-in fade-in-50 duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>AI Resume Extraction Awaiting Confirmation</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Review & Confirm Extracted Facts
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Facts extracted directly from{" "}
            <span className="font-semibold text-neutral-200">{fileName}</span> (
            {Math.round(fileSize / 1024)} KB). Confirm or adjust below before saving.
          </p>
        </div>

        <button
          onClick={onDeleteResume}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white font-semibold p-2 rounded-lg hover:bg-neutral-900 transition-colors self-start sm:self-auto border border-transparent hover:border-neutral-700"
          title="Delete uploaded file and parsed data"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remove Resume</span>
        </button>
      </div>

      {/* Extracted Identity & Location Info */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
          Candidate Identity & Geographic Clearance
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <span className="text-[11px] text-neutral-400 font-medium block mb-1">
              Full Name
            </span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-white text-xs focus:ring-2 focus:ring-white/20 focus:outline-none"
            />
          </div>

          <div>
            <span className="text-[11px] text-neutral-400 font-medium block mb-1">
              Email Address
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="candidate@example.com"
              className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-white text-xs focus:ring-2 focus:ring-white/20 focus:outline-none"
            />
          </div>

          <div>
            <span className="text-[11px] text-neutral-400 font-medium block mb-1">
              Phone Number
            </span>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 234-5678"
              className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-white text-xs focus:ring-2 focus:ring-white/20 focus:outline-none"
            />
          </div>

          <div>
            <span className="text-[11px] text-neutral-400 font-medium block mb-1">
              Country & ISO
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Country"
                className="flex-1 h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-white text-xs focus:ring-2 focus:ring-white/20 focus:outline-none"
              />
              <input
                type="text"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                placeholder="US"
                maxLength={3}
                className="w-14 h-9 px-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white text-xs text-center font-mono font-bold focus:ring-2 focus:ring-white/20 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Languages Section */}
      <div className="space-y-3 pt-2 border-t border-neutral-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <LanguagesIcon className="w-3.5 h-3.5" />
            <span>Spoken & Written Languages ({languages.length})</span>
          </label>
          <span className="text-[11px] text-neutral-500">Used for language-specific gig eligibility</span>
        </div>

        <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-neutral-950 border border-neutral-800 min-h-[50px]">
          {languages.map((lang, idx) => (
            <span
              key={`${lang.name}-${idx}`}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium bg-neutral-900 text-white border border-neutral-700 shadow-xs"
            >
              <span>{lang.name}</span>
              <span className="text-[10px] text-neutral-300 font-semibold bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-600 uppercase tracking-wider">
                {lang.proficiency}
              </span>
              <button
                type="button"
                onClick={() => removeLanguage(idx)}
                className="text-neutral-400 hover:text-white ml-0.5"
                aria-label={`Remove ${lang.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        {/* Add Language Form */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newLangName}
            onChange={(e) => setNewLangName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLanguage())}
            placeholder="Add language (e.g. Spanish, German, Hindi, French)..."
            className="flex-1 h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-white text-xs focus:ring-2 focus:ring-white/20 focus:outline-none"
          />
          <select
            value={newLangProf}
            onChange={(e) => setNewLangProf(e.target.value as any)}
            className="h-9 px-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white text-xs focus:ring-2 focus:ring-white/20 focus:outline-none"
          >
            <option value="native">Native / Bilingual</option>
            <option value="fluent">Fluent / Professional</option>
            <option value="conversational">Conversational</option>
            <option value="basic">Basic</option>
          </select>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addLanguage}
            disabled={!newLangName.trim()}
            className="border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800 h-9"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Language
          </Button>
        </div>
      </div>

      {/* Skills Section with Evidence Citations */}
      <div className="space-y-3 pt-2 border-t border-neutral-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Identified Technical Skills ({skills.length})
          </label>
          <span className="text-[11px] text-neutral-500">
            Click &times; to remove any false positives
          </span>
        </div>

        <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-neutral-950 border border-neutral-800 min-h-[60px]">
          {skills.length === 0 ? (
            <span className="text-xs text-neutral-500 italic p-1">
              No technical skills detected yet. Add your core skills below.
            </span>
          ) : (
            skills.map((skill) => {
              const ev = getEvidenceForSkill(skill);
              return (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-900 text-white border border-neutral-700 shadow-xs hover:border-neutral-500 transition-colors"
                  title={ev?.contextSnippet ? `Found in: ${ev.contextSnippet}` : undefined}
                >
                  <span>{skill}</span>
                  {ev && (
                    <span className="text-[10px] text-neutral-300 font-semibold bg-neutral-800 px-1 py-0.5 rounded border border-neutral-700">
                      {ev.sourceSection}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-neutral-400 hover:text-white ml-0.5"
                    aria-label={`Remove ${skill}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })
          )}
        </div>

        {/* Add missing skill */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newSkillInput}
            onChange={(e) => setNewSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            placeholder="Add missing skill (e.g. Prompt Engineering, C++, PyTorch, RLHF)..."
            className="flex-1 h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-white text-xs focus:ring-2 focus:ring-white/20 focus:outline-none"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addSkill}
            disabled={!newSkillInput.trim()}
            className="border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800 h-9"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Skill
          </Button>
        </div>
      </div>

      {/* Experience Level & Estimated Years */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-800">
        <div>
          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
            Experience Level Tier
          </label>
          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-white text-xs focus:ring-2 focus:ring-white/20 focus:outline-none"
          >
            <option value="entry_level">Entry Level (0 - 2 years)</option>
            <option value="mid_level">Mid Level (2 - 5 years)</option>
            <option value="senior">Senior (5+ years)</option>
            <option value="expert">Expert / Specialist</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
            Years of Relevant Experience
          </label>
          <input
            type="number"
            min="0"
            max="35"
            step="0.5"
            value={years}
            onChange={(e) => setYears(parseFloat(e.target.value) || 0)}
            className="w-full h-10 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-white text-xs focus:ring-2 focus:ring-white/20 focus:outline-none"
          />
        </div>
      </div>

      {/* Inferred Summary */}
      <div>
        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
          Extracted Profile Summary
        </label>
        <textarea
          rows={2}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full p-3 rounded-xl border border-neutral-700 bg-neutral-950 text-white text-xs focus:ring-2 focus:ring-white/20 focus:outline-none"
        />
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
        <Button
          variant="secondary"
          size="md"
          onClick={onCancel}
          className="border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800"
        >
          Discard & Enter Manually
        </Button>
        <Button
          variant="primary"
          size="md"
          className="bg-white text-black hover:bg-neutral-200 font-semibold"
          onClick={() =>
            onConfirm({
              fullName: fullName.trim() || undefined,
              email: email.trim() || undefined,
              phone: phone.trim() || undefined,
              country: country.trim() || undefined,
              countryCode: countryCode.trim() || undefined,
              languages,
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
