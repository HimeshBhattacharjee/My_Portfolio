# Release checklist: GitHub to Netlify

Follow these steps in order to release the redesigned portfolio from the
`portfolio-redesign` branch to production at <https://himeshb.netlify.app/>.
Each step says what to do, where to do it, and what you should see.

| Item | Value |
| --- | --- |
| Repository | `https://github.com/HimeshBhattacharjee/My_Portfolio` (public) |
| Development branch | `portfolio-redesign` |
| Production branch | `main` |
| CI workflow | `.github/workflows/portfolio-ci.yml` ("Portfolio CI") |
| Required check | `quality-checks` |
| Netlify build command | `npm run build` (set in `netlify.toml`) |
| Netlify publish directory | `dist` (set in `netlify.toml`) |
| Netlify base directory | empty (repository root) |
| Node.js | 22 (from `.nvmrc`, read by both GitHub Actions and Netlify) |

---

## 1. Verify the local repository

Run these in the project folder before you commit:

```sh
git remote -v                 # origin → https://github.com/HimeshBhattacharjee/My_Portfolio.git
git branch --show-current     # portfolio-redesign
git status --short            # review every file listed
```

Then run the same checks CI runs:

```sh
npm ci                                              # reinstalls node_modules exactly from the lockfile
node scripts/check-repo-hygiene.mjs --include-untracked
npm run lint
npm run build                                       # runs the content check, then vite build
```

`--include-untracked` also checks the new files a commit would add. All four must pass.

**Never commit:** `.env.local`, any other `.env.*` file except `.env.example`, `private/`,
`CONTENT_TO_CONFIRM.md`, `dist/`, `node_modules/`. `.gitignore` already excludes them,
and the hygiene check fails if one gets in.

## 2. GitHub Actions workflow

`Portfolio CI` runs automatically on:

- every push to `portfolio-redesign` or `main`;
- every pull request into `main`;
- a manual run (GitHub → **Actions** → **Portfolio CI** → **Run workflow**).

It has two jobs:

| Job | What it does | Blocks a merge? |
| --- | --- | --- |
| `quality-checks` | `npm ci` → repository hygiene → ESLint → `npm run build` (content check + Vite build) → checks that `dist/index.html`, the JS and CSS bundles, the CV and the portrait were produced | Yes, once made required (step 3) |
| `dependency-audit (informational)` | `npm audit --omit=dev --audit-level=high` | No. It is allowed to fail; read its log |

It only validates. It deploys nothing, needs no secrets and only has read access to the
repository. The project has no automated test suite, so there is no test step.

## 3. Make `quality-checks` a required check for `main`

This option only lists a check after it has run once, so do this after step 4.

1. GitHub → repository → **Settings** → **Rules** → **Rulesets** → **New ruleset** →
   **New branch ruleset**.
2. **Ruleset name:** `Protect main`. **Enforcement status:** Active.
3. **Target branches** → **Add target** → **Include default branch** (that is `main`).
4. Tick **Require a pull request before merging** (leave the required approvals at 0 if you
   work alone).
5. Tick **Require status checks to pass** → **Add checks** → type `quality-checks` →
   select it (source: GitHub Actions). Also tick **Require branches to be up to date
   before merging**.
6. Tick **Block force pushes**. Leave **Restrict deletions** ticked.
7. **Create**.

(The older **Branches → Add branch protection rule** screen works too: branch name
pattern `main`, then the same options.)

## 4. Push the feature branch

```sh
git push -u origin portfolio-redesign
```

GitHub → **Actions** shows a **Portfolio CI** run for `portfolio-redesign`. Wait for
`quality-checks` to show a green tick. If it fails, open the failed step, fix it locally,
commit and push again.

A push to `portfolio-redesign` does not change the live site. Netlify only deploys
non-production branches if branch deploys are turned on (see step 9).

## 5. Open the pull request

1. GitHub shows **Compare & pull request** for `portfolio-redesign`; click it (or go to
   **Pull requests** → **New pull request**).
2. **base:** `main` ← **compare:** `portfolio-redesign`.
3. Give it a title and description and click **Create pull request**.

At the bottom of the pull request you should see:

- **Portfolio CI / quality-checks**: must turn green;
- **Portfolio CI / dependency-audit (informational)**: may show a failure; it does not block;
- **netlify/himeshb/deploy-preview** (and similar Netlify checks), if the Netlify site is
  connected to this repository (step 6).

Don't merge yet.

## 6. Netlify Deploy Preview

**First confirm that Netlify is connected to this repository.** Netlify → the `himeshb`
site → **Site configuration** → **Build & deploy** → **Continuous deployment**:

- **Repository** must show `github.com/HimeshBhattacharjee/My_Portfolio`. If it says
  the site is not linked to a repository (for example because it was deployed by drag
  and drop), click **Link repository**, choose GitHub and this repository, and choose
  `main` as the production branch.
- **Build settings:** `netlify.toml` in the repository sets the build command
  (`npm run build`) and publish directory (`dist`). These override whatever the UI
  shows. Leave **Base directory** empty.
- **Branches and deploy contexts:**
  - **Production branch:** `main`.
  - **Deploy Previews:** "Any pull request against your production branch / branch deploy
    branches".
  - **Branch deploys:** "Deploy only the production branch" is fine.

**Then open the preview.** On the pull request, the Netlify bot comment or the
**deploy-preview** check links to an address like:

```
https://deploy-preview-<PR number>--himeshb.netlify.app
```

A Deploy Preview is a separate URL. It never replaces the production site. Check it at
phone and desktop widths, in both themes.

## 7. Environment variables

The contact form needs these three variables **at build time**. Vite writes them into the
JavaScript bundle during `npm run build`, so a running site cannot pick them up later.

| Name (exactly) | Value |
| --- | --- |
| `VITE_EMAILJS_SERVICE_ID` | EmailJS → Email Services → your service's ID |
| `VITE_EMAILJS_TEMPLATE_ID` | EmailJS → Email Templates → your template's ID |
| `VITE_EMAILJS_PUBLIC_KEY` | EmailJS → Account → General → Public Key |

Netlify → **Site configuration** → **Environment variables** → **Add a variable** (for
each):

- [ ] **Key:** the exact name above.
- [ ] **Scopes:** include **Builds**.
- [ ] **Deploy contexts:** **Production** and **Deploy Previews** (same value for both is
      fine). Add **Branch deploys** only if you turn branch deploys on.
- [ ] Value: copy from your EmailJS dashboard (the same values as your `.env.local`).
- [ ] After adding or changing a variable, rebuild: **Deploys** → **Trigger deploy** →
      **Deploy site** (or push a new commit to the pull request for the preview).

Never put these values in the repository, in `netlify.toml` or in GitHub Actions. They
end up in the public JavaScript bundle anyway, which is how EmailJS is designed to work.
What protects the form is the allowed-origins list (step 8), not keeping the IDs hidden.

Without the variables, the site still builds, but the contact form says it is not
configured instead of sending.

## 8. EmailJS allowed origins

EmailJS dashboard → **Account** → **Security** → allowed origins / domains:

- [ ] `https://himeshb.netlify.app` is listed. This must stay.
- [ ] Do **not** add a wildcard such as `*` or `*.netlify.app`. Anyone's Netlify site
      could then send through your account.
- [ ] A Deploy Preview has a different origin
      (`https://deploy-preview-<N>--himeshb.netlify.app`), so the form will be refused
      there unless you allow that exact origin. Either:
  - skip testing the form on the preview and test it on production after release
    (simplest); or
  - add that exact preview origin, send your own test message, then remove it.
- [ ] If `http://localhost:5173` is still listed from local testing, remove it when you
      no longer need it.

## 9. Production branch verification

Before merging, confirm:

- [ ] Netlify **Production branch** is `main` (step 6).
- [ ] The pull request's **quality-checks** is green.
- [ ] The Deploy Preview looks right.
- [ ] The three environment variables exist for the **Production** context (step 7).
- [ ] `https://himeshb.netlify.app` is in EmailJS allowed origins (step 8).

## 10. Final production deployment

1. On the pull request, click **Merge pull request** → **Confirm merge**.
2. That pushes to `main`, which:
   - runs **Portfolio CI** on `main` (check that it goes green under **Actions**);
   - makes Netlify build `main` and publish it to `https://himeshb.netlify.app/`
     (Netlify → **Deploys**: the newest production deploy should say **Published**).
3. Check the live site:
   - [ ] the page loads at phone and desktop widths, in both themes;
   - [ ] **Download CV** downloads the PDF;
   - [ ] send one message through the contact form yourself and confirm it arrives.
4. If something is wrong: Netlify → **Deploys** → open the previous production deploy →
   **Publish deploy**. That restores the earlier site immediately while you fix the
   problem on a branch.

Locally, after the merge:

```sh
git fetch origin
git switch main
git pull --ff-only
```
