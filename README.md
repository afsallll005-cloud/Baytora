# Baytora - Luxury Real Estate & Curated Residences Portal

A modern, full-stack real estate marketplace portal inspired by architectural minimalism and modern luxury design. Built with **Next.js 14** (App Router), an **Express.js** REST API backend, and **MongoDB**.

---

## 📁 Repository Structure

This repository is organized as a clean, production-ready monorepo:

```text
├── frontend/                 # Next.js 14 Web Application
│   ├── src/
│   │   ├── app/              # Next.js App Router (Public routes + /admin console)
│   │   │   ├── admin/        # Complete Admin Management Console
│   │   │   │   ├── properties/ # Inventory & Image Manager
│   │   │   │   ├── cities/     # Featured Destinations Showcase Manager
│   │   │   │   ├── stats/      # "At a glance" Homepage Stats Manager
│   │   │   │   ├── agents/     # Broker & Agent Directory Manager
│   │   │   │   └── inquiries/  # Leads & CRM Management
│   │   │   ├── login/        # Authentication & Role Portal
│   │   │   ├── properties/   # Catalog & Dynamic Property Detail Views
│   │   │   └── add-property/ # 5-Step Property Listing Submission Form
│   │   ├── components/       # Reusable UI Components (Navbar, Footer, PropertyCard, etc.)
│   │   ├── lib/              # Resilient API client, Auth session, and Seed data
│   │   └── styles/           # Design system tokens and Vanilla CSS
│   ├── vercel.json           # Vercel subfolder deployment configuration
│   ├── .env.example          # Frontend environment variables template
│   ├── .gitignore            # Frontend git ignore rules
│   └── package.json          # Frontend dependencies & scripts
│
├── backend/                  # Node.js & Express REST API
│   ├── src/
│   │   ├── models/           # Mongoose Schemas (Property, Agent, City, User, Inquiry)
│   │   ├── controllers/      # API Route Controllers
│   │   ├── routes/           # REST Endpoints
│   │   ├── data/             # Seed Data & Initial Fixtures
│   │   ├── seed.js           # Database Seeding Script
│   │   └── server.js         # Express Application Entrypoint
│   ├── .env.example          # Backend environment variables template
│   ├── .gitignore            # Backend git ignore rules
│   └── package.json          # Backend dependencies & scripts
│
├── vercel.json               # Root monorepo configuration for Vercel auto-builds
├── .gitignore                # Global git ignore (node_modules, .next, .env, etc.)
└── package.json              # Monorepo root scripts
```

---

## 🌟 Key Features

1. **Luxury Visual Aesthetic**: Two-tone obsidian (`#111112`) & violet (`#7F51FF`) design tokens with fluid typography, zero bloated utility CSS, and responsive micro-animations.
2. **Dynamic Search & Filtering**: Multi-parameter search by transaction category (`Buy`, `Rent`, `Commercial`), property type, bedrooms, bathrooms, and price ranges.
3. **Featured Cities Showcase**: Interactive city accordion with image previews, governorates, and direct catalog search filters.
4. **"At a Glance" Statistics**: Scroll-triggered animated counters auto-calculated from active listings, agents, and customer satisfaction.
5. **Interactive Map Coordinates & Location Selector**: Pinpoint location selector in the property listing workflow with interactive pin-dropping and governorate picker.
6. **Property Image Editing**: Full thumbnail reordering, image URL additions, and instant previews in the admin inventory manager.
7. **Complete Admin Console & CRM (`/admin`)**:
   - **Properties Manager**: Toggle verified/featured badges, edit specs, pricing, and images.
   - **Featured Cities Manager**: Add, edit, or reorder destination cards.
   - **Homepage Stats Manager (`/admin/stats`)**: Toggle live system auto-calculation or set custom highlight metrics with live preview.
   - **Agents Manager**: Edit broker details, phone numbers, WhatsApp, ratings, and closed deals.
   - **Inquiries CRM**: Track client leads, update response status, and open direct WhatsApp chats.
8. **Built-in Resilience**: Works out of the box with built-in in-memory fallback data. You can run and deploy the frontend without needing a live MongoDB server running immediately.

---

## 🚀 How to Push to GitHub

Follow these steps in your terminal to initialize and push this project to GitHub:

```bash
# 1. Initialize git in the root folder (if not already initialized)
git init

# 2. Stage all files (clean .gitignore will exclude node_modules & .next)
git add .

# 3. Commit your files
git commit -m "Initial commit - Baytora Luxury Real Estate Portal"

# 4. Set default branch to main
git branch -M main

# 5. Link your GitHub remote repository (replace with your repository URL)
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git

# 6. Push to GitHub
git push -u origin main
```

---

## ⚡ How to Deploy on Vercel

The frontend is built with Next.js and is optimized for one-click deployment on **Vercel**:

### Option 1: Import via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **"Add New..."** > **"Project"**.
3. Import your GitHub repository.
4. In the **"Configure Project"** screen:
   - **Root Directory**: Click `Edit` and select **`frontend`**.
   - **Framework Preset**: Next.js (automatically detected).
   - **Build Command**: `next build` (default).
   - **Output Directory**: `.next` (default).
5. Click **"Deploy"**.

Your website will be live on a `*.vercel.app` URL within 1–2 minutes!

### Option 2: Deploy from Monorepo Root (Automatic)

Because this repository includes a root [`vercel.json`](file:///c:/afsall/Antigravity/RentelHome/vercel.json) file, Vercel will automatically run:
```bash
cd frontend && npm install && npm run build
```
and serve the `.next` output without requiring manual root directory changes in the Vercel dashboard.

---

## 💻 Running Locally

### 1. Run the Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 2. (Optional) Run the Express & MongoDB Backend
```bash
cd backend
npm install
npm run dev
```
The API server starts on **`http://localhost:5000`**.

To seed the initial sample properties, agents, and admin user into MongoDB:
```bash
cd backend
npm run seed
```

---

## 🔑 Default Administrator Credentials

To access the Admin Console at **`/admin`**:
- **Email:** `Admin@Baytora` *(or `admin@baytora.com`)*
- **Password:** `12345678`
- **Role:** Super Admin
