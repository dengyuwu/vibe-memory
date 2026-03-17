import fs from "node:fs/promises";
import path from "node:path";
import { ensureDir, fileExists, toPosixPath, writeText } from "./path-utils.mjs";

export async function walkMarkdownFiles(rootDir) {
  if (!(await fileExists(rootDir))) {
    return [];
  }

  const results = [];
  const entries = await fs.readdir(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walkMarkdownFiles(fullPath)));
      continue;
    }

    if (entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }

  return results;
}

export async function loadMemoryDocuments(projectRoot) {
  const aiRoot = path.join(projectRoot, ".ai");
  const files = await walkMarkdownFiles(aiRoot);
  const documents = [];

  for (const absolutePath of files) {
    if (path.basename(absolutePath).startsWith("_")) {
      continue;
    }

    const relativePath = toPosixPath(path.relative(projectRoot, absolutePath));
    const content = await fs.readFile(absolutePath, "utf8");
    documents.push({
      absolutePath,
      path: relativePath,
      content,
      frontmatter: parseFrontmatter(content)
    });
  }

  return documents;
}

export function parseFrontmatter(content) {
  const normalized = String(content || "").replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) {
    return {};
  }

  const endIndex = normalized.indexOf("\n---\n", 4);
  if (endIndex === -1) {
    return {};
  }

  const block = normalized.slice(4, endIndex);
  const result = {};

  for (const line of block.split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();

    if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
      result[key] = rawValue
        .slice(1, -1)
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
      continue;
    }

    result[key] = rawValue;
  }

  return result;
}

export function buildFrontmatter(record) {
  const lines = ["---"];
  for (const [key, value] of Object.entries(record)) {
    if (Array.isArray(value)) {
      lines.push(`${key}: [${value.join(", ")}]`);
      continue;
    }

    lines.push(`${key}: ${value}`);
  }
  lines.push("---", "");
  return lines.join("\n");
}

export async function rebuildIndexes(projectRoot, metadata = {}) {
  const documents = await loadMemoryDocuments(projectRoot);
  const tags = {};

  for (const document of documents) {
    const recordTags = Array.isArray(document.frontmatter.tags) ? document.frontmatter.tags : [];
    for (const tag of recordTags) {
      if (!tags[tag]) {
        tags[tag] = [];
      }
      tags[tag].push(document.path);
    }
  }

  const indexRoot = path.join(projectRoot, ".ai", "index");
  await ensureDir(indexRoot);

  const manifest = {
    managedBy: "dev-memory-protocol",
    version: "0.1.0",
    generatedAt: new Date().toISOString(),
    fileCount: documents.length,
    ...metadata
  };

  const tagIndex = {
    generatedAt: new Date().toISOString(),
    records: Object.fromEntries(
      Object.entries(tags).sort(([left], [right]) => left.localeCompare(right))
    )
  };

  await writeText(path.join(indexRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  await writeText(path.join(indexRoot, "tags.json"), `${JSON.stringify(tagIndex, null, 2)}\n`);

  return { manifest, tagIndex, documents };
}
