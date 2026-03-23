Full ship pipeline: test → lint → build → version bump → commit → tag → push.

Steps (run in order, stop if any fails):

1. **Tests** — `npm test` — must pass 100%
2. **Lint** — `npm run lint` — zero errors
3. **Build** — `npm run build` — must succeed
4. **Security scan** — `git grep -rn "password\|secret\|api_key" src/` — no hardcoded secrets
5. **Version bump** — based on last commits:
   - Any `feat!:` or BREAKING CHANGE → major bump
   - Any `feat:` → minor bump
   - Only `fix:`, `chore:`, `refactor:` → patch bump
   - Run: `npm version [major|minor|patch] --no-git-tag-version`
6. **Commit** — `git add . && git commit -m "chore: release vX.Y.Z"`
7. **Tag** — `git tag vX.Y.Z`
8. **Push** — `git push && git push --tags`

After push:
- If Vercel: deployment starts automatically — share preview URL
- If Railway: deployment starts automatically
- If manual: run deploy steps

Report:
```
🚀 Shipped vX.Y.Z
━━━━━━━━━━━━━━━━━━━━━
✅ Tests: X passed
✅ Build: success
✅ Tagged: vX.Y.Z
✅ Pushed to: [branch]
🌐 Live at: [URL if known]
```

If any step fails, stop and show what broke. Do NOT skip steps.
