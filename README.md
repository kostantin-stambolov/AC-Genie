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

## Future

- Clova / ChatGPT APIs for dictation and file upload
- Real essay and test content (from AC Sample PDFs or structured data)
