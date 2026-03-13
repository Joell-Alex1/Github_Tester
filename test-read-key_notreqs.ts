// test-installation.ts
import dotenv from "dotenv";
dotenv.config();
const InstallationId = process.env.INSTALLATION_ID!;
import { getInstallationOctokit } from "./lib/github/installations.ts";

const installs = await getInstallationOctokit(Number(InstallationId));
console.log(installs);


