---
phase: 01-rules-v02
plan: "02"
subsystem: rules-engine
tags: [engine, dependency-graph, finding-graph, temporal-decay, incremental-cache, tdd]
dependency_graph:
  requires: ["01-01"]
  provides: ["RuleDependencyGraph", "FindingGraphImpl", "computeTemporalWeight", "weightedConfidence", "IncrementalCache"]
  affects: ["packages/rules/src/engine/"]
tech_stack:
  added: []
  patterns: ["Kahn's algorithm for topological sort", "SHA-256 fingerprint caching", "exponential decay w(t)=e^(-λt)"]
key_files:
  created:
    - packages/rules/src/engine/rule-dependency-graph.ts
    - packages/rules/src/engine/finding-graph.ts
    - packages/rules/src/engine/temporal-decay.ts
    - packages/rules/src/engine/incremental-cache.ts
    - packages/rules/src/engine/__tests__/rule-dependency-graph.test.ts
    - packages/rules/src/engine/__tests__/finding-graph.test.ts
    - packages/rules/src/engine/__tests__/temporal-decay.test.ts
    - packages/rules/src/engine/__tests__/incremental-cache.test.ts
  modified: []
decisions:
  - "Used Kahn's algorithm for topological ordering with eager cycle validation on every register() call"
  - "findingsFor() uses method overloading to support both ruleId-only and ruleId+filePath queries"
  - "IncrementalCache key is SHA-256(filePath::ruleId::ruleVersion) truncated to 16 hex chars"
  - "Pre-existing typecheck errors in rule-tester.ts are out of scope (from Plan 01)"
metrics:
  duration: "4 minutes"
  completed: "2026-05-07"
  tasks_completed: 2
  files_created: 8
  tests_added: 55
  tests_total: 89
---

# Phase 01 Plan 02: Engine Support Modules Summary

**One-liner:** Four pure engine utility modules — topological rule ordering with Kahn's algorithm, finding graph with overloaded lookup, exponential confidence decay (w=e^(-λt)), and SHA-256 fingerprint caching with version-based invalidation.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 (RED) | Failing tests: RuleDependencyGraph + FindingGraphImpl | d080232 | 2 test files |
| 1 (GREEN) | Implement RuleDependencyGraph + FindingGraphImpl | 01f69ac | 2 impl files |
| 2 (RED) | Failing tests: temporal-decay + IncrementalCache | db7a134 | 2 test files |
| 2 (GREEN) | Implement temporal-decay + IncrementalCache | e3d60ba | 2 impl files |

## Implementations

### RuleDependencyGraph (`rule-dependency-graph.ts`)

- `register(rule)` — stores rule and triggers eager cycle validation; throws `'Duplicate rule ID: {id}'` on re-registration
- `topologicalOrder()` — Kahn's algorithm; throws `'Circular dependency detected in rule graph'` on cycles; returns prerequisites before dependents
- `size()` — count of registered rules
- Unregistered prerequisites are silently skipped (rules may declare intent without all deps present)

### FindingGraphImpl (`finding-graph.ts`)

- `add(findings[])` — indexes by `ruleId` and `ruleId::filePath`
- `findingsFor(ruleId)` / `findingsFor(ruleId, filePath)` — overloaded lookup returning `[]` for misses
- `hasFinding(ruleId, state)` — boolean check
- `confidence(ruleId, filePath?)` — average confidence across findings; returns `null` for no matches
- `readOnly()` — returns a live `FindingGraph` view without `add()`

### temporal-decay (`temporal-decay.ts`)

- `computeTemporalWeight(observedAt, λ=0.01)` — exponential decay `e^(-λt)`, t in days; future dates clamped to weight=1
- `weightedConfidence(signals[], λ=0.01)` — `Σ(w_i * decay_i * v_i) / Σ(w_i * decay_i)`; returns 0 for empty or all-zero weights

### IncrementalCache (`incremental-cache.ts`)

- Constructor: `new IncrementalCache(repoRoot)` — cache dir at `{repoRoot}/.agentsaudit-cache/`
- `get(filePath, ruleId, ruleVersion)` — returns `Finding[] | null`; invalidates on version change or file content change
- `set(filePath, ruleId, ruleVersion, findings)` — creates cache dir if needed; stores JSON entry
- Cache key: `sha256(filePath::ruleId::ruleVersion).slice(0, 16)` — 16 hex chars per threat model
- Corrupt JSON silently returns `null` (T-02-01 mitigation)

## Test Results

```
Test Files  17 passed (17)
Tests       89 passed (89)
```

New tests added by this plan: 55 (12 rule-dependency-graph + 20 finding-graph + 13 temporal-decay + 10 incremental-cache).

## Deviations from Plan

None — plan executed exactly as written.

## Threat Model Compliance

| Threat ID | Status |
|-----------|--------|
| T-02-01 (Tampering: cache read) | Mitigated — `JSON.parse` in try/catch returns null on corrupt data; file hash comparison detects content tampering |
| T-02-02 (DoS: cycle detection) | Mitigated — `validateNoCycles()` called on every `register()`; Kahn's algorithm terminates on detection |
| T-02-03 (DoS: cache disk write) | Accepted — developer tool, no sensitive data |

## Known Stubs

None.

## Self-Check: PASSED

- `packages/rules/src/engine/rule-dependency-graph.ts` — FOUND
- `packages/rules/src/engine/finding-graph.ts` — FOUND
- `packages/rules/src/engine/temporal-decay.ts` — FOUND
- `packages/rules/src/engine/incremental-cache.ts` — FOUND
- Commit d080232 — FOUND
- Commit 01f69ac — FOUND
- Commit db7a134 — FOUND
- Commit e3d60ba — FOUND
- 89 tests pass — VERIFIED
