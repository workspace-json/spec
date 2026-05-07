---
phase: 01-rules-v02
plan: "07"
subsystem: rules/plugin rules/presets agents-audit
tags: [plugin-api, presets, exports, v0.2.0, package-config, audit-adapter]
dependency_graph:
  requires: ["01-01", "01-02", "01-03", "01-04", "01-05", "01-06"]
  provides:
    - "RulePack and Preset interfaces in plugin.ts"
    - "Three preset configurations: preset:default, preset:strict, preset:ci"
    - "Complete v0.2 public API in index.ts (9 rules + engine + presets + types)"
    - "Testing subpath @workspacejson/rules/testing in package.json"
    - "v0.2-typed RuleContext construction via buildLegacyContext in audit.ts"
    - "Updated presenter.ts using breakdown fields and severity null guard"
  affects:
    - packages/rules/src/plugin.ts
    - packages/rules/src/presets/index.ts
    - packages/rules/src/index.ts
    - packages/rules/package.json
    - packages/rules/src/rules/staleness/section-staleness.ts
    - packages/agents-audit/src/audit.ts
    - packages/agents-audit/src/presenter.ts
    - packages/agents-audit/src/presenter.test.ts
tech_stack:
  added: []
  patterns:
    - "Plugin pack API pattern (RulePack/Preset interfaces) for extensibility"
    - "Factory functions getDefaultRules()/getStrictRules()/getCiRules() returning Rule arrays"
    - "buildLegacyContext adapter bridging v0.1 audit orchestration to v0.2 RuleContext shape"
    - "Object.assign bridge for runtime legacy field attachment without TypeScript violation"
    - "Testing subpath isolation: main bundle never imports vitest"
key_files:
  created:
    - packages/rules/src/plugin.ts
    - packages/rules/src/presets/index.ts
  modified:
    - packages/rules/src/index.ts
    - packages/rules/package.json
    - packages/rules/src/rules/staleness/section-staleness.ts
    - packages/agents-audit/src/audit.ts
    - packages/agents-audit/src/presenter.ts
    - packages/agents-audit/src/presenter.test.ts
decisions:
  - "createSectionStalenessRule() factory placed after sectionStaleness const declaration to avoid forward-reference (var hoisting doesn't apply to const)"
  - "buildLegacyContext uses Object.assign to attach agentsMd/repo/config at runtime — TypeScript type satisfied by v0.2 RuleContext while migrated rules access legacy fields via bridge cast"
  - "Build script adds --external vitest so rule-tester.ts (which imports vitest) can be bundled in the ./testing subpath without bundling vitest itself"
  - "presenter.test.ts score fixture updated to use breakdown object (failCount/warnCount/etc.) to match v0.2 HygieneScore"
  - "createSectionStalenessRule evaluate() wraps return with Array.isArray normalization to satisfy Promise<Finding[]> return type"
metrics:
  duration: "~35 minutes"
  completed_at: "2026-05-07T21:00:00Z"
  tasks_completed: 4
  files_created: 2
  files_modified: 6
---

# Phase 01 Plan 07: Plugin Pack API, Presets, and v0.2.0 Package Assembly Summary

Full v0.2 public surface assembled: Plugin pack API declaration, three preset configurations (default/strict/ci), complete index.ts with all 9 rules and engine exports, v0.2.0 package.json with testing subpath, buildLegacyContext adapter in audit.ts, and presenter.ts using v0.2 HygieneScore breakdown fields.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | be8bd73 | feat(01-07): create plugin.ts RulePack/Preset interfaces and three presets |
| 2 | f539d2c | feat(01-07): update index.ts and package.json for v0.2.0 public API |
| 3 | 9fe702c | feat(01-07): update audit.ts to construct v0.2-compatible RuleContext |
| 4 | 2ec12b7 | feat(01-07): update presenter.ts to use v0.2 HygieneScore fields |

## What Was Built

### Task 1: plugin.ts and presets/index.ts

**`packages/rules/src/plugin.ts`:**
- `Preset` interface: name, description, rules[] with id/factory/config
- `RulePack` interface: name, version, rules[], optional presets[]

**`packages/rules/src/presets/index.ts`:**
- `preset:default` — all 8 open-tier rules with balanced thresholds (churnThreshold=0.7, minImporters=5, staleness=60d)
- `preset:strict` — tightened: staleness=30d, churnThreshold=0.5/warnThreshold=0.3, minImporters=3
- `preset:ci` — 3 cheap rules: missing-file-reference, pattern-zero-match, framework-drift
- Factory functions: `getDefaultRules()`, `getStrictRules()`, `getCiRules()` returning configured `Rule[]`
- `presets` const object and `PresetName` type alias

Also added `createSectionStalenessRule()` factory to `section-staleness.ts` (prerequisite needed by strict preset).

### Task 2: index.ts and package.json v0.2.0

**`packages/rules/src/index.ts`** completely rewritten to export:
- Full engine suite: RuleEngine, computeHygieneScore, RuleDependencyGraph, FindingGraphImpl, computeTemporalWeight, weightedConfidence, IncrementalCache
- All 9 rules (5 migrated + 4 new v0.2) with their factory functions
- Three presets, factory helpers, PresetName type
- RulePack and Preset plugin types
- All 35+ v0.2 types from types.ts
- Testing excluded from main bundle (accessible only via ./testing subpath)

**`packages/rules/package.json`:**
- Version bumped: 0.1.1 → 0.2.0
- Added `./testing` subpath to exports (dist/testing/rule-tester.js)
- Build script updated to include `src/testing/rule-tester.ts` with `--external vitest`

### Task 3: audit.ts buildLegacyContext

`buildLegacyContext(agentsMd, repo, config, workspace?)` constructs a complete v0.2 `RuleContext`:
- `repo`: root, files, isMonorepo from RepoState
- `workspace`: WorkspaceSignals with topology inferred from isMonorepo, ciProvider='unknown', empty manifests/agentFiles
- `config`: cast to `Record<string, unknown>`
- `file`: path=agentsMd.filePath, language='unknown', content=agentsMd.raw
- `git`: stub async functions returning empty/zero values
- `findings`: empty FindingGraph stub
- `emit`: no-op
- `Object.assign(base, { agentsMd, repo, config })` attaches legacy fields for bridge cast

### Task 4: presenter.ts v0.2 field updates

- `score.errorCount` → `score.breakdown.failCount`
- `score.warningCount` → `score.breakdown.warnCount`
- Info display line (score.infoCount) removed entirely
- `finding.severity ?? finding.state.toLowerCase()` null guard for optional severity field
- `presenter.test.ts` fixture updated to use v0.2 HygieneScore breakdown shape

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking Issue] Worktree branch 29 commits behind main**
- **Found during:** Execution start
- **Issue:** Worktree was based on an old commit (c0bc9cf) before any v0.2 work. The plan depends on 01-01 through 01-06 (all previously merged to main).
- **Fix:** Merged main into the worktree branch via `git merge main --no-edit` (fast-forward)
- **Files modified:** All files from plans 01-01 through 01-06
- **Not a code deviation:** Infrastructure setup

**2. [Rule 2 - Missing Critical Functionality] createSectionStalenessRule factory**
- **Found during:** Task 1 (presets/index.ts requires it for strict preset)
- **Issue:** The plan noted "if factory is missing, add it" — sectionStaleness.ts had no factory
- **Fix:** Added `createSectionStalenessRule(config?)` factory after the const declaration
- **Files modified:** packages/rules/src/rules/staleness/section-staleness.ts
- **Commit:** be8bd73

**3. [Rule 1 - Bug] createSectionStalenessRule return type mismatch**
- **Found during:** Task 3 (typecheck of agents-audit)
- **Issue:** `sectionStaleness.evaluate.call(...)` returns `Promise<Finding | Finding[]>` (Rule interface), but the factory's evaluate signature promises `Promise<Finding[]>`
- **Fix:** Added `Array.isArray(result) ? result : [result]` normalization
- **Files modified:** packages/rules/src/rules/staleness/section-staleness.ts
- **Commit:** 9fe702c

**4. [Rule 1 - Bug] tsup build needs --external vitest for testing subpath**
- **Found during:** Task 2 (build verification)
- **Issue:** `rule-tester.ts` imports from `vitest`; bundling it without externalizing vitest caused ESM build failure
- **Fix:** Added `--external vitest` to build script
- **Files modified:** packages/rules/package.json
- **Commit:** f539d2c

**5. [Rule 1 - Bug] presenter.test.ts score fixture used v0.1 HygieneScore shape**
- **Found during:** Task 4 (typecheck)
- **Issue:** Test passed `{ errorCount: 0, warningCount: 0, infoCount: 0 }` which no longer matches v0.2 HygieneScore
- **Fix:** Updated to `{ breakdown: { failCount: 0, warnCount: 0, insufficientDataCount: 0, skipCount: 0, previewCount: 0 }, coverageRatio: 0 }`
- **Files modified:** packages/agents-audit/src/presenter.test.ts
- **Commit:** 2ec12b7

## Verification Results

| Check | Result |
|-------|--------|
| V9: No tree-sitter/ast-grep imports | PASS — grep returns 0 |
| V10: No VrekoContext class implementation | PASS — grep returns 0 |
| Version 0.2.0 in package.json | PASS |
| getCiRules() returns 3 rules | PASS (CI_RULE_IDS has 3 entries) |
| plugin.ts exports RulePack and Preset | PASS |
| presets/index.ts exports all three presets | PASS |
| index.ts exports all 9 rules | PASS |
| Testing NOT in main bundle | PASS — no RuleTester in index.ts |
| ./testing subpath in package.json exports | PASS |
| buildLegacyContext in audit.ts | PASS |
| presenter.ts uses breakdown fields | PASS |
| presenter.ts severity null guard | PASS |
| TypeScript errors in audit.ts | PASS (zero) |
| TypeScript errors in presenter.ts | PASS (zero) |
| Tests pass | 157/157 pass |

## Known Stubs

The `buildLegacyContext` in `audit.ts` has intentional stubs:
- `git.*` signals return empty/zero values (awaiting v0.3 real git integration)
- `findings.findingsFor` returns [] (FindingGraph not wired to audit run findings)
- `workspace.ciProvider = 'unknown'` (not yet detected from repo)

These stubs are intentional and documented with `TODO(v0.3)` comments. The five migrated rules don't use these fields (they use the legacy bridge), and the four new rules use them conditionally. The CLI produces correct results with these stubs.

## Threat Flags

None. No new network endpoints, auth paths, or schema changes at trust boundaries beyond what the plan's threat model documented.

## Self-Check: PASSED

Files verified (all FOUND):
- packages/rules/src/plugin.ts
- packages/rules/src/presets/index.ts
- packages/rules/src/index.ts
- packages/rules/package.json
- packages/agents-audit/src/audit.ts
- packages/agents-audit/src/presenter.ts

Commits verified (all FOUND in git log):
- be8bd73 (Task 1) ✓
- f539d2c (Task 2) ✓
- 9fe702c (Task 3) ✓
- 2ec12b7 (Task 4) ✓

157 tests pass in packages/rules.
