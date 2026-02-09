# 🚀 SUVIDHA City OS - Cloud Deployment Guide

This folder contains a **Host-Ready** version of your project, optimized for:
1.  **Frontend:** Vercel (Fast, Free, Global CDN)
2.  **Backend:** Render (Free Tier, Easy Node.js hosting)
3.  **Database:** Supabase (Free PostgreSQL Database)

---

## 🛠️ Step 1: Database Setup (Supabase)

1.  Go to **[supabase.com](https://supabase.com/)** and create a new project.
2.  Once created, go to **Project Settings > Database > Connection String > Node.js**.
    *   Copy the connection string (URI). It looks like:
        `postgresql://postgres.password@db.project.supabase.co:5432/postgres`
    *   **Keep this safe!** You will need it for the Backend environment variables.
3.  Go to the **SQL Editor** in the left sidebar.
4.  Open the file `supabase_setup.sql` from this folder.
5.  **Copy & Paste** the entire content into the Supabase SQL Editor and click **Run**.
    *   ✅ This creates all tables (Users, Grievances, etc.)
    *   ✅ This creates the Admin & Citizen accounts.

---

## 🛠️ Step 2: Backend Deployment (Render)

1.  Push this `final_website_cloud_ready` folder to a **GitHub Repository**.
    *   Ideally, push the whole folder, or separate repos for frontend/backend.
    *   *Simplest:* Push the whole thing, then configure Root Directory in Render.

2.  Go to **[render.com](https://render.com/)**, create an account, and click **New + > Web Service**.
3.  Connect your GitHub repository.
4.  **Configure Settings:**
    *   **Name:** `suvidha-backend`
    *   **Root Directory:** `backend` (Important!)
    *   **Runtime:** Node
    *   **Build Command:** `npm install`
    *   **Start Command:** `node server.js`
5.  **Environment Variables (Advanced):**
    *   Add the following variables:
        *   `DATABASE_URL`: (Paste your Supabase Connection String from Step 1)
        *   `NODE_ENV`: `production`
        *   `FRONTEND_URL`: `https://your-frontend-name.vercel.app` (You'll get this in Step 3, come back and update it later!)
        *   `GMAIL_USER`: (Your Gmail)
        *   `GMAIL_APP_PASSWORD`: (Your App Password)
6.  Click **Create Web Service**. Wait for it to deploy.
    *   Copy the **Service URL** (e.g., `https://suvidha-backend.onrender.com`).

---

## 🛠️ Step 3: Frontend Deployment (Vercel)

1.  Go to **[vercel.com](https://vercel.com/)**, create an account, and click **Add New > Project**.
2.  Import the same GitHub repository.
3.  **Configure Settings:**
    *   **Framework Preset:** Vite
    *   **Root Directory:** `frontend` (Click Edit next to Root Directory and select `frontend`)
4.  **Environment Variables:**
    *   `VITE_API_URL`: (Paste your Render Backend URL from Step 2)
        *   Example: `https://suvidha-backend.onrender.com`
5.  Click **Deploy**.
6.  🎉 **Success!** Your app is live.

---

## 🔄 Final Step: Connect Frontend & Backend

1.  Copy your **Vercel Domain** (e.g., `https://suvidha-city.vercel.app`).
2.  Go back to **Render Dashboard > Environment Variables**.
3.  Update (or Add) `FRONTEND_URL` with your Vercel domain.
4.  **Redeploy** the backend (Manual Deploy > Clear Cache & Deploy) to apply changes.

---

## 🧪 Testing

1.  Open your Vercel URL.
2.  Login with **Admin Credentials**:
    *   Email: `abhishekholagundi@gmail.com`
    *   Password: `123456789` (Note: In live DB, passwords need to be hashed. The SQL script handles this for seeded users.)

✅ **DONE! You are now hosted on the cloud.**
