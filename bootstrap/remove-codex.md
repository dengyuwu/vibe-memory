Use this repository to remove development memory workflow from Codex projects.

Suggested one-line prompt:
`Remove dev-memory-protocol from this repository for the current project, delete only its managed rules from AGENTS.md, keep .ai memory files, and leave all other project rules intact.`

Expected execution:
1. Read `bootstrap/uninstall.md`.
2. Run `node ./skills/dev-memory-protocol/scripts/uninstall.mjs --tool codex --project <target-project>`.
3. Report the files updated and the memory files retained.

Optional global bootstrap removal:
- If the user previously enabled Codex-wide auto-bootstrap, run `node ./skills/dev-memory-protocol/scripts/uninstall-global.mjs`.
