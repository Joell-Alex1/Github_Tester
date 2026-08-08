# AI PR Reviewer (GitHub Action)

An AI-powered pull request reviewer, published as a GitHub Action. Drop it into any repo's workflow and it will review new/updated pull requests using Gemini, posting feedback as a PR comment — no server to host, no webhook, no app to install.

## How it works

1. GitHub runs the action directly on its own runners when a `pull_request` event fires (`opened`, `edited`, `reopened`, `synchronize`).
2. `index.ts` uses the workflow's `GITHUB_TOKEN` to list the changed files in the PR and fetch their full content.
3. The diffs + file contents are sent to Gemini (`lib/ai/review.ts`) for review.
4. The AI's response is posted back to the PR as a comment (`lib/github/comments.ts`).

## Using it in your repo

Add a workflow file, e.g. `.github/workflows/reviewer.yml`:

```yaml
name: "AI Review"

on:
  pull_request:
    types: [opened, edited, reopened, synchronize]

permissions:
  contents: read
  pull-requests: write
  issues: write

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: Joell-Alex1/ai-reviewer@v1
        with:
          gemini-api-key: ${{ secrets.GEMINI_API_KEY }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Then add a `GEMINI_API_KEY` repo secret (Settings → Secrets and variables → Actions) with your Google Gemini API key. Open a pull request and the bot will review it automatically.

## Local development

Copy `.env.example` to `.env` and fill in:

```
GEMINI_API_KEY=...
```

Build the action bundle after making changes to `index.ts` or `lib/`:

```bash
npm run build:action
```

This compiles `index.ts` (via a dedicated `tsconfig.action.json`, kept separate from the Next.js `tsconfig.json`) and bundles it with all dependencies into `dist/index.js` using `ncc` — that's the file GitHub Actions actually runs, so it must be committed.

## Releasing a new version

Consumers reference this action by tag (e.g. `@v1`). After merging changes to `main`:

```bash
git tag -d v1
git push origin :refs/tags/v1
git tag -a v1 -m "..."
git push origin v1
```
