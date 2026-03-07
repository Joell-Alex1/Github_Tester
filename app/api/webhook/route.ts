import { NextResponse } from "next/server";
import { getInstallationOctokit } from "@/lib/github/installations";
import { addComment } from "@/lib/github/comments";

export async function POST(request: Request) {
  const body = await request.json();

  console.log("🔥 Webhook received");
  console.log("Action:", body.action);
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

  for (const file of files) {
    if (!file.patch) continue;

    console.log("File:", file.filename);
    console.log("Diff:", file.patch);
  }

  await addComment({
    octokit,
    owner,
    repo,
    issue_number: prNumber,
    body: "👋 PR received automatically by GitHub App!",
  });

  console.log("Comment posted!");

  return NextResponse.json({ ok: true });
}