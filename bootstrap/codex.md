Use this repository to install development memory workflow for Codex projects.

Suggested one-line prompt:
`帮我从这个仓库安装 dev-memory-protocol：https://github.com/dengyuwu/dev-memory-protocol-skill`

Expected execution:
1. Read `bootstrap/install.md`.
2. Run `node ./skills/dev-memory-protocol/scripts/install.mjs --tool codex --project <target-project>`.
3. Report the files created or updated.

Optional global bootstrap:
- If the user wants future Codex project conversations to auto-check and auto-initialize `.ai`, run `node ./skills/dev-memory-protocol/scripts/install-global.mjs`.

Removal guide:
- Read `bootstrap/remove-codex.md` or `bootstrap/uninstall.md`.
