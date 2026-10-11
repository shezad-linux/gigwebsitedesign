import { Metadata } from "next";
import Link from "next/link";
import {
  Code2,
  Smartphone,
  Palette,
  TrendingUp,
  Cpu,
  CheckCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Clock,
  DollarSign,
  UserCheck,
  CheckCircle2,
  Users,
  Briefcase,
  FileText,
  Star,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { HIRE_CATEGORIES, HireServiceCategory } from "@/lib/hire-talent/types";
import { createClient } from "@/lib/supabase/server";
import { fetchTalentProfiles } from "@/lib/hire-talent/queries";

export const metadata: Metadata = {
  title: "Hire Talent — Pre-Vetted Engineers, Designers & AI Specialists | Remotasks.si",
  description:
    "Hire top engineers, designers, growth marketers, and AI specialists by the hour or at fixed project prices. Expert-managed matching tailored to your requirements.",
};

const CATEGORY_ICONS: Record<HireServiceCategory, any> = {
  "software-web": Code2,
  "mobile-apps": Smartphone,
  "ui-ux-design": Palette,
  "digital-marketing": TrendingUp,
  "ai-automation": Cpu,
  "qa-testing-consulting": CheckCircle,
};

export default async function HireTalentLandingPage() {
  const supabase = createClient();
  const featuredTalents = await fetchTalentProfiles(supabase, { verifiedOnly: true, limit: 6 });

  return (
    <div className="min-h-screen bg-canvas-bg text-black">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-neutral-200 bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-100 border border-neutral-300 text-neutral-800">
              <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
              Managed Talent Matching • Guaranteed Quality
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-black leading-[1.08]">
              Find the right talent for your next project.
            </h1>

            <p className="text-lg sm:text-xl text-neutral-600 leading-relaxed font-normal">
              Hire pre-vetted software engineers, UI/UX designers, AI specialists, and marketers.
              Choose between transparent hourly rates or fixed-price milestones with managed coordination.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link href="/hire-talent/request">
                <Button size="lg" className="w-full sm:w-auto bg-black text-white hover:bg-neutral-800 font-bold px-8 shadow-xs">
                  Post a Project
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/hire-talent/profile">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-neutral-300 hover:bg-neutral-50 font-semibold">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Apply as a Professional
                </Button>
              </Link>
            </div>

            {/* Micro-trust indicators */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-neutral-100 text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-black shrink-0" />
                <span>Pre-vetted technical assessments</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-black shrink-0" />
                <span>Matches delivered within 48h</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-black shrink-0" />
                <span>Zero upfront agency fees</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SERVICE CATEGORIES */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
              Capabilities & Specialties
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-black mt-1 tracking-tight">
              Explore Our Core Service Categories
            </h2>
          </div>
          <p className="text-sm text-neutral-600 max-w-md">
            Every specialist is vetted through strict code reviews, past deliverable inspection, and communication standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(HIRE_CATEGORIES).map((category) => {
            const Icon = CATEGORY_ICONS[category.id] || Code2;
            return (
              <Card
                key={category.id}
                className="group bg-white border-neutral-200 hover:border-black transition-all hover:shadow-sm flex flex-col justify-between"
              >
                <CardHeader className="p-6 pb-4">
                  <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-black mb-4 group-hover:bg-black group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg font-bold text-black tracking-tight">
                    {category.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-neutral-600 mt-2 leading-relaxed">
                    {category.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6 pt-0 space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {category.popularSkills.slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="text-[11px] font-medium bg-neutral-100 text-neutral-700 px-2.5 py-0.5 rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold">Typical Hourly</span>
                      <span className="font-semibold text-black">{category.typicalHourlyRange}</span>
                    </div>
                    <Link
                      href={`/hire-talent/request?category=${category.id}`}
                      className="inline-flex items-center gap-1 font-bold text-black hover:underline"
                    >
                      Post Project
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 3. HOW HIRING WORKS */}
      <section className="py-20 bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
              Predictable Managed Process
            </span>
            <h2 className="text-3xl font-black text-black mt-1 tracking-tight">
              How Managed Hiring Works
            </h2>
            <p className="text-sm text-neutral-600 mt-2">
              From scope outline to verified milestone completion without recruitment chaos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-black text-white text-xs font-black flex items-center justify-center">
                1
              </div>
              <h3 className="text-base font-bold text-black">Submit Scope</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Describe your project, choose hourly or fixed-price, and set target budget boundaries with our AI Scope Assistant.
              </p>
            </div>

            <div className="space-y-3 bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-black text-white text-xs font-black flex items-center justify-center">
                2
              </div>
              <h3 className="text-base font-bold text-black">Curated Matching</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Our technical coordinators evaluate verified talent profiles and recommend 2–3 suitable professionals within 48 hours.
              </p>
            </div>

            <div className="space-y-3 bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-black text-white text-xs font-black flex items-center justify-center">
                3
              </div>
              <h3 className="text-base font-bold text-black">Review Proposals</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Examine technical proposals, milestones, and approaches. Select your specialist and finalize communication terms.
              </p>
            </div>

            <div className="space-y-3 bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-black text-white text-xs font-black flex items-center justify-center">
                4
              </div>
              <h3 className="text-base font-bold text-black">Track & Deliver</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Collaborate with clear milestone deliverables or approved weekly work logs. Release payment only after milestone satisfaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOURLY VS FIXED PRICE GUIDE */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
            Flexible Commercial Structures
          </span>
          <h2 className="text-3xl font-black text-black mt-1 tracking-tight">
            Hourly vs. Fixed-Price Hiring
          </h2>
          <p className="text-sm text-neutral-600 mt-2">
            Select the model that aligns with your project clarity and operational rhythm.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Hourly Card */}
          <div className="bg-white p-8 rounded-2xl border border-neutral-200 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-black" />
                <h3 className="text-xl font-bold text-black">Hourly Engagement</h3>
              </div>
              <span className="text-[11px] font-bold bg-neutral-100 text-neutral-800 px-2.5 py-1 rounded-full">
                Iterative Sprints
              </span>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Best for evolving projects, ongoing maintenance, ad-hoc consulting, or embedded engineers working closely with your team.
            </p>

            <ul className="space-y-2.5 text-xs text-neutral-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pay only for verified, logged hours</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Adjust scope dynamically week over week</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Specify timezone overlap and weekly hour caps</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pause or terminate with minimal notice</span>
              </li>
            </ul>

            <Link href="/hire-talent/request?model=hourly" className="block pt-3">
              <Button variant="outline" className="w-full border-neutral-300 font-bold hover:bg-neutral-50">
                Post Hourly Request
              </Button>
            </Link>
          </div>

          {/* Fixed Price Card */}
          <div className="bg-white p-8 rounded-2xl border border-black space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-black" />
                <h3 className="text-xl font-bold text-black">Fixed-Price Project</h3>
              </div>
              <span className="text-[11px] font-bold bg-black text-white px-2.5 py-1 rounded-full">
                Defined Deliverables
              </span>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Ideal for well-specified scopes, MVPs, discrete design systems, migrations, and turnkey technical solutions.
            </p>

            <ul className="space-y-2.5 text-xs text-neutral-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Guaranteed budget certainty before kickoff</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Deliverables broken into milestone checkpoints</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Defined rounds of revision included</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Clear acceptance criteria for final handover</span>
              </li>
            </ul>

            <Link href="/hire-talent/request?model=fixed" className="block pt-3">
              <Button className="w-full bg-black text-white hover:bg-neutral-800 font-bold">
                Post Fixed-Price Project
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. FEATURED TALENT SHOWCASE */}
      <section className="py-20 bg-neutral-50 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                Approved Professional Pool
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-black mt-1 tracking-tight">
                Featured Verified Professionals
              </h2>
            </div>
            <Link
              href="/hire-talent/profile"
              className="text-xs font-bold text-black hover:underline inline-flex items-center gap-1"
            >
              Join the talent pool
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTalents.map((talent) => (
              <Card key={talent.id} className="bg-white border-neutral-200 hover:border-black transition-all">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-black text-white font-black text-base flex items-center justify-center shrink-0">
                        {talent.full_name?.charAt(0) || "P"}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-black">{talent.full_name || "Professional"}</h4>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Verified" />
                        </div>
                        <p className="text-[11px] text-neutral-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {talent.country || "Global"} • {talent.experience_years}y exp
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-extrabold text-black">
                      ${talent.hourly_rate}/hr
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-neutral-900 line-clamp-1">{talent.headline}</h5>
                  <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed">{talent.bio}</p>

                  <div className="flex flex-wrap gap-1">
                    {talent.skills.slice(0, 4).map((skill) => (
                      <span key={skill} className="text-[10px] font-medium bg-neutral-100 px-2 py-0.5 rounded text-neutral-700">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-neutral-500">
                      {talent.availability_status === "available_now" ? "Available now" : "Part-time available"}
                    </span>
                    <Link
                      href={`/hire-talent/request?preferredTalent=${talent.id}`}
                      className="font-bold text-black hover:underline text-xs"
                    >
                      Request Match →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA BANNER */}
      <section className="py-20 bg-black text-white border-t border-neutral-900">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
            Ready to Accelerate Your Roadmap?
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Start hiring vetted specialists without recruiter markups.
          </h2>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto">
            Outline your project in 3 minutes. Our technical coordinators will match and present suitable professionals for your review.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/hire-talent/request">
              <Button size="lg" className="w-full sm:w-auto bg-white text-black hover:bg-neutral-100 font-bold px-8">
                Post Your Project Request
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-neutral-800 text-white hover:bg-neutral-900">
                View Managed Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
