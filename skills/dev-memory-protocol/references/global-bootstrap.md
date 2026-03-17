# Global Bootstrap

Use this guide after installing the skill into Codex when you want future project conversations to auto-bootstrap project memory.

## Goal

Let the installed skill manage one global bootstrap block in `~/.codex/AGENTS.md`.

That global block should:

- Detect project roots
- Create `.ai/` when a project has not been initialized yet
- Read baseline memory when `.ai/` already exists
- Prefer recall before implementation work

## Enable

Run:

```bash
node "<skill-path>/scripts/install-global.mjs"
```

## Disable

Run:

```bash
node "<skill-path>/scripts/uninstall-global.mjs"
```

## Notes

- This is separate from project initialization.
- Installing the skill into Codex does not automatically enable the global bootstrap block.
- The global bootstrap block should be append-only and must not overwrite existing global rules outside the managed block.
