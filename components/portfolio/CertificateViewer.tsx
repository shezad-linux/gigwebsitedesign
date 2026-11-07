"use client";

import React, { useRef } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  ShieldCheck,
  Download,
  Printer,
  Calendar,
  Share2,
  ExternalLink,
  QrCode,
  Sparkles,
} from "lucide-react";
import { ContributionCertificate } from "@/types/portfolio";

interface CertificateViewerProps {
  certificate: ContributionCertificate;
}

export const CertificateViewer: React.FC<CertificateViewerProps> = ({ certificate }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Certificate of Contribution - ${certificate.contributorName}`,
        text: `Verified open-source contribution certificate for ${certificate.projectName}`,
        url: certificate.verificationUrl,
      });
    } else {
      navigator.clipboard.writeText(certificate.verificationUrl);
      alert("Certificate verification link copied to clipboard!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (hidden in print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4 print:hidden shadow-sm">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Verified Authentic Certificate
          </span>
          <span className="font-mono text-xs font-bold text-neutral-500">
            {certificate.id}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-xs font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Download / Print PDF
          </button>
        </div>
      </div>

      {/* Certificate Sheet (Printable Layout) */}
      <div
        ref={printRef}
        id="certificate-print-sheet"
        className="relative mx-auto max-w-4xl rounded-2xl border-8 border-double border-neutral-900 bg-[#FCFCFD] p-8 sm:p-14 text-neutral-900 shadow-xl print:m-0 print:max-w-none print:border-4 print:shadow-none"
      >
        {/* Subtle Watermark Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <Award className="w-[450px] h-[450px]" />
        </div>

        {/* Certificate Header */}
        <div className="relative text-center border-b border-neutral-200 pb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-black text-white shadow-md mb-4">
            <Award className="w-8 h-8" />
          </div>

          <div className="uppercase tracking-[0.25em] text-xs font-bold text-neutral-500">
            Official Recognition of Technical Excellence
          </div>

          <h1 className="mt-2 text-3xl sm:text-5xl font-serif font-bold text-black tracking-tight">
            Certificate of Contribution
          </h1>

          <p className="mt-2 text-sm text-neutral-600 font-sans max-w-xl mx-auto">
            This certifies that meaningful, peer-reviewed engineering work has been accepted and successfully integrated into our open-source portfolio.
          </p>
        </div>

        {/* Certificate Body */}
        <div className="relative my-10 text-center space-y-6">
          <div className="text-xs uppercase tracking-widest text-neutral-400 font-sans">
            Proudly Presented To
          </div>

          <div className="text-3xl sm:text-4xl font-serif font-bold text-black border-b-2 border-neutral-900/20 pb-2 inline-block px-8">
            {certificate.contributorName}
          </div>

          <p className="text-sm text-neutral-700 max-w-2xl mx-auto leading-relaxed pt-2">
            In formal recognition of exceptional dedication and engineering contributions to the open-source Android codebase of:
          </p>

          <div className="inline-block rounded-xl bg-neutral-100/80 px-6 py-2.5 font-sans font-bold text-lg text-black border border-neutral-200">
            {certificate.projectName}
          </div>

          <div className="max-w-xl mx-auto rounded-lg border border-neutral-200 bg-white/70 p-4 text-left shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Contribution Scope & Impact
            </p>
            <p className="text-xs font-semibold text-neutral-900 mb-1">
              {certificate.contributionType}
            </p>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {certificate.summary}
            </p>
          </div>
        </div>

        {/* Certificate Signatures & Security Footer */}
        <div className="relative mt-12 pt-8 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end text-center sm:text-left">
          {/* Issuer Signature */}
          <div className="space-y-1">
            <div className="font-serif italic text-lg text-black border-b border-neutral-400 pb-1 w-44 mx-auto sm:mx-0">
              {certificate.issuerName}
            </div>
            <p className="text-xs font-bold text-neutral-900">{certificate.issuerName}</p>
            <p className="text-[11px] text-neutral-500">{certificate.issuerTitle}</p>
            <p className="text-[10px] text-neutral-400">{certificate.organizationName}</p>
          </div>

          {/* Official Seal / Medallion */}
          <div className="text-center">
            <div className="inline-flex flex-col items-center justify-center h-24 w-24 rounded-full border-2 border-neutral-900 bg-neutral-50 p-2 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-neutral-900 mb-1" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-800">
                Verified
              </span>
              <span className="text-[8px] text-neutral-400 font-mono">
                {certificate.completionDate}
              </span>
            </div>
          </div>

          {/* Verification Code & Link */}
          <div className="text-center sm:text-right space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Certificate Identifier
            </p>
            <p className="font-mono text-sm font-bold text-black">{certificate.id}</p>
            <p className="text-[10px] text-neutral-500">
              Completion Date: {certificate.completionDate}
            </p>
            <p className="text-[10px] text-neutral-400 truncate max-w-[220px] ml-auto">
              Verify: {certificate.verificationUrl}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

