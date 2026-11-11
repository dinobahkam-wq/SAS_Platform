# SAS Platform — Agent entrypoint

**Mandatory first read for every new development session:** [Project memory](docs/project-memory/README.md).

Before proposing or changing code:

1. Read `docs/project-memory/README.md`, then `CURRENT_STATE.md`, `DECISIONS.md`, `WORKFLOW.md`, and `CHANGELOG.md`.
2. Confirm the GitHub repository, target branch, current PR and exact head SHA **from GitHub**, not from a prior chat, screenshot, or a local directory.
3. Read relevant implementation documents under `docs/` and recent GitHub PRs. Treat these as historical evidence; distinguish approved design decisions from merged code and from unverified changes.
4. Do not claim checks, deployment, migration, or local testing succeeded without current evidence.
5. Keep GitHub authoritative; local Windows worktrees are verification mirrors. Preserve uncommitted changes.
6. Record each completed development package in `docs/project-memory/CHANGELOG.md` and refresh `CURRENT_STATE.md` on the package branch. Link PRs and commits.
7. Never store secrets, local environment files, or font binaries in the knowledge documents.
8. No direct feature development on `main`; use branches and PRs. Do not merge or deploy without the user's explicit approval.

If this file is present on `main` but the newest development PRs are still stacked and unmerged, consult the active head branch specified in `CURRENT_STATE.md` for implementation and use this directory for documented decisions.

These instructions are a **repository-level workflow**, not automatic access to other ChatGPT conversations. A new session must read the GitHub documents using its GitHub connection.
