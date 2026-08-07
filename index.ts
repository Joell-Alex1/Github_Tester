import * as core from "@actions/core";
import * as github from "@actions/github";
import { reviewCode } from "./lib/ai/review";
import { addComment } from "./lib/github/comments";

const SKIP_FILES = [
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  ".gitignore",
];

async function run() {
  const geminiApiKey = core.getInput("gemini-api-key", { required: true });
  process.env.GEMINI_API_KEY = geminiApiKey;

  const token = process.env.GITHUB_TOKEN as string;
  const octokit = github.getOctokit(token);

  const { owner, repo } = github.context.repo;
  const pullRequest = github.context.payload.pull_request;

  if (!pullRequest) {
    core.info("No pull_request in event payload, skipping.");
    return;
  }

  const prNumber = pullRequest.number;

  const { data: files } = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number: prNumber,
  });

  let reviewInput = "";

  for (const file of files) {
    if (SKIP_FILES.includes(file.filename)) continue;
    if (!file.patch) continue;

    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: file.filename,
      ref: pullRequest.head.sha,
    });

    if ("content" in response.data) {
      const decodedContent = Buffer.from(
        response.data.content,
        "base64"
      ).toString();

      reviewInput += `
File: ${file.filename}

DIFF:
${file.patch}

FULL FILE:
${decodedContent}

-------------------------
`;
    }
  }

  const aiReview = await reviewCode(reviewInput);

  await addComment({
    octokit,
    owner,
    repo,
    issue_number: prNumber,
    body: aiReview,
  });

  core.info("Comment posted!");
}

run().catch((error) => {
  core.setFailed(error instanceof Error ? error.message : String(error));
});
