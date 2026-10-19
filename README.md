# ApplyFlow

ApplyFlow is a job application tracker for saving opportunities, following application progress, and organizing deadlines and interviews in one place.

## Features

- **Dashboard:** application totals, status summaries, and recent applications.
- **Applications:** create, edit, delete, search, filter by status, and sort by date or company. Track job links, salary ranges, work arrangements, notes, deadlines, and interview schedules.
- **Application statuses:** Saved, Applied, In review, Interview, Offer, and Rejected.
- **Calendar:** month and agenda views with search, event-type filters, and private interviews, deadlines, follow-ups, and reminders. Application deadlines and scheduled interviews appear automatically.
- **Accounts:** Google sign-in, profile completion, separate registration email confirmation, and profile editing.
- **Settings:** Light, Dark, and System appearance; calendar preferences; default currency and work arrangement; CSV and iCalendar exports.

## Tech stack

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Supabase Auth, PostgreSQL with Drizzle ORM, and Nodemailer with Gmail SMTP. Dependency versions are recorded in [package.json](package.json) and [package-lock.json](package-lock.json).

## Local setup

You will need Node.js 24 and npm, a Supabase project with a PostgreSQL connection string, Google OAuth credentials, and a Gmail account with an app password for registration emails. Node.js 24 supports the TypeScript imports and module hooks used by the tests.

Run the following commands from the repository root.

### 1. Install dependencies

```sh
npm ci
```

### 2. Configure environment variables

Create a `.env` file in the repository root and replace these placeholders:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
DATABASE_URL=YOUR_SERVER_POSTGRES_CONNECTION_STRING
GMAIL_ADDRESS=YOUR_SENDING_GMAIL_ADDRESS
GMAIL_APP_PASSWORD=YOUR_GMAIL_APP_PASSWORD
```

Use `.env` for this setup because the database and authentication utility scripts load it through `dotenv/config`. Keep `DATABASE_URL` and Gmail credentials on the server; `.env` files are ignored by Git. Use a Gmail app password for `GMAIL_APP_PASSWORD`.

### 3. Configure Google authentication

Follow the [Google signup and email confirmation guide](docs/google-auth-setup.md) to configure the Google OAuth client, enable the Google provider in Supabase, and allow the application's callback URLs.

For local development, the app callback is `http://localhost:3000/auth/callback?flow=*` in Supabase's redirect allowlist. Google Cloud uses the Supabase provider callback, typically `https://YOUR_PROJECT.supabase.co/auth/v1/callback`.

### 4. Prepare the database

**The repository does not include a complete migration for an empty database.** The application interview migration requires an existing `public.applications` table matching the `applications` definition in [drizzle/schema.ts](drizzle/schema.ts). Provision that base table separately if you are starting with a new Supabase project. Its `user_id` references `public.users.user_id`, so create the users table first.

Apply the users migration:

```sh
node scripts/auth-database.mjs --apply
```

This creates the registration table on a new installation or renames the previous `public.applyflow_profiles` table to `public.users`, preserving existing registrations. Supabase's `auth.users` table is separate.

Once the base `public.applications` table exists, apply the calendar and interview migrations:

```sh
node scripts/calendar-database.mjs --apply
node scripts/application-interviews-database.mjs --apply
```

The calendar migration creates `public.calendar_events`; the interview migration adds nullable `interview_date` and `interview_time` columns. These scripts can be rerun. Run each script without `--apply` to check its table or columns; use `node scripts/calendar-database.mjs --inspect` for calendar column definitions and constraints.

Use the scripts above and the SQL in [supabase/migrations](supabase/migrations) for these changes. The older introspected migration under `drizzle/` includes Supabase-managed schemas and is unsuitable as an application bootstrap.

### 5. Start the app

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up with Google, complete your full name and birthdate, and confirm your email before accessing the dashboard.

To check Supabase provider settings and verify SMTP credentials without sending an email:

```sh
node scripts/check-google-auth.mjs --email
```

## Application behavior

### Registration

A Google identity alone does not grant dashboard access. ApplyFlow also requires a completed profile and its own email confirmation. Confirmation links expire after 24 hours, and resend requests have a 60-second cooldown. See the [authentication guide](docs/google-auth-setup.md) for the complete flow and verification checklist.

### Interviews and calendar events

Choosing **Interview** in an application shows an optional interview date and time. Scheduled interviews remain visible after a status change and appear in the application's **Next step** column, calendar, and exports. Clearing the date also clears the time and removes the generated calendar interview.

Edit generated deadlines and interviews on the **Applications** page. Manage manually created events on the **Calendar** page. Calendar dates and times preserve the user's local wall-clock values, including all-day events and optional end times. Calendar reminders and exports do not send email or device notifications or invitations.

### Preferences and exports

Appearance is saved in the current browser, with System mode following operating-system changes. Calendar preferences (Month/Agenda, Sunday/Monday, and 12/24-hour time) and application defaults are saved in the signed-in account's `applyflow_settings` authentication metadata. No additional settings migration is required. Application defaults apply only to new applications.

Download data from **Settings**. CSV exports include all application fields except the account ID. iCalendar (`.ics`) exports include private calendar events plus generated application deadlines and interviews.

## Development and checks

| Command         | Purpose                            |
| --------------- | ---------------------------------- |
| `npm run dev`   | Start the development server       |
| `npm run build` | Create a production build          |
| `npm run start` | Serve a completed production build |
| `npm run lint`  | Run ESLint                         |

Generate Next.js route types before checking TypeScript, especially on a fresh checkout:

```sh
npx next typegen
npx tsc --noEmit
```

Run focused application-list, calendar, settings, and export tests without a database:

```sh
node --test tests/application-list.test.mjs tests/calendar.test.mjs tests/settings.test.mjs
```

Run the full test suite after configuring `DATABASE_URL` and preparing the database:

```sh
node --test "tests/*.test.mjs"
```

The `*-db.test.mjs` integration tests require PostgreSQL access and use temporary tables with transaction rollback. The application database tests also require the existing `public.applications` schema. Other tests cover authentication, registration, profile updates, application actions, calendar actions, settings, and exports. A real Google sign-in and confirmation-email round trip must be verified with a configured provider and browser account.

## Project structure

```text
app/
  (dashboard)/       Dashboard, applications, calendar, profile, and settings routes
  _actions/          Server Actions for authentication and account data
  _components/       Shared UI and dashboard components
  _db/               Database connection and queries
  _lib/              Authentication, calendar, settings, and export utilities
  auth/              OAuth callback and email confirmation
docs/                Authentication setup guide
drizzle/             Database schema, relations, and older introspection output
scripts/             Database migration and authentication checks
supabase/migrations/ Application SQL migrations
tests/               Node.js unit and database integration tests
```

## Production

Configure the same environment variables on your hosting provider. Set `NEXT_PUBLIC_SITE_URL` to the app's public HTTPS origin and add the production origin and callback URLs to Google Cloud and Supabase as described in the [authentication guide](docs/google-auth-setup.md). Apply the database migrations before using the app.

Run `npm run build`, then `npm run start` on a Node.js host, or use a hosting provider that supports Next.js server features. The app requires server execution for authentication, database access, and email delivery.
