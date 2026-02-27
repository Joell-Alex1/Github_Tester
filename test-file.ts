import dotenv from "dotenv";
dotenv.config();

import { getInstallationOctokit } from "./lib/github/installations.ts";
import { addComment } from "./lib/github/comments.ts";

async function main() {
  const octokit = await getInstallationOctokit(
    Number(process.env.INSTALLATION_ID)
  );

  await addComment({
    octokit,
    owner: "Joell-Alex1",
    repo: "Github_Tester",
    issue_number: 1,
    body: "Testing comment from script 🚀",
  });

  console.log("Comment posted!");
}

main().catch(console.error);
