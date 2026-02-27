import { NextResponse } from "next/server";
import { getInstallationOctokit } from "@/lib/github/installations";
import { addComment } from "@/lib/github/comments";

export async function POST(request: Request) {
  const body = await request.json();

  console.log("🔥 Webhook received");
  console.log("Action:", body.action);
  console.log("Repo:", body.repository?.full_name);


  // reqd var we will extract from the webhook payload for demonstration
  const owner = body.repository?.owner?.login;
  const repo = body.repository?.name;
  const prNumber = body.pull_request?.number;
  const pr = body.pull_request;

    const octokit = await getInstallationOctokit(
      Number(process.env.INSTALLATION_ID)
    );
  
    await addComment({
      octokit,
      owner: owner,
      repo: repo,
      issue_number: prNumber,
      body: "👋 PR received automatically by GitHub App!",
    });
  
    console.log("Comment posted!");
  
  if (pr && pr.patch_url) {
    console.log("Fetching patch from:", pr.patch_url);

    const patchRes = await fetch(pr.patch_url); // for public repos, no auth needed
    const patchText = await patchRes.text();

    console.log("Patch content:\n", patchText); //test: log first 500 chars
  }

  return NextResponse.json({ ok: true });
}
