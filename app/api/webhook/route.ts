import { NextResponse } from "next/server";


export async function POST(request: Request) {
  const body = await request.json();

  console.log("🔥 Webhook received");
  console.log("Action:", body.action);
  console.log("Repo:", body.repository?.full_name);

  const pr = body.pull_request;

  if (pr && pr.patch_url) {
    console.log("Fetching patch from:", pr.patch_url);

    const patchRes = await fetch(pr.patch_url); // for public repos, no auth needed
    const patchText = await patchRes.text();

    console.log("Patch content:\n", patchText.slice(0, 500)); //test: log first 500 chars
  }

  return NextResponse.json({ ok: true });
}
