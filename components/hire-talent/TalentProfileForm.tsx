"use client";

/* ==============================================================================
   TalentProfileForm Component
   Professional talent onboarding and profile management editor
   ============================================================================== */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserCheck,
  Briefcase,
  Clock,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Save,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { HIRE_CATEGORIES, HireServiceCategory, TalentProfile } from "@/lib/hire-talent/types";
import { saveTalentProfileAction } from "@/app/actions/hire-talent";

interface TalentProfileFormProps {
  initialProfile?: TalentProfile | null;
}

export function TalentProfileForm({ initialProfile }: TalentProfileFormProps) {
  const router = useRouter();

  const [fullName, setFullName] = useState(initialProfile?.full_name || "");
  const [headline, setHeadline] = useState(initialProfile?.headline || "");
  const [bio, setBio] = useState(initialProfile?.bio || "");
  const [skills, setSkills] = useState<string[]>(
    initialProfile?.skills || ["TypeScript", "Next.js", "React", "PostgreSQL"]
  );
  const [skillInput, setSkillInput] = useState("");
  const [experienceYears, setExperienceYears] = useState<number>(initialProfile?.experience_years || 5);
  const [hourlyRate, setHourlyRate] = useState<number>(initialProfile?.hourly_rate || 75);
  const [minProjectBudget, setMinProjectBudget] = useState<number>(initialProfile?.min_project_budget || 1500);
  const [availabilityStatus, setAvailabilityStatus] = useState(
    initialProfile?.availability_status || "available_now"
  );
  const [availabilityHours, setAvailabilityHours] = useState<number>(
    initialProfile?.availability_hours_per_week || 40
  );
  const [preferredCategories, setPreferredCategories] = useState<HireServiceCategory[]>(
    initialProfile?.preferred_categories || ["software-web"]
  );
  const [timezone, setTimezone] = useState(initialProfile?.timezone || "UTC");
  const [languages, setLanguages] = useState<string[]>(initialProfile?.languages || ["English"]);
  const [country, setCountry] = useState(initialProfile?.country || "United States");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const toggleCategory = (cat: HireServiceCategory) => {
    if (preferredCategories.includes(cat)) {
      if (preferredCategories.length > 1) {
        setPreferredCategories(preferredCategories.filter((c) => c !== cat));
      }
    } else {
      setPreferredCategories([...preferredCategories, cat]);
    }
  };

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setToastMessage(null);

    const payload = {
      full_name: fullName,
      headline,
      bio,
      skills,
      experience_years: experienceYears,
      hourly_rate: hourlyRate,
      min_project_budget: minProjectBudget,
      availability_status: availabilityStatus,
      availability_hours_per_week: availabilityHours,
      preferred_categories: preferredCategories,
      timezone,
      languages,
      country,
    };

    try {
      const res = await saveTalentProfileAction(payload);
      if (res.success) {
        setToastMessage({
          text: "Talent profile submitted successfully. Pending verification review.",
          type: "success",
        });
        setTimeout(() => router.push("/hire-talent"), 2000);
      } else {
        setToastMessage({ text: res.error || "Failed to save profile", type: "error" });
      }
    } catch {
      setToastMessage({ text: "An error occurred saving your profile", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {toastMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            toastMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Basics */}
        <Card className="bg-white border-neutral-200 shadow-xs">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-lg font-bold text-black flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-black" />
              Professional Overview
            </CardTitle>
            <CardDescription className="text-xs text-neutral-500">
              Your headline and biography are presented to clients during project recommendations.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 pt-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Turner"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1.5">
                  Country of Residence
                </label>
                <input
                  type="text"
                  placeholder="e.g. United States, Germany, India"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1.5">
                Professional Headline *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Full-Stack Next.js & Cloud Architect (8+ years exp)"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-black"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">5 to 160 characters</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1.5">
                Detailed Biography & Experience Summary *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Highlight your domain strengths, past project successes, team leadership, and technical specializations..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-black leading-relaxed"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">Minimum 20 characters</span>
            </div>
          </CardContent>
        </Card>

        {/* Categories & Skills */}
        <Card className="bg-white border-neutral-200 shadow-xs">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-lg font-bold text-black flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-black" />
              Service Categories & Technical Skills
            </CardTitle>
            <CardDescription className="text-xs text-neutral-500">
              Select all categories you wish to receive managed project invitations for.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 pt-0 space-y-5">
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-2">
                Preferred Categories *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.values(HIRE_CATEGORIES).map((cat) => {
                  const isSelected = preferredCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`p-2.5 rounded-xl text-left border text-xs font-bold transition-all ${
                        isSelected
                          ? "border-black bg-black text-white"
                          : "border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700"
                      }`}
                    >
                      {cat.shortTitle}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-2">
                Core Technical Skills & Tools *
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {skills.map((skill) => (
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
                  placeholder="e.g. Next.js, LangChain, Figma"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-black"
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

        {/* Pricing, Availability & Logistics */}
        <Card className="bg-white border-neutral-200 shadow-xs">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-lg font-bold text-black flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-black" />
              Commercial Rates & Capacity
            </CardTitle>
            <CardDescription className="text-xs text-neutral-500">
              Set your target rate boundaries and weekly capacity for matched projects.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 pt-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1.5">
                  Hourly Rate (USD) *
                </label>
                <input
                  type="number"
                  required
                  min={5}
                  max={500}
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1.5">
                  Minimum Project Budget (USD)
                </label>
                <input
                  type="number"
                  min={50}
                  value={minProjectBudget}
                  onChange={(e) => setMinProjectBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1.5">
                  Years of Hands-on Experience
                </label>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  max={50}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1.5">
                  Current Availability Status
                </label>
                <select
                  value={availabilityStatus}
                  onChange={(e) => setAvailabilityStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="available_now">Available Immediately (Full-Time)</option>
                  <option value="available_part_time">Available Part-Time (10-20h/wk)</option>
                  <option value="busy">Busy / Books Full</option>
                  <option value="not_available">Not Available</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1.5">
                  Hours Available / Week
                </label>
                <input
                  type="number"
                  min={0}
                  max={80}
                  value={availabilityHours}
                  onChange={(e) => setAvailabilityHours(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1.5">
                  Primary Timezone
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTC, America/New_York"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
          <p className="text-xs text-neutral-500">
            Profiles are reviewed by our platform technical directors before being presented for client matches.
          </p>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-black text-white hover:bg-neutral-800 text-xs font-bold px-8 shadow-xs"
          >
            <Save className="w-3.5 h-3.5 mr-2" />
            {isSubmitting ? "Saving Profile..." : "Save Talent Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
