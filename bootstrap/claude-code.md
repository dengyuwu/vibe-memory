Use this repository to install development memory workflow for Claude Code projects.

Suggested one-line prompt:
`Install dev-memory-protocol from this repository for the current project, append rules to CLAUDE.md without overwriting existing content, initialize .ai memory files, and keep existing project rules intact.`

Expected execution:
1. Read `bootstrap/install.md`.
2. Run `node ./skills/dev-memory-protocol/scripts/install.mjs --tool claude --project <target-project>`.
3. Report the files created or updated.

Removal guide:
- Read `bootstrap/remove-claude-code.md` or `bootstrap/uninstall.md`.
