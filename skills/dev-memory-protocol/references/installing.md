# Installing From An Installed Skill

Use this guide when `dev-memory-protocol` is already installed in Codex or another skill host and you want to initialize the current project.

## Goal

Initialize project-local memory files and append the managed rule block without overwriting user-authored rules.

## Steps

1. Identify the absolute path of this installed skill.
2. Run:

```bash
node "<skill-path>/scripts/install.mjs" --project <target-project>
```

3. Use `--tool codex`, `--tool claude`, or `--tool both` only when the target is explicit.
4. Let the installer auto-detect the target tool when possible.

## Expected Result

The installer will:

- Create `.ai/project`, `.ai/memory`, and `.ai/index` if missing
- Append the managed rule block to `AGENTS.md`, `CLAUDE.md`, or both
- Keep user rules outside the managed block intact
- Rebuild the memory index

## Notes

- This guide is self-contained and does not depend on repository-root `bootstrap/` files.
- Installing the skill into Codex is not the same as initializing a project with the protocol.
- If `.ai/` is missing after skill installation, run the install script for the current project.
