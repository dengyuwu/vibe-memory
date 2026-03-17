import path from "node:path";
import { buildFrontmatter, rebuildIndexes } from "./lib/memory-store.mjs";
import { isGitRepository, listChangedFiles, readDiff } from "./lib/git-utils.mjs";
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

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function isManagedPath(filePath) {
  const normalized = String(filePath || "").replace(/\\/g, "/");
  return (
    normalized === "AGENTS.md" ||
    normalized === "CLAUDE.md" ||
    normalized.startsWith(".ai/")
  );
}

function takeSegments(filePath) {
  const normalized = String(filePath || "").replace(/\\/g, "/");
  return normalized.split("/").filter(Boolean);
}

const GENERIC_TAGS = new Set([
  "src",
  "lib",
  "app",
  "apps",
  "packages",
  "test",
  "tests",
  "spec",
  "main",
  "index",
  "json",
  "js",
  "jsx",
  "ts",
  "tsx",
  "md",
  "yml",
  "yaml"
]);

function inferTagsFromPaths(paths) {
  const tags = [];
  for (const item of paths) {
    const segments = takeSegments(item);
    for (const segment of segments.slice(0, 3)) {
      if (segment.startsWith(".")) {
        continue;
      }
      if (segment.includes(".")) {
        const base = segment.split(".")[0];
        if (base && !GENERIC_TAGS.has(base.toLowerCase())) {
          tags.push(base.toLowerCase());
        }
        const ext = segment.split(".").pop();
        if (ext && !GENERIC_TAGS.has(ext.toLowerCase())) {
          tags.push(ext.toLowerCase());
        }
        continue;
      }
      if (!GENERIC_TAGS.has(segment.toLowerCase())) {
        tags.push(segment.toLowerCase());
      }
    }
  }

  return unique(tags).slice(0, 8);
}

function inferType(typeArg, hintText) {
  if (typeArg && typeArg !== "auto") {
    return typeArg;
  }

  const lower = String(hintText || "").toLowerCase();
  if (/(bug|fix|error|issue|regression|hotfix|incident)/.test(lower)) {
    return "bug";
  }

  return "decision";
}

function inferTitle(type, titleArg, query, changedPaths) {
  if (titleArg) {
    return titleArg;
  }

  if (query) {
    return query.trim();
  }

  const segments = unique(changedPaths.flatMap((item) => takeSegments(item).slice(0, 2))).slice(0, 3);
  if (segments.length === 0) {
    return type === "bug" ? "Capture bug from diff" : "Capture decision from diff";
  }

  const prefix = type === "bug" ? "Review bug-related changes in" : "Record decision for";
  return `${prefix} ${segments.join(", ")}`;
}

function summarizeDiff(diffText) {
  const lines = String(diffText || "").split(/\r?\n/);
  let additions = 0;
  let deletions = 0;
  const files = new Set();
  const hunks = [];

  for (const line of lines) {
    if (line.startsWith("diff --git ")) {
      const match = line.match(/^diff --git a\/(.+?) b\/(.+)$/);
      if (match) {
        files.add(match[2]);
      }
      continue;
    }

    if (line.startsWith("@@")) {
      hunks.push(line.trim());
      continue;
    }

    if (line.startsWith("+++ ") || line.startsWith("--- ")) {
      continue;
    }

    if (line.startsWith("+")) {
      additions += 1;
      continue;
    }

    if (line.startsWith("-")) {
      deletions += 1;
    }
  }

  return {
    changedFiles: Array.from(files),
    additions,
    deletions,
    hunkHeaders: unique(hunks).slice(0, 6)
  };
}

function buildBody(type, query, changedPaths, diffSummary) {
  const fileList = changedPaths.length > 0 ? changedPaths.map((item) => `- \`${item}\``).join("\n") : "- No changed files detected";
  const hunkList =
    diffSummary.hunkHeaders.length > 0
      ? diffSummary.hunkHeaders.map((item) => `- \`${item}\``).join("\n")
      : "- Review the diff details before finalizing this record.";

  if (type === "bug") {
    return `## Symptom

${query || "Summarize the failure or regression that these changes address."}

## Root Cause

Review the changed files and confirm the verified root cause before keeping this memory.

Changed files:
${fileList}

## Fix

This diff currently adds ${diffSummary.additions} lines and removes ${diffSummary.deletions} lines.

Relevant hunks:
${hunkList}

## Regression Checks

- Re-test flows touching the changed files above.
- Confirm adjacent modules and callbacks still behave correctly.
- Replace this candidate text with a verified summary after review.
`;
  }

  return `## Context

${query || "Summarize the implementation context for this change."}

Changed files:
${fileList}

## Decision

This diff currently adds ${diffSummary.additions} lines and removes ${diffSummary.deletions} lines. Record the actual decision made by this change after review.

Relevant hunks:
${hunkList}

## Consequences

- Verify downstream modules affected by the changed files.
- Replace this candidate text with the final decision and tradeoffs.
`;
}

async function writeRecord(projectRoot, type, title, tags, paths, confidence, body) {
  const recordDate = new Date().toISOString().slice(0, 10);
  const directoryName = type === "bug" ? "bugs" : "decisions";
  const fileName = `${recordDate}-${slugify(title)}.md`;
  const targetPath = path.join(projectRoot, ".ai", "memory", directoryName, fileName);

  const frontmatter = buildFrontmatter({
    type,
    scope: "project",
    tags,
    paths,
    last_verified: recordDate,
    confidence
  });

  await writeText(targetPath, `${frontmatter}${body.trim()}\n`);
  await rebuildIndexes(projectRoot, {
    updatedBy: "capture-from-diff.mjs"
  });

  return toPosixPath(path.relative(projectRoot, targetPath));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const projectRoot = resolveProjectPath(args.project || ".");
  const scope = args.scope || "all";
  const query = args.query || "";
  const providedPaths = splitList(args.paths);
  const confidence = args.confidence || "medium";
  const write = args.write === "true";

  if (!["staged", "unstaged", "all"].includes(scope)) {
    throw new Error("Only --scope staged, --scope unstaged, or --scope all is supported.");
  }

  if (!(await isGitRepository(projectRoot))) {
    throw new Error("The target project is not a git repository.");
  }

  const changedPaths = unique([
    ...(await listChangedFiles(projectRoot, scope)),
    ...providedPaths
  ]).filter((item) => !isManagedPath(item));

  if (changedPaths.length === 0) {
    throw new Error("No non-managed changed files detected for the selected diff scope.");
  }

  const diffText = await readDiff(projectRoot, scope, changedPaths);
  const diffSummary = summarizeDiff(diffText);
  const type = inferType(args.type || "auto", `${query} ${args.title || ""}`);
  const title = inferTitle(type, args.title, query, changedPaths);
  const tags = unique([...inferTagsFromPaths(changedPaths), ...splitList(args.tags)]).slice(0, 10);
  const body = buildBody(type, query, changedPaths, diffSummary);

  const candidate = {
    source: "git-diff",
    scope,
    type,
    title,
    tags,
    paths: changedPaths.map((item) => toPosixPath(item)),
    additions: diffSummary.additions,
    deletions: diffSummary.deletions,
    body
  };

  if (write) {
    const created = await writeRecord(
      projectRoot,
      type,
      title,
      candidate.tags,
      candidate.paths,
      confidence,
      body
    );
    console.log(
      JSON.stringify(
        {
          ...candidate,
          created
        },
        null,
        2
      )
    );
    return;
  }

  console.log(JSON.stringify(candidate, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
