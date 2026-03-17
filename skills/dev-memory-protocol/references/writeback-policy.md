# Writeback Policy

## Allowed Records

Write back only if the knowledge is verified and likely to be reused:

- Stable project facts
- Business rules
- Bug root causes and regression checks
- Implementation decisions
- Cross-module risks

## Disallowed Records

Do not write back:

- Raw chat transcripts
- Unverified guesses
- Temporary experiments
- Secrets, passwords, tokens, private keys
- Full database connection strings

## Record Quality

Each bug or decision record should include:

- `type`
- `tags`
- `paths`
- `last_verified`
- `confidence`

Keep entries short, concrete, and anchored to real files or modules.

## Candidate Generation

Use `capture-from-diff.mjs` to generate candidate records from current git changes.

- Default behavior: print a candidate record as JSON for review.
- Use `--write true` only after checking that the title, tags, paths, and summary are accurate.
- Prefer `--type bug` when capturing a regression or fix, and `--type decision` when documenting an implementation choice.
- The diff-based capture ignores managed protocol files such as `.ai/`, `AGENTS.md`, and `CLAUDE.md` so candidates stay focused on product code changes.
