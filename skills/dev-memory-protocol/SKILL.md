---
name: dev-memory-protocol
description: Cross-platform development memory workflow for Codex and Claude Code. Use when setting up project memory files, installing an append-only memory protocol from a GitHub repo, initializing .ai memory directories, recalling project knowledge before edits, or capturing verified bug and decision records after implementation.
---

# Development Memory Protocol

Use this skill to install or operate a project-local memory layer for software development.

## Install

1. Read `../../../bootstrap/install.md`.
2. Read `../../../bootstrap/manifest.json`.
3. Run `node ./skills/dev-memory-protocol/scripts/install.mjs --project <target-project>`.
4. Pass `--tool codex`, `--tool claude`, or `--tool both` only when the user explicitly requests one target.
5. Append the managed rule block only. Do not overwrite user rules outside the managed block.

## Uninstall

1. Read `../../../bootstrap/uninstall.md`.
2. Run `node ./skills/dev-memory-protocol/scripts/uninstall.mjs --project <target-project>`.
3. Remove only the managed rule block from `AGENTS.md`, `CLAUDE.md`, or both.
4. Keep `.ai/` memory files unless the user explicitly asks for a destructive cleanup.

## Operate

- Use `scripts/recall.mjs` before editing code to print baseline memory files and related records for a query.
- Use `scripts/capture.mjs` after a fix or decision to create a structured markdown record.
- Use `scripts/capture-from-diff.mjs` to generate a candidate bug or decision record from current git changes, then add `--write true` only after review.
- Use `scripts/index.mjs` or `scripts/compact.mjs` to rebuild `.ai/index/` after bulk edits.

## References

- Read `references/protocol.md` for the memory layout and installation contract.
- Read `references/writeback-policy.md` before writing back memory records.
- Read `references/hook-adapters.md` when wiring hooks in Codex or Claude Code.
