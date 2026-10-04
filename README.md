# Sanjeev Kumar Pandit — macOS-style Portfolio

A portfolio that *is* a simulated macOS desktop: boot screen → lock screen → desktop with draggable/resizable windows, dock, menu bar, Control Center, Spotlight, widgets, Settings, notifications and dark mode. Below 768px it becomes an iPhone-style mobile OS. Contact messages are stored in **MongoDB** and read through a secure, server-side admin inbox.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Motion · MongoDB · zod · jose · bcryptjs

---

## Quick start

```bash
npm install
cp .env.example .env.local      # fill in values (see below)
npm run dev                     # http://localhost:3000
```

The site works without a database (everything except Contact + Admin). Without `MONGODB_URI` the contact form shows a clear "database is not configured" message.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | for Contact/Admin | MongoDB / Atlas connection string |
| `MONGODB_DB` | no (default `sanjeev_portfolio`) | Database name |
| `ADMIN_SESSION_SECRET` | for Admin | ≥32 chars, signs the session cookie |
| `ADMIN_EMAIL` | for Admin | Admin login email (seeded by migration) |
| `ADMIN_PASSWORD_HASH` | for Admin | bcrypt hash, base64-encoded (from `npm run admin:hash`) |
| `PORTFOLIO_UNLOCK_PASSWORD` | no (default `hello`) | Lock-screen demo password, checked server-side |
| `NEXT_PUBLIC_PASSWORD_HINT` | no | Hint under the lock-screen field |
| `NEXT_PUBLIC_SITE_URL` | no | Canonical URL, Open Graph, sitemap |

Secrets are never exposed to the browser; only `NEXT_PUBLIC_*` values are public.

## MongoDB setup

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas) (or run local MongoDB).
2. Create a database user and allow your IP (or `0.0.0.0/0` for Vercel, with a strong password).
3. Put the connection string in `MONGODB_URI`.
4. Run the migration:

```bash
npm run db:migrate
```

It creates the collections with `$jsonSchema` validators and indexes (`messages`, `admin_users`, `rate_limits` with TTL), and seeds/updates the admin user. Changing `ADMIN_PASSWORD_HASH` and re-running it bumps `sessionVersion`, which invalidates all existing admin sessions. Schema notes: `database/schema.md`.

## Admin inbox

1. Generate a password hash: `npm run admin:hash -- "your-strong-password"`
2. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET` in `.env.local`.
3. Run `npm run db:migrate`.
4. In the desktop, open the **Admin** app (Spotlight → "admin") and sign in.

Security: bcrypt hashes, signed JWT in an `httpOnly` `SameSite=Strict` cookie, same-origin checks, Mongo-backed rate limiting, honeypot on the contact form, generic login errors, all authorization server-side. No email is sent anywhere.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` / `npm run typecheck` | Quality checks |
| `npm run db:migrate` | Create collections/indexes, seed admin |
| `npm run admin:hash -- "pw"` | Generate admin password hash |
| `npm run icons:generate` | Regenerate `src/data/techIcons.ts` from simple-icons |

## Deploy (Vercel)

Before pushing, verify that no local environment file is staged:

```bash
git status --short
git check-ignore -v .env.local
```

The repository ignores `.env`, `.env.*`, `.env.local`, credentials and `.vercel/`. Never use `git add -f` for an environment file. If a secret was ever committed or shared publicly, rotate it before deployment.

Deployment checklist:

1. Run `npm run typecheck`, `npm run lint`, and `npm run build` locally.
2. Run `npm run verify:deployment` with the production values loaded locally. It checks variable presence and never prints secret values.
3. Create or use a GitHub repository, commit the source, and push it. Do not commit `.env.local`.
4. Import the repository into Vercel with the **Next.js** framework preset and Node.js 20 or newer.
5. Add the variables from the table above in Vercel for **Production**, **Preview**, and **Development** as appropriate. `NEXT_PUBLIC_SITE_URL` should be the final production HTTPS domain.
6. Add the Vercel deployment domain to MongoDB Atlas Network Access and use a restricted database user.
7. Run `npm run db:migrate` once locally with the production `MONGODB_URI`, then deploy.
8. After deployment, verify `/robots.txt`, `/sitemap.xml`, `/icon.png`, the contact form, admin login, and the browser console.

## Editing your content

All content lives in `src/data/portfolio.ts` (single source of truth).

- **Add a project:** add an object at the **top** of `portfolio.projects` — index 0 is treated as the "latest" project (shown in widgets). Fields: title, summary, tech, GitHub/live links, etc.
- **Add skills:** add to the relevant category in `portfolio.skills`. Icons come from `src/data/techIcons.ts`; unknown names fall back to a generic icon.
- **Profile photo:** replace `public/images/Sanjeev Photo.jpeg` and update `portfolio.profile.avatar` if the filename changes. The browser-tab icon is generated separately at `src/app/icon.png`.
- **Resume:** replace `public/resume/Sanjeev_Kumar_Pandit_CV.pdf` (keep the name or update `portfolio.resume`).
- **Wallpapers:** `src/data/wallpapers.ts` (each has light + dark variants). Drop new images in `public/` and register them.
- **Apps / dock:** `src/data/apps.ts`. **Shortcuts:** `src/data/shortcuts.ts`.
- Search for `TODO` in `src/data/portfolio.ts`: 10th/12th results aren't in the CV, project statuses are assumed "Completed", and project screenshots are not yet added.

## Using the OS

- **Lock screen password:** `hello` by default (change via `PORTFOLIO_UNLOCK_PASSWORD`).
- **Shortcuts:** `⌘/Ctrl+Space` Spotlight · `Alt+W` close window · `Alt+M` minimize · `Esc` closes the open overlay (Spotlight, Control Center, menus). The Help/Apple menu lists them all.
- **Windows:** drag title bar, resize edges, traffic lights (close/minimise/maximise), double-click title to maximise. Right-click dock icons and the desktop for context menus.
- **Settings:** wallpaper, dark/light/auto, accent, dock size/magnification/position/auto-hide, notifications, sound, reset.
- **Mobile (<768px):** iOS-style lock, home screen with widgets, app grid, dock, full-screen apps with swipe-style back.

## Structure

```
src/
  app/            layout, page, API routes (unlock, contact, admin/*), SEO files
  components/
    boot/ lock/ desktop/ windows/ control-center/ spotlight/ notifications/ mobile/
    apps/         home, about, skills, projects, contact, resume, settings, admin
    ui/ system/   shared primitives, icons, dialogs
  context/        theme, desktop prefs, session, windows, overlays, notifications
  data/           portfolio content, apps, wallpapers, shortcuts, tech icons
  lib/            db, auth, api helpers, rate-limit, validation, stores
database/         migrate.mjs, schema.md
scripts/          hash-password.mjs, generate-icons.mjs
```

The OS renders client-side after hydration (no time/battery hydration mismatches); a hidden semantic `#seo-content` block plus JSON-LD is server-rendered for SEO.

## Troubleshooting

- **"Database is not configured"** — set `MONGODB_URI` and restart.
- **Admin login fails** — re-run `npm run db:migrate` after changing admin env vars; make sure the hash came from `npm run admin:hash` (base64 form).
- **Atlas connection timeout** — add your IP to Atlas Network Access.
- **Layout reset** — Settings → reset, or clear `localStorage` key `sp-os:prefs`.
# Portfolio-Macbook-UI
