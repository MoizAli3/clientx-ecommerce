# Project: ClientX E-commerce Platform

## Tech Stack
- Next.js 15 (App Router)
- TypeScript (strict mode)
- Tailwind CSS + shadcn/ui
- Supabase (Auth + DB + Storage)
- JazzCash (Payments)
- EasyPaisa (Payments)
- Resend (Emails)

## Commands
- npm run dev → Dev server (port 3000)
- npm run build → Production build
- npm test → Jest tests
- npm run lint → ESLint check
- npm run db:push → Push Supabase schema

## Architecture
/src
  /app → Next.js App Router pages
  /components → Reusable UI components
  /lib → Utility functions, API clients
  /lib/payments → JazzCash & EasyPaisa logic
  /hooks → Custom React hooks
  /types → TypeScript type definitions
  /actions → Server Actions
  /middleware.ts → Auth middleware

## Rules
- NEVER modify /generated folder
- NEVER commit .env or .env.local
- ALWAYS use server components by default
- Use "use client" ONLY when interactivity needed
- All API responses: { success: boolean, data: any, error?: string }
- All payment responses: { success: boolean, transactionId: string, error?: string }
- Use Zod for ALL input validation
- Supabase queries only in server components/actions
- Mobile-first design (Pakistani users mostly on mobile)

## Payment Gotchas
- JazzCash sandbox URL alag hai production se
- EasyPaisa sandbox URL alag hai production se
- Dono ke liye hash generation required hai
- Keys kabhi frontend pe expose mat karo

## Supabase Gotchas
- RLS policies MUST be enabled on all tables
- Image uploads go to Supabase Storage only