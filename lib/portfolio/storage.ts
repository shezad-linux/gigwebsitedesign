import type {
  PortfolioApp,
  ContributionProposal,
  ContributionCertificate,
  InternshipRecord,
  AcquisitionEnquiry,
  GeneralContactMessage,
  ContributionWorkflowStage,
  InternshipStatus,
  AcquisitionEnquiryStatus,
} from "../../types/portfolio";
import { PORTFOLIO_APPS } from "../../data/portfolio-apps";
import {
  SEED_PROPOSALS,
  SEED_CERTIFICATES,
  SEED_INTERNSHIPS,
  SEED_ACQUISITIONS,
} from "../../data/portfolio-seed";

const STORAGE_KEYS = {
  APPS: "remotasks_portfolio_apps_v2",
  PROPOSALS: "remotasks_portfolio_proposals_v2",
  CERTIFICATES: "remotasks_portfolio_certificates_v2",
  INTERNSHIPS: "remotasks_portfolio_internships_v2",
  ACQUISITIONS: "remotasks_portfolio_acquisitions_v2",
  CONTACTS: "remotasks_portfolio_contacts_v2",
};

// In-memory server fallback cache for SSR and API routes
let serverApps: PortfolioApp[] = [...PORTFOLIO_APPS];
let serverProposals: ContributionProposal[] = [...SEED_PROPOSALS];
let serverCertificates: ContributionCertificate[] = [...SEED_CERTIFICATES];
let serverInternships: InternshipRecord[] = [...SEED_INTERNSHIPS];
let serverAcquisitions: AcquisitionEnquiry[] = [...SEED_ACQUISITIONS];
let serverContacts: GeneralContactMessage[] = [];

/* ==================== Application Directory ==================== */

export function getPortfolioApps(): PortfolioApp[] {
  if (typeof window === "undefined") {
    return serverApps;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(PORTFOLIO_APPS));
      return PORTFOLIO_APPS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(PORTFOLIO_APPS));
      return PORTFOLIO_APPS;
    }
    // Ensure all 14 baseline apps exist
    const missing = PORTFOLIO_APPS.filter(
      (baseApp) => !parsed.some((p: any) => p.id === baseApp.id || p.packageName === baseApp.packageName)
    );
    if (missing.length > 0) {
      const merged = [...parsed, ...missing];
      localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch (err) {
    console.error("Error reading portfolio apps:", err);
    return PORTFOLIO_APPS;
  }
}

export function savePortfolioApp(app: PortfolioApp): PortfolioApp[] {
  const current = getPortfolioApps();
  const existingIdx = current.findIndex((a) => a.id === app.id);
  const updatedApp: PortfolioApp = {
    ...app,
    updatedAt: new Date().toISOString(),
  };

  let updatedList: PortfolioApp[];
  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = updatedApp;
  } else {
    updatedList = [updatedApp, ...current];
  }

  serverApps = updatedList;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(updatedList));
      window.dispatchEvent(new Event("portfolio_apps_updated"));
    } catch { }
  }
  return updatedList;
}

export function resetPortfolioApps(): PortfolioApp[] {
  serverApps = [...PORTFOLIO_APPS];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(PORTFOLIO_APPS));
      window.dispatchEvent(new Event("portfolio_apps_updated"));
    } catch { }
  }
  return PORTFOLIO_APPS;
}

/* ==================== Contribution Proposals ==================== */

export function getContributionProposals(): ContributionProposal[] {
  if (typeof window === "undefined") {
    return serverProposals;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROPOSALS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROPOSALS, JSON.stringify(SEED_PROPOSALS));
      return SEED_PROPOSALS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_PROPOSALS;
  } catch (err) {
    console.error("Error reading proposals:", err);
    return SEED_PROPOSALS;
  }
}

export function saveContributionProposal(
  proposal: Omit<ContributionProposal, "id" | "createdAt" | "updatedAt" | "status"> & {
    id?: string;
    status?: ContributionWorkflowStage;
  }
): ContributionProposal {
  const current = getContributionProposals();
  const now = new Date().toISOString();
  const newProposal: ContributionProposal = {
    id: proposal.id || `prop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    status: proposal.status || "Submitted",
    createdAt: now,
    updatedAt: now,
    ...proposal,
  };

  const updatedList = [newProposal, ...current];
  serverProposals = updatedList;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.PROPOSALS, JSON.stringify(updatedList));
      window.dispatchEvent(new Event("portfolio_proposals_updated"));
    } catch { }
  }
  return newProposal;
}

export function updateProposalStatus(
  id: string,
  status: ContributionWorkflowStage,
  adminFeedback?: string,
  internshipConsideration?: boolean
): ContributionProposal | null {
  const current = getContributionProposals();
  const index = current.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updated: ContributionProposal = {
    ...current[index],
    status,
    adminFeedback: adminFeedback !== undefined ? adminFeedback : current[index].adminFeedback,
    internshipConsideration:
      internshipConsideration !== undefined
        ? internshipConsideration
        : current[index].internshipConsideration,
    updatedAt: new Date().toISOString(),
  };

  current[index] = updated;
  serverProposals = [...current];

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.PROPOSALS, JSON.stringify(current));
      window.dispatchEvent(new Event("portfolio_proposals_updated"));
    } catch { }
  }
  return updated;
}

/* ==================== Certificates ==================== */

export function getCertificates(): ContributionCertificate[] {
  if (typeof window === "undefined") {
    return serverCertificates;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(SEED_CERTIFICATES));
      return SEED_CERTIFICATES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_CERTIFICATES;
  } catch (err) {
    console.error("Error reading certificates:", err);
    return SEED_CERTIFICATES;
  }
}

export function getCertificateById(id: string): ContributionCertificate | null {
  const all = getCertificates();
  const normalized = id.trim().toUpperCase();
  return (
    all.find(
      (c) =>
        c.id.toUpperCase() === normalized ||
        c.id.replace(/[^A-Z0-9]/g, "") === normalized.replace(/[^A-Z0-9]/g, "")
    ) || null
  );
}

export function issueCertificate(
  certificate: Omit<ContributionCertificate, "id" | "createdAt" | "verificationUrl" | "status"> & {
    id?: string;
  }
): ContributionCertificate {
  const current = getCertificates();
  const now = new Date().toISOString();
  const id =
    certificate.id ||
    `CERT-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const fullCertificate: ContributionCertificate = {
    ...certificate,
    id,
    status: "Issued",
    verificationUrl: `https://remotasks.si/verify-certificate/${id}`,
    createdAt: now,
  };

  const updated = [fullCertificate, ...current];
  serverCertificates = updated;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(updated));
      window.dispatchEvent(new Event("portfolio_certificates_updated"));
    } catch { }
  }
  return fullCertificate;
}

/* ==================== Internships ==================== */

export function getInternships(): InternshipRecord[] {
  if (typeof window === "undefined") {
    return serverInternships;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INTERNSHIPS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INTERNSHIPS, JSON.stringify(SEED_INTERNSHIPS));
      return SEED_INTERNSHIPS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_INTERNSHIPS;
  } catch (err) {
    console.error("Error reading internships:", err);
    return SEED_INTERNSHIPS;
  }
}

export function saveInternship(record: Omit<InternshipRecord, "id" | "createdAt" | "updatedAt"> & { id?: string }): InternshipRecord {
  const current = getInternships();
  const now = new Date().toISOString();
  const id = record.id || `intern-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const existingIdx = current.findIndex((i) => i.id === id);
  let updatedList: InternshipRecord[];
  let savedRecord: InternshipRecord;

  if (existingIdx >= 0) {
    savedRecord = {
      ...current[existingIdx],
      ...record,
      id,
      updatedAt: now,
    };
    updatedList = [...current];
    updatedList[existingIdx] = savedRecord;
  } else {
    savedRecord = {
      ...record,
      id,
      createdAt: now,
      updatedAt: now,
    };
    updatedList = [savedRecord, ...current];
  }

  serverInternships = updatedList;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.INTERNSHIPS, JSON.stringify(updatedList));
      window.dispatchEvent(new Event("portfolio_internships_updated"));
    } catch { }
  }
  return savedRecord;
}

export function updateInternshipStatus(
  id: string,
  status: InternshipStatus,
  interviewNotes?: string
): InternshipRecord | null {
  const current = getInternships();
  const idx = current.findIndex((i) => i.id === id);
  if (idx === -1) return null;

  const updated: InternshipRecord = {
    ...current[idx],
    status,
    interviewNotes: interviewNotes !== undefined ? interviewNotes : current[idx].interviewNotes,
    updatedAt: new Date().toISOString(),
  };

  current[idx] = updated;
  serverInternships = [...current];

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.INTERNSHIPS, JSON.stringify(current));
      window.dispatchEvent(new Event("portfolio_internships_updated"));
    } catch { }
  }
  return updated;
}

/* ==================== Acquisition Enquiries ==================== */

export function getAcquisitionEnquiries(): AcquisitionEnquiry[] {
  if (typeof window === "undefined") {
    return serverAcquisitions;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACQUISITIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ACQUISITIONS, JSON.stringify(SEED_ACQUISITIONS));
      return SEED_ACQUISITIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_ACQUISITIONS;
  } catch (err) {
    console.error("Error reading acquisitions:", err);
    return SEED_ACQUISITIONS;
  }
}

export function saveAcquisitionEnquiry(
  enquiry: Omit<AcquisitionEnquiry, "id" | "createdAt" | "updatedAt" | "status"> & {
    id?: string;
    status?: AcquisitionEnquiryStatus;
  }
): AcquisitionEnquiry {
  const current = getAcquisitionEnquiries();
  const now = new Date().toISOString();
  const newEnquiry: AcquisitionEnquiry = {
    id: enquiry.id || `acq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    status: enquiry.status || "New",
    createdAt: now,
    updatedAt: now,
    ...enquiry,
  };

  const updated = [newEnquiry, ...current];
  serverAcquisitions = updated;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.ACQUISITIONS, JSON.stringify(updated));
      window.dispatchEvent(new Event("portfolio_acquisitions_updated"));
    } catch { }
  }
  return newEnquiry;
}

export function updateAcquisitionStatus(
  id: string,
  status: AcquisitionEnquiryStatus,
  adminNotes?: string
): AcquisitionEnquiry | null {
  const current = getAcquisitionEnquiries();
  const idx = current.findIndex((a) => a.id === id);
  if (idx === -1) return null;

  const updated: AcquisitionEnquiry = {
    ...current[idx],
    status,
    adminNotes: adminNotes !== undefined ? adminNotes : current[idx].adminNotes,
    updatedAt: new Date().toISOString(),
  };

  current[idx] = updated;
  serverAcquisitions = [...current];

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.ACQUISITIONS, JSON.stringify(current));
      window.dispatchEvent(new Event("portfolio_acquisitions_updated"));
    } catch { }
  }
  return updated;
}

/* ==================== General Contacts ==================== */

export function saveGeneralContactMessage(
  msg: Omit<GeneralContactMessage, "id" | "createdAt">
): GeneralContactMessage {
  const now = new Date().toISOString();
  const newMsg: GeneralContactMessage = {
    id: `contact-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: now,
    ...msg,
  };

  serverContacts.push(newMsg);

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      const list = raw ? JSON.parse(raw) : [];
      list.push(newMsg);
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(list));
    } catch { }
  }
  return newMsg;
}
