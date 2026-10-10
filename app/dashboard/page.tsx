"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  ArrowUpDown,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  User,
  ExternalLink,
  FileText,
  Calculator,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterSidebar } from "@/components/dashboard/FilterSidebar";
import { GigCard } from "@/components/dashboard/GigCard";
import { GigPreviewDrawer } from "@/components/dashboard/GigPreviewDrawer";
import { SkeletonLoader } from "@/components/dashboard/SkeletonLoader";
import { Dialog } from "@/components/ui/dialog";
import { GigListing, GigMatchScore } from "@/types/gig";
import { UserProfile } from "@/types/profile";
import { DEFAULT_PROFILE } from "@/data/demo-profile";
import { MOCK_GIGS } from "@/data/gigs";
import {
  getStoredProfile,
  getStoredGigs,
  getTrackedApplications,
  toggleSaveGig,
} from "@/lib/storage";
import { calculateAllMatches } from "@/lib/matching";
import { filterAndSortGigs, FilterState, DEFAULT_FILTERS } from "@/lib/filters";

import { apiClient } from "@/lib/api";

function DashboardContent() {
  const searchParams = useSearchParams();

  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [allGigs, setAllGigs] = useState<GigListing[]>(MOCK_GIGS);
  const [savedGigIds, setSavedGigIds] = useState<Set<string>>(new Set());
  const [selectedGig, setSelectedGig] = useState<GigListing | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters State
  const [filters, setFilters] = useState<FilterState>(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      return { ...DEFAULT_FILTERS, category: categoryParam };
    }
    return DEFAULT_FILTERS;
  });

  // Load data via unified apiClient (Supabase > Spring Boot > LocalStorage)
  useEffect(() => {
    let isMountedLocal = true;
    setIsMounted(true);
    async function loadData() {
      try {
        const [p, g, apps] = await Promise.all([
          apiClient.getProfile(),
          apiClient.getGigs(),
          apiClient.getApplications(),
        ]);
        if (isMountedLocal) {
          setProfile(p);
          setAllGigs(g);
          setSavedGigIds(new Set(apps.map((a) => a.gigId)));
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        if (isMountedLocal) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    // Check if user came from onboarding
    if (searchParams.get("onboarded") === "true") {
      setToastMessage("Profile saved! Your matches have been recalibrated based on your skills.");
    }

    return () => {
      isMountedLocal = false;
    };
  }, [searchParams]);

  // Recalculate matches whenever profile or gigs change
  const matchesMap: Record<string, GigMatchScore> = useMemo(() => {
    return calculateAllMatches(profile, allGigs);
  }, [profile, allGigs]);

  // Filtered & sorted listings
  const filteredGigs = useMemo(() => {
    return filterAndSortGigs(allGigs, matchesMap, filters, profile);
  }, [allGigs, matchesMap, filters, profile]);

  // Unique platform names for the filter dropdown
  const platformOptions = useMemo(() => {
    const set = new Set<string>();
    for (const g of allGigs) {
      set.add(g.platformName);
    }
    return Array.from(set).sort();
  }, [allGigs]);

  const handleToggleSave = async (gig: GigListing) => {
    const isNowSaved = await apiClient.toggleSavedGig(gig);
    const nextSet = new Set(savedGigIds);
    if (isNowSaved) {
      nextSet.add(gig.id);
      showToast(`Saved "${gig.title}" to your Applications Tracker.`);
    } else {
      nextSet.delete(gig.id);
      showToast(`Removed "${gig.title}" from your saved gigs.`);
    }
    setSavedGigIds(nextSet);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-canvas-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toast / Notification Banner */}
        {toastMessage && (
          <div className="mb-6 p-4 rounded-xl bg-black border border-neutral-800 text-white text-xs sm:text-sm font-medium flex items-center justify-between shadow-xs animate-in slide-in-from-top">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-neutral-400 hover:text-white ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dashboard Top Header & Search / Controls */}
        <div className="bg-white rounded-[14px] border border-neutral-200 p-5 sm:p-6 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                  Your Best-Fit Opportunities
                </h1>
                <span
                  suppressHydrationWarning
                  className="text-xs font-bold text-black bg-neutral-100 border border-neutral-300 px-2.5 py-0.5 rounded-full"
                >
                  {filteredGigs.length} {filteredGigs.length === 1 ? "match" : "matches"}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-1" suppressHydrationWarning>
                Personalized for <strong className="text-black">{profile.fullName}</strong> · Country:{" "}
                <span className="text-black font-semibold">{profile.country} ({profile.countryCode})</span>
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                href="/profile"
                variant="secondary"
                size="sm"
                className="text-xs border-neutral-300 hover:bg-neutral-100 text-black"
              >
                <User className="w-3.5 h-3.5 mr-1 text-black" />
                <span suppressHydrationWarning>
                  Edit Skills ({isMounted ? (profile.skills?.length || 0) : DEFAULT_PROFILE.skills.length})
                </span>
              </Button>
              <Button
                href="/applications"
                variant="subtle"
                size="sm"
                className="text-xs bg-neutral-100 text-black hover:bg-neutral-200 border border-neutral-200"
              >
                <span suppressHydrationWarning>
                  Saved Tracker ({isMounted ? savedGigIds.size : 0})
                </span>
              </Button>
            </div>
          </div>

          {/* Search bar & Sort Controls */}
          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search roles, platforms, skills (e.g. Java, Python, Outlier)..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full h-10 pl-9 pr-4 rounded-lg border border-neutral-300 text-xs sm:text-sm bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-black focus:border-black text-black"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters({ ...filters, search: "" })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile Filter Button */}
              <Button
                variant="secondary"
                size="md"
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 text-xs border-neutral-300 text-black"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-black" />
                <span>Filters</span>
              </Button>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 text-xs text-neutral-600 shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
                <span className="hidden sm:inline">Sort:</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                  className="h-10 px-2.5 rounded-lg border border-neutral-300 bg-white text-xs font-semibold text-black focus:ring-1 focus:ring-black"
                >
                  <option value="best-match">Best Match Score</option>
                  <option value="newest-reviewed">Newest Reviewed</option>
                  <option value="pay-high-to-low">Highest Pay</option>
                  <option value="rating">Platform Rating</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 3 Resume Calibration Status Card */}
        <div className="mb-8 rounded-[14px] border border-neutral-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border shrink-0 ${
                profile.resume
                  ? "bg-black border-black text-white"
                  : "bg-neutral-100 border-neutral-300 text-black"
              }`}
            >
              {profile.resume ? (
                <FileText className="w-5 h-5" />
              ) : (
                <Calculator className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-black">
                  {profile.resume
                    ? `Resume Calibrated: ${profile.resume.fileName}`
                    : "Scoring with Manual Skills Profile"}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    profile.resume
                      ? "bg-black text-white border-black"
                      : "bg-neutral-100 text-neutral-800 border-neutral-300"
                  }`}
                >
                  {profile.resume ? "AI Verified Extraction" : "Manual Input"}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5" suppressHydrationWarning>
                Deterministic formula active across {profile.skills?.length || 0} skills · Geographic screening rules set for {profile.country ? `${profile.country} (${profile.countryCode || ""})` : "All Regions"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              href="/profile"
              size="sm"
              variant={profile.resume ? "secondary" : "primary"}
              className="text-xs"
            >
              {profile.resume ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-black" />
                  Manage Resume & Evidence
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  Upload Resume for AI Matching
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Grid: Left Filters, Center List, Right Detail Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Desktop Left Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <FilterSidebar
              filters={filters}
              onChange={setFilters}
              availablePlatforms={platformOptions}
              userProfile={profile}
              totalCount={allGigs.length}
              filteredCount={filteredGigs.length}
            />
          </div>

          {/* Central Listings Results */}
          <div
            className={`space-y-4 ${
              selectedGig ? "lg:col-span-5" : "lg:col-span-9"
            }`}
          >
            {isLoading ? (
              <SkeletonLoader />
            ) : filteredGigs.length > 0 ? (
              filteredGigs.map((gig) => (
                <GigCard
                  key={gig.id}
                  gig={gig}
                  matchScore={
                    matchesMap[gig.id] || {
                      gigId: gig.id,
                      matchScore: 60,
                      matchedSkills: [],
                      missingSkills: gig.skillsRequired,
                      isCountryEligible: true,
                      countryNote: "Eligible",
                      scoreBreakdown: {
                        skillScore: 30,
                        experienceScore: 10,
                        categoryScore: 10,
                        countryFitScore: 10,
                      },
                    }
                  }
                  isSaved={savedGigIds.has(gig.id)}
                  onToggleSave={handleToggleSave}
                  isSelected={selectedGig?.id === gig.id}
                  onSelect={(g) => {
                    setSelectedGig(g);
                    setMobilePreviewOpen(true);
                  }}
                />
              ))
            ) : (
              /* Empty state */
              <div className="rounded-[14px] border border-border bg-white p-12 text-center space-y-4 shadow-xs">
                <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-ink">No gigs match your current filters</h3>
                <p className="text-xs sm:text-sm text-ink-muted max-w-sm mx-auto">
                  Try clearing your search query, lowering the minimum match score, or selecting "All Categories".
                </p>
                <div className="pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setFilters({ ...DEFAULT_FILTERS })}
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    Reset All Filters
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Right Selected Gig Preview Panel */}
          {selectedGig && (
            <div className="hidden lg:block lg:col-span-4">
              <GigPreviewDrawer
                gig={selectedGig}
                matchScore={matchesMap[selectedGig.id]}
                userProfile={profile}
                isSaved={savedGigIds.has(selectedGig.id)}
                onToggleSave={handleToggleSave}
                onClose={() => setSelectedGig(null)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Selected Gig Detail Dialog */}
      <Dialog
        open={mobilePreviewOpen && Boolean(selectedGig)}
        onOpenChange={(open) => {
          setMobilePreviewOpen(open);
          if (!open) setSelectedGig(null);
        }}
        title={selectedGig?.title || "Gig Details"}
        description={`${selectedGig?.platformName || ""} · ${selectedGig?.category || ""}`}
      >
        {selectedGig && (
          <div className="max-h-[75vh] overflow-y-auto pr-1">
            <GigPreviewDrawer
              gig={selectedGig}
              matchScore={matchesMap[selectedGig.id]}
              userProfile={profile}
              isSaved={savedGigIds.has(selectedGig.id)}
              onToggleSave={handleToggleSave}
              onClose={() => {
                setMobilePreviewOpen(false);
                setSelectedGig(null);
              }}
            />
          </div>
        )}
      </Dialog>

      {/* Mobile Filters Modal / Drawer */}
      <Dialog
        open={mobileFilterOpen}
        onOpenChange={setMobileFilterOpen}
        title="Filter AI Opportunities"
        description="Refine by category, payment verification, and country eligibility"
      >
        <FilterSidebar
          filters={filters}
          onChange={(newF) => {
            setFilters(newF);
            setMobileFilterOpen(false);
          }}
          availablePlatforms={platformOptions}
          userProfile={profile}
          totalCount={allGigs.length}
          filteredCount={filteredGigs.length}
        />
        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <Button onClick={() => setMobileFilterOpen(false)}>
            Show {filteredGigs.length} Results
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-canvas-bg py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SkeletonLoader />
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

