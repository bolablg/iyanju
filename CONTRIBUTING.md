# Repository workflow

Repository: https://github.com/bolablg/iyanju.git

| Branch     | Purpose                                                           | Change path                                     |
| ---------- | ----------------------------------------------------------------- | ----------------------------------------------- |
| `dev-bola` | Default repository branch and Bolaji's regular development branch | Work here by default                            |
| `dev-*`    | Other development branches                                        | Push development work; use descriptive suffixes |
| `staging`  | Integration and release review                                    | Pull request from a `dev-*` branch              |
| `main`     | Reviewed release source                                           | Pull request from `staging` only                |

The empty repository is bootstrapped with one shared baseline on `dev-bola`, `staging`, and `main`. Subsequent changes follow the promotion sequence. A Git branch or merge does not itself authorize live deployment, DNS changes, or Kazi account changes. No deployment workflow is included.

## Everyday work

```sh
rtk proxy git switch dev-bola
rtk proxy git pull --ff-only
```

For another development branch, choose a name such as `dev-contact-update` and branch from the current development/integration baseline. Keep `dev-bola` as the usual working checkout. Resolve conflicts on a development branch and merge the target branch into it when needed; do not force-push shared history.

Before promotion run the project’s build, type, lint, formatting, unit, and browser checks. Open a pull request with **base `staging`** and **head `dev-bola`** (or another `dev-*` branch); GitHub's default base may be `dev-bola`, so select the intended target explicitly. After integration review, open a separate pull request with **base `main`** and **head `staging`**. Do not skip staging.

Use merge commits for promotion so the long-lived branches retain common ancestry. Squash/rebase merge and automatic head-branch deletion are disabled for this repository. After a release, synchronize development with the target history using an ordinary merge when needed.

## Enforced GitHub policy

- New branch names are limited to `dev-*`, `staging`, and `main`.
- Force pushes are blocked on those branches.
- `staging` and `main` require a pull request, resolved review conversations, and a passing `branch-policy` check against an up-to-date base. Deletion is blocked.
- No standing bypass is configured, including for administrators. Rules can still be edited by authorized repository administrators; changes should be intentional and recorded.
- A second person's approval is not required for this individually operated repository. The pull-request trail and promotion check still apply.
- `branch-policy` rejects forks for release promotion, `dev-*` → `main`, and `main` → `staging`. Development-targeted synchronization PRs can use any allowed branch in this repository.

The GitHub Action runs the policy from the trusted base commit for pull requests and does not execute the proposed application code or use administrative secrets. It validates the branch flow, not application quality or permission to deploy. The pure policy has local regression tests under `tests/branch-policy.test.mjs`.

The action also supports a manual check from GitHub Actions. Future hosting must explicitly select `main` as its production branch; GitHub's `dev-bola` default is for development.

Read back the live settings in [GitHub rulesets](https://github.com/bolablg/iyanju/settings/rules). Declarative policy snapshots are retained in `.github/rulesets/`; do not assume editing a JSON file updates GitHub. Remote rule changes need an explicit administrative application and verification.
