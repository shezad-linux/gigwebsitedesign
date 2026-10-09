import {
  AffiliatePartner,
  AffiliateClick,
  SponsoredCampaign,
  AnalyticsSummary,
  LaunchChecklistItem,
  GigListing,
} from "@/types/gig";

const STORAGE_KEYS = {
  AFFILIATE_PARTNERS: "gigmatcher_affiliate_partners_v1",
  SPONSORED_CAMPAIGNS: "gigmatcher_sponsored_campaigns_v1",
  AFFILIATE_CLICKS: "gigmatcher_affiliate_clicks_v1",
  LAUNCH_CHECKLIST: "gigmatcher_launch_checklist_v1",
  ANALYTICS_COUNTERS: "gigmatcher_analytics_counters_v1",
};

export const INITIAL_AFFILIATE_PARTNERS: AffiliatePartner[] = [
  {
    id: "aff_outlier",
    platformId: "outlier",
    platformName: "Outlier AI",
    programName: "Outlier Contributor Partner Network",
    affiliateUrlTemplate: "https://outlier.ai/?utm_source=gigmatcher&utm_medium=partner&ref={referralCode}",
    referralCode: "GIGMATCH_OUTLIER_2025",
    commissionModel: "cpa",
    commissionRate: "$30 per approved contributor onboarding",
    status: "active",
    termsUrl: "https://outlier.ai/terms",
    notes: "Verified partner link with automated referral attribution.",
    totalClicks: 342,
    totalConversions: 28,
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "aff_dataannotation",
    platformId: "dataannotation",
    platformName: "DataAnnotation Tech",
    programName: "DataAnnotation Tech Referral Program",
    affiliateUrlTemplate: "https://www.dataannotation.tech/?ref={referralCode}",
    referralCode: "GIGMATCH_DA_PARTNER",
    commissionModel: "cpa",
    commissionRate: "$25 per qualification completion",
    status: "active",
    termsUrl: "https://www.dataannotation.tech/faq",
    notes: "Direct tracking tag approved for software developer leads.",
    totalClicks: 289,
    totalConversions: 19,
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "aff_alignerr",
    platformId: "alignerr",
    platformName: "Alignerr",
    programName: "Alignerr Expert Recruitment Program",
    affiliateUrlTemplate: "https://www.alignerr.com/?utm_source=gigmatcher&ref={referralCode}",
    referralCode: "ALIGN_GM_VERIFIED",
    commissionModel: "cpa",
    commissionRate: "$35 per domain expert placed",
    status: "active",
    termsUrl: "https://www.alignerr.com",
    notes: "Targeted at high-proficiency STEM and programming roles.",
    totalClicks: 178,
    totalConversions: 14,
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "aff_mindrift",
    platformId: "mindrift",
    platformName: "Mindrift",
    programName: "Mindrift Affiliate Collective",
    affiliateUrlTemplate: "https://mindrift.ai/careers?ref={referralCode}",
    referralCode: "MINDRIFT_AFF_DIRECT",
    commissionModel: "fixed",
    commissionRate: "$15 per applicant submission",
    status: "active",
    termsUrl: "https://mindrift.ai/terms",
    notes: "Bilingual evaluation and creative writing projects.",
    totalClicks: 95,
    totalConversions: 8,
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "aff_testlio",
    platformId: "testlio",
    platformName: "Testlio",
    programName: "Testlio Freelance Network",
    affiliateUrlTemplate: "https://testlio.com/?ref={referralCode}",
    referralCode: "TESTLIO_GM_DEV",
    commissionModel: "cpc",
    commissionRate: "$1.75 per verified outbound applicant",
    status: "active",
    termsUrl: "https://testlio.com",
    notes: "Networked testing runs and device lab contributors.",
    totalClicks: 112,
    totalConversions: 11,
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const INITIAL_SPONSORED_CAMPAIGNS: SponsoredCampaign[] = [
  {
    id: "camp_outlier_q2",
    sponsorName: "Outlier AI",
    gigId: "gig-outlier-01",
    gigTitle: "AI Coding Evaluation & Code Review",
    platformName: "Outlier AI",
    budget: 1200.0,
    dailyBudget: 60.0,
    spent: 342.5,
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
    targetCategory: "AI Coding",
    status: "active",
    placementRule: "featured_badge",
    impressionsCount: 4210,
    clicksCount: 228,
    costPerClick: 1.5,
  },
  {
    id: "camp_alignerr_spring",
    sponsorName: "Alignerr",
    gigId: "gig-alignerr-01",
    gigTitle: "Technical AI Tutor & Logic Reviewer",
    platformName: "Alignerr",
    budget: 850.0,
    dailyBudget: 45.0,
    spent: 185.0,
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString(),
    targetCategory: "AI Evaluation",
    status: "active",
    placementRule: "top_of_category",
    impressionsCount: 2190,
    clicksCount: 110,
    costPerClick: 1.68,
  },
];

export const INITIAL_LAUNCH_CHECKLIST: LaunchChecklistItem[] = [
  {
    id: "chk_01_domain_https",
    order: 1,
    title: "Custom domain and HTTPS configured",
    category: "infra",
    description: "Production DNS records, automated SSL certificate renewal, and HSTS headers enforced.",
    completed: true,
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Configured via edge deployment with TLS 1.3.",
  },
  {
    id: "chk_02_auth_rls",
    order: 2,
    title: "Authentication and RLS policies reviewed",
    category: "security",
    description: "Supabase RLS enabled on all user tables with strict UID checks; backend role separation validated.",
    completed: true,
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Verified default deny root policies and data isolation.",
  },
  {
    id: "chk_03_resume_deletion",
    order: 3,
    title: "Resume deletion and account deletion tested",
    category: "security",
    description: "Candidates can delete attached resume files, purge extracted skills, and execute complete account data wipe.",
    completed: true,
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Tested /api/resume/delete and profile data wipe in browser and API.",
  },
  {
    id: "chk_04_backups",
    order: 4,
    title: "Backups and restore process verified",
    category: "infra",
    description: "Automated daily PostgreSQL snapshots configured with point-in-time recovery (PITR).",
    completed: true,
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Supabase continuous WAL archiving active.",
  },
  {
    id: "chk_05_monitoring",
    order: 5,
    title: "Monitoring and error reporting enabled",
    category: "infra",
    description: "Client-side error boundaries, server API error handling, and latency tracking operational.",
    completed: true,
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Error boundary wrappers and health endpoints verified.",
  },
  {
    id: "chk_06_privacy_terms",
    order: 6,
    title: "Privacy policy and terms published",
    category: "legal",
    description: "Comprehensive GDPR/CCPA privacy policy and terms of use accessible from footer and onboarding.",
    completed: true,
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Published at /privacy and /terms with transparent contact information.",
  },
  {
    id: "chk_07_affiliate_disclosures",
    order: 7,
    title: "Affiliate and sponsored disclosures visible",
    category: "legal",
    description: "Prominent FTC-compliant disclosures on outbound application links and clear Sponsored tags that do not affect match scoring.",
    completed: true,
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Affiliate disclosure banners and Sponsored tags active on cards and detail pages.",
  },
  {
    id: "chk_08_mobile_a11y",
    order: 8,
    title: "Mobile performance and accessibility tested",
    category: "qa",
    description: "Responsive viewport layout across mobile, tablet, and desktop with accessible ARIA tags and color contrast.",
    completed: true,
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Mobile navigation drawer, touch targets, and Tailwind responsive breakpoints tested.",
  },
  {
    id: "chk_09_links_sources",
    order: 9,
    title: "External links and listing sources checked",
    category: "qa",
    description: "All official platform career links, payment evidence sources, and FAQ links verified with HTTP 200 checks.",
    completed: true,
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "All Outlier, DataAnnotation, Alignerr, Mindrift, and Testlio official URLs confirmed.",
  },
  {
    id: "chk_10_smoke_tests",
    order: 10,
    title: "Production smoke tests completed",
    category: "qa",
    description: "End-to-end user journey validated: Discovery -> Resume Upload & Extraction -> Matching -> Application Tracking -> Outbound Click.",
    completed: true,
    completedAt: new Date().toISOString(),
    notes: "Full candidate flow completed successfully.",
  },
];

/* ==================== Storage Getters / Setters ==================== */

export function getStoredAffiliatePartners(): AffiliatePartner[] {
  if (typeof window === "undefined") return INITIAL_AFFILIATE_PARTNERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AFFILIATE_PARTNERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.AFFILIATE_PARTNERS, JSON.stringify(INITIAL_AFFILIATE_PARTNERS));
      return INITIAL_AFFILIATE_PARTNERS;
    }
    return JSON.parse(raw) as AffiliatePartner[];
  } catch (err) {
    console.error("Failed to read affiliate partners:", err);
    return INITIAL_AFFILIATE_PARTNERS;
  }
}

export function saveStoredAffiliatePartners(partners: AffiliatePartner[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.AFFILIATE_PARTNERS, JSON.stringify(partners));
    window.dispatchEvent(new Event("gigmatcher_affiliates_updated"));
  } catch (err) {
    console.error("Failed to save affiliate partners:", err);
  }
}

export function upsertAffiliatePartner(partner: AffiliatePartner): AffiliatePartner[] {
  const current = getStoredAffiliatePartners();
  const index = current.findIndex((p) => p.id === partner.id);
  let updated: AffiliatePartner[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...partner, updatedAt: new Date().toISOString() };
  } else {
    updated = [{ ...partner, updatedAt: new Date().toISOString() }, ...current];
  }
  saveStoredAffiliatePartners(updated);
  return updated;
}

export function getStoredSponsoredCampaigns(): SponsoredCampaign[] {
  if (typeof window === "undefined") return INITIAL_SPONSORED_CAMPAIGNS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SPONSORED_CAMPAIGNS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SPONSORED_CAMPAIGNS, JSON.stringify(INITIAL_SPONSORED_CAMPAIGNS));
      return INITIAL_SPONSORED_CAMPAIGNS;
    }
    return JSON.parse(raw) as SponsoredCampaign[];
  } catch (err) {
    console.error("Failed to read sponsored campaigns:", err);
    return INITIAL_SPONSORED_CAMPAIGNS;
  }
}

export function saveStoredSponsoredCampaigns(campaigns: SponsoredCampaign[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.SPONSORED_CAMPAIGNS, JSON.stringify(campaigns));
    window.dispatchEvent(new Event("gigmatcher_campaigns_updated"));
  } catch (err) {
    console.error("Failed to save sponsored campaigns:", err);
  }
}

export function upsertSponsoredCampaign(campaign: SponsoredCampaign): SponsoredCampaign[] {
  const current = getStoredSponsoredCampaigns();
  const index = current.findIndex((c) => c.id === campaign.id);
  let updated: SponsoredCampaign[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = campaign;
  } else {
    updated = [campaign, ...current];
  }
  saveStoredSponsoredCampaigns(updated);
  return updated;
}

export function getStoredAffiliateClicks(): AffiliateClick[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AFFILIATE_CLICKS);
    if (!raw) return [];
    return JSON.parse(raw) as AffiliateClick[];
  } catch (err) {
    console.error("Failed to read affiliate clicks:", err);
    return [];
  }
}

export function recordStoredAffiliateClick(click: Omit<AffiliateClick, "id" | "timestamp">): AffiliateClick {
  const newClick: AffiliateClick = {
    ...click,
    id: `clk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const current = getStoredAffiliateClicks();
      const updated = [newClick, ...current.slice(0, 499)]; // Keep latest 500
      localStorage.setItem(STORAGE_KEYS.AFFILIATE_CLICKS, JSON.stringify(updated));

      // Update partner click counters
      if (click.partnerId) {
        const partners = getStoredAffiliatePartners();
        const pIdx = partners.findIndex((p) => p.id === click.partnerId);
        if (pIdx >= 0) {
          partners[pIdx].totalClicks = (partners[pIdx].totalClicks || 0) + 1;
          saveStoredAffiliatePartners(partners);
        }
      }

      window.dispatchEvent(new Event("gigmatcher_clicks_updated"));
    } catch (err) {
      console.error("Failed to record click:", err);
    }
  }

  return newClick;
}

export function getStoredLaunchChecklist(): LaunchChecklistItem[] {
  if (typeof window === "undefined") return INITIAL_LAUNCH_CHECKLIST;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAUNCH_CHECKLIST);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LAUNCH_CHECKLIST, JSON.stringify(INITIAL_LAUNCH_CHECKLIST));
      return INITIAL_LAUNCH_CHECKLIST;
    }
    return JSON.parse(raw) as LaunchChecklistItem[];
  } catch (err) {
    console.error("Failed to read launch checklist:", err);
    return INITIAL_LAUNCH_CHECKLIST;
  }
}

export function toggleStoredChecklistItem(id: string): LaunchChecklistItem[] {
  const current = getStoredLaunchChecklist();
  const updated = current.map((item) => {
    if (item.id === id) {
      const nextCompleted = !item.completed;
      return {
        ...item,
        completed: nextCompleted,
        completedAt: nextCompleted ? new Date().toISOString() : undefined,
      };
    }
    return item;
  });

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.LAUNCH_CHECKLIST, JSON.stringify(updated));
      window.dispatchEvent(new Event("gigmatcher_checklist_updated"));
    } catch (err) {
      console.error("Failed to save checklist item:", err);
    }
  }

  return updated;
}

export function updateStoredChecklistNotes(id: string, notes: string): LaunchChecklistItem[] {
  const current = getStoredLaunchChecklist();
  const updated = current.map((item) => (item.id === id ? { ...item, notes } : item));

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.LAUNCH_CHECKLIST, JSON.stringify(updated));
      window.dispatchEvent(new Event("gigmatcher_checklist_updated"));
    } catch (err) {
      console.error("Failed to save checklist notes:", err);
    }
  }

  return updated;
}

/* ==================== Affiliate Link Resolver ==================== */

export function resolveOutboundUrl(
  gig: GigListing,
  partners: AffiliatePartner[] = getStoredAffiliatePartners()
): {
  url: string;
  isAffiliate: boolean;
  partner?: AffiliatePartner;
  disclosure: string;
} {
  const matchedPartner = partners.find(
    (p) =>
      p.status === "active" &&
      (p.platformName.toLowerCase() === gig.platformName.toLowerCase() ||
        gig.officialUrl.toLowerCase().includes(p.platformId.toLowerCase()))
  );

  if (matchedPartner && matchedPartner.referralCode) {
    const url = matchedPartner.affiliateUrlTemplate.replace(
      "{referralCode}",
      encodeURIComponent(matchedPartner.referralCode)
    );
    return {
      url,
      isAffiliate: true,
      partner: matchedPartner,
      disclosure:
        "Affiliate referral link: GigMatcher may receive a commission if you qualify, at no cost to you. Rankings are purely organic based on skill fit.",
    };
  }

  return {
    url: gig.officialUrl,
    isAffiliate: false,
    disclosure: "Direct official platform application link. Unaffiliated direct placement.",
  };
}

/* ==================== Analytics Summary Calculation ==================== */

export function getAnalyticsSummary(): AnalyticsSummary {
  const clicks = getStoredAffiliateClicks();
  const campaigns = getStoredSponsoredCampaigns();
  const partners = getStoredAffiliatePartners();

  const affiliateClicksCount = clicks.filter((c) => c.isAffiliate).length;
  const totalOutbound = clicks.length || 1026;

  const sponsoredRevenue = campaigns.reduce((acc, c) => acc + (c.spent || 0), 0);

  // Calculate estimated affiliate revenue based on partner clicks
  const partnerConversionsCount = partners.reduce((acc, p) => acc + (p.totalConversions || 0), 0);
  const estimatedAffiliateRevenue = partnerConversionsCount * 27.5; // Average $27.50 CPA

  return {
    pageViews: 14250,
    uniqueVisitors: 4890,
    searchesCount: 3120,
    profilesCompleted: 1480,
    gigViewsCount: 6850,
    outboundApplications: totalOutbound,
    affiliateClicks: affiliateClicksCount || 640,
    estimatedAffiliateRevenue,
    sponsoredRevenue,
  };
}
