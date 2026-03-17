# Hook Adapters

Use hooks as trigger points and Node scripts as the execution layer.

## Suggested Events

1. Task start
   - Run `node ./skills/dev-memory-protocol/scripts/recall.mjs --project . --query "<task summary>"`
2. Before editing
   - Run `node ./skills/dev-memory-protocol/scripts/recall.mjs --project . --query "<module or bug keywords>"`
3. After implementation
   - Run `node ./skills/dev-memory-protocol/scripts/capture-from-diff.mjs --project . --query "<what changed>"`
4. After bug fix or major decision
   - Review the diff candidate, then run `node ./skills/dev-memory-protocol/scripts/capture-from-diff.mjs --project . --type <bug|decision> --query "<what changed>" --write true`
5. After writeback or bulk edits
   - Run `node ./skills/dev-memory-protocol/scripts/index.mjs --project .`

## Tool Notes

- Codex: append rules to `AGENTS.md`.
- Claude Code: append rules to `CLAUDE.md`.
- If a project uses both, install to both rule files.

Keep hook bodies thin. Let `install.mjs`, `recall.mjs`, `capture.mjs`, and `index.mjs` own the logic.

## Minimal Adapter Contract

For any tool integration, keep the adapter behavior consistent:

1. Before editing, print the output of `recall.mjs` or inject it into the task context.
2. After major fixes or decisions, prefer `capture-from-diff.mjs` to generate a candidate from current git changes.
3. Use `capture.mjs` only when there is no useful diff context or when a manual record is clearer.
4. After writeback, call `index.mjs`.

## Example Commands

Use these examples as templates, not as hard requirements:

```bash
node ./skills/dev-memory-protocol/scripts/recall.mjs --project . --query "refund status callback"
node ./skills/dev-memory-protocol/scripts/capture-from-diff.mjs --project . --type bug --query "refund callback status sync"
node ./skills/dev-memory-protocol/scripts/capture-from-diff.mjs --project . --type bug --query "refund callback status sync" --write true
node ./skills/dev-memory-protocol/scripts/capture.mjs --project . --type bug --title "Refund callback skipped status sync" --tags refund,payment --paths src/refund,src/payment
node ./skills/dev-memory-protocol/scripts/index.mjs --project .
```
