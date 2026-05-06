This repository uses an RFC-style process for substantive changes to the
specification. The goal is lightweight, reviewable proposals that leave a
clear audit trail.

Quick workflow:

- Fork the `workspace-json/spec` repository.
- Create a branch named `rfc/<short-name>`.
- Add your proposal as an RFC under `rfc/` (Markdown). For spec changes, edit `spec.mdx` or propose a PR linked to the RFC.
- Open a pull request against `main` referencing the RFC issue/PR.

Schema changes:

- Include updated `schema/v1.json` and at least one example in `examples/`.
- Add or update `scripts/validate-examples.js` tests if necessary.

Contributor expectations:

- Follow `CODE_OF_CONDUCT.md`.
- Be responsive to review comments.

Contact: governance@workspacejson.dev
