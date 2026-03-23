Generate a weekly progress report for the current project.

Gather data:
1. Git log for the past 7 days:
   `git log --oneline --since="7 days ago" --author="$(git config user.name)"`
2. Files changed: `git diff --stat HEAD~20 HEAD 2>/dev/null | tail -5`
3. Current project status from CLAUDE.md if available

Report structure:

```
📊 Weekly Report — Week of [DATE]
Project: [name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ COMPLETED THIS WEEK
• [feature/fix from commits]
• [feature/fix from commits]

🔄 IN PROGRESS
• [what's currently being worked on]

📌 NEXT WEEK PLAN
• [what needs to happen next]

⚠️ BLOCKERS
• [anything blocking progress]

📈 STATS
• Commits: X
• Files changed: X
• Lines added: X | Lines removed: X

🎯 OVERALL STATUS: On Track / At Risk / Delayed
```

Keep it honest. If behind schedule, say so with a recovery plan.
This report can be copy-pasted to send to a client.
