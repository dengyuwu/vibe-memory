export const BLOCK_ID = "dev-memory-protocol";
export const BLOCK_START = `<!-- ${BLOCK_ID}:start -->`;
export const BLOCK_END = `<!-- ${BLOCK_ID}:end -->`;

export function buildManagedBlock() {
  return `${BLOCK_START}
## Development Memory Protocol

Follow all existing user and project instructions first.
This section only adds memory workflow and must not override prior rules.

1. Start each task by reading:
   - \`.ai/project/overview.md\`
   - \`.ai/project/config-map.md\`
   - \`.ai/memory/handoff.md\`
   - \`.ai/memory/known-risks.md\`

2. Before editing code, search relevant memory in:
   - \`.ai/memory/bugs/\`
   - \`.ai/memory/decisions/\`
   - \`.ai/project/business-rules.md\`

3. Never guess configuration locations, business rules, or historical behavior if project memory exists. Search memory first.

4. Write back only verified, reusable, project-relevant knowledge:
   - stable facts
   - business rules
   - bug root causes
   - regression risks
   - implementation decisions

5. Never store secrets, passwords, tokens, private keys, or full connection strings in memory files.

6. Project memory has higher priority than global preferences. Newer verified records have higher priority than older ones.

7. Update only the managed block and \`.ai/\` files created by this protocol. Do not overwrite user-authored rules outside this block.
${BLOCK_END}
`;
}

export function upsertManagedBlock(existingText, blockText) {
  const normalized = existingText.replace(/\r\n/g, "\n");
  const startIndex = normalized.indexOf(BLOCK_START);
  const endIndex = normalized.indexOf(BLOCK_END);

  if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
    const before = normalized.slice(0, startIndex).replace(/\s*$/, "");
    const after = normalized.slice(endIndex + BLOCK_END.length).replace(/^\s*/, "");
    return [before, blockText.trimEnd(), after].filter(Boolean).join("\n\n") + "\n";
  }

  if (!normalized.trim()) {
    return `${blockText.trimEnd()}\n`;
  }

  return `${normalized.replace(/\s*$/, "")}\n\n${blockText.trimEnd()}\n`;
}

export function removeManagedBlock(existingText) {
  const normalized = existingText.replace(/\r\n/g, "\n");
  const startIndex = normalized.indexOf(BLOCK_START);
  const endIndex = normalized.indexOf(BLOCK_END);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return normalized;
  }

  const before = normalized.slice(0, startIndex).replace(/\s*$/, "");
  const after = normalized.slice(endIndex + BLOCK_END.length).replace(/^\s*/, "");
  const next = [before, after].filter(Boolean).join("\n\n");
  return next ? `${next}\n` : "";
}

export function resolveRuleTargets(tool) {
  if (tool === "codex") {
    return ["AGENTS.md"];
  }

  if (tool === "claude") {
    return ["CLAUDE.md"];
  }

  if (tool === "both") {
    return ["AGENTS.md", "CLAUDE.md"];
  }

  throw new Error(`Unsupported tool: ${tool}`);
}
