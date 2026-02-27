import app from "./octokit.ts";

export async function getInstallationOctokit(installationId: number) {
  const octokit = await app.getInstallationOctokit(installationId);
  return octokit;
}
