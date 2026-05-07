---
phase: 01-rules-v02
plan: "06"
subsystem: rules/testing
tags: [rule-tester, v2, five-state, preview, tdd, test-harness]
dependency_graph:
  requires: ["01-01", "01-02", "01-03", "01-04", "01-05"]
  provides: [rule-tester-v2]
  affects:
    - packages/rules/src/testing/rule-tester.ts
    - packages/rules/src/testing/__tests__/rule-tester.test.ts
    - packages/rules/src/rules/consistency/__tests__/convention-mismatch.test.ts
    - packages/rules/src/rules/drift/__tests__/framework-drift.test.ts
    - packages/rules/src/rules/integrity/__tests__/pattern-zero-match.test.ts
    - packages/rules/src/rules/staleness/__tests__/section-staleness.test.ts
    - types/ambient.d.ts
tech_stack:
  added: []
  patterns: [five-state-assertion, preview-case-testing, legacy-bridge-cast, exactOptionalPropertyTypes-compat]
key_files:
  created:
    - packages/rules/src/testing/__tests__/rule-tester.test.ts
  modified:
    - packages/rules/src/testing/rule-tester.ts
    - packages/rules/src/rules/consistency/__tests__/convention-mismatch.test.ts
    - packages/rules/src/rules/drift/__tests__/framework-drift.test.ts
    - packages/rules/src/rules/integrity/__tests__/pattern-zero-match.test.ts
    - packages/rules/src/rules/staleness/__tests__/section-staleness.test.ts
    - types/ambient.d.ts
decisions:
  - "Maintained legacy bridge (Object.assign of agentsMd/repo/config) for migrated v0.1 workspace-scoped rules"
  - "ValidCase.expectedState is PASS/WARN/INSUFFICIENT_DATA/SKIP; InvalidCase explicitly requires FAIL state"
  - "PreviewCase tests defensive [] return without vreko; does not test PREVIEW state directly (engine owns that)"
  - "TestContext = DeepPartial<RuleContext> & LegacyFields to accept both v0.2 and legacy context shapes"
  - "Extended types/ambient.d.ts vitest stub to add toBeNull/toBeUndefined/toEqual/toBeInstanceOf/not/toBeTypeOf"
  - "Migrated v0.1 rule tests updated from invalid to valid+expectedState:'WARN' (those rules return WARN not FAIL)"
metrics:
  duration: "~25 minutes"
  completed_at: "2026-05-07T20:41:14Z"
  tasks_completed: 1
  files_created: 1
  files_modified: 6
---

# Phase 01 Plan 06: RuleTester v2 with Five-State Assertions and Preview Support Summary

RuleTester v2 with five-state assertions (PASS/WARN/INSUFFICIENT_DATA/SKIP/FAIL), dedicated PreviewCase group, and full RuleContext construction with mocked GitSignals and empty FindingGraph.

## Tasks Completed

### Task 1: Rewrite RuleTester v2 (TDD)

**RED commit:** e7371b1 — `test(01-06): add failing tests for RuleTester v2 API`
**GREEN commit:** e059627 — `feat(01-06): implement RuleTester v2 with five-state assertions and preview support`

**RuleTester v2** (`packages/rules/src/testing/rule-tester.ts`):
- `ValidCase`: `expectedState?: 'PASS' | 'WARN' | 'INSUFFICIENT_DATA' | 'SKIP'` — asserts no FAIL findings; optionally asserts a specific non-fail state
- `InvalidCase`: `expectedState?: 'FAIL'` + `expectedFindings?: Partial<Finding>[]` — asserts at least one FAIL finding with optional substring/severity matching
- `PreviewCase`: tests that rule returns `[]` defensively when `ctx.vreko` is absent, and optionally validates `meta.previewMessage()`
- `InvariantCase`: arbitrary async test function for complex cross-context checks
- `buildContext(partial?)`: constructs complete `RuleContext` with all required fields:
  - Mocked `GitSignals`: `churnScore→0`, `authorCount→1`, `modificationVelocity→0`, `fileAge→0`, `recentCommits→[]`, `commitsBetween→[]`, `lastModified→new Date(0)`
  - Empty `FindingGraph`: `findingsFor→[]`, `hasFinding→false`, `confidence→null`
  - Legacy bridge maintained via `Object.assign(ctx, { agentsMd, repo, config })` for migrated workspace-scoped rules
- `buildStaticContext(partial?)`: constructs `StaticRuleContext` only (no `file`/`git`/`findings`/`emit`/`vreko`)
- `run()` supports all four case groups: `valid`, `invalid`, `preview`, `invariants`

**Tests** (`packages/rules/src/testing/__tests__/rule-tester.test.ts`):
- 37 tests covering all new API features
- Uses `makeStubRule()`, `makeWarnRule()`, `makeProRule()` stubs
- All test assertions use matchers within the project's ambient vitest type stub

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Migrated v0.1 rule tests used `invalid` for WARN-state findings**
- **Found during:** Task 1 (GREEN phase test run)
- **Issue:** The v2 `invalid` case group now specifically requires FAIL-state findings. Four migrated rule tests (`convention-mismatch`, `framework-drift`, `pattern-zero-match`, `section-staleness`) used `invalid` for rules that return WARN (not FAIL). They failed after the rewrite.
- **Fix:** Updated all four test files to use `valid` with `expectedState: 'WARN'` — the correct v2 API for asserting WARN findings
- **Files modified:** convention-mismatch.test.ts, framework-drift.test.ts, pattern-zero-match.test.ts, section-staleness.test.ts
- **Commits:** e059627

**2. [Rule 2 - Missing Critical Functionality] ambient.d.ts vitest stub was too narrow**
- **Found during:** Task 1 (TypeScript check)
- **Issue:** The project's custom `declare module 'vitest'` in `types/ambient.d.ts` only declared 10 matcher methods. Needed matchers like `toBeNull`, `toBeUndefined`, `toEqual`, `toBeInstanceOf`, `toBeTypeOf`, `not`, `toBeCloseTo`, `toThrow` were missing. Pre-existing test files (`finding-graph.test.ts`, `incremental-cache.test.ts`, `rule-dependency-graph.test.ts`) were already failing typecheck for the same reason (157 pre-existing typecheck errors).
- **Fix:** Extended the `Assertion` interface in ambient.d.ts with all standard vitest matchers
- **Files modified:** types/ambient.d.ts
- **Result:** Typecheck errors reduced from 157 (pre-existing) to 58 (remaining pre-existing issues unrelated to this plan)
- **Commits:** e059627

**3. [Rule 1 - Bug] TestContext type needed to accept both v0.2 and legacy field shapes**
- **Found during:** Task 1 (GREEN phase implementation)
- **Issue:** The plan specified `buildContext(partial?: DeepPartial<RuleContext>)` but migrated rules pass `agentsMd`, `repo` (as RepoState with `gitHistory`), and `config` (as AuditConfig) in their test contexts. These fields don't exist on `RuleContext`.
- **Fix:** Defined `TestContext = DeepPartial<RuleContext> & LegacyFields` to accept both shapes. `buildContext` assembles the full legacy objects (ParsedAgentsMd, RepoState) and attaches them via `Object.assign` for the bridge cast.
- **Files modified:** packages/rules/src/testing/rule-tester.ts

## TDD Gate Compliance

| Gate | Commit | Status |
|------|--------|--------|
| RED (test commit) | e7371b1 | PASS — tests ran and failed before implementation |
| GREEN (feat commit) | e059627 | PASS — all 170 tests pass after implementation |

## Test Results

| Test Suite | Tests | Status |
|---|---|---|
| rule-tester.test.ts (new) | 37 | PASS |
| All pre-existing suites | 133 | PASS |
| **Total** | **170** | **PASS** |

## Must-Have Verification

| Must-Have | Status |
|---|---|
| `PreviewCase` interface exported | PASS — `grep "PreviewCase" rule-tester.ts` shows interface + run() usage |
| `buildStaticContext()` exported | PASS |
| `ValidCase.expectedState` (PASS/WARN/INSUFFICIENT_DATA/SKIP) | PASS |
| `InvalidCase.expectedState?: 'FAIL'` + `expectedFindings` | PASS |
| `buildContext()` mocked GitSignals with correct defaults | PASS — authorCount=1, churnScore=0, velocity=0 |
| Empty FindingGraph | PASS |
| All tests pass | PASS — 170/170 |

## Known Stubs

None. The RuleTester itself is a test utility; it does not make API calls or produce UI output.

## Threat Flags

None. Test fixtures contain only synthetic data per the plan's threat model (T-06-01: accept).

## Self-Check: PASSED

Files verified:
- `/Users/user1/WebstormProjects/agents-audit/packages/rules/src/testing/rule-tester.ts` — FOUND
- `/Users/user1/WebstormProjects/agents-audit/packages/rules/src/testing/__tests__/rule-tester.test.ts` — FOUND
- `/Users/user1/WebstormProjects/agents-audit/types/ambient.d.ts` — FOUND (extended)

Commits verified:
- e7371b1 (RED) — FOUND in git log
- e059627 (GREEN) — FOUND in git log

All 170 tests pass.
