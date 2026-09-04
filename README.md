# StudyHub

A student command center: assignments, exams, timetable, notes with file
attachments, study plans and a focus timer, in one app that syncs between your
laptop and your phone.

Built with React + Vite on the front end and Supabase (Postgres, auth and
storage) on the back end. There is no server of your own to run — the app is a
static site, and Supabase handles data and sign-in.

## Features

- **Dashboard** — what's due, what's next, at a glance
- **Schedule** — day, week and month views for classes, labs and one-off events
- **Exams** — dates, venues, syllabus and duration, auto-added to the schedule
- **Assignments** and **Tasks** — due dates, priorities, subjects
- **Study Plan** — sessions planned against your subjects
- **Notes** — rich text with PDF and image attachments, previewed in place
- **Focus** — a Pomodoro timer with configurable work and break lengths
- **Global search** — `Ctrl`/`Cmd` + `K`, or the search button on mobile
- Installable to a phone home screen, 12h/24h time, responsive down to phones

## Setting it up

You need a free [Supabase](https://supabase.com) project and Node 18+.

### 1. Create the database

In the Supabase dashboard:

1. **SQL Editor → New Query** — paste and run [`supabase/schema.sql`](supabase/schema.sql).
   This creates the tables and the row-level security policies that keep each
   account's data private.
2. **Storage → New Bucket** — create a **private** bucket named `note-files`,
   for note attachments.
3. **SQL Editor → New Query** — paste and run
   [`supabase/storage-policies.sql`](supabase/storage-policies.sql), which
   restricts each user to their own folder in that bucket.

### 2. Point the app at it

```bash
cp .env.example .env
```

Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from
**Project Settings → API**. The anon key is meant to be public — it ships in the
browser bundle either way, and row-level security is what actually protects the
data. Never put the *service role* key in this file.

If either variable is missing the app says so on screen instead of failing
silently.

### 3. Run it

```bash
npm install
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm run icons` | Regenerate the PNG app icons from `public/icon.svg` |

## Keeping it to yourself

By default the app is single-user: the sign-in page offers no way to register,
and the sign-up code path is disabled. Two things make that real:

1. **In Supabase** — *Authentication → Sign In / Providers → Email* — turn
   **"Allow new users to sign up"** off. This is the enforcement point. Without
   it, anyone could still register through the API even though the app's UI
   hides it.
2. **Create your own account** before turning sign-ups off, or afterwards via
   *Authentication → Users → Add user* (tick "Auto Confirm User" so you can sign
   in straight away).

Anyone who finds your URL then gets a sign-in screen they cannot get past.

### Opening it up to other people

The app was built multi-user from the start — every row is keyed to a user id
and guarded by row-level security, so accounts never see each other's data. To
let others in, re-enable sign-ups in Supabase and set `VITE_ALLOW_SIGNUP=true`,
then redeploy.

## Deploying

The build is a static site, so any static host works. On
[Vercel](https://vercel.com): import the repository, and it will pick up the
settings from `vercel.json`. Add `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` under **Settings → Environment Variables**, then
deploy. Vite reads them at **build** time, so changing one needs a redeploy, not
just a restart.

Pushing to the default branch redeploys automatically.

### Installing it on your phone

Open the deployed URL in your phone's browser and use **Add to Home Screen**
(Share menu on iOS, the ⋮ menu on Android). It then launches full-screen with
its own icon, like a native app. It still needs a connection — there is no
offline mode.

## Repo layout

```
src/
  App.jsx              app shell, sidebar, tab routing
  constants.js         subjects, priorities, tab list, date/time helpers
  styles.js            the whole stylesheet: inline style objects + responsive CSS
  contexts/            auth session state
  hooks/useStudyData   every read and write against Supabase, in one hook
  components/          one file per tab
  pages/               sign-in, and the "not configured yet" screen
supabase/
  schema.sql           tables + row-level security
  storage-policies.sql bucket policies for note attachments
  reset-data.sql       wipe all data, keep the schema
scripts/
  generate-icons.mjs   renders the PNG app icons
```

## Resetting

[`supabase/reset-data.sql`](supabase/reset-data.sql) empties every table while
leaving the schema and your account intact. It is irreversible.

Note that free Supabase projects pause after a week of inactivity and are
eventually deleted, which takes the data with them. Open the app now and then,
or export anything you would miss.

## License

MIT — see [LICENSE](LICENSE).
