# Convoy (`convoy.unfugly.app`)

> **"Never travel alone. Form your convoy."**  
> A privacy-first, verified ride-sharing and exam transit coordination app exclusively for SRMIST students (`@srmist.edu.in`), powered by Supabase.

## Features
- **Strict Student Auth**: Restricts signups strictly to `@srmist.edu.in` via Supabase SMTP OTP/Magic Link.
- **Zero-PII Privacy Protection**: No contact numbers, WhatsApp handles, or student NetIDs are visible on public feeds.
- **Pure SVG Iconography**: Crisp Lucide vector SVGs for Bus, Train, Cab/Auto, and Private Vehicle (zero cheap emojis).
- **Exam Transit Hub**: Dedicated tab with Forenoon (FN) & Afternoon (AN) session toggles and a flexible venue text field.
- **Bilateral Contact Unlock**: Instant 1-tap WhatsApp (`wa.me`) chat button and phone reveal once the host accepts a join request.

## Tech Stack
- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- Supabase Auth & Database
- Lucide React

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables in `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
