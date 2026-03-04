# American College Preparation Unit (AC-Genie)

Web app for students to practice for the American College in Sofia admission exam. Mobile-first, with email + PIN login, Part 1 (Essay) and Part 2 (Test, 4 sections), and progress tracking.

## Run locally

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**
   - Copy `.env.example` to `.env` (or ensure `.env` has `DATABASE_URL` and `SESSION_SECRET`).
   - Default: `DATABASE_URL="file:./prisma/dev.db"` and any `SESSION_SECRET` for cookie signing.

3. **Create database**
   ```bash
   npx prisma migrate dev
   ```

4. **Start dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000). You will be redirected to `/login`. Use **Register** to create an account (email + 4–8 digit PIN), then sign in.

## Project layout

- **`/`** – Redirects to `/login` or `/home`
- **`/login`**, **`/register`** – Email + PIN auth
- **`/home`** – List of exam parts (Part 1 Essay, Part 2 Sections 1–4); Continue / Start new / Previous examples
- **`/practice/part1`** – Essay practice (placeholder content)
- **`/practice/part2/[section]`** – Test section practice (placeholder content)
- **`/docs/`** – Vision, content assessment, and open questions

## Tech stack

- Next.js 14 (App Router), React, Tailwind CSS
- Prisma + SQLite (local); session auth with HTTP-only cookie, bcrypt for PIN
- Rate-limited login; see `docs/VISION.md` for security notes

## Deploy (live URL)

Code is on GitHub: **https://github.com/kostantin-stambolov/AC-Genie**

To get a public URL (e.g. with [Railway](https://railway.com/new)):

1. Create a **New Project** → **Deploy from GitHub repo** → select **AC-Genie**.
2. In the service **Variables**, set at least:
   - `DATABASE_URL` (e.g. `file:./prisma/dev.db` for SQLite, or a Postgres URL if you add Railway Postgres)
   - `SESSION_SECRET` (long random string)
   - `OPENAI_API_KEY` (for essay feedback and dictation)
3. Generate a **public domain** in the service’s Networking / Settings to get your live URL.

See **docs/DEPLOYMENT_RAILWAY.md** for step-by-step Railway deployment and database options.

## Future

- Clova / ChatGPT APIs for dictation and file upload
- Real essay and test content (from AC Sample PDFs or structured data)
