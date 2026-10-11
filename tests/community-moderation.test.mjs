import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Automated Community Moderation & 3-Tier Risk Model Suite", () => {
  // Mirroring the rules engine in lib/community/screening.ts
  const CREDENTIAL_PATTERNS = [
    { name: "Stripe API Key", regex: /sk_live_[0-9a-zA-Z]{24,}/i },
    { name: "AWS Access Key", regex: /AKIA[0-9A-Z]{16}/ },
    { name: "GitHub Personal Token", regex: /ghp_[0-9a-zA-Z]{36}/ },
  ];

  const MALICIOUS_EXTENSIONS = /\.(exe|scr|bat|cmd|apk|msi|vbs|ps1|reg)(\?.*)?$/i;

  const HIGH_RISK_SCAM_PATTERNS = [
    { name: "Crypto Doubler / Recovery Scam", regex: /(send|transfer)\s+(btc|eth|crypto|usdt|bitcoin)\s+(to\s+wallet|to\s+double|and\s+get)/i },
    { name: "Pay Upfront Fee to Work", regex: /(pay|deposit|transfer)\s+(registration|activation|joining|processing|refundable)\s+fee\s+(first|before|to\s+receive\s+tasks)/i },
  ];

  const UNREALISTIC_EARNINGS_PATTERNS = [
    { name: "Unrealistic Daily INR Earning", regex: /(earn|make|get)\s+(₹|rs\.?|inr)\s*([3-9],\d{3}|\d{5,})\s*(daily|per\s*day|\/day)/i },
    { name: "Unrealistic Daily USD Earning", regex: /(earn|make|get)\s+(\$|usd)\s*([2-9]\d{2}|\d{4,})\s*(daily|per\s*day|\/day)/i },
    { name: "Guaranteed Effortless Income", regex: /guaranteed\s+(income|returns|profits?)\s*(with(out)?\s+(no|zero)\s+(work|effort|skills)|100%|daily)/i },
  ];

  const SUSPICIOUS_SHORTENER_HOSTS = new Set([
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "cutt.ly",
    "is.gd",
    "ow.ly",
    "buff.ly",
    "adf.ly",
    "rb.gy",
  ]);

  function calculateTextSimilarity(a, b) {
    if (!a || !b) return 0;
    const wordsA = new Set(a.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2));
    const wordsB = new Set(b.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2));
    if (wordsA.size === 0 || wordsB.size === 0) return 0;
    let intersection = 0;
    wordsA.forEach((w) => {
      if (wordsB.has(w)) intersection++;
    });
    const union = wordsA.size + wordsB.size - intersection;
    return union === 0 ? 0 : intersection / union;
  }

  function screenContent(input) {
    const combinedText = `${input.title} ${input.body}`.trim();
    const reasons = [];
    const matchedRules = [];
    let riskLevel = "low";
    let reviewStatus = "none";
    let autoHide = false;
    let requiresReview = false;

    const metrics = {
      unrealisticEarningsDetected: false,
      credentialExposureDetected: false,
      maliciousLinkDetected: false,
      suspiciousLinkShortenerDetected: false,
      duplicateContentDetected: false,
    };

    // HIGH RISK CHECKS
    for (const cred of CREDENTIAL_PATTERNS) {
      if (cred.regex.test(combinedText)) {
        metrics.credentialExposureDetected = true;
        matchedRules.push(`credential_leak:${cred.name}`);
        reasons.push(`Contains exposed sensitive credentials (${cred.name})`);
        riskLevel = "high";
        autoHide = true;
        reviewStatus = "urgent";
      }
    }

    if (input.link_url) {
      try {
        const url = new URL(input.link_url);
        if (MALICIOUS_EXTENSIONS.test(url.pathname)) {
          metrics.maliciousLinkDetected = true;
          matchedRules.push("malicious_attachment_url");
          reasons.push("URL points directly to an executable/malware file extension");
          riskLevel = "high";
          autoHide = true;
          reviewStatus = "urgent";
        }
      } catch {}
    }

    for (const scam of HIGH_RISK_SCAM_PATTERNS) {
      if (scam.regex.test(combinedText)) {
        matchedRules.push(`high_risk_scam:${scam.name}`);
        reasons.push(`High-confidence fraudulent pattern detected (${scam.name})`);
        riskLevel = "high";
        autoHide = true;
        reviewStatus = "urgent";
      }
    }

    // MEDIUM RISK CHECKS
    if (riskLevel !== "high") {
      const inrMatch = combinedText.match(/(?:earn|make|get)\s*(?:up\s*to)?\s*(?:₹|rs\.?|inr)\s*([0-9,]+)\s*(?:daily|per\s*day|\/day|a\s*day)/i);
      if (inrMatch) {
        const val = parseInt(inrMatch[1].replace(/,/g, ""), 10);
        if (val >= 3000) {
          metrics.unrealisticEarningsDetected = true;
          matchedRules.push("unrealistic_earnings:Daily INR Earning");
          reasons.push(`Contains unverified or exaggerated daily income claim (₹${inrMatch[1]})`);
          riskLevel = "medium";
          requiresReview = true;
          reviewStatus = "needs_review";
        }
      }

      const usdMatch = combinedText.match(/(?:earn|make|get)\s*(?:up\s*to)?\s*(?:\$|usd)\s*([0-9,]+)\s*(?:daily|per\s*day|\/day|a\s*day)/i);
      if (usdMatch) {
        const val = parseInt(usdMatch[1].replace(/,/g, ""), 10);
        if (val >= 200) {
          metrics.unrealisticEarningsDetected = true;
          matchedRules.push("unrealistic_earnings:Daily USD Earning");
          reasons.push(`Contains unverified or exaggerated daily income claim ($${usdMatch[1]})`);
          riskLevel = "medium";
          requiresReview = true;
          reviewStatus = "needs_review";
        }
      }

      for (const claim of UNREALISTIC_EARNINGS_PATTERNS) {
        if (claim.regex.test(combinedText)) {
          metrics.unrealisticEarningsDetected = true;
          matchedRules.push(`unrealistic_earnings:${claim.name}`);
          reasons.push(`Contains unverified or exaggerated income claim ("${claim.name}")`);
          riskLevel = "medium";
          requiresReview = true;
          reviewStatus = "needs_review";
        }
      }

      if (input.link_url) {
        try {
          const url = new URL(input.link_url);
          const host = url.hostname.toLowerCase().replace(/^www\./, "");
          if (SUSPICIOUS_SHORTENER_HOSTS.has(host)) {
            metrics.suspiciousLinkShortenerDetected = true;
            matchedRules.push("link_shortener_obfuscation");
            reasons.push(`URL uses redirect/shortener service (${host}) requiring destination review`);
            riskLevel = "medium";
            requiresReview = true;
            reviewStatus = "needs_review";
          }
        } catch {}
      }

      if (input.authorPostHistory) {
        const { recentTitles, recentBodies } = input.authorPostHistory;
        let isDuplicate = false;
        for (const pastTitle of recentTitles || []) {
          if (calculateTextSimilarity(input.title, pastTitle) > 0.8) {
            isDuplicate = true;
            break;
          }
        }
        if (!isDuplicate) {
          for (const pastBody of recentBodies || []) {
            if (calculateTextSimilarity(input.body, pastBody) > 0.85) {
              isDuplicate = true;
              break;
            }
          }
        }
        if (isDuplicate) {
          metrics.duplicateContentDetected = true;
          matchedRules.push("duplicate_content_detected");
          reasons.push("Substantially identical content was recently posted by this author");
          riskLevel = "medium";
          requiresReview = true;
          reviewStatus = "needs_review";
        }
      }
    }

    return { riskLevel, reviewStatus, reasons, autoHide, requiresReview, matchedRules, metrics };
  }

  // Progressive rate limits
  function getProgressiveRateLimits(accountAgeHours, postCount) {
    const isNewAccount = accountAgeHours < 24 || postCount < 2;
    if (isNewAccount) {
      return {
        isNewAccount: true,
        createPost: { interval: 300_000, uniqueTokenPerInterval: 1 },
        createReply: { interval: 60_000, uniqueTokenPerInterval: 2 },
        submitReport: { interval: 60_000, uniqueTokenPerInterval: 3 },
      };
    }
    return {
      isNewAccount: false,
      createPost: { interval: 60_000, uniqueTokenPerInterval: 3 },
      createReply: { interval: 60_000, uniqueTokenPerInterval: 10 },
      submitReport: { interval: 60_000, uniqueTokenPerInterval: 5 },
    };
  }

  // Report prioritization
  const REPORT_WEIGHTS = { scam: 3.0, abuse: 3.0, misleading: 2.0, spam: 1.5, other: 1.0 };
  function calculateReportPriority(reports) {
    const reportCount = reports.length;
    let reportScore = 0;
    for (const r of reports) {
      reportScore += REPORT_WEIGHTS[r.reason] || 1.0;
    }
    const isUrgent = reportCount >= 3 || reportScore >= 5.0;
    const shouldAutoHide = reportScore >= 8.0;
    return { reportCount, reportScore: Math.round(reportScore * 10) / 10, isUrgent, shouldAutoHide };
  }

  function renderModerationUrgentAlertEmail(params) {
    const subject = `🚨 [URGENT MODERATION] ${params.riskLevel.toUpperCase()} Risk Incident: ${params.targetTitle.slice(0, 50)}`;
    const html = `<div class="card"><h1>Urgent Security & Moderation Alert</h1><p>Action link: ${params.adminUrl || "https://remotasks.si/admin?tab=community"}</p><ul>${params.reasons.map((r) => `<li>${r}</li>`).join("")}</ul></div>`;
    return { subject, html };
  }

  function renderDailyModerationSummaryEmail(params) {
    const subject = `📊 Daily Moderation Summary — ${params.summaryDate}`;
    const text = `Total Posts: ${params.totalPosts}\nAuto-Hidden Threats: ${params.autoHiddenCount}\nNeeds Review Flags: ${params.flaggedCount}\nAvg Turnaround: ${params.averageTurnaroundMinutes} mins`;
    return { subject, text };
  }

  // ============================================================================
  // Tests
  // ============================================================================

  test("Risk Level Low: Normal discussion and legitimate gig recommendation publishes immediately", () => {
    const result = screenContent({
      title: "Tips for passing the Remotasks LiDAR onboarding assessment",
      body: "Make sure you read the instructions carefully and zoom in on cuboids. Average compensation is $15/hr depending on project tier.",
      link_url: "https://remotasks.com/projects",
      affiliate_disclosure: "Referral link for new annotators",
    });

    assert.equal(result.riskLevel, "low");
    assert.equal(result.reviewStatus, "none");
    assert.equal(result.autoHide, false);
    assert.equal(result.requiresReview, false);
    assert.equal(result.reasons.length, 0);
  });

  test("Risk Level Medium: Unrealistic earnings claim triggers scrutiny without automatic fraud classification", () => {
    const inrResult = screenContent({
      title: "New data labeling portal pays well",
      body: "You can easily earn ₹50,000 daily with zero effort or special skills required.",
    });

    assert.equal(inrResult.riskLevel, "medium");
    assert.equal(inrResult.reviewStatus, "needs_review");
    assert.equal(inrResult.autoHide, false, "Medium risk should NOT be auto-hidden");
    assert.equal(inrResult.requiresReview, true);
    assert.equal(inrResult.metrics.unrealisticEarningsDetected, true);
    assert.ok(inrResult.reasons.some((r) => r.includes("income claim")));

    const usdResult = screenContent({
      title: "Remote typing tasks available now",
      body: "Sign up today and earn $1,500 daily guaranteed income without working.",
    });

    assert.equal(usdResult.riskLevel, "medium");
    assert.equal(usdResult.reviewStatus, "needs_review");
    assert.equal(usdResult.autoHide, false);
  });

  test("Risk Level Medium: Link shorteners trigger review requirement to prevent blind redirects", () => {
    const result = screenContent({
      title: "Legitimate annotation project link",
      body: "Here is the registration link for the newest prompt evaluation batch.",
      link_url: "https://bit.ly/remote-tasks-batch-9",
    });

    assert.equal(result.riskLevel, "medium");
    assert.equal(result.reviewStatus, "needs_review");
    assert.equal(result.autoHide, false);
    assert.equal(result.metrics.suspiciousLinkShortenerDetected, true);
    assert.ok(result.reasons.some((r) => r.includes("shortener service")));
  });

  test("Risk Level Medium: Duplicate content against author recent post history is flagged", () => {
    const history = {
      recentTitles: ["Pass Outlier AI screening test in 2026"],
      recentBodies: ["Detailed walkthrough of Outlier AI training tests and guidelines."],
      accountAgeHours: 72,
      totalPublishedPosts: 4,
    };

    const duplicateResult = screenContent({
      title: "Pass Outlier AI screening test in 2026",
      body: "Detailed walkthrough of Outlier AI training tests and guidelines.",
      authorPostHistory: history,
    });

    assert.equal(duplicateResult.riskLevel, "medium");
    assert.equal(duplicateResult.reviewStatus, "needs_review");
    assert.equal(duplicateResult.metrics.duplicateContentDetected, true);
  });

  test("Risk Level High: Exposed Stripe/AWS credentials are auto-hidden and escalated to urgent", () => {
    const dummyStripeKey = "sk" + "_live_" + "test_credential_token_placeholder_12345";
    const stripeResult = screenContent({
      title: "Test API credentials for micro-tasks portal",
      body: "Here is the key to test your webhook integration: " + dummyStripeKey,
    });

    assert.equal(stripeResult.riskLevel, "high");
    assert.equal(stripeResult.reviewStatus, "urgent");
    assert.equal(stripeResult.autoHide, true, "Credential leaks must be auto-hidden immediately");
    assert.equal(stripeResult.metrics.credentialExposureDetected, true);

    const dummyAwsKey = "AKIA" + "IOSFODNN7EXAMPLE";
    const awsResult = screenContent({
      title: "Backend access setup",
      body: "Use IAM key " + dummyAwsKey + " to configure task dispatch bucket.",
    });

    assert.equal(awsResult.riskLevel, "high");
    assert.equal(awsResult.autoHide, true);
  });

  test("Risk Level High: Executable or malware downloads in URL are auto-hidden", () => {
    const exeResult = screenContent({
      title: "Download automated task runner tool",
      body: "Install this automation assistant before starting task evaluation.",
      link_url: "https://cdn.tasks-automation.org/files/runner-v2.exe",
    });

    assert.equal(exeResult.riskLevel, "high");
    assert.equal(exeResult.reviewStatus, "urgent");
    assert.equal(exeResult.autoHide, true);
    assert.equal(exeResult.metrics.maliciousLinkDetected, true);
  });

  test("Risk Level High: Upfront fee to work scam pattern is auto-hidden", () => {
    const scamResult = screenContent({
      title: "Guaranteed high paying transcription task queue",
      body: "Deposit registration fee first to receive tasks and start earning immediately.",
    });

    assert.equal(scamResult.riskLevel, "high");
    assert.equal(scamResult.reviewStatus, "urgent");
    assert.equal(scamResult.autoHide, true);
  });

  test("Progressive Rate Limiting: Enforces stricter bounds on new accounts (< 24h old)", () => {
    const newAccountLimits = getProgressiveRateLimits(12, 1);
    assert.equal(newAccountLimits.isNewAccount, true);
    assert.equal(newAccountLimits.createPost.uniqueTokenPerInterval, 1);
    assert.equal(newAccountLimits.createPost.interval, 300_000); // 1 post per 5 min
    assert.equal(newAccountLimits.createReply.uniqueTokenPerInterval, 2);

    const establishedLimits = getProgressiveRateLimits(72, 8);
    assert.equal(establishedLimits.isNewAccount, false);
    assert.equal(establishedLimits.createPost.uniqueTokenPerInterval, 3);
    assert.equal(establishedLimits.createPost.interval, 60_000); // 3 posts per min
    assert.equal(establishedLimits.createReply.uniqueTokenPerInterval, 10);
  });

  test("Report Prioritization: Weighted scoring elevates multi-report items to urgent and auto-hides severe reports", () => {
    const singleReport = calculateReportPriority([{ reason: "spam" }]);
    assert.equal(singleReport.isUrgent, false);
    assert.equal(singleReport.reportScore, 1.5);

    const urgentReports = calculateReportPriority([
      { reason: "scam" },
      { reason: "scam" },
      { reason: "abuse" },
    ]);
    assert.equal(urgentReports.isUrgent, true);
    assert.equal(urgentReports.reportScore, 9.0);
    assert.equal(urgentReports.shouldAutoHide, true, "Score >= 8.0 auto-hides reported content");
  });

  test("Urgent Email Alert: Renders incident alert with reasons and admin link", () => {
    const email = renderModerationUrgentAlertEmail({
      riskLevel: "high",
      targetTitle: "Executable download",
      reasons: ["URL points directly to an executable/malware file extension"],
      adminUrl: "https://remotasks.si/admin?tab=community",
    });

    assert.ok(email.subject.includes("[URGENT MODERATION]"));
    assert.ok(email.subject.includes("HIGH Risk Incident"));
    assert.ok(email.html.includes("Urgent Security & Moderation Alert"));
    assert.ok(email.html.includes("https://remotasks.si/admin?tab=community"));
  });

  test("Daily Summary Email: Renders 24h exception metrics", () => {
    const email = renderDailyModerationSummaryEmail({
      summaryDate: "Oct 11, 2026",
      totalPosts: 45,
      autoHiddenCount: 2,
      flaggedCount: 5,
      averageTurnaroundMinutes: 14,
    });

    assert.ok(email.subject.includes("Daily Moderation Summary"));
    assert.ok(email.text.includes("Total Posts: 45"));
    assert.ok(email.text.includes("Auto-Hidden Threats: 2"));
    assert.ok(email.text.includes("Avg Turnaround: 14 mins"));
  });
});
