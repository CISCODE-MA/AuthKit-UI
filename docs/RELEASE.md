# Release Guide

This repo uses:

- `develop` for day-to-day work
- `master` for release readiness
- Changesets for versioning and changelogs
- GitHub Actions for validation + publishing
- npm OIDC (no npm tokens)

---

## When to add a changeset

Add a changeset when a change impacts consumers:

- public API changes (new exports, removals, behavior changes)
- bug fixes
- anything that should be mentioned in release notes

Command:

```bash
npx changeset
```

Commit the generated file under `.changeset/`.

---

## Branch flow

1. Create a branch from `develop`

- `feat/...`, `fix/...`, `docs/...`, etc.

2. Open PR into `develop`

- PR checks must pass:
  - typecheck
  - tests
  - build
  - lint
  - format check

3. Promote `develop` → `master`

- Open PR from `develop` to `master`
- Release check must pass (optional Sonar if enabled)

---

## Versioning + publishing

Publishing is triggered by pushing a git tag on `master`.

Steps:

1. On `develop`, apply versions locally using changesets:

```bash
npm run version-packages
```

2. Commit the version bump (package.json + changelog output)

```bash
git add -A
git commit -m "chore: version packages"
git push
```

3. Merge `develop` → `master`

4. Tag the release on `master` and push tag:

```bash
git checkout master
git pull
git tag vX.Y.Z
git push origin vX.Y.Z
```

That tag triggers the `CD - Release` workflow which publishes via npm OIDC.

---

## Notes

- Do not publish from local machines.
- Do not edit `dist/` manually (it is build output).
- If publishing fails, check GitHub Actions logs first, then npm OIDC configuration.
