# Changelog

## Unreleased

## 0.2.0 - 2026-05-08

### Breaking changes

- `agents.workspace.json` is now read from the repository root (`agents.workspace.json`) rather than `.agents/agents.workspace.json`. The legacy path is still read as a fallback so existing setups continue to work, but new files are written to the root.
- `generate` now writes `agents.workspace.json` to the repository root and no longer creates the `.agents/` directory.
- `Rule.evaluate` now returns `Promise<Finding[]>` — the previous `Promise<Finding | Finding[]>` union is removed. Custom rule implementations must always return an array.

### New features

- Added `generate` subcommand: `agents-audit generate [path] [--dry-run]` writes `agents.workspace.json` from a live repository scan.
- `scan` output now shows `✓ All checks passed` on clean repos instead of an empty findings table.
- `scan` output filters `PASS`, `SKIP`, `INSUFFICIENT_DATA`, and `PREVIEW` findings from the terminal table and saved reports — only `FAIL` and `WARN` findings are shown.
- Saved Markdown reports (via `--save`) now print the report path to stdout after writing.
- Remediation hints from rule findings appear inline below the finding message in the terminal table.
- Interactive findings navigator only receives `FAIL`/`WARN` findings, not PASS/SKIP rows.

### Bug fixes

- Fixed `--fail-on info` incorrectly exiting non-zero on clean repositories. The old implementation matched every finding regardless of state; the fix uses a severity rank map so only findings with an explicit `severity` field are counted.
- Fixed `tests in a __tests__ directory` convention synonym never matching. The remark Markdown parser converts `__tests__` (double underscores) to bold text, stripping the underscores. The parser now uses raw source lines for synonym matching.

### Security

- `--config <path>` is now validated to be within the repository root before reading. A path outside the root falls back to defaults with a warning.
- `reportDir` in `agents.workspace.json` and `.agentsauditrc` is now verified to be within the repository root before any write operation.
- `.agentsauditrc` fields are sanitised before merging with defaults: non-array `ignore`, non-string `reportDir`, and non-finite numeric thresholds are discarded.
- Config parse errors no longer include the absolute filesystem path or raw JSON error text in the warning message.

### Internal

- `detectCiProvider` and `DEFAULT_AUDIT_CONFIG` extracted to `src/internal/config.ts`.
- `findAgentsMdPath` and `readTextOrEmpty` extracted to `src/internal/fs.ts`.
- `isActionable(f: Finding)` predicate exported from `cli-helpers.ts` and used consistently in presenter, reporter, and CLI.
- `hygiene-score.ts` reduced to a single pass over findings (was two sequential loops).
- `loadWorkspaceJson` eliminates the double `existsSync` TOCTOU pattern.
- `Rule.evaluate` return type narrowed from `Finding | Finding[]` to `Finding[]`.
- `incremental-cache` tests refactored from shared `beforeEach`/`afterEach` to per-test `withTempDir` helper.
- CI self-audit now fails on `error`-severity findings (removed `continue-on-error`).

## 0.1.1 - 2026-05-06

- Added npm discoverability keywords to `@workspacejson/spec`
- Added npm discoverability keywords to `@workspacejson/rules`
- Added npm discoverability keywords to `agents-audit`

## 0.1.0 - 2026-05-06

- Initial workspace implementation for `agents-audit`
- Added `@workspacejson/spec` and `@workspacejson/rules`
- Added the `agents-audit` CLI wrapper
