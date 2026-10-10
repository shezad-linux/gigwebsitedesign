# AI Gig-Matching Platform (Obsidian Edition)

A high-performance, responsive discovery and matching platform connecting remote specialists, AI trainers, and developers to verified AI evaluation contracts (Outlier, DataAnnotation, Alignerr, Mindrift, Testlio).

Engineered with a **strict Black & White (Obsidian / Monochrome)** design system, deterministic matching formulas, transparent compensation evidence, server-enforced role-based access control (RBAC), and GDPR/CCPA zero-retention privacy safeguards.

---

## 🌟 Key Features

- **Obsidian Black & White UX**: Brutalist-luxe design system built with Tailwind CSS, custom dark scrollbars, high-contrast monochrome badges, and interactive Three.js 3D orb visualization.
- **Deterministic Fit Engine**: 0–100% mathematical skill overlap and experience calculation with full score breakdown drawers. Sponsored listings never alter organic fit scores.
- **Evidence-Backed Compensation & Geoblocks**: Real-time tracking of advertised rates vs. worker reports, payout rails (PayPal, Airwallex, Wire), and country eligibility filters.
- **Private & Safe Resume Calibration**: In-memory text extraction (PDF & DOCX) with structured schema validation. Candidates review and confirm facts before saving.
- **Zero-Retention Guarantee**: One-click self-service data purge permanently cleans cached extractions, saved listings, and application trackers from client and server storage.
- **Server-Enforced Admin Operations**: Multi-role RBAC (`admin`, `reviewer`, `user`) enforced in PostgreSQL Row Level Security (RLS) and Next.js middleware sessions.
- **Operations Console (`/admin`)**: Complete listing catalog lifecycle (`published`, `paused`, `draft`, `archived`), stale-data review queue, community report triage, affiliate partner analytics, and a 10-point production launch matrix.

---

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router, Server Components, Route Handlers)
- **Language:** TypeScript 5.6 (strict mode)
- **Styling:** Tailwind CSS 3.4 (Obsidian Monochrome Tokens)
- **Database & Auth:** Supabase (PostgreSQL, Auth, Storage, Row-Level Security)
- **Icons & Animation:** Lucide React, Three.js
- **Form Validation:** React Hook Form + Zod
- **Testing:** Native Node.js Test Runner (`node:test`, `node:assert`)
- **CI/CD:** GitHub Actions

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+ (tested on Node.js v25)
- **npm**: v9+
- A [Supabase](https://supabase.com) account and project

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/gig-matching-platform.git
cd gig-matching-platform

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to create your local environment file:
```bash
cp .env.example .env.local
```

Configure your `.env.local` credentials:
```env
# Supabase Public API (Exposed to browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-Side Only Service Role (NEVER prefix with NEXT_PUBLIC_)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Primary Administrative Email
ADMIN_EMAIL=admin@yourdomain.com
```

### 4. Database Setup & SQL Migrations
1. Open your Supabase Project Dashboard and navigate to the **SQL Editor**.
2. Run the full schema & security policies script:
   - File: `supabase/admin_rbac.sql`
   - This provisions the `user_roles`, `payment_evidence`, `user_reports`, `audit_events`, and `affiliate_partners` tables with full Row Level Security (RLS).
3. Create your first administrative account:
   - Go to **Authentication → Users** in Supabase and invite/create your admin email (e.g. `admin@yourdomain.com`).
   - Run `supabase/setup_admin.sql` in the SQL Editor to assign the `'admin'` role:
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   SELECT id, 'admin' FROM auth.users WHERE email = 'admin@yourdomain.com'
   ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
   ```

### 5. Running the Application
```bash
# Start local development server
npm run dev

# Open http://localhost:3000
```

---

## 🧪 Testing & Verification

Run automated test suites and compiler checks before committing code:

```bash
# Run automated unit tests (matching engine, eligibility, validation)
npm test

# Run strict TypeScript type check
npx tsc --noEmit

# Run ESLint linter
npm run lint

# Test production build
npm run build
```

---

## 🔒 Security & Access Control Architecture

| Role | Access Scope | Enforced By |
| :--- | :--- | :--- |
| **Anonymous** | View public landing page, published listings, and legal disclosures | Next.js Static Pages & Public RLS policies |
| **Authenticated User** | Edit own profile, save gigs, track applications, wipe account | Supabase Auth cookies + `auth.uid() = user_id` RLS |
| **Reviewer** | Access review queue, verify evidence notes, triage community flags | `has_role('reviewer')` Security Definer function |
| **Admin** | Full CRUD on listings, manage partner URLs, promote roles, audit logs | `has_role('admin')` in DB + Server `middleware.ts` |

> **Security Rule**: The Supabase service-role key is strictly restricted to server-side route handlers. Non-admin users cannot elevate their role through frontend manipulation or direct REST requests.

---

## 📦 Production Deployment (Vercel)

1. **Connect Repository**: Import the repository into your Vercel team account.
2. **Set Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (Sensitive, Server-only)
   - `ADMIN_EMAIL`
3. **Configure Custom Domain**:
   - Add your custom domain in Vercel Project Settings.
   - Set up DNS records (CNAME / A records) with automated SSL provisioning.
4. **Supabase Auth Configuration**:
   - In Supabase Dashboard → **Authentication → URL Configuration**, add your production domain to **Site URL** and **Redirect URLs** (e.g., `https://yourdomain.com/**`).

---

## 🔄 Rollback & Recovery Plan

- **Frontend Rollback**: In the Vercel Dashboard, go to **Deployments** and click **Instant Rollback** to redeploy the previous stable release commit.
- **Database Rollback**: Supabase provides automated daily backups and Point-In-Time-Recovery (PITR). Database schema changes are versioned in `supabase/` and should only be altered via reviewed SQL migrations.
