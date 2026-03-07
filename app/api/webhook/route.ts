import { NextResponse } from "next/server";
import { getInstallationOctokit } from "@/lib/github/installations";
import { addComment } from "@/lib/github/comments";
import { reviewCode } from "@/lib/ai/review";


export async function POST(request: Request) {
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

  const octokit = await getInstallationOctokit(
    Number(process.env.INSTALLATION_ID)
  );

  const { data: files } = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number: prNumber,
  });

  console.log("Changed files in this PR:");

  let reviewInput = "";
  for (const file of files) {
  if (!file.patch) continue;

  const response = await octokit.rest.repos.getContent({
    owner,
    repo,
    path: file.filename,
    ref: body.pull_request.head.sha,
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

  console.log("Comment posted!");

  return NextResponse.json({ ok: true });
}