---
phase: 01-rules-v02
plan: "03"
subsystem: rules-migration
tags: [rules, v0.2, migration, finding-shape]
key-files:
  created: []
  modified:
    - packages/rules/src/rules/integrity/missing-file-reference.ts
    - packages/rules/src/rules/integrity/pattern-zero-match.ts
    - packages/rules/src/rules/drift/framework-drift.ts
    - packages/rules/src/rules/staleness/section-staleness.ts
    - packages/rules/src/rules/consistency/convention-mismatch.ts
    - packages/rules/src/testing/rule-tester.ts
metrics:
  tasks_completed: 3
  tasks_total: 3
  tests_added: 0
  tests_passing: 34
---

## Summary

Migrated all 5 v0.1 rules to the v0.2 Finding shape and updated RuleTester to construct full v0.2 RuleContext.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 3955777 | feat(01-03): migrate integrity and drift rules to v0.2 shape |
| 2 | 8eb8ed6 | feat(01-03): migrate staleness and consistency rules to v0.2 shape |
| 3 | d113053 | refactor(01-03): update RuleTester for v0.2 Rule interface and bridge context |

## What Was Built

All five v0.1 rules now conform to the v0.2 Rule and Finding contracts:

- `missing-file-reference` — `meta: RuleMeta` block added; returns `state: 'FAIL'` findings
- `pattern-zero-match` — returns `state: 'WARN'` findings
- `framework-drift` — returns `state: 'WARN'` findings
- `section-staleness` — returns `state: 'WARN'` or `state: 'PASS'` based on gates
- `convention-mismatch` — returns `state: 'WARN'` findings

All findings include: `state`, `confidence`, `signals`, `temporalWeight`, `ruleVersion`, `firedAt`. Migration bridge cast (`TODO(v0.3)`) applied in all rules to bridge legacy context fields.

RuleTester updated to use `rule.meta.id` for describe labels; `LegacyTestContext` type added for backward-compatible partial context in existing tests.

## Deviations

- Migration bridge cast applied rather than full RuleContext refactor in test files — existing 34 tests pass without modification, deferring full test migration to plan 01-06 (RuleTester v2).

## Self-Check: PASSED

- All 5 rules have `meta: RuleMeta` blocks ✓
- All 5 rules return v0.2 Finding shape ✓
- `missing-file-reference` returns `state: 'FAIL'` ✓
- `pattern-zero-match`, `framework-drift`, `section-staleness`, `convention-mismatch` return `state: 'WARN'` ✓
- 34/34 tests passing ✓
