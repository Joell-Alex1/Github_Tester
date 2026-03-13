import { NextResponse } from "next/server";
import { getInstallationOctokit } from "@/lib/github/installations";
import { addComment } from "@/lib/github/comments";
import { reviewCode } from "@/lib/ai/review";


export async function POST(request: Request) {
  // we parse the incoming webhook payload to get the necessary information about the pull request, such as the repository, the changed files, and the diff. We then use this information to generate a review using our AI and post it back as a comment on the pull request.
  const body = await request.json();

  console.log("🔥 Webhook received");
  console.log("Action:", body.action);
  
  if (body.action !== "opened") {

  return NextResponse.json({ skipped: true });
}
  console.log("Repo:", body.repository?.full_name);

  const owner = body.repository?.owner?.login;
  const repo = body.repository?.name;
  const prNumber = body.pull_request?.number;

// we need the octokit instance to make authenticated requests to the GitHub API, we get it using the installation ID from our environment variables. This allows us to fetch the changed files and their content for the pull request.
  const octokit = await getInstallationOctokit(
    Number(body.installation.id)
  );
// we fetch the list of changed files in the pull request using the GitHub API. This gives us the filename, the diff (patch), and other metadata for each changed file. We will use this information to generate our AI review.
  const { data: files } = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number: prNumber,
  });

  console.log("Changed files in this PR:");
  const SKIP_FILES = [
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  ".gitignore",
];
  let reviewInput = "";
  // im trying to reduce api calls by reducing number of files we send to the ai, so we skip lockfiles and gitignore
  for (const file of files) {
    if (SKIP_FILES.includes(file.filename)) {
      continue;
    }
    if (!file.patch) continue;

// we need the full file content to give the ai more context, so we fetch it here. This does add an api call for each file, but it should be worth it for the improved reviews.
console.log("Fetching:", owner, repo, file.filename);

  const response = await octokit.rest.repos.getContent({
    owner,
    repo,
    path: file.filename,
    ref: body.pull_request.head.sha,
  });
// the response can be either a file or a directory, we only want to review files, so we check for the content property which is only present in file responses. If it's a directory, we skip it.We also decode the content from base64 to get the full file content.
  if ("content" in response.data) {
    const decodedContent = Buffer.from(
      response.data.content,
      "base64"
    ).toString();
// input for the ai, we give it the filename, the diff and the full file content for better context. We separate each file with a delimiter for better parsing on the ai side.
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
// we send above data and get comments back from the ai to post on the pr
const aiReview = await reviewCode(reviewInput);

  await addComment({
    octokit,
    owner,
    repo,
    issue_number: prNumber,
    body: aiReview,
  });

  console.log("Comment posted!");
// we return a simple response to acknowledge the webhook was received and processed. The actual comment posting is done asynchronously, so we don't wait for it to complete before responding to the webhook.
  return NextResponse.json({ ok: true });
}