# agents-audit monorepo

[![npm version](https://img.shields.io/npm/v/agents-audit.svg)](https://www.npmjs.com/package/agents-audit)
[![npm downloads](https://img.shields.io/npm/dm/agents-audit.svg)](https://www.npmjs.com/package/agents-audit)

This repository is the canonical source for the `agents-audit` release family.

Published packages:

- [`@workspacejson/spec`](https://www.npmjs.com/package/@workspacejson/spec)
- [`@workspacejson/rules`](https://www.npmjs.com/package/@workspacejson/rules)
- [`agents-audit`](https://www.npmjs.com/package/agents-audit)

What lives here:

- The JSON Schema and types for `agents.workspace.json`
- The deterministic rule engine and fixtures
- The `agents-audit` CLI and presentation layer
- Release metadata, CI, and packaging configuration

All three npm packages are published from this single monorepo and point back to
`workspace-json/agents-audit` in their package metadata.

Homepage: https://workspacejson.dev

Releases are intended to use GitHub Actions trusted publishing with provenance,
not long-lived npm tokens.

GitHub release tags mirror npm package versions so the repository history and the
registry history stay aligned.

Release links:

- [GitHub Releases](https://github.com/workspace-json/agents-audit/releases)
- [agents-audit on npm](https://www.npmjs.com/package/agents-audit)
- [@workspacejson/rules on npm](https://www.npmjs.com/package/@workspacejson/rules)
- [@workspacejson/spec on npm](https://www.npmjs.com/package/@workspacejson/spec)
