# @workspacejson/spec

JSON Schema and TypeScript types for `.agents/agents.workspace.json`.

This repository is the canonical specification source for the workspace metadata format.

## Install

```bash
pnpm add @workspacejson/spec
```

## API

```ts
import { workspaceJsonSchema } from '@workspacejson/spec';
import type { WorkspaceJson } from '@workspacejson/spec';
```

## Contents

- `schema/v1.json` contains the published JSON Schema
- `src/index.ts` re-exports the schema and type surface
- `src/types.ts` holds the TypeScript representation

## Notes

- The package publishes only schema, generated types, and package metadata
- The schema is intended to be consumed by `agents-audit` and external tools that validate `.agents/agents.workspace.json`
- Governance, security, and contribution policy live in the repo root
