import fs from "fs";
import { App } from "octokit";

const keyPath = process.env.GITHUB_PRIVATE_KEY!;
const privateKey = fs.readFileSync(keyPath, "utf8");

const app = new App({
  appId: process.env.GITHUB_APP_ID!,
  privateKey,
});

export default app;
