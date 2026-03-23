Scaffold a new project with production-ready structure.

Ask the user:
1. Project type? (Next.js fullstack / React frontend / FastAPI backend / Node.js API)
2. Database? (Supabase / PostgreSQL / MongoDB / none)
3. Auth? (Supabase Auth / NextAuth / JWT / none)
4. Payment? (JazzCash / EasyPaisa / Stripe / none)
5. Project name?

Then create:

**For Next.js projects:**
```
project-name/
├── src/
│   ├── app/              # App Router pages
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   └── layout/       # Navbar, Footer
│   ├── lib/              # Utils, DB clients
│   ├── actions/          # Server Actions
│   ├── hooks/            # Custom React hooks
│   └── types/            # TypeScript types
├── public/
├── .env.example          # All required vars (no real values)
├── .gitignore            # includes .env.local
├── CLAUDE.md             # Project context for AI
├── README.md
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

**For FastAPI projects:**
```
project-name/
├── app/
│   ├── main.py
│   ├── routers/
│   ├── models/
│   ├── schemas/
│   ├── dependencies/
│   └── utils/
├── tests/
├── .env.example
├── requirements.txt
├── CLAUDE.md
└── README.md
```

After scaffolding:
- Run `git init && git add . && git commit -m "chore: initial project scaffold"`
- Show next steps to the user
