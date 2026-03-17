Use this repository as a one-sentence uninstall target for development memory workflow.

Uninstall contract:
1. Read `bootstrap/manifest.json`.
2. Detect the active tool:
   - Prefer `--tool codex` when the user explicitly asks to remove Codex rules only.
   - Prefer `--tool claude` when the user explicitly asks to remove Claude Code rules only.
   - Prefer `--tool both` when the user explicitly asks to remove both.
   - Otherwise let the uninstaller auto-detect by omitting `--tool`.
3. Run `node ./skills/dev-memory-protocol/scripts/uninstall.mjs --project <target-project>`.
4. Remove only the managed rule block. Never modify user-authored rules outside the managed block.
5. Keep `.ai/` project memory files by default so the user does not lose project knowledge.
6. Report which files were updated and which memory files were retained.

Supported environment:
- Windows and macOS
- Node.js 18 or newer
- Codex and Claude Code

User-facing one-line prompt:
`Remove dev-memory-protocol from this repository for the current project, delete only its managed rules from AGENTS.md/CLAUDE.md, keep existing project memory files in .ai, and keep all other project rules intact.`
