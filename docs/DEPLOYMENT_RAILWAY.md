# Deploy AC-Genie on Railway (live URL)

## CLI (from project root)

Login and link must run in **your terminal** (interactive):

```bash
npm run railway:login   # opens browser – complete sign-in
npm run railway:link    # select your Railway project
```

Then you or the assistant can run:

```bash
npm run railway:logs    # view deploy/runtime logs
npm run railway:status # service status
```

---

## Deploy (web)

Your code is on GitHub: **https://github.com/kostantin-stambolov/AC-Genie**

To get a **live URL** so the app runs on the internet:

## 1. Create a Railway project from GitHub

1. Go to **[railway.com/new](https://railway.com/new)** (or [railway.app](https://railway.app) → New Project).
2. Choose **Deploy from GitHub repo**.
3. Select the **AC-Genie** repository (and the correct GitHub account if you have several).
4. Railway will create a project and try to deploy. It can auto-detect Next.js.

## 2. Set environment variables

In the Railway project:

1. Open your **service** (the deployed app).
2. Go to the **Variables** tab.
3. Add:

| Variable | Value | Required |
|----------|--------|----------|
| `DATABASE_URL` | See below | Yes |
| `SESSION_SECRET` | A long random string (e.g. 32+ chars) | Yes |
| `OPENAI_API_KEY` | Your OpenAI API key (for essay feedback & dictation) | For essay features |

**Database options:**

- **Quick test (data resets on redeploy):**  
  `DATABASE_URL="file:./prisma/dev.db"`  
  The app runs migrations on every start, but the DB file lives on the container and is **deleted on each new deploy**.

- **Persistent DB (recommended – keep accounts and data across deploys):**  
  1. In your **AC-Genie service**, go to **Settings** (or **Variables**).  
  2. Click **Add Volume** (or **Volumes** → **Add Volume**). Mount path: `/data`.  
  3. In **Variables**, set:  
     `DATABASE_URL="file:/data/dev.db"`  
  4. Redeploy. The app runs `prisma migrate deploy` on start and stores the SQLite file on the volume, so **the DB is not deleted on new deploys**.

## 3. Build and start command

The app uses:

- **Build:** `npm run build`
- **Start:** `npm start` (runs `prisma migrate deploy` then `next start` so the DB has tables on every deploy)

## 4. Get your URL

After deploy:

1. Open your service → **Settings** (or **Deployments**).
2. Under **Networking** / **Public networking**, click **Generate domain** (or use the default).
3. The **URL** (e.g. `https://ac-genie-production-xxxx.up.railway.app`) is your live app. Open it in a browser to use the app.

## Build time

The first build can take **5–10 minutes** (install + `better-sqlite3` native bindings + Next.js build). If a build runs longer than ~10 min, cancel it in the dashboard and redeploy; check the **Build** logs for the step it’s on (Install vs Build vs Deploy).

## 5. First run and seed

Migrations run automatically on **every** start (`prisma migrate deploy`), so the DB is ready as soon as the app is up. No need to run them manually.

To create a test user (optional): in Railway’s **Settings** → run a one-off command or use the shell:  
`npm run seed`  
(Only if your seed is safe for production.)

---

**Summary:** Connect Railway to **GitHub → AC-Genie**, set **DATABASE_URL** and **SESSION_SECRET** (and **OPENAI_API_KEY** for essays), then use the generated domain as your live URL.
