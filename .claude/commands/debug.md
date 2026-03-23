Deep-dive debug the error or problem described by the user.

Process:
1. **Understand** — Read the full error message/stack trace carefully
2. **Locate** — Find the exact file and line causing the issue
3. **Root cause** — Don't just fix symptoms. Ask WHY it's happening
4. **Check context** — Read surrounding code, imports, types, env vars
5. **Fix** — Apply the minimal correct fix
6. **Verify** — Check if the fix could cause other issues
7. **Explain** — Tell the user what was wrong and why the fix works

Common traps to check:
- Race conditions / async/await missing
- Undefined/null not guarded
- Wrong environment variables
- Type mismatches (TypeScript)
- Import/export mistakes (default vs named)
- Next.js: server vs client component confusion
- Supabase: RLS policy blocking query silently
- CORS issues on API calls

If you can't reproduce the bug from the info given, ask for:
- Full error message with stack trace
- Relevant code snippet
- What was the last working state
