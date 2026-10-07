# Google signup and email confirmation

## Setup status checked September 22, 2026

- Profile-table migration applied to the configured Supabase database; RLS enabled and browser-role access revoked.
- Google provider is **disabled**. Complete the Google Cloud and Supabase steps below before testing real signup.
- Email provider is currently enabled; disable it after configuring Google if this project is Google-only.
- Existing Gmail SMTP credentials verified successfully. No test email was sent.
- Production build, TypeScript checks, nine access/validation tests, and the PostgreSQL confirmation-token integration test passed. ESLint has no errors and four existing unused-variable warnings.
- A real Google signup and confirmation-email round trip remains to be tested after provider configuration.

September 23, 2026: renamed the application profile table to `public.users`, preserving its data and access restrictions.

## What the app does

1. **Sign up → Continue with Google** authenticates a Google account.
2. **Finish signing up** asks for a full name and birthdate. Email comes from the authenticated Supabase user, never from a submitted form field. The Google name is only an editable suggestion; no Google birthday permission is requested.
3. The server saves a registration in `public.users` and sends a separate confirmation email using the existing Nodemailer/Gmail configuration.
4. The email opens a confirmation page. Clicking **Confirm email address** activates the registration, then the user can sign in with Google.
5. **Sign in → Continue with Google** requires an existing registration. New users are signed out of that local session and told to sign up first. Pending registrations go to the confirmation screen.

Supabase Google OAuth uses one endpoint for signup and login. It can create an `auth.users` identity even when someone starts at Sign in. That identity is not an ApplyFlow registration and grants no dashboard access. The app does not delete Auth identities or overwrite existing profile data during repeat signup.

Google's verified identity and ApplyFlow's post-signup email confirmation are separate. The latter is stored in `public.users.email_confirmed_at`, not Supabase's `auth.users.email_confirmed_at`.

## 1. Environment

Keep these in your local `.env` and your hosting provider's environment settings. Never commit secrets:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
DATABASE_URL=YOUR_SERVER_POSTGRES_CONNECTION_STRING
GMAIL_ADDRESS=YOUR_SENDING_GMAIL_ADDRESS
GMAIL_APP_PASSWORD=YOUR_GMAIL_APP_PASSWORD
```

Use your real HTTPS origin for `NEXT_PUBLIC_SITE_URL` in production. A fixed configured origin prevents spoofed request headers from controlling confirmation URLs. Gmail's app password is a server secret, not your normal account password. For production volume, replace the transporter with your transactional SMTP provider.

## 2. Application users table

Run the app migrations:

```sh
node scripts/auth-database.mjs --apply
```

The script uses Drizzle's PostgreSQL driver to run the SQL migrations in a transaction; `pg` remains the underlying connection driver. It creates the initial profile table on a new installation, then renames it to `public.users`. On an existing installation, it preserves the table's rows, RLS, grants, and foreign keys. Rerunning the script does not recreate `applyflow_profiles`.

Alternatively, use the Supabase SQL Editor. For a new installation, first run `supabase/migrations/202609220001_applyflow_profiles.sql`. Then run `supabase/migrations/202609230001_rename_profiles_to_users.sql`. If `applyflow_profiles` already exists, run only the rename migration; if the rename is already applied, do not rerun the initial migration. The rename refuses to overwrite an existing `public.users` table. Browser roles have no access; Next.js accesses `public.users` using the server's `DATABASE_URL`. Supabase's separate `auth.users` table is unchanged.

Check the result with `node scripts/auth-database.mjs`: RLS should be true and both browser-access flags false. Do not use the existing introspected Drizzle migration to set up this flow: it contains Supabase-managed schemas.

## 3. Google Cloud

In Google Auth Platform for your Google Cloud project:

1. Configure **Branding** with ApplyFlow's name, support email, and developer contact.
2. Set **Audience** appropriately. If the app is in Testing, add your own Google account and any testers.
3. Use only the basic `openid`, email, and profile scopes.
4. Under **Clients**, create an OAuth client with type **Web application**.
5. Add `http://localhost:3000` and your production origin to **Authorized JavaScript origins** as appropriate.
6. Add the callback shown on Supabase's Google provider screen to **Authorized redirect URIs**. It normally looks like `https://YOUR_PROJECT.supabase.co/auth/v1/callback`. This is the Supabase callback, not the app callback.
7. Copy the client ID and secret into Supabase's Google provider configuration.

## 4. Supabase

1. Under **Authentication → Sign In / Providers → Google**, enable Google and save the Google client ID and secret. Keep nonce checking enabled.
2. Under **Authentication → URL Configuration**, set the Site URL to your app's origin.
3. Add `http://localhost:3000/auth/callback?flow=*` and `https://YOUR_APP_DOMAIN/auth/callback?flow=*` to Redirect URLs. Keep the wildcard limited to the flow parameter; the app binds it to a short-lived browser cookie. Replace the example production domain with your actual host.
4. Keep new-user signup enabled so Google signup works. Disable the Email auth provider if this project should support only Google. ApplyFlow's separate confirmation email uses Nodemailer, so it does not require the Email provider or Supabase email templates.

Google and Supabase credentials must be configured by the project owner. They are not stored in this repository.

## Checks before launch

Run `node scripts/check-google-auth.mjs --email` to check public provider settings and authenticate with SMTP without sending an email.

- New Google account on Sign in: rejected with a signup link; no application profile created.
- New account on Sign up: profile form appears with the Google email locked.
- Empty name, impossible or future birthdate: rejected by the server.
- Completed profile: saved once, email sent, dashboard blocked until confirmation.
- Email link GET: shows a confirmation button without activating the account (safe for link scanners).
- Confirm button: activates once; expired, altered, or reused tokens cannot activate a registration.
- Confirmed user: Google login opens dashboard; `/profile` displays saved name, birthdate, and email.
- Repeat signup: existing data remains intact; pending profiles resume confirmation.
- Resend: cooldown of 60 seconds; a new link replaces the previous one.
- All dashboard routes redirect unauthenticated users to login.

Confirmation tokens are random 256-bit values, stored only as hashes, expire after 24 hours, and are consumed atomically. Email is sent only to the authenticated user's saved email. Future data queries and Server Actions must call `requireAccount()` themselves, not rely only on the shared layout. Future application tables need their own authorization/RLS rules.

## Validation

```sh
node --test tests/auth-policy.test.mjs
node --test tests/profiles-db.test.mjs
npx tsc --noEmit
npm run lint
npm run build
```

An actual Google login and email-delivery check still require your configured provider and a real browser account.
The database integration test uses only temporary tables on `DATABASE_URL` and rolls back; it does not change real accounts or send emails. Tests use Node 24's built-in TypeScript support.

References: [Supabase Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google), [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [Redirect URL patterns](https://supabase.com/docs/guides/auth/redirect-urls).
