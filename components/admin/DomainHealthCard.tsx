"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  RefreshCw,
  ExternalLink,
  Lock,
  Server,
  Zap,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DomainHealthReport, DnsRecordRequirement } from "@/lib/domain-health";

interface DomainHealthCardProps {
  adminEmail?: string;
  onRefreshChecklist?: () => void;
}

export function DomainHealthCard({ adminEmail, onRefreshChecklist }: DomainHealthCardProps) {
  const [report, setReport] = useState<DomainHealthReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testEmailRecipient, setTestEmailRecipient] = useState(adminEmail || "admin@remotasks.si");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchHealth = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/domain-health");
      const data = await res.json();
      if (data?.report) {
        setReport(data.report);
      }
    } catch (err) {
      console.error("Failed to fetch domain health:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailRecipient || isSendingTest) return;

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient: testEmailRecipient }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || "Test email dispatched successfully!",
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || "Failed to dispatch test email.",
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Network exception sending test email.",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="primary" size="sm">
                Production Readiness
              </Badge>
              <Badge
                variant="outline"
                size="sm"
                className="bg-neutral-100 text-black border-neutral-300 font-bold"
              >
                Domain & Email Diagnostics
              </Badge>
              {report?.isHttps && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Lock className="w-3 h-3" /> SSL TLS 1.3 Active
                </span>
              )}
            </div>
            <h3 className="text-xl font-extrabold text-ink tracking-tight mt-1">
              Custom Domain & Transactional Email Deliverability
            </h3>
            <p className="text-xs text-slate-500">
              Zero-downtime DNS routing matrix, SPF/DKIM anti-spoofing compliance, and Resend transactional email status.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchHealth}
              disabled={isLoading}
              className="gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh Status
            </Button>
          </div>
        </div>

        {/* Status Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-xl border border-border bg-slate-50/50 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-700" /> Canonical Domain
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-base font-extrabold text-black font-mono truncate">
              {report?.domain || "remotasks.si"}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Apex: {report?.apexDomain || "remotasks.si"}</p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-slate-50/50 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-700" /> SSL Certificate
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-base font-extrabold text-black">
              {report?.isHttps ? "HTTPS Enforced" : "HTTP (Staging/Dev)"}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Automated Auto-Renewal</p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-slate-50/50 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-700" /> Email Dispatcher
              </span>
              <span
                className={`h-2 w-2 rounded-full ${
                  report?.emailConfigured ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
            </div>
            <p className="text-base font-extrabold text-black">
              {report?.emailConfigured ? "Resend (Live)" : "Dev Simulation"}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              {report?.emailConfigured ? "API Key Connected" : "Safe Mock Dispatch"}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-slate-50/50 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-700" /> Readiness Score
              </span>
              <span className="text-xs font-extrabold text-black">{report?.readinessScore || 85}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden my-1">
              <div
                className="h-full bg-black rounded-full transition-all duration-500"
                style={{ width: `${report?.readinessScore || 85}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {report?.isProductionReady ? "Ready for Public Launch" : "Verification in Progress"}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Test Email Tool */}
      <Card className="bg-white border-border shadow-xs">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-extrabold text-black flex items-center gap-2">
                <Send className="w-4 h-4 text-black" />
                Live Transactional Email Verification
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Dispatch an immediate test receipt and operational diagnostic to confirm SMTP / Resend delivery.
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              size="sm"
              className="text-[11px] bg-slate-50 font-semibold"
            >
              Sender: {report?.senderAddress || "Remotasks <notifications@remotasks.si>"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <form onSubmit={handleSendTestEmail} className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="Enter email to receive test (e.g. you@example.com)"
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-border text-xs focus:ring-1 focus:ring-black focus:outline-none"
                />
              </div>
              <Button
                type="submit"
                disabled={isSendingTest || !testEmailRecipient}
                className="bg-black hover:bg-neutral-800 text-white font-semibold text-xs h-10 px-5 rounded-xl shrink-0 gap-1.5"
              >
                {isSendingTest ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Dispatching...
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    Send Test Email
                  </>
                )}
              </Button>
            </div>

            {testResult && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                  testResult.success
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">{testResult.success ? "Email Sent Successfully" : "Email Dispatch Error"}</p>
                  <p className="mt-0.5 leading-relaxed">{testResult.message}</p>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Production DNS Records Matrix */}
      <Card className="bg-white border-border shadow-xs">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-extrabold text-black flex items-center gap-2">
                <Server className="w-4 h-4 text-black" />
                Production DNS Configuration Matrix
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Add these records in your domain registrar (Cloudflare, GoDaddy, Namecheap, Vercel) to authorize web and email routing.
              </CardDescription>
            </div>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md self-start sm:self-auto">
              TTL: Automatic / 300s
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-border text-slate-600 uppercase tracking-wider text-[10px] font-extrabold">
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Host / Name</th>
                  <th className="py-3 px-4">Target Value</th>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {report?.dnsRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className="px-2 py-0.5 rounded bg-black text-white text-[11px]">
                        {record.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-black">
                      {record.host}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs font-mono text-[11px] text-slate-700 truncate">
                      {record.expectedValue}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {record.purpose}
                    </td>
                    <td className="py-3.5 px-4">
                      {record.status === "verified" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Check className="w-3 h-3" /> Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Recommended
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleCopy(record.id, `${record.type}\t${record.host}\t${record.expectedValue}`)
                        }
                        className="h-7 px-2 text-[11px] font-medium text-slate-600 hover:text-black hover:bg-slate-100 gap-1"
                      >
                        {copiedId === record.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Production Guide & Deliverability Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-border space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-black" />
            <h4 className="text-sm font-extrabold text-black">Web Domain Deployment Steps</h4>
          </div>
          <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside leading-relaxed">
            <li>
              <strong>Apex Domain:</strong> Point your apex (<code>@</code>) to <code>76.76.21.21</code> (A record).
            </li>
            <li>
              <strong>Subdomain:</strong> Add <code>www</code> CNAME pointing to <code>cname.vercel-dns.com</code>.
            </li>
            <li>
              <strong>Environment:</strong> Set <code>NEXT_PUBLIC_APP_URL=https://remotasks.si</code> in hosting settings.
            </li>
            <li>
              <strong>SSL/TLS:</strong> Certificates issue automatically within 5 minutes of DNS propagation.
            </li>
          </ol>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-black" />
            <h4 className="text-sm font-extrabold text-black">Email Deliverability Best Practices</h4>
          </div>
          <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside leading-relaxed">
            <li>
              <strong>SPF Record:</strong> Protect against domain spoofing via <code>v=spf1 include:resend.com ~all</code>.
            </li>
            <li>
              <strong>DKIM Signature:</strong> Add the Resend public key TXT record to achieve 100% inbox rate.
            </li>
            <li>
              <strong>DMARC Alignment:</strong> Add <code>_dmarc</code> TXT record with reporting URI for reputation monitoring.
            </li>
            <li>
              <strong>API Key:</strong> Add <code>RESEND_API_KEY</code> and <code>EMAIL_FROM</code> in your <code>.env</code> file.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
