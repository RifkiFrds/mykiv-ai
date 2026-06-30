# 💖 MyKiv AI — AI-Powered Relationship & Health Companion

MyKiv AI is a modern, premium Progressive Web Application (PWA) designed for couples to track their health, coordinate their daily schedules, manage shared expenses, and strengthen their connection with personalized AI insights.

---

## ✨ Features

- **🧠 AI Relationship Brain**: Powered by Gemini (via Replicate), providing personalized relationship insights, shared meal recommendations, and customized summaries based on your shared memories and health tracking.
- **🏥 Health & Wellness Tracker**: Log water intake, meals, sleep, mood, medicines, and exercises. Visualize history with interactive charts.
- **📅 Couple Hub**:
  - **Timeline**: Track joint plans, dates, and milestones.
  - **Wishlist**: Save and tracking progress of shared wishes/purchases.
  - **Presence/Location**: Shared current status and timezone coordinate.
- **💳 Shared Expenses**: Keep track of couple budget and split bills easily.
- **⏰ Smart Reminders**: Never miss anniversaries, medicine times, or shared tasks with custom snooze options.
- **📱 PWA & Offline Support**: Fully installable on mobile devices (iOS & Android) with local storage sync when offline.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Actions, Server Components)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Row-Level Security, Google OAuth)
- **Styling**: Vanilla CSS (TailwindCSS optional) with sleek modern glassmorphism design
- **AI Engine**: Replicate API (Gemini LLM)
- **State Management & Querying**: React Context, React Query (TanStack Query)

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd mykiv-ai
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root of the project with your API keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
REPLICATE_API_TOKEN=your-replicate-api-token
```

### 3. Setup Database Schema & Seed Data
Initialize the tables, RLS policies, and triggers, then seed the mock relationship data:

```bash
# Apply RLS fix and database migrations
supabase db query --linked --file supabase/rls_fix.sql

# Seed 2 weeks of couple history
supabase db query --linked --file supabase/seed.sql
```

### 4. Running the Development Server
Start the Next.js dev server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to experience MyKiv AI!

---

## 🔒 Security & Row-Level Security (RLS)
The database enforces strict privacy controls so that couples can only see their own logs and their partner's data, ensuring maximum security and confidentiality.
