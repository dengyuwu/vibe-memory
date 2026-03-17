import path from "node:path";
import { fileExists, readTextMaybe, resolveProjectPath, toPosixPath, writeText } from "./lib/path-utils.mjs";
import { rebuildIndexes } from "./lib/memory-store.mjs";
import { removeManagedBlock, resolveRuleTargets } from "./lib/rules-append.mjs";

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith("--")) {
      continue;
    }
    const key = item.slice(2);
    const next = argv[index + 1];
    args[key] = next && !next.startsWith("--") ? next : "true";
    if (args[key] === next) {
      index += 1;
    }
  }
  return args;
}

async function detectTool(projectRoot) {
  const hasAgents = await fileExists(path.join(projectRoot, "AGENTS.md"));
  const hasClaude = await fileExists(path.join(projectRoot, "CLAUDE.md"));

  if (hasAgents && hasClaude) {
    return "both";
  }

  if (hasAgents) {
    return "codex";
  }

  if (hasClaude) {
    return "claude";
  }

  return "both";
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const projectRoot = resolveProjectPath(args.project || ".");
  const tool = args.tool || (await detectTool(projectRoot));

  if (!["codex", "claude", "both"].includes(tool)) {
    throw new Error(`Invalid --tool value: ${tool}`);
  }

  const actions = [];
  for (const relativeTarget of resolveRuleTargets(tool)) {
    const targetPath = path.join(projectRoot, relativeTarget);
    if (!(await fileExists(targetPath))) {
      actions.push(`skipped missing ${relativeTarget}`);
      continue;
    }

    const existingText = await readTextMaybe(targetPath);
    const nextText = removeManagedBlock(existingText);

    if (nextText === existingText.replace(/\r\n/g, "\n")) {
      actions.push(`no managed block found in ${relativeTarget}`);
      continue;
    }

    await writeText(targetPath, nextText);
    actions.push(`removed managed block from ${relativeTarget}`);
  }

  await rebuildIndexes(projectRoot, {
    uninstalledAt: new Date().toISOString(),
    tool,
    projectRoot: toPosixPath(projectRoot),
    note: "Rules removed; project memory files kept."
  });
  actions.push("rebuilt .ai index");

  console.log(
    JSON.stringify(
      {
        tool,
        projectRoot: toPosixPath(projectRoot),
        actions,
        retained: [
          ".ai/project/*",
          ".ai/memory/*",
          ".ai/index/*"
        ]
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
