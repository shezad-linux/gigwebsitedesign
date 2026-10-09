"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  FileText,
  Trash2,
  RotateCcw,
  Save,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Globe,
  Plus,
  X,
  ShieldCheck,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { UserProfile, UserLanguage } from "@/types/profile";
import {
  getStoredProfile,
  saveStoredProfile,
  resetStoredProfile,
  removeResumeFromProfile,
} from "@/lib/storage";
import { apiClient } from "@/lib/api";

const CATEGORY_CHOICES = [
  "AI Coding",
  "AI Evaluation",
  "Data Annotation",
  "Writing & Content",
  "Language & Translation",
  "Software & QA Testing",
];

const PAYOUT_CHOICES = ["PayPal", "Wise", "Direct Deposit", "Payoneer", "Deel"];

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(() => getStoredProfile());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [newLangName, setNewLangName] = useState("");
  const [newLangProf, setNewLangProf] = useState<UserLanguage["proficiency"]>("fluent");

  useEffect(() => {
    let isMounted = true;
    async function fetchLatestProfile() {
      try {
        const remoteProfile = await apiClient.getProfile();
        if (isMounted && remoteProfile) {
          setProfile(remoteProfile);
        }
      } catch (err) {
        console.warn("Could not load remote profile:", err);
      }
    }
    fetchLatestProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredProfile(profile);
    try {
      await apiClient.updateProfile(profile);
    } catch (err) {
      console.warn("Could not sync profile to backend:", err);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetProfile = () => {
    if (confirm("Reset profile to default verified candidate template?")) {
      const reset = resetStoredProfile();
      setProfile(reset);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleRemoveResume = () => {
    if (confirm("Remove attached sample resume from your profile?")) {
      const updated = removeResumeFromProfile();
      setProfile(updated);
    }
  };

  const addSkill = () => {
    if (!newSkillInput.trim()) return;
    const trimmed = newSkillInput.trim();
    if (!profile.skills.includes(trimmed)) {
      setProfile({
        ...profile,
        skills: [...profile.skills, trimmed],
      });
    }
    setNewSkillInput("");
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((s) => s !== skillToRemove),
    });
  };

  const addLanguage = () => {
    if (!newLangName.trim()) return;
    setProfile({
      ...profile,
      languages: [
        ...profile.languages,
        { name: newLangName.trim(), proficiency: newLangProf },
      ],
    });
    setNewLangName("");
  };

  const removeLanguage = (index: number) => {
    setProfile({
      ...profile,
      languages: profile.languages.filter((_, i) => i !== index),
    });
  };

  const toggleCategory = (cat: string) => {
    if (profile.desiredCategories.includes(cat)) {
      if (profile.desiredCategories.length > 1) {
        setProfile({
          ...profile,
          desiredCategories: profile.desiredCategories.filter((c) => c !== cat),
        });
      }
    } else {
      setProfile({
        ...profile,
        desiredCategories: [...profile.desiredCategories, cat],
      });
    }
  };

  const togglePayout = (pay: string) => {
    if (profile.preferredPayoutMethods.includes(pay)) {
      if (profile.preferredPayoutMethods.length > 1) {
        setProfile({
          ...profile,
          preferredPayoutMethods: profile.preferredPayoutMethods.filter((p) => p !== pay),
        });
      }
    } else {
      setProfile({
        ...profile,
        preferredPayoutMethods: [...profile.preferredPayoutMethods, pay],
      });
    }
  };

  return (
    <div className="min-h-screen bg-canvas-bg py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="bg-white rounded-[14px] border border-border p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-brand-600" />
              <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
                Profile & Matching Preferences
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              Changes made here immediately recalibrate your match scores across all catalog gigs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetProfile}
              className="text-xs text-slate-600"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset to Demo Profile
            </Button>
            <Link href="/dashboard">
              <Button size="sm" className="text-xs">
                View Matches <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Profile updated successfully! Matching dashboard scores have been updated.</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Identity & Country */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Personal & Geographic Information</CardTitle>
              <CardDescription>
                Country determines platform accessibility and geographic screening passes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-border text-xs sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-border text-xs sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Country of Residence
                  </label>
                  <input
                    type="text"
                    value={profile.country}
                    onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-border text-xs sm:text-sm"
                    placeholder="e.g. India, United States, Germany"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Country ISO Code
                  </label>
                  <input
                    type="text"
                    value={profile.countryCode}
                    onChange={(e) => setProfile({ ...profile, countryCode: e.target.value.toUpperCase() })}
                    className="w-full h-10 px-3 rounded-lg border border-border text-xs sm:text-sm font-mono"
                    placeholder="e.g. IN, US, GB, DE"
                    maxLength={3}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Tax / Contractor Classification
                </label>
                <input
                  type="text"
                  value={profile.workAuthorization || ""}
                  onChange={(e) => setProfile({ ...profile, workAuthorization: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-border text-xs sm:text-sm"
                  placeholder="e.g. Independent Contractor (W-8BEN compliant)"
                />
              </div>
            </CardContent>
          </Card>

          {/* Attached Resume */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Resume & Parser Cache</CardTitle>
                  <CardDescription>
                    Client-side extracted resume metadata used to suggest matching skills.
                  </CardDescription>
                </div>
                {profile.resume && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveResume}
                    className="text-red-600 hover:bg-red-50 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove Resume
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {profile.resume ? (
                <div className="p-4 rounded-xl border border-border bg-slate-50 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-brand-600" />
                      <span className="font-bold text-ink">{profile.resume.fileName}</span>
                      <span className="text-slate-400">
                        ({(profile.resume.fileSize / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Simulated parse active
                    </span>
                  </div>
                  <p className="text-slate-600 italic">{profile.resume.extractedSummary}</p>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500 space-y-2">
                  <p>No resume currently attached. Skills are driven entirely by your manual entries.</p>
                  <Link href="/onboarding">
                    <Button type="button" variant="secondary" size="sm">
                      Upload or Re-scan Resume in Onboarding
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills & Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Skills & Experience Tier</CardTitle>
              <CardDescription>
                Add or remove skills to observe real-time score shifts in the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Active Skills ({profile.skills.length})
                </label>
                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-border bg-slate-50 min-h-[50px]">
                  {profile.skills.map((sk) => (
                    <span
                      key={sk}
                      onClick={() => removeSkill(sk)}
                      className="px-2.5 py-1 text-xs rounded-md bg-brand-600 text-white font-medium cursor-pointer hover:bg-red-600 transition-colors flex items-center gap-1 group"
                      title="Click to remove"
                    >
                      {sk}
                      <X className="w-3 h-3 group-hover:block" />
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add skill (e.g. C++, PyTorch, React, Prompt Engineering)"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  className="h-9 px-3 rounded-lg border border-border text-xs flex-1"
                />
                <Button type="button" variant="secondary" size="sm" onClick={addSkill}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Skill
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Experience Level
                  </label>
                  <select
                    value={profile.experienceLevel}
                    onChange={(e) =>
                      setProfile({ ...profile, experienceLevel: e.target.value as any })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-border text-xs sm:text-sm bg-white"
                  >
                    <option value="entry">Entry (0-1 years)</option>
                    <option value="mid">Mid-Level (2-4 years)</option>
                    <option value="expert">Expert / Senior (5+ years)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={profile.yearsOfExperience}
                    onChange={(e) =>
                      setProfile({ ...profile, yearsOfExperience: Number(e.target.value) })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-border text-xs sm:text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Languages */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Languages</CardTitle>
              <CardDescription>
                Enables matching for bilingual evaluation and machine translation post-editing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {profile.languages.map((l, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-slate-50 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-brand-600" />
                      <span className="font-semibold text-ink">{l.name}</span>
                      <span className="text-slate-500 capitalize">({l.proficiency})</span>
                    </div>
                    {profile.languages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLanguage(idx)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Language (e.g. French, Spanish, Japanese)"
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
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Work Preferences & Payouts</CardTitle>
              <CardDescription>
                Configure desired categories, schedule commitment, and accepted payout methods.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">
                  Target Gig Categories
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORY_CHOICES.map((cat) => {
                    const active = profile.desiredCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`p-2.5 rounded-lg text-xs font-medium border text-left transition-colors flex items-center justify-between ${
                          active
                            ? "bg-brand-50 border-brand-600 text-brand-900 font-bold"
                            : "bg-white border-border text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span>{cat}</span>
                        {active && <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Weekly Hours Available
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={profile.weeklyHoursAvailable}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        weeklyHoursAvailable: Number(e.target.value),
                      })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-border text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">
                    Payout Methods
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PAYOUT_CHOICES.map((pay) => {
                      const active = profile.preferredPayoutMethods.includes(pay);
                      return (
                        <button
                          key={pay}
                          type="button"
                          onClick={() => togglePayout(pay)}
                          className={`px-2.5 py-1 rounded text-xs font-medium border ${
                            active
                              ? "bg-brand-600 text-white border-brand-600"
                              : "bg-white text-slate-700 border-border hover:bg-slate-50"
                          }`}
                        >
                          {pay}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Profile Bio
                </label>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full p-3 rounded-lg border border-border text-xs sm:text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Save Button */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link href="/dashboard">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
            <Button type="submit" size="lg" className="font-bold shadow-md">
              <Save className="w-4 h-4 mr-2" /> Save Profile & Recalculate Matches
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
