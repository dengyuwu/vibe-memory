import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function runGit(projectRoot, args) {
  try {
    const result = await execFileAsync("git", args, {
      cwd: projectRoot,
      windowsHide: true,
      maxBuffer: 1024 * 1024 * 8
    });
    return result.stdout.trim();
  } catch (error) {
    const stderr = error.stderr?.toString().trim();
    const message = stderr || error.message || "git command failed";
    throw new Error(message);
  }
}

export async function isGitRepository(projectRoot) {
  try {
    await runGit(projectRoot, ["rev-parse", "--show-toplevel"]);
    return true;
  } catch {
    return false;
  }
}

export async function listChangedFiles(projectRoot, scope) {
  const files = new Set();

  if (scope === "staged" || scope === "all") {
    for (const line of (await runGit(projectRoot, ["diff", "--cached", "--name-only", "--diff-filter=ACMR"])).split("\n")) {
      if (line.trim()) {
        files.add(line.trim());
      }
    }
  }

  if (scope === "unstaged" || scope === "all") {
    for (const line of (await runGit(projectRoot, ["diff", "--name-only", "--diff-filter=ACMR"])).split("\n")) {
      if (line.trim()) {
        files.add(line.trim());
      }
    }

    for (const line of (await runGit(projectRoot, ["ls-files", "--others", "--exclude-standard"])).split("\n")) {
      if (line.trim()) {
        files.add(line.trim());
      }
    }
  }

  return Array.from(files).sort((left, right) => left.localeCompare(right));
}

export async function readDiff(projectRoot, scope, paths = []) {
  const pathspec = paths.length > 0 ? ["--", ...paths] : [];
  const parts = [];

  if (scope === "staged" || scope === "all") {
    const staged = await runGit(projectRoot, [
      "diff",
      "--cached",
      "--no-ext-diff",
      "--unified=0",
      ...pathspec
    ]);
    if (staged) {
      parts.push(staged);
    }
  }

  if (scope === "unstaged" || scope === "all") {
    const unstaged = await runGit(projectRoot, ["diff", "--no-ext-diff", "--unified=0", ...pathspec]);
    if (unstaged) {
      parts.push(unstaged);
    }
  }

  return parts.join("\n");
}
