import path from "node:path";

export const GLOBAL_BLOCK_ID = "dev-memory-protocol-global";
export const GLOBAL_BLOCK_START = `<!-- ${GLOBAL_BLOCK_ID}:start -->`;
export const GLOBAL_BLOCK_END = `<!-- ${GLOBAL_BLOCK_ID}:end -->`;

export function buildGlobalBootstrapBlock(skillRoot) {
  const normalizedSkillRoot = skillRoot.split(path.sep).join("/");
  return `${GLOBAL_BLOCK_START}
## Dev Memory Protocol Global Bootstrap

- If the installed \`dev-memory-protocol\` skill is available at \`${normalizedSkillRoot}\`, use it as the source of truth for project-memory bootstrap.
- For project-scoped development tasks, run project-memory bootstrap before substantial implementation.
- Only bootstrap when the current working directory is a project root or can be resolved to a project root.
- Resolve the project root with this priority:
  1. Prefer \`git rev-parse --show-toplevel\`
  2. If git is unavailable, treat the current directory as a project root only when it contains project markers such as \`.git\`, \`package.json\`, \`pnpm-workspace.yaml\`, \`pom.xml\`, \`build.gradle\`, \`settings.gradle\`, \`pyproject.toml\`, \`requirements.txt\`, \`Cargo.toml\`, \`go.mod\`, \`composer.json\`, \`Gemfile\`, or \`Makefile\`
  3. Never auto-create \`.ai\` under obvious non-project directories such as the home directory, desktop, or downloads
- If the project root exists and \`.ai/index/manifest.json\` is missing, run:
  \`node "${normalizedSkillRoot}/scripts/install.mjs" --project "<project-root>"\`
- Auto-bootstrap may append managed project-level blocks to \`AGENTS.md\` or \`CLAUDE.md\`, but must never overwrite user-authored rules outside the managed block.
- If the project already contains \`.ai\`, read these baseline files before editing:
  - \`.ai/project/overview.md\`
  - \`.ai/project/config-map.md\`
  - \`.ai/memory/handoff.md\`
  - \`.ai/memory/known-risks.md\`
- Before editing project code, prefer:
  \`node "${normalizedSkillRoot}/scripts/recall.mjs" --project "<project-root>" --query "<task summary>"\`
- After implementation, prefer \`capture-from-diff.mjs\` to produce candidate memory and only write verified knowledge.
- Never store passwords, tokens, private keys, or full connection strings in \`.ai\`.
- This global block only bootstraps project memory. It must not override existing global rules.
${GLOBAL_BLOCK_END}
`;
}

export function upsertGlobalBootstrapBlock(existingText, blockText) {
  const normalized = existingText.replace(/\r\n/g, "\n");
  const startIndex = normalized.indexOf(GLOBAL_BLOCK_START);
  const endIndex = normalized.indexOf(GLOBAL_BLOCK_END);

  if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
    const before = normalized.slice(0, startIndex).replace(/\s*$/, "");
    const after = normalized.slice(endIndex + GLOBAL_BLOCK_END.length).replace(/^\s*/, "");
    return [before, blockText.trimEnd(), after].filter(Boolean).join("\n\n") + "\n";
  }

  if (!normalized.trim()) {
    return `${blockText.trimEnd()}\n`;
  }

  return `${normalized.replace(/\s*$/, "")}\n\n${blockText.trimEnd()}\n`;
}

export function removeGlobalBootstrapBlock(existingText) {
  const normalized = existingText.replace(/\r\n/g, "\n");
  const startIndex = normalized.indexOf(GLOBAL_BLOCK_START);
  const endIndex = normalized.indexOf(GLOBAL_BLOCK_END);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return normalized;
  }

  const before = normalized.slice(0, startIndex).replace(/\s*$/, "");
  const after = normalized.slice(endIndex + GLOBAL_BLOCK_END.length).replace(/^\s*/, "");
  const next = [before, after].filter(Boolean).join("\n\n");
  return next ? `${next}\n` : "";
}
