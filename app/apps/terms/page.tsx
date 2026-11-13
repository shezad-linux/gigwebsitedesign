import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  ArrowLeft,
  Shield,
  FileText,
  AlertTriangle,
  Scale,
  Smartphone,
  CreditCard,
  HeartPulse,
  DollarSign,
  Cpu,
  Camera,
  Gamepad2,
  Lock,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Master Terms & Conditions for Mobile Applications | Remotasks Studio",
  description:
    "Master End-User License Agreement (EULA) and Terms of Service governing all Android mobile applications and games published on the Google Play Store.",
  alternates: {
    canonical: "https://remotasks.si/apps/terms",
  },
};

const COVERED_APPS = [
  { name: "Moonroot: Seedlight", packageId: "com.moonroot.seedlight", category: "Games" },
  { name: "Emberline Odyssey", packageId: "com.lumentrail.emberlineodyssey", category: "Games" },
  { name: "City Cat Runner", packageId: "com.shezadgames.citycatrunner", category: "Games" },
  { name: "GPS Map Camera : Geo Tagging", packageId: "com.homedesignia.geocamera", category: "Camera" },
  { name: "SnapGlow Insta Filters", packageId: "com.snapglow.app", category: "Photography" },
  { name: "AI Edge: On-Device AI", packageId: "ai.offlinellm.assistant", category: "AI Utilities" },
  { name: "Speech-to-Text AI voice typing", packageId: "wekk.app", category: "AI Utilities" },
  { name: "SignFlow – eSign & PDF", packageId: "com.shezad.signflow", category: "Productivity" },
  { name: "DocuScan: OpenCv Smart Scanner", packageId: "io.docuscan.app", category: "Productivity" },
  { name: "PDF Scanner & OCR - PageRay", packageId: "com.antigravity.scanner", category: "Productivity" },
  { name: "insomnia: better sleep", packageId: "com.insomania.bettersleep", category: "Health & Wellness" },
  { name: "CycleCare: Period Tracker", packageId: "com.cyclecare.tracker", category: "Health & Wellness" },
  { name: "UPI Alert: Voice Soundbox", packageId: "com.alertpay.alertpay", category: "Finance" },
  { name: "HomeDesignia", packageId: "com.homedesignia.app", category: "Lifestyle" },
];

export default function MasterAppsTermsPage() {
  return (
    <div className="min-h-screen bg-canvas-bg py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/apps"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Apps Directory
          </Link>
          <span className="text-xs text-slate-400 font-mono">DOC ID: PLAY-TERMS-MASTER-2026</span>
        </div>

        {/* Header Hero */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-border shadow-xs space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary" size="sm">
              Google Play Compliance
            </Badge>
            <Badge variant="outline" size="sm" className="bg-neutral-100 text-black border-neutral-300">
              End-User License Agreement (EULA)
            </Badge>
            <Badge variant="outline" size="sm" className="bg-emerald-50 text-emerald-800 border-emerald-300">
              Active across 14 Applications
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
            Master Terms &amp; Conditions for Mobile Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            These Master Terms and Conditions (&ldquo;Master Terms&rdquo; or &ldquo;EULA&rdquo;) constitute a legally binding
            agreement between you (&ldquo;User&rdquo;, &ldquo;you&rdquo;) and <strong>Shezad / Remotasks Studio</strong> (&ldquo;Publisher&rdquo;,
            &ldquo;Developer&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). They govern your download, installation, access, and use of all mobile
            software applications, games, features, and content distributed via the Google Play Store.
          </p>
          <div className="pt-2 text-xs text-slate-400 border-t border-slate-100 flex flex-wrap gap-4">
            <span>Effective Date: January 1, 2026</span>
            <span>·</span>
            <span>Last Updated: November 2026</span>
            <span>·</span>
            <span>Governing Platform: Google Play Store</span>
          </div>
        </div>

        {/* Quick Navigation / Table of Contents */}
        <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs sm:text-sm space-y-3">
          <div className="font-bold text-neutral-900 flex items-center gap-2">
            <Scale className="w-4 h-4 text-neutral-800" /> Key Sections Overview
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
            <a href="#scope" className="hover:text-black transition">1. Scope &amp; Covered Applications</a>
            <a href="#google-play" className="hover:text-black transition">2. Google Play Store Terms Hierarchy</a>
            <a href="#license" className="hover:text-black transition">3. License Grant &amp; Restrictions</a>
            <a href="#billing" className="hover:text-black transition">4. In-App Purchases &amp; Subscriptions</a>
            <a href="#category-terms" className="hover:text-black transition">5. Category-Specific Disclaimers</a>
            <a href="#permissions" className="hover:text-black transition">6. Permissions &amp; Data Access</a>
            <a href="#user-conduct" className="hover:text-black transition">7. Prohibited Uses &amp; Fair Play</a>
            <a href="#liability" className="hover:text-black transition">8. Limitation of Liability &amp; Disclaimers</a>
            <a href="#termination" className="hover:text-black transition">9. Termination &amp; App Lifecycle</a>
            <a href="#contact" className="hover:text-black transition">10. Contact &amp; Legal Notices</a>
          </div>
        </div>

        {/* Content Body */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-border shadow-xs space-y-10 text-slate-700 text-sm sm:text-base leading-relaxed">
          {/* Section 1 */}
          <section id="scope" className="space-y-4">
            <h2 className="text-xl font-bold text-ink flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-indigo-600" /> 1. Scope &amp; Covered Applications
            </h2>
            <p>
              These Master Terms apply to all software, games, assets, and associated services published under our Google Play
              developer accounts (including publisher entities <em>Shezad Games</em>, <em>Moonroot</em>, <em>Lumen Trail</em>, and <em>HomeDesignia</em>).
            </p>
            <p>
              By downloading, installing, or continuing to use any of our applications listed below (or any future releases), you
              expressly acknowledge that you have read, understood, and agreed to be bound by these Master Terms. If you do not
              agree, do not download, install, or use the applications.
            </p>

            <div className="mt-4 rounded-2xl border border-slate-200 overflow-hidden text-xs">
              <div className="bg-slate-50 p-3 font-semibold text-slate-800 border-b border-slate-200">
                Schedule A — Covered Google Play Applications
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {COVERED_APPS.map((app) => (
                  <div key={app.packageId} className="p-3 flex items-center justify-between hover:bg-slate-50/50">
                    <div>
                      <span className="font-bold text-slate-900">{app.name}</span>
                      <span className="block text-slate-500 font-mono text-[11px]">{app.packageId}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium">
                      {app.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section id="google-play" className="space-y-3">
            <h2 className="text-xl font-bold text-ink flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" /> 2. Google Play Store Terms Hierarchy
            </h2>
            <p>
              You acknowledge that these Master Terms are concluded between you and the Publisher only, and not with Google LLC
              (&ldquo;Google&rdquo;). However:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600">
              <li>
                <strong>Google Play Terms of Service:</strong> Your use of our apps must comply with Google Play&apos;s Terms of Service and Developer Program Policies.
              </li>
              <li>
                <strong>Third-Party Beneficiary:</strong> Google and its subsidiaries are third-party beneficiaries of these Terms and have the right to enforce them against you.
              </li>
              <li>
                <strong>Maintenance &amp; Support:</strong> The Publisher is solely responsible for providing any maintenance and support services for our apps. Google has no obligation whatsoever to furnish any maintenance or support services.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="license" className="space-y-3">
            <h2 className="text-xl font-bold text-ink flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-600" /> 3. License Grant &amp; Intellectual Property
            </h2>
            <p>
              We grant you a revocable, non-exclusive, non-transferable, limited personal license to install and use the application
              on personal Android devices that you own or control, solely for personal, non-commercial purposes (unless explicitly
              authorized in writing).
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-2">
              <strong>License Restrictions:</strong> You shall not:
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Decompile, reverse-engineer, disassemble, or attempt to derive the source code of any application.</li>
                <li>Modify, adapt, translate, enhance, or create derivative works from the application.</li>
                <li>Rent, lease, lend, sell, sublicense, distribute, or commercially exploit any application.</li>
                <li>Remove, alter, or obscure any copyright, trademark, or proprietary notice.</li>
                <li>Circumvent or disable any digital rights management (DRM) or security features.</li>
              </ul>
            </div>
            <p className="text-xs text-slate-500">
              All copyrights, trademarks, audio soundtracks, visual artwork, game mechanics, and codebases remain the exclusive
              intellectual property of the Publisher and its licensors.
            </p>
          </section>

          {/* Section 4 */}
          <section id="billing" className="space-y-3">
            <h2 className="text-xl font-bold text-ink flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" /> 4. In-App Purchases, Subscriptions &amp; Billing
            </h2>
            <p>
              Certain features, premium tiers, or virtual items within our applications may be offered through Google Play In-App
              Billing:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600">
              <li>
                <strong>Payment Processing:</strong> All transactions are processed securely through Google Play Billing. We do not store or process your credit card or financial instrument details directly.
              </li>
              <li>
                <strong>Subscriptions:</strong> Auto-renewing subscriptions will automatically charge your Google Play account at the recurring rate until cancelled. You may manage or cancel subscriptions at any time via <em>Google Play &gt; Payments &amp; Subscriptions</em>.
              </li>
              <li>
                <strong>Refunds:</strong> Refund requests are governed by Google Play&apos;s standard refund policy. Unless required by applicable consumer law, digital purchases and consumed virtual goods are non-refundable once delivered.
              </li>
              <li>
                <strong>Price Changes:</strong> We reserve the right to modify prices for in-app features at any time. Any subscription price changes will take effect after adequate advance notice in compliance with Google Play billing rules.
              </li>
            </ul>
          </section>

          {/* Section 5 - Category Disclaimers */}
          <section id="category-terms" className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-xl font-bold text-ink flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" /> 5. Category-Specific Disclaimers &amp; Operational Terms
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Because our applications cover distinct domains, the following specific terms apply in addition to the general provisions:
              </p>
            </div>

            {/* 5.1 Health & Wellness */}
            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
              <div className="flex items-center gap-2 font-bold text-amber-900 text-sm sm:text-base">
                <HeartPulse className="w-4 h-4 text-amber-700" /> 5.1 Health &amp; Wellness Apps (CycleCare, insomnia: better sleep)
              </div>
              <div className="text-xs sm:text-sm text-amber-950 space-y-2 leading-relaxed">
                <p>
                  <strong>CRITICAL MEDICAL DISCLAIMER:</strong> OUR HEALTH AND WELLNESS APPLICATIONS ARE FOR INFORMATIONAL, EDUCATIONAL, AND LIFESTYLE TRACKING PURPOSES ONLY. THEY DO NOT PROVIDE MEDICAL ADVICE, CLINICAL DIAGNOSES, OR MEDICAL TREATMENT.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-amber-900">
                  <li>
                    <strong>Not Contraception:</strong> CycleCare&apos;s cycle predictions and fertility estimates are statistical approximations. Under no circumstances should they be relied upon as a method of contraception or birth control.
                  </li>
                  <li>
                    <strong>Medical Supervision:</strong> Always seek the advice of your physician or qualified healthcare provider with any questions regarding a medical condition, sleep disorder, or reproductive health. Never disregard professional medical advice because of something read in an app.
                  </li>
                </ul>
              </div>
            </div>

            {/* 5.2 Financial Alert Utilities */}
            <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-3">
              <div className="flex items-center gap-2 font-bold text-blue-900 text-sm sm:text-base">
                <DollarSign className="w-4 h-4 text-blue-700" /> 5.2 Financial Alert &amp; Soundbox Utilities (UPI Alert: Voice Soundbox)
              </div>
              <div className="text-xs sm:text-sm text-blue-950 space-y-2 leading-relaxed">
                <p>
                  <strong>FINANCIAL &amp; AUDIT DISCLAIMER:</strong> <em>UPI Alert: Voice Soundbox</em> is an audio notification reader utility. It operates by reading incoming device notifications and converting text to speech:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-blue-900">
                  <li>
                    <strong>No Banking Operations:</strong> The app does not hold funds, execute payments, manage bank accounts, or serve as an escrow or payment gateway.
                  </li>
                  <li>
                    <strong>Verification Obligation:</strong> Soundbox voice announcements must never be treated as formal proof of banking transactions. Merchants and users must verify real-time settlements through their official banking or merchant applications.
                  </li>
                  <li>
                    <strong>Notification Dependency:</strong> The Publisher accepts zero liability for missed, delayed, distorted, or spoofed voice alerts caused by OS battery-saver optimizations, network outages, notification permission revocation, or third-party notification changes.
                  </li>
                </ul>
              </div>
            </div>

            {/* 5.3 Document Scanning, OCR & Digital Signatures */}
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
              <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm sm:text-base">
                <FileText className="w-4 h-4 text-emerald-700" /> 5.3 Document Scanning &amp; Signatures (DocuScan, PageRay OCR, SignFlow)
              </div>
              <div className="text-xs sm:text-sm text-emerald-950 space-y-2 leading-relaxed">
                <p>
                  <strong>LOCAL PROCESSING &amp; LEGAL VALIDITY:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1 text-emerald-900">
                  <li>
                    <strong>Document Confidentiality:</strong> Documents and images scanned or signed via DocuScan, PageRay, and SignFlow are processed locally on your device. You are solely responsible for backing up your files.
                  </li>
                  <li>
                    <strong>OCR Accuracy:</strong> Optical Character Recognition (OCR) is inherently heuristic and subject to resolution, font, and lighting errors. The Publisher makes no warranties regarding the 100% accuracy of extracted text.
                  </li>
                  <li>
                    <strong>Signature Legal Enforceability:</strong> Electronic signatures created via SignFlow depend on local statutory recognition (such as the ESIGN Act, eIDAS, or IT Act 2000). You are responsible for ensuring digital signatures meet the legal requirements of your jurisdiction and specific agreement.
                  </li>
                </ul>
              </div>
            </div>

            {/* 5.4 AI & Speech-to-Text Utilities */}
            <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-3">
              <div className="flex items-center gap-2 font-bold text-purple-900 text-sm sm:text-base">
                <Cpu className="w-4 h-4 text-purple-700" /> 5.4 AI &amp; Voice Transcription (AI Edge, Speech-to-Text)
              </div>
              <div className="text-xs sm:text-sm text-purple-950 space-y-2 leading-relaxed">
                <ul className="list-disc pl-5 space-y-1 text-purple-900">
                  <li>
                    <strong>Probabilistic Output:</strong> Artificial intelligence models, neural network embeddings, and speech recognition engines are probabilistic systems that may produce inaccurate, biased, hallucinated, or incomplete responses.
                  </li>
                  <li>
                    <strong>No High-Risk Reliance:</strong> You agree not to rely on AI outputs for life-critical, medical, emergency, legal, or financial decisions without independent human verification.
                  </li>
                </ul>
              </div>
            </div>

            {/* 5.5 Camera, Geotagging & Imaging */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm sm:text-base">
                <Camera className="w-4 h-4 text-slate-700" /> 5.5 Camera &amp; Geotagging (GPS Map Camera, SnapGlow)
              </div>
              <div className="text-xs sm:text-sm text-slate-700 space-y-2 leading-relaxed">
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li>
                    <strong>Location Accuracy:</strong> Geotagged coordinates and address overlays rely on device hardware GPS and satellite availability. Environmental factors (indoors, dense urban areas) may cause deviations.
                  </li>
                  <li>
                    <strong>Privacy &amp; Third-Party Rights:</strong> You are solely responsible for complying with local privacy, wiretapping, surveillance, and photography laws when capturing photos, recording audio, or stamping geolocation coordinates of individuals or private property.
                  </li>
                </ul>
              </div>
            </div>

            {/* 5.6 Interactive Games */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm sm:text-base">
                <Gamepad2 className="w-4 h-4 text-slate-700" /> 5.6 Interactive Games (Moonroot: Seedlight, Emberline Odyssey)
              </div>
              <div className="text-xs sm:text-sm text-slate-700 space-y-2 leading-relaxed">
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li>
                    <strong>Virtual Goods &amp; Scores:</strong> In-game currency, energy, power-ups, badges, and unlockable items are virtual entertainment assets with no real-world cash equivalence. They cannot be transferred, exchanged, or redeemed for monetary value.
                  </li>
                  <li>
                    <strong>Fair Gameplay &amp; Anti-Cheat:</strong> Any attempt to inject cheats, alter memory buffers, automate gameplay through unauthorized bots, or exploit unintended bugs will result in immediate termination of access without refund.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section id="permissions" className="space-y-3">
            <h2 className="text-xl font-bold text-ink flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-600" /> 6. Device Permissions &amp; Data Privacy
            </h2>
            <p>
              To deliver their core features, our applications may request specific Android runtime permissions (e.g. Camera,
              Microphone, Location, Storage, Notification Access):
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600">
              <li>
                <strong>Purpose Limitation:</strong> Permissions are requested solely to execute the requested user action (e.g. Camera for document scanning or geotagging; Microphone for voice dictation; Notification Access for payment voice alerts).
              </li>
              <li>
                <strong>Local-First Architecture:</strong> Where technically feasible, our utilities prioritize on-device execution. Files, document scans, audio recordings, and biometric data remain on your local device.
              </li>
              <li>
                <strong>Privacy Policy:</strong> For complete information regarding data collection, third-party analytics (e.g. Firebase Crashlytics), and your privacy rights under GDPR/CCPA, please review our comprehensive{" "}
                <Link href="/privacy" className="font-semibold text-indigo-600 underline">
                  Privacy Policy
                </Link>
                .
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section id="user-conduct" className="space-y-3">
            <h2 className="text-xl font-bold text-ink flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-indigo-600" /> 7. Prohibited Uses &amp; Fair Conduct
            </h2>
            <p>
              You agree to use our applications in strict compliance with all applicable local, national, and international laws.
              You shall not:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
              <li>Use any application to upload, transmit, or forge fraudulent, forged, or illegal documents.</li>
              <li>Impersonate any individual, entity, financial institution, or government authority.</li>
              <li>Transmit malware, viruses, worms, Trojan horses, or harmful code through our software.</li>
              <li>Interfere with, disrupt, or place an unreasonable load on any network, server, or cloud backend.</li>
              <li>Distribute pirated, modified, or modified APK/AAB builds outside of the official Google Play Store.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section id="liability" className="space-y-3">
            <h2 className="text-xl font-bold text-ink flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-600" /> 8. Disclaimer of Warranties &amp; Limitation of Liability
            </h2>
            <div className="p-4 rounded-2xl bg-neutral-100 border border-neutral-300 text-xs sm:text-sm text-neutral-900 space-y-2">
              <p className="font-bold">
                WARRANTY DISCLAIMER (&ldquo;AS IS&rdquo; &amp; &ldquo;AS AVAILABLE&rdquo;):
              </p>
              <p className="leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED UNDER APPLICABLE LAW, THE APPLICATIONS ARE PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS
                AVAILABLE&rdquo;, WITHOUT WARRANTY OF ANY KIND, EXPRESS, IMPLIED, OR STATUTORY, INCLUDING WITHOUT LIMITATION WARRANTIES OF
                MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE OPERATION
                OF THE APPLICATIONS WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE FROM VIRUSES OR OTHER HARMFUL COMPONENTS.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-100 border border-neutral-300 text-xs sm:text-sm text-neutral-900 space-y-2">
              <p className="font-bold">
                LIMITATION OF LIABILITY:
              </p>
              <p className="leading-relaxed">
                TO THE EXTENT NOT PROHIBITED BY LAW, IN NO EVENT SHALL THE PUBLISHER, ITS DIRECTORS, EMPLOYEES, AFFILIATES, OR AGENTS BE
                LIABLE FOR PERSONAL INJURY, PROPERTY DAMAGE, LOST PROFITS, LOST DATA, MISSED PAYMENTS, CORRUPTED FILES, BUSINESS
                INTERRUPTION, OR ANY INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES WHATSOEVER ARISING OUT OF OR
                RELATED TO YOUR USE OR INABILITY TO USE THE APPLICATION.
              </p>
              <p className="leading-relaxed">
                IN NO EVENT SHALL OUR TOTAL AGGREGATE LIABILITY TO YOU FOR ALL DAMAGES EXCEED THE AMOUNT YOU ACTUALLY PAID TO US FOR
                THE SPECIFIC APPLICATION OR IN-APP PURCHASE IN THE PRECEDING TWELVE (12) MONTHS, OR FIFTY UNITED STATES DOLLARS ($50.00
                USD), WHICHEVER IS LESS.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section id="termination" className="space-y-3">
            <h2 className="text-xl font-bold text-ink flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" /> 9. Termination &amp; App Lifecycle
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              These Master Terms remain in effect until terminated by either you or the Publisher.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600">
              <li>
                <strong>Termination by You:</strong> You may terminate these Terms at any time by uninstalling the application and deleting all copies from your devices.
              </li>
              <li>
                <strong>Termination by Publisher:</strong> Your rights under these Terms will terminate automatically without notice if you fail to comply with any provision.
              </li>
              <li>
                <strong>Lifecycle &amp; Deprecation:</strong> We reserve the right to update, modify, temporarily suspend, or permanently discontinue any application, feature, or service at any time with or without prior notice. The Publisher shall have no liability to you for deprecating or discontinuing an application.
              </li>
            </ul>
          </section>

          {/* Section 10 */}
          <section id="contact" className="space-y-4">
            <h2 className="text-xl font-bold text-ink flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" /> 10. Governing Law, Dispute Resolution &amp; Contact
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              These Master Terms shall be governed by and construed in accordance with the substantive laws of India, excluding its
              conflict-of-law principles. Any legal action or proceeding arising under these Terms will be subject to the exclusive
              jurisdiction of the competent courts in India.
            </p>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 text-sm">Developer &amp; Legal Support</div>
              <p className="text-xs text-slate-600">
                For questions, support requests, or intellectual property inquiries regarding our Google Play apps, please contact:
              </p>
              <div className="text-xs space-y-1 font-mono text-slate-800 pt-1">
                <div>Developer / Publisher: Shezad / Remotasks Studio</div>
                <div>Legal &amp; Privacy Email: <a href="mailto:legal@remotasks.si" className="text-indigo-600 underline">legal@remotasks.si</a></div>
                <div>Support Email: <a href="mailto:support@remotasks.si" className="text-indigo-600 underline">support@remotasks.si</a></div>
                <div>Official Domain: <a href="https://remotasks.si" className="text-indigo-600 underline">https://remotasks.si</a></div>
              </div>
            </div>
          </section>
        </div>

        {/* Bottom Banner */}
        <div className="p-6 rounded-3xl bg-neutral-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="font-bold text-sm">Need Play Store URL for your App Console?</div>
            <div className="text-xs text-neutral-400">
              You can provide <code>https://remotasks.si/apps/terms</code> as your official Terms of Service link in Google Play Console.
            </div>
          </div>
          <Link
            href="/apps"
            className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition shrink-0"
          >
            Explore Apps Directory
          </Link>
        </div>
      </div>
    </div>
  );
}
