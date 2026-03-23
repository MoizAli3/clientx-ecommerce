Generate a conventional git commit for all staged/unstaged changes.

Steps:
1. Run `git status` and `git diff` to see all changes
2. Run `git log --oneline -5` to match existing commit style
3. Analyze what changed and WHY (not just what)
4. Stage relevant files with `git add` (never `git add -A` blindly — check for .env or secrets first)
5. Write commit message following conventional commits:
   - `feat:` — new feature
   - `fix:` — bug fix
   - `chore:` — maintenance, deps, config
   - `refactor:` — code restructure, no behavior change
   - `docs:` — documentation only
   - `test:` — adding/fixing tests
   - `style:` — formatting only
6. Create the commit

Rules:
- NEVER commit .env, .env.local, secrets, or credentials
- Keep subject line under 72 characters
- Add body if the change needs explanation
- Add `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>` at end
