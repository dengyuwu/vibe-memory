# Uninstalling From An Installed Skill

Use this guide when `dev-memory-protocol` is already installed in Codex or another skill host and you want to remove the protocol from the current project.

## Goal

Remove only the managed rule block while keeping project memory files by default.

## Steps

1. Identify the absolute path of this installed skill.
2. Run:

```bash
node "<skill-path>/scripts/uninstall.mjs" --project <target-project>
```

3. Use `--tool codex`, `--tool claude`, or `--tool both` only when the target is explicit.
4. Let the uninstaller auto-detect the target tool when possible.

## Expected Result

The uninstaller will:

- Remove only the managed block from `AGENTS.md`, `CLAUDE.md`, or both
- Keep `.ai/` project memory files unless explicitly removed later
- Rebuild the memory index

## Notes

- This guide is self-contained and does not depend on repository-root `bootstrap/` files.
- Removing the skill from Codex is not the same as removing the protocol from a project.
