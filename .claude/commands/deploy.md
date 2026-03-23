Production deployment checklist — run through this before every deploy.

Pre-deploy checks:
1. **Tests** — Run full test suite. No failures allowed.
2. **Build** — `npm run build` (or equivalent). Must pass with zero errors.
3. **Lint** — `npm run lint`. Fix all errors (warnings ok).
4. **Env vars** — Confirm all required env vars are set in production environment
5. **Secrets** — Scan for hardcoded API keys, passwords, tokens (`git grep -i "secret\|password\|api_key"`)
6. **Dependencies** — No known critical CVEs (`npm audit --audit-level=high`)
7. **DB migrations** — Any schema changes need to be applied first?
8. **Breaking changes** — Any API changes that break existing clients/mobile apps?

Deploy steps (based on project):
- **Vercel**: `vercel --prod` or push to main (auto-deploy)
- **Railway**: push to main (auto-deploy) or `railway up`
- **AWS**: depends on setup — ask if unclear

Post-deploy:
9. **Smoke test** — Open the live URL and test the critical user flow
10. **Check logs** — Look for any new errors in production logs
11. **Rollback plan** — If something breaks, how to revert quickly?

Report: ✅ deployed successfully or ❌ blocked by: [reason]
