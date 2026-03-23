Set up a GitHub repository for the current project. Run this once per project.

Steps:
1. Check if git is initialized: `git status`
   - If not: `git init && git add . && git commit -m "chore: initial commit"`

2. Check if remote already exists: `git remote -v`
   - If yes: show current remote and stop

3. Create GitHub repo using gh CLI:
   ```bash
   gh repo create [project-name] --public --source=. --remote=origin --push
   ```
   Ask user: public or private repo?

4. Push all branches and tags:
   ```bash
   git push -u origin main
   git push --tags
   ```

5. Set up branch protection (optional, for team projects):
   - Require PR for main
   - Require passing checks

6. Create `.github/` folder with:
   - `ISSUE_TEMPLATE/bug_report.md`
   - `ISSUE_TEMPLATE/feature_request.md`
   - `pull_request_template.md`

7. Print the repo URL when done.

Requirements: `gh` CLI must be installed and authenticated (`gh auth login`).
