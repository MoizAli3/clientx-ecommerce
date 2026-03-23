Do a thorough code review of the current project or specified files.

Review checklist:
1. **Correctness** — Logic errors, off-by-one, null/undefined handling
2. **Security** — OWASP Top 10: SQL injection, XSS, CSRF, auth bypass, exposed secrets, insecure direct object references
3. **Performance** — N+1 queries, missing indexes, unnecessary re-renders, large bundle sizes
4. **TypeScript** — Missing types, `any` usage, unsafe casts
5. **Error handling** — Unhandled promise rejections, missing try/catch, no user-facing error messages
6. **Code quality** — DRY violations, overly complex functions, naming clarity
7. **Tests** — Missing test coverage for critical paths
8. **Dependencies** — Outdated packages, unnecessary packages

Output format:
- 🔴 CRITICAL — Must fix before ship (security, data loss risk)
- 🟡 WARNING — Should fix (bugs, performance)
- 🟢 SUGGESTION — Nice to have (style, refactor)

Be specific: include file path + line number for every issue.
At the end give an overall score /10 and a summary of top 3 things to fix.
