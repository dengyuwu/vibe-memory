import path from "node:path";
import { loadMemoryDocuments } from "./lib/memory-store.mjs";
import { tokenize, scoreDocument } from "./lib/classifier.mjs";
import { fileExists, resolveProjectPath, toPosixPath } from "./lib/path-utils.mjs";

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

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const projectRoot = resolveProjectPath(args.project || ".");
  const limit = Number(args.limit || 8);
  const query = args.query || "";
  const tokens = tokenize(query);
  const baseline = [
    ".ai/project/overview.md",
    ".ai/project/config-map.md",
    ".ai/memory/handoff.md",
    ".ai/memory/known-risks.md"
  ];

  const existingBaseline = [];
  for (const relativePath of baseline) {
    if (await fileExists(path.join(projectRoot, relativePath))) {
      existingBaseline.push(relativePath);
    }
  }

  const related = (await loadMemoryDocuments(projectRoot))
    .map((document) => ({ ...document, score: scoreDocument(document, tokens) }))
    .filter((document) => document.score > 0)
    .sort((left, right) => right.score - left.score || left.path.localeCompare(right.path))
    .slice(0, limit)
    .map((document) => ({
      path: toPosixPath(document.path),
      score: document.score,
      type: document.frontmatter.type || "",
      tags: document.frontmatter.tags || []
    }));

  console.log(
    JSON.stringify(
      {
        projectRoot: toPosixPath(projectRoot),
        query,
        baseline: existingBaseline,
        related
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
