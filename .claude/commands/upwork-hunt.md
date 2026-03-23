Help find and respond to relevant Upwork jobs.

Since we can't scrape Upwork directly, do this:

1. **Ask the user** to paste the job posting text (title + description + budget)

2. **Score the job** (1-10) based on:
   - Stack match (Next.js, React, FastAPI, Node.js, Supabase = high score)
   - Budget (above $500 = good, above $1500 = excellent)
   - Client history (if mentioned)
   - Project clarity (vague = low score)
   - Red flags: "quick fix", "simple task", "$5 budget", no description

3. **Generate a proposal** if score ≥ 7:

   Structure:
   - Hook (1 sentence showing you READ their post, not generic)
   - Relevant experience (2-3 sentences, specific projects/tech)
   - Your approach (brief — how you'd solve their specific problem)
   - Timeline + budget estimate
   - Call to action ("Let's jump on a quick call")
   - Keep under 200 words — clients don't read walls of text

4. **Proposal tone**: Confident, specific, no fluff. Don't start with "Hi, I'm a developer with X years..."

5. Ask user: "Want me to tailor this for a specific niche or add a portfolio link?"

Profile info to reference:
- Stack: Next.js, React, TypeScript, FastAPI, Supabase, PostgreSQL, Tailwind CSS
- Based in Pakistan, available for international clients
- Speciality: E-commerce, SaaS dashboards, AI integrations
