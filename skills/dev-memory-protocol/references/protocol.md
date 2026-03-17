# Protocol

## Purpose

Use project-local memory files to reduce repeated explanation, repeated bug fixes, and accidental regressions across fresh CLI sessions.

## Principles

1. Keep rules in `AGENTS.md` and `CLAUDE.md`.
2. Keep project facts and reusable knowledge in `.ai/`.
3. Append managed rule blocks. Never overwrite user-authored rules outside the managed block.
4. Write back only verified, reusable, project-relevant knowledge.
5. Never store secrets, passwords, tokens, private keys, or full connection strings.

## Memory Layout

```text
.ai/
├── project/
│   ├── overview.md
│   ├── architecture.md
│   ├── config-map.md
│   └── business-rules.md
├── memory/
│   ├── handoff.md
│   ├── known-risks.md
│   ├── regression-checklist.md
│   ├── bugs/
│   │   └── _template.md
│   └── decisions/
│       └── _template.md
└── index/
    ├── manifest.json
    └── tags.json
```

## Managed Rule Block

The managed block must:

1. Respect existing user and project instructions first.
2. Require baseline memory reads at task start.
3. Require memory search before editing code.
4. Restrict writeback to verified, reusable knowledge.
5. Restrict secret storage.
6. Update only the managed block and `.ai/` files created by this protocol.

## Installation Contract

1. Create missing `.ai/` directories and templates.
2. Upsert the managed rule block into `AGENTS.md`, `CLAUDE.md`, or both.
3. Rebuild `.ai/index/manifest.json`.
4. Do not delete user-authored memory files.

## Uninstall Contract

1. Remove only the managed rule block from `AGENTS.md`, `CLAUDE.md`, or both.
2. Keep `.ai/` project memory files by default.
3. Rebuild `.ai/index/manifest.json` so the retained memory stays searchable.
4. Treat deletion of `.ai/` memory files as a separate, explicit, potentially destructive action.
