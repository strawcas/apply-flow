This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Google authentication

See [Google signup setup](docs/google-auth-setup.md) for Google Cloud and Supabase configuration, environment variables, the profile migration, and verification steps. Registration requires a full name, birthdate, and a separate email confirmation before dashboard access.

## Calendar

The calendar supports month and agenda views, event search and type filters, and adding, editing, or deleting private interviews, deadlines, follow-ups, and reminders. Application deadlines also appear automatically and are edited on the Applications page. Dates and optional times are stored as entered in the user's local calendar; no email or device notifications are sent.

Apply the calendar table migration using the configured `DATABASE_URL`:

```bash
node scripts/calendar-database.mjs --apply
```

Run without `--apply` to check the actual table columns and browser access restrictions, or with `--inspect` to see column definitions and constraints. The calendar uses the existing `type`, `company`, `start_time`, and `end_time` columns. Event types are stored as `interview`, `deadline`, `follow-up`, and `other` (shown as Reminder); blank optional fields are stored as empty strings. The migration requires the existing `public.users` table and can be applied again safely. Run the calendar checks with `node --test tests/calendar.test.mjs tests/calendar-actions.test.mjs` and the PostgreSQL integration check with `node --test tests/calendar-db.test.mjs`.

## Settings

Settings offers Light, Dark, and System appearance, calendar defaults (Month/Agenda, Sunday/Monday, 12/24-hour times), application defaults (currency and work arrangement), and private CSV/iCalendar downloads. Appearance saves in this browser and follows operating-system changes in System mode. Calendar and application preferences save to the signed-in account's `applyflow_settings` authentication metadata; no additional database migration is required. Application defaults only apply when creating an application.

CSV downloads include every application field except the account ID. Calendar downloads include events and generated application deadlines, preserve local wall-clock times and end times, and support all-day events. Exports do not send invitations or notifications. Run the settings and export checks with `node --test tests/settings.test.mjs tests/settings-server.test.mjs`.

## Local development

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
