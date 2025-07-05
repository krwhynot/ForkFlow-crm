# ForkFlow CRM Authentication & Login Page Guide

## Overview
ForkFlow CRM uses a modular authentication system built on top of [react-admin](https://marmelab.com/react-admin/) and [Supabase](https://supabase.com/) (with support for JWT and offline modes). The login flow is designed to be secure, extensible, and easy to customize for both development and production environments.

---

## Authentication Flow
1. **User visits the app** (`/`)
2. If authentication is required, the **Login Page** is shown
3. On successful login, the user is redirected to the dashboard
4. If authentication is bypassed (for development), the dashboard loads directly

---

## Login Page Implementation
- **Component:** `src/login/UniversalLoginPage.tsx`
  - Handles all login modes (Supabase, JWT, Demo)
  - Shows email/password fields, error messages, and demo user shortcuts
  - Redirects to `/` if already authenticated
- **Form Logic:** Uses `react-admin`'s `useLogin` and `useAuthState` hooks
- **UI Kit:** Uses custom UI kit components for consistent styling

---

## Enabling/Disabling Authentication (Development Mode)
- **Bypass Auth:** Set `VITE_SKIP_AUTH=true` in `.env.local` to skip login and load the dashboard directly
- **Enable Auth:** Remove or set `VITE_SKIP_AUTH=false` to require login
- **Demo Mode:** Set `VITE_IS_DEMO=true` to show demo features (like the welcome card)

**Example `.env.local` for development:**
```env
VITE_SKIP_AUTH=true
VITE_IS_DEMO=true
```

---

## Customizing the Login UI & Logic
- **Login Page:** Edit `src/login/UniversalLoginPage.tsx` for UI/UX changes
- **Login Form:** Edit `src/login/LoginForm.tsx` for form fields and validation
- **Auth Provider:** Edit `src/providers/supabase/authProvider.ts` for Supabase logic, or `src/providers/auth/jwtAuthProvider.ts` for JWT
- **CRM Auth Setup:** See `src/root/CRM.tsx` for how auth is injected into the app

---

## Best Practices & Extending Auth
- **Never commit real secrets** to `.env` or `.env.local` (use `.gitignore`)
- **Use environment variables** to control auth mode and Supabase keys
- **Keep auth logic modular** (separate UI, provider, and API logic)
- **Add social login or 2FA** by extending the auth provider and login page
- **Review RLS (Row Level Security) policies** in Supabase for data safety
- **Test login/logout flows** in both dev and production

---

## Key Files & Components
- `src/login/UniversalLoginPage.tsx` – Main login page
- `src/login/LoginForm.tsx` – Login form UI/logic
- `src/providers/supabase/authProvider.ts` – Supabase auth provider
- `src/providers/auth/jwtAuthProvider.ts` – JWT auth provider (optional)
- `src/root/CRM.tsx` – Main app, controls auth injection and bypass
- `.env.local` – Controls dev/prod auth mode

---

## Troubleshooting
- **Login page not showing?** Check `VITE_SKIP_AUTH` and CRM `requireAuth` logic
- **Auth errors?** Check Supabase keys and network requests
- **Stuck on loading?** Ensure backend tables exist and API is reachable
- **Want to test as different roles?** Edit the dev auth provider in `CRM.tsx`

---

## For New Developers
- **Read this file before changing auth!**
- Always test login/logout after making changes
- Ask for a code review before deploying auth changes
- Keep UI and logic changes small and well-commented
- When in doubt, ask for help or check the [react-admin auth docs](https://marmelab.com/react-admin/Authentication.html)

---

Happy coding! 🚀 