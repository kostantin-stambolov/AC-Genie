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

- **Quick test (data may reset on redeploy):**  
  Use SQLite:  
  `DATABASE_URL="file:./prisma/dev.db"`  
  The app will run, but the DB file may not persist across redeploys.

- **Persistent data (recommended):**  
  1. In Railway, add **Postgres** to the project (New → Database → PostgreSQL).  
  2. In the Postgres service, open **Variables** and copy `DATABASE_URL`.  
  3. In your app service Variables, set `DATABASE_URL` to that URL (it looks like `postgresql://...`).  
  4. The app’s Prisma schema is currently **SQLite**. To use Postgres you must switch the schema to `provider = "postgresql"` in `prisma/schema.prisma`, run `npx prisma migrate deploy`, and redeploy.

## 3. Build and start command (if needed)

Railway usually detects Next.js. If you need to set commands:

- **Build:** `npm run build`
- **Start:** `npm start`  
  (Or use the default that Railway suggests.)

## 4. Get your URL

After deploy:

1. Open your service → **Settings** (or **Deployments**).
2. Under **Networking** / **Public networking**, click **Generate domain** (or use the default).
3. The **URL** (e.g. `https://ac-genie-production-xxxx.up.railway.app`) is your live app. Open it in a browser to use the app.

## Build time

The first build can take **5–10 minutes** (install + `better-sqlite3` native bindings + Next.js build). If a build runs longer than ~10 min, cancel it in the dashboard and redeploy; check the **Build** logs for the step it’s on (Install vs Build vs Deploy).

## 5. First run: database and seed

If the app uses a fresh DB (e.g. new Postgres or new SQLite):

- Run migrations on the deployed app (e.g. in Railway’s shell or a one-off command):  
  `npx prisma migrate deploy`  
- Optionally seed a test user:  
  `npm run seed`  
  (Only if your seed is safe for production.)

---

**Summary:** Connect Railway to **GitHub → AC-Genie**, set **DATABASE_URL** and **SESSION_SECRET** (and **OPENAI_API_KEY** for essays), then use the generated domain as your live URL.
