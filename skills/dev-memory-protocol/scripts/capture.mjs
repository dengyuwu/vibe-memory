import fs from "node:fs/promises";
import path from "node:path";
import { buildFrontmatter, rebuildIndexes } from "./lib/memory-store.mjs";
import { resolveProjectPath, slugify, toPosixPath, writeText } from "./lib/path-utils.mjs";

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

function splitList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildDefaultBody(type) {
  if (type === "bug") {
    return `## Symptom

Describe the observed failure.

## Root Cause

Describe the verified root cause.

## Fix

Describe the applied fix.

## Regression Checks

List the checks required when touching related code again.
`;
  }

  return `## Context

Describe the implementation or product context.

## Decision

Describe the chosen direction.

## Consequences

Describe expected tradeoffs and follow-up constraints.
`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const projectRoot = resolveProjectPath(args.project || ".");
  const type = args.type || "bug";
  const title = args.title;

  if (!["bug", "decision"].includes(type)) {
    throw new Error("Only --type bug or --type decision is supported.");
  }

  if (!title) {
    throw new Error("Missing required --title.");
  }

  let body = args.body || "";
  if (!body && args["body-file"]) {
    body = await fs.readFile(path.resolve(process.cwd(), args["body-file"]), "utf8");
  }
  if (!body) {
    body = buildDefaultBody(type);
  }

  const recordDate = new Date().toISOString().slice(0, 10);
  const directoryName = type === "bug" ? "bugs" : "decisions";
  const fileName = `${recordDate}-${slugify(title)}.md`;
  const targetPath = path.join(projectRoot, ".ai", "memory", directoryName, fileName);

  const frontmatter = buildFrontmatter({
    type,
    scope: "project",
    tags: splitList(args.tags),
    paths: splitList(args.paths),
    last_verified: recordDate,
    confidence: args.confidence || "medium"
  });

  await writeText(targetPath, `${frontmatter}${body.trim()}\n`);
  await rebuildIndexes(projectRoot, {
    updatedBy: "capture.mjs"
  });

  console.log(
    JSON.stringify(
      {
        created: toPosixPath(path.relative(projectRoot, targetPath))
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
