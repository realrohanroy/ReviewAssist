# Client Review Assistant — Production Deployment Runbook

> **Target Platform:** Railway (Backend + PostgreSQL) & Vercel (Frontend SPA)  
> **Anti-Gating Status:** Strictly Compliant (FTC & Google Review Policies)  

---

## 1. System Architecture Overview

```mermaid
graph LR
    Client([Client Browser]) -->|HTTPS| Frontend[Vercel Frontend SPA]
    Staff([Employee / Admin]) -->|HTTPS| Frontend
    Frontend -->|HTTPS API Requests /api/*| Backend[Railway Backend API Express]
    Backend -->|TCP 5432 SSL| Database[(Railway PostgreSQL)]
    Backend -->|HTTPS API Key Server-Only| Groq[Groq AI API]
    Client -->|Uniform Direct Navigation| GoogleReview[Google Review Destination]
```

---

## 2. Environment Variables Dictionary

### Backend Environment Variables (Railway)

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | Yes | `production` | Set to `production` to activate secure cookies and strict security flags |
| `PORT` | Yes | `5000` | Port listened by the Express server (Railway automatically sets `PORT`) |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string with SSL: `postgresql://user:pass@host:port/dbname?sslmode=require` |
| `JWT_SECRET` | Yes | — | Cryptographically random string (min. 32 characters) used to sign authentication tokens |
| `GROQ_API_KEY` | Optional | — | API key for Groq Cloud (`gsk_...`). If omitted, fallback suggestions generate locally |
| `GROQ_MODEL` | Optional | `openai/gpt-oss-20b` | Model name on Groq (e.g. `openai/gpt-oss-20b` or `llama-3.3-70b-versatile`) |
| `FRONTEND_URL` | Yes | — | Production URL of the frontend (e.g., `https://review-collector.vercel.app`) for CORS and link generation |

### Frontend Environment Variables (Vercel)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | Optional | `/api` | Base API URL if not using reverse proxying |

---

## 3. Step-by-Step Deployment Guide

### A. Deploy Database on Railway
1. Log in to [Railway](https://railway.app/).
2. Create a new project and add a **PostgreSQL** service.
3. From the database settings, copy the **`DATABASE_URL`** connection string.

### B. Deploy Backend on Railway
1. In the same Railway project, click **New Service** → **GitHub Repo** → select this repository.
2. In the service settings:
   - Root directory: leave as `/` (uses root `Dockerfile`).
   - Add environment variables:
     - `NODE_ENV` = `production`
     - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (or paste from step A)
     - `JWT_SECRET` = generate a secure string (e.g. via `openssl rand -hex 32`)
     - `FRONTEND_URL` = `https://your-app.vercel.app`
     - `GROQ_API_KEY` = your Groq API key
3. In the Railway service settings, click **Generate Domain** to get your backend domain (e.g. `https://review-api-production.up.railway.app`).
4. Run migrations and database seeding using Railway CLI or one-off build command:
   ```bash
   npx prisma migrate deploy --schema=packages/backend/prisma/schema.prisma
   npx tsx packages/backend/prisma/seed.ts
   ```

### C. Deploy Frontend on Vercel
1. Log in to [Vercel](https://vercel.com/) and click **Add New Project**.
2. Import this repository.
3. In Project Settings:
   - Framework Preset: **Vite**
   - Root Directory: `packages/frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Update `packages/frontend/vercel.json`:
   Replace `BACKEND_URL_PLACEHOLDER` with your Railway backend domain (without `https://` prefix, e.g. `review-api-production.up.railway.app`).
5. Click **Deploy**.

---

## 4. Google Anti-Gating Pre-Flight Verification

Before delivering the application to clients or employees, complete this mandatory verification:

- [ ] **Uniform Navigation**: Open any active review link (`/review/:token`). Verify that selecting 1 star, 3 stars, or 5 stars and clicking **"Continue to Google"** navigates to the exact same official Google review link.
- [ ] **Zero Database Rating Storage**: Query the database to ensure zero ratings are captured:
  ```sql
  SELECT column_name FROM information_schema.columns 
  WHERE table_name IN ('ReviewRequest', 'ReviewRequestEvent', 'DraftGenerationLog') 
  AND column_name ILIKE '%rating%';
  ```
  *(Must return 0 rows).*
- [ ] **AI Key Leak Isolation**: Inspect browser DevTools Network tab on the public client page. Verify that `GROQ_API_KEY` is never exposed to the client.
