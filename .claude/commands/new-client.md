Set up a complete folder for a new client project.

Ask for:
1. Client name (company or person)
2. Project type (e-commerce / SaaS / portfolio / API / other)
3. Deadline (if known)
4. Tech stack preferences

Then create the folder structure at the current working directory:

```
client-name/
├── .claude/
│   └── CLAUDE.md          # Client context — fill this in
├── docs/
│   ├── PRD.md             # Product Requirements Document (template)
│   ├── API.md             # API documentation (template)
│   └── SETUP.md           # Environment setup guide (template)
├── .env.example            # Required env vars
├── .gitignore
└── README.md
```

Pre-fill CLAUDE.md with:
- Client name
- Project type
- Tech stack
- Deadline
- Key requirements placeholder
- "Ask before making assumptions about business logic"

Pre-fill PRD.md with:
- Problem statement (blank)
- User stories template
- Technical requirements template
- Out of scope section

Also:
- Run `git init` in the folder
- Create initial commit: `chore: initialize client project for [client-name]`
- Print checklist: things to do before starting code (get designs, confirm stack, set up env vars, etc.)
