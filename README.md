# review-bot

An AI-powered pull request reviewer. It runs as a GitHub App webhook receiver: when a PR is opened on a repo where the app is installed, it fetches the changed files, sends them to Gemini for review, and posts the result back as a PR comment.

## How it works

1. GitHub sends a `pull_request` webhook event to this server whenever a PR is opened.
2. `app/api/webhook/route.ts` checks the action is `"opened"`, then uses the installation's Octokit client to list the changed files and fetch their full content.
3. The diffs + file contents are sent to Gemini (`lib/ai/review.ts`) for review.
4. The AI's response is posted back to the PR as a comment (`lib/github/comments.ts`).

## Setup

### 1. Environment variables

Copy `.env.example` to `.env` and fill in:

```
GITHUB_TOKEN=...
GITHUB_APP_ID=...
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
GEMINI_API_KEY=...
```

- `GITHUB_APP_ID` / `GITHUB_PRIVATE_KEY` come from your GitHub App settings (the private key matches `github-app.private-key.pem`).
- `GEMINI_API_KEY` is your Google Gemini API key.

### 2. Run the server locally

```bash
We start the server using this comamnd
npm run dev
```

This starts the app at `http://localhost:3000`, with the webhook endpoint at `http://localhost:3000/api/webhook`.

### 3. Expose it publicly with ngrok

GitHub needs a public URL to send webhooks to, so tunnel your local server:

```bash
ngrok http 3000
```

Copy the `https://xxxx.ngrok-free.app` URL ngrok gives you.

### 4. Point the GitHub App at the tunnel

In your GitHub App settings (github.com → Settings → Developer settings → GitHub Apps → your app), set the **Webhook URL** to:

```
https://xxxx.ngrok-free.app/api/webhook
```

Note: free ngrok URLs change every time you restart it — update the webhook URL each session unless you have a reserved domain.

## Triggering a review

1. Make sure the GitHub App is installed on the target repo.
2. Push your branch to GitHub.
3. Open a pull request.

Opening the PR fires the `pull_request: opened` webhook, which triggers the bot to review the changed files and post a comment. Other PR actions (e.g. synchronize, closed) are currently skipped.
