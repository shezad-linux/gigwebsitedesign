# Supabase Authentication & URL Configuration Guide

This guide details the exact Supabase Dashboard configuration required for production deployment of the AI Gig-Matching Platform.

---

## 1. Site URL & Redirect URLs

In your Supabase project dashboard, navigate to:
**Authentication → URL Configuration**

### Site URL
Set the primary site URL to your production domain:
- `https://your-production-domain.com` (or `http://localhost:3000` during local development)

### Redirect URLs (Allowed Callback URLs)
Add all necessary application redirect targets to the whitelist:
```text
https://your-production-domain.com/**
https://your-production-domain.com/admin/login
https://your-production-domain.com/dashboard
https://your-production-domain.com/profile
https://*.vercel.app/**
http://localhost:3000/**
```

---

## 2. Email Templates Setup

In your Supabase project dashboard, navigate to:
**Authentication → Email Templates**

Copy and paste the HTML content from the `supabase/email_templates/` directory:

1. **Magic Link:** Use `supabase/email_templates/magic_link.html`
   - Subject: `Your Secure Sign-In Link — AI Gig-Matcher`
2. **Invite User:** Use `supabase/email_templates/invite_user.html`
   - Subject: `You have been invited to the AI Gig-Matcher operations console`
3. **Reset Password:** Use `supabase/email_templates/reset_password.html`
   - Subject: `Reset Your Password — AI Gig-Matcher`

---

## 3. Session Security & Cookie Handling

- **JWT Expiry:** Recommended 3600 seconds (1 hour).
- **Refresh Token Rotation:** Enabled (revokes old refresh token on rotation).
- **Detect Compromised Refresh Tokens:** Enabled.
- **Server Middleware:** In `middleware.ts`, sessions are refreshed and verified on the server edge via `@supabase/ssr` cookies before `/admin` route rendering.

---

## 4. First Admin Provisioning

To grant administrative access to an email:
1. Create or invite the user in **Authentication → Users**.
2. Run the secure migration in the Supabase SQL Editor:
   ```sql
   SELECT public.assign_admin_role_by_email('admin@yourdomain.com', 'admin');
   ```
3. Verify the role in `public.user_roles`:
   ```sql
   SELECT * FROM public.user_roles;
   ```
