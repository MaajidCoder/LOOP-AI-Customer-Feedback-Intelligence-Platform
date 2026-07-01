# Project LOOP 🌌
> **AI Customer-Feedback Intelligence Platform**
> A corporate-grade web application that helps companies ingest, analyze, cluster, and query customer feedback semantically. Built as part of the Zidio Development Internship.

---

## 🚀 Product Showcase & Key Features

LOOP transforms scattered feedback (support tickets, reviews, sales notes) into structured, evidence-backed decisions using role-based access control and retrieval-grounded AI.

### Core Features
- **Multi-Tenant Workspaces:** Absolute data isolation at the database query level. Users from Company A can never access or query Company B's database records.
- **Feedback Ingest Center:** Bulk CSV import, single-entry forms, and live simulation feeds mimicking App Store and Intercom tickets.
- **Feedback Inbox:** A fully-featured list view supporting full-text search, server-side pagination, sorting, status transitions (`NEW` → `REVIEW` → `RESOLVED` → `ARCHIVED`), and category tagging.
- **Analytics Dashboard:** Visual representation of key metrics driven by Recharts:
  - Feedback volume over time
  - Sentiment breakdown percentages
  - Categories distribution and top trending user themes

### AI Features (Powered by Gemini)
- **Auto-Classification:** On ingestion, feedback items are classified by sentiment (Positive, Negative, Neutral), rated, and tagged with a theme and product area.
- **Theme Clustering:** Grouping feedback dynamically into workspace-specific themes to track spike anomalies.
- **Ask LOOP (Grounded Q&A):** A semantic AI search page that embeds questions, searches the vector database, and generates a response citing specific feedback sources.
- **Voice-of-Customer Reports:** One-click weekly digest summarizers representing sentiment shifts, top themes, quote collections, and recommended steps.

---

## 🛠️ Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14** (App Router) + TypeScript | Full-stack architecture, API routes, and Server Side rendering. |
| **Styling** | **Tailwind CSS** | Premium aesthetics, quick layout utilities, and responsiveness. |
| **Database** | **PostgreSQL** | Relational data integrity for multi-tenant mapping. |
| **ORM** | **Prisma** | Type-safe queries, migration control, and schema structure. |
| **Auth** | **NextAuth.js** (Auth.js) | Session handling, user authorization, and RBAC guards. |
| **AI / Embeddings** | **Google Gemini API** | Classification, text embeddings, and semantic Q&A reasoning. |
| **Charts** | **Recharts** | Rich dashboard data visualizations. |

---

## 🔒 Security & RBAC Enforcement

LOOP implements secure Role-Based Access Control across three main user roles:

1. **ADMIN (Full Control):**
   - Full workspace settings and details access.
   - Invite workspace members, delete workspace members, and update user roles.
   - Full feedback write, edit, and bulk-delete access.
2. **ANALYST (Triage & Ingestion):**
   - Access to feedback ingestion (Single form, CSV import, simulation pulls).
   - Manage feedback items (triage, change status, assign themes).
   - *Forbidden:* Cannot manage workspace members or change roles (returns HTTP `403 Forbidden`).
3. **VIEWER (Read-Only):**
   - Read-only access to feedback inbox, dashboard, reports, and AI Ask Loop.
   - *Forbidden:* Hides action buttons in UI and blocks all write requests server-side.

---

## 🔑 Demo Credentials Checklist

Use the following credentials to test Role-Based Access Control (RBAC) in the seeded workspace:

| Role | Username / Email | Password |
| :--- | :--- | :--- |
| **Admin User** | `admin@company.com` | `password123` |
| **Analyst User** | `analyst@company.com` | `password123` |
| **Viewer User** | `viewer@company.com` | `password123` |

---

## 💻 Local Setup & Development

### 1. Prerequisites
- **Node.js 18 LTS** or newer
- **PostgreSQL Database** (Local instance, or hosted on Supabase / Neon)
- **Gemini API Key** (Set as `GEMINI_API_KEY` in environment variables)

### 2. Configure Environment Variables
Create a `.env` file in the root of the project:

```env
# Database connection string
DATABASE_URL="postgresql://username:password@localhost:5432/loop_db"

# NextAuth secret key for token signing
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Gemini AI API Key
GEMINI_API_KEY="your-google-gemini-api-key"
```

### 3. Initialize Database & Run Seed
Run the migrations and populate the database with the seed workspace data:

```bash
# Apply migrations to setup the database tables
npx prisma migrate dev --name init

# Seed the database (Creates workspace, 3 role accounts, and 125 feedback records)
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📁 Repository Structure
```
loop/
 ├── app/                      # Next.js App Router folders
 │    ├── (auth)/              # Authentication pages (Login, Signup)
 │    ├── (app)/dashboard/     # Main dashboard workspace pages
 │    └── api/                 # Serverless API routes (Feedback, Members, Analytics)
 ├── components/               # Shareable React components (Cards, Forms, Filters)
 ├── lib/                      # Database client, AI reasoning helper, and config keys
 ├── prisma/                   # Schema specification & migrations folder
 ├── scripts/                  # Workspace database seed scripts
 ├── public/                   # Static assets (logos, images)
 ├── package.json              # Project dependencies & scripts
 └── README.md                 # Project documentation
```
