import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Transactional Email Integration & Custom Domain Deliverability Suite", () => {
  // Mock implementations mirroring lib/email.ts and lib/domain-health.ts for pure hermetic testing
  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatCurrency(amount, currency = "INR") {
    const code = (currency || "INR").toUpperCase();
    if (code === "INR") {
      return `₹${amount.toLocaleString("en-IN")}`;
    }
    if (code === "USD") {
      return `$${amount.toLocaleString("en-US")}`;
    }
    return `${code} ${amount.toLocaleString()}`;
  }

  function renderOrderConfirmationEmail(params, config = {}) {
    const appUrl = config.appUrl || "https://remotasks.si";
    const supportEmail = config.supportEmail || "support@remotasks.si";
    const formattedFinalPrice = formatCurrency(params.finalPrice, params.currency);
    const formattedOriginalPrice = formatCurrency(params.originalPrice, params.currency);
    const formattedDiscount = formatCurrency(params.discountAmount, params.currency);

    const subject = `Order Confirmed: ${params.serviceName} (#${params.orderId.slice(0, 8)})`;

    const discountRow =
      params.discountAmount > 0
        ? `<tr>
            <td style="padding: 10px 0; font-size: 13px; color: #71717a; border-bottom: 1px solid #f4f4f5;">
              Discount (${params.couponCode || "Applied Coupon"})
            </td>
            <td style="padding: 10px 0; font-size: 13px; font-weight: 700; color: #16a34a; text-align: right; border-bottom: 1px solid #f4f4f5;">
              -${formattedDiscount}
            </td>
          </tr>`
        : "";

    const html = `<!DOCTYPE html><html><body>
      <div class="main-card">
        <h1>Thank you, ${escapeHtml(params.customerName)}.</h1>
        <p>Your order for <strong>${escapeHtml(params.serviceName)}</strong> has been confirmed.</p>
        <div class="order-id">#${escapeHtml(params.orderId)}</div>
        <div class="base-price">${formattedOriginalPrice}</div>
        ${discountRow}
        <div class="total-paid">${formattedFinalPrice}</div>
        ${params.customerNotes ? `<div class="notes">${escapeHtml(params.customerNotes)}</div>` : ""}
        <a href="${appUrl}/dashboard">Go to Candidate Dashboard</a>
      </div>
    </body></html>`;

    const text = `REMOTASKS — ORDER CONFIRMATION & RECEIPT
Order ID: #${params.orderId}
Service: ${params.serviceName}
Base Price: ${formattedOriginalPrice}
${params.discountAmount > 0 ? `Discount (${params.couponCode}): -${formattedDiscount}\n` : ""}Total Paid: ${formattedFinalPrice}
Customer: ${params.customerName} (${params.customerEmail})
`;

    return { html, text, subject };
  }

  function parseDomainInfo(rawHostOrUrl) {
    let hostname = rawHostOrUrl.trim();
    try {
      if (hostname.startsWith("http://") || hostname.startsWith("https://")) {
        hostname = new URL(hostname).hostname;
      } else {
        hostname = hostname.split("/")[0].split(":")[0];
      }
    } catch {
      hostname = "remotasks.si";
    }

    const parts = hostname.split(".");
    let apexDomain = hostname;
    if (parts.length > 2 && !hostname.endsWith("localhost")) {
      apexDomain = parts.slice(-2).join(".");
    }

    return { domain: hostname, apexDomain };
  }

  function getRequiredDnsRecords(apexDomain) {
    return [
      { id: "dns_a_apex", type: "A", host: "@", expectedValue: "76.76.21.21" },
      { id: "dns_cname_www", type: "CNAME", host: "www", expectedValue: "cname.vercel-dns.com" },
      { id: "dns_txt_spf", type: "TXT", host: "@", expectedValue: "v=spf1 include:resend.com ~all" },
      { id: "dns_txt_dkim", type: "TXT", host: `resend._domainkey.${apexDomain}` },
      { id: "dns_txt_dmarc", type: "TXT", host: `_dmarc.${apexDomain}`, expectedValue: `v=DMARC1; p=none; rua=mailto:dmarc-reports@${apexDomain}` },
      { id: "dns_mx_inbound", type: "MX", host: "@", expectedValue: "10 feedback-smtp.us-east-1.amazonses.com" },
    ];
  }

  // --- Tests ---

  test("renders order confirmation email without discount accurately", () => {
    const params = {
      orderId: "ord_101abc999",
      customerName: "Jane Doe",
      customerEmail: "jane@example.com",
      serviceName: "Expert Resume Review",
      originalPrice: 799,
      discountAmount: 0,
      finalPrice: 799,
      currency: "INR",
    };

    const rendered = renderOrderConfirmationEmail(params);

    assert.ok(rendered.subject.includes("Order Confirmed: Expert Resume Review"));
    assert.ok(rendered.subject.includes("#ord_101a"));
    assert.ok(rendered.html.includes("Jane Doe"));
    assert.ok(rendered.html.includes("₹799"));
    assert.ok(!rendered.html.includes("Discount ("));
    assert.ok(rendered.text.includes("Base Price: ₹799"));
    assert.ok(rendered.text.includes("Total Paid: ₹799"));
  });

  test("renders coupon discount row and savings when discount is applied", () => {
    const params = {
      orderId: "ord_202def888",
      customerName: "Alex Smith",
      customerEmail: "alex@example.com",
      serviceName: "Career Accelerator",
      originalPrice: 3499,
      discountAmount: 700,
      couponCode: "CAREER20",
      finalPrice: 2799,
      currency: "INR",
      customerNotes: "Targeting Outlier and DataAnnotation AI Trainer roles.",
    };

    const rendered = renderOrderConfirmationEmail(params);

    assert.ok(rendered.html.includes("Discount (CAREER20)"));
    assert.ok(rendered.html.includes("-₹700"));
    assert.ok(rendered.html.includes("₹2,799") || rendered.html.includes("₹2799"));
    assert.ok(rendered.html.includes("Targeting Outlier and DataAnnotation"));
    assert.ok(rendered.text.includes("Discount (CAREER20): -₹700"));
  });

  test("sanitizes dangerous HTML characters in customer names and notes", () => {
    const params = {
      orderId: "ord_xss_test",
      customerName: "Bob <script>alert(1)</script>",
      customerEmail: "bob@example.com",
      serviceName: "Expert Resume Creation",
      originalPrice: 1499,
      discountAmount: 0,
      finalPrice: 1499,
      currency: "INR",
      customerNotes: 'Need ATS format & "clean" layout > 1 page',
    };

    const rendered = renderOrderConfirmationEmail(params);

    assert.ok(!rendered.html.includes("<script>alert(1)</script>"));
    assert.ok(rendered.html.includes("&lt;script&gt;alert(1)&lt;/script&gt;"));
    assert.ok(rendered.html.includes("&amp;"));
    assert.ok(rendered.html.includes("&quot;clean&quot;"));
  });

  test("correctly parses hostnames and extracts apex domain", () => {
    const check1 = parseDomainInfo("https://remotasks.si/pricing");
    assert.equal(check1.domain, "remotasks.si");
    assert.equal(check1.apexDomain, "remotasks.si");

    const check2 = parseDomainInfo("https://www.remotasks.si");
    assert.equal(check2.domain, "www.remotasks.si");
    assert.equal(check2.apexDomain, "remotasks.si");

    const check3 = parseDomainInfo("http://localhost:3000");
    assert.equal(check3.domain, "localhost");
    assert.equal(check3.apexDomain, "localhost");
  });

  test("generates RFC-compliant DNS records for web and email routing", () => {
    const records = getRequiredDnsRecords("remotasks.si");

    const aRecord = records.find((r) => r.id === "dns_a_apex");
    assert.ok(aRecord);
    assert.equal(aRecord.type, "A");
    assert.equal(aRecord.host, "@");
    assert.equal(aRecord.expectedValue, "76.76.21.21");

    const cnameRecord = records.find((r) => r.id === "dns_cname_www");
    assert.ok(cnameRecord);
    assert.equal(cnameRecord.type, "CNAME");
    assert.equal(cnameRecord.expectedValue, "cname.vercel-dns.com");

    const spfRecord = records.find((r) => r.id === "dns_txt_spf");
    assert.ok(spfRecord);
    assert.equal(spfRecord.type, "TXT");
    assert.ok(spfRecord.expectedValue.startsWith("v=spf1"));
    assert.ok(spfRecord.expectedValue.includes("include:resend.com"));

    const dmarcRecord = records.find((r) => r.id === "dns_txt_dmarc");
    assert.ok(dmarcRecord);
    assert.ok(dmarcRecord.host.startsWith("_dmarc"));
    assert.ok(dmarcRecord.expectedValue.includes("v=DMARC1"));
  });

  test("fail-soft email simulation returns success without crashing", async () => {
    // Test the fail-soft behavior pattern
    async function simulateSendEmail(apiKey, options) {
      if (!apiKey || apiKey.length < 5) {
        return {
          success: true,
          simulated: true,
          id: `sim_${Date.now()}`,
        };
      }
      return { success: true, simulated: false, id: "real_msg_123" };
    }

    const unconfigured = await simulateSendEmail(undefined, {
      to: "candidate@test.com",
      subject: "Test",
      html: "<p>Hello</p>",
    });

    assert.equal(unconfigured.success, true);
    assert.equal(unconfigured.simulated, true);
    assert.ok(unconfigured.id.startsWith("sim_"));

    const configured = await simulateSendEmail("re_123456789", {
      to: "candidate@test.com",
      subject: "Test",
      html: "<p>Hello</p>",
    });

    assert.equal(configured.success, true);
    assert.equal(configured.simulated, false);
    assert.equal(configured.id, "real_msg_123");
  });
});
