Use this repository as a one-sentence install target for development memory workflow.

Installation contract:
1. Read `bootstrap/manifest.json`.
2. Detect the active tool:
   - Prefer `--tool codex` when the user explicitly asks for Codex only.
   - Prefer `--tool claude` when the user explicitly asks for Claude Code only.
   - Prefer `--tool both` when the user explicitly asks for both.
   - Otherwise let the installer auto-detect by omitting `--tool`.
3. Run `node ./skills/dev-memory-protocol/scripts/install.mjs --project <target-project>`.
4. Append the managed rule block only. Never overwrite existing rules outside the managed block.
5. Initialize `.ai/` files if missing. Do not delete user-authored memory files.
6. Report which files were created or updated.

Supported environment:
- Windows and macOS
- Node.js 18 or newer
- Codex and Claude Code

User-facing one-line prompt:
`Install dev-memory-protocol from this repository for the current project, support Codex and Claude Code, append rules without overwriting AGENTS.md or CLAUDE.md, initialize .ai memory files, and keep existing project rules intact.`

Auto-detect behavior:
- If only `AGENTS.md` exists, install for Codex.
- If only `CLAUDE.md` exists, install for Claude Code.
- If both exist, install for both.
- If neither exists, install for both so future sessions on either tool can use the protocol.
