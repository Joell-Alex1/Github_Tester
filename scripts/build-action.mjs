import { execSync } from "node:child_process";
import { copyFileSync, renameSync, existsSync, rmSync } from "node:fs";

const MAIN_TSCONFIG = "tsconfig.json";
const ACTION_TSCONFIG = "tsconfig.action.json";
const BACKUP = "tsconfig.json.bak";

renameSync(MAIN_TSCONFIG, BACKUP);
copyFileSync(ACTION_TSCONFIG, MAIN_TSCONFIG);

try {
  execSync("ncc build index.ts -o dist", { stdio: "inherit" });
} finally {
  rmSync(MAIN_TSCONFIG);
  renameSync(BACKUP, MAIN_TSCONFIG);
}
