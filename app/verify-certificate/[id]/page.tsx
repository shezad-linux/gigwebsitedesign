import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { getCertificateById } from "@/lib/portfolio/storage";
import { CertificateViewer } from "@/components/portfolio/CertificateViewer";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cert = getCertificateById(params.id);
  if (!cert) {
    return {
      title: "Certificate Not Found | Remotasks Verification",
    };
  }
  return {
    title: `Certificate ${cert.id} - ${cert.contributorName} | Remotasks`,
    description: `Official Certificate of Contribution for ${cert.contributorName} on project ${cert.projectName}. Verified by ${cert.issuerName}.`,
  };
}

export default function CertificateDetailPage({ params }: Props) {
  const cert = getCertificateById(params.id);

  if (!cert) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-neutral-200 bg-white p-8 text-center space-y-4 shadow-sm">
          <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900">Certificate Not Found</h2>
          <p className="text-xs text-neutral-500">
            No active certificate matching identifier <code className="font-mono font-bold text-black">{params.id}</code> exists in our ledger.
          </p>
          <div className="pt-2">
            <Link
              href="/verify-certificate"
              className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Verification Tool
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-24">
      <div className="border-b border-neutral-200 bg-white py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            href="/verify-certificate"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Verify another certificate
          </Link>
          <span className="font-mono text-xs text-neutral-400">
            Authenticated via Remotasks Ledger
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <CertificateViewer certificate={cert} />
      </div>
    </div>
  );
}

