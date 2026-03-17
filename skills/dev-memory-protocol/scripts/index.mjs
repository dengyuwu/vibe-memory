import { rebuildIndexes } from "./lib/memory-store.mjs";
import { resolveProjectPath, toPosixPath } from "./lib/path-utils.mjs";

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
  const result = await rebuildIndexes(projectRoot, {
    updatedBy: "index.mjs"
  });

  console.log(
    JSON.stringify(
      {
        projectRoot: toPosixPath(projectRoot),
        fileCount: result.documents.length
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
