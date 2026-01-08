import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();

  console.log("🔥 Webhook received");
  console.log("Action:", body.action);
  console.log("Repo:", body.repository?.full_name);

  return NextResponse.json({ ok: true });
}
