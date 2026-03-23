Daily morning briefing — give a quick summary of what needs attention today.

Check and report on:

1. **Git status** — Any uncommitted changes in current project?
   Run: `git status` and `git log --oneline -3`

2. **Build health** — Does the project build cleanly?
   Run: `npm run build 2>&1 | tail -20` (or equivalent)

3. **Lint errors** — Any blocking lint issues?
   Run: `npm run lint 2>&1 | grep -E "error|Error" | head -10`

4. **Dependencies** — Any outdated or vulnerable packages?
   Run: `npm outdated 2>/dev/null | head -10`

5. **TODO/FIXME scan** — Any urgent items in code?
   Search for: `TODO`, `FIXME`, `HACK`, `XXX` in src/

6. **TypeScript errors** — Any type errors?
   Run: `npx tsc --noEmit 2>&1 | head -20`

Output format:
```
☀️ Morning Check — [Date]
━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Git: clean / ⚠️ X uncommitted files
✅ Build: passing / ❌ failing
✅ Lint: clean / ⚠️ X errors
✅ TypeScript: no errors / ⚠️ X errors
📝 TODOs found: X items
━━━━━━━━━━━━━━━━━━━━━━━━━
Top priorities for today:
1. [most urgent thing]
2. [second thing]
3. [third thing]
```
