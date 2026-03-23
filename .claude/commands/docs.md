Generate documentation for the current project or specified code.

What to generate based on context:

**README.md** (if missing or requested):
- Project name + one-line description
- Tech stack badges
- Prerequisites
- Installation steps (copy-pasteable)
- Environment variables table
- Available scripts
- Project structure overview
- API overview (if applicable)
- Contributing guide

**API Documentation**:
- Every endpoint: method, path, auth required, request body, response shape, error codes
- Example curl requests
- Common error responses

**Code Comments**:
- JSDoc/TSDoc for exported functions
- Inline comments only where logic is non-obvious
- No obvious comments ("// increment i by 1")

**CLAUDE.md** (for project AI context):
- Tech stack
- Key commands
- Architecture overview
- Important rules/gotchas
- File structure

Keep docs accurate and concise. Developers hate outdated docs — only document what exists.
