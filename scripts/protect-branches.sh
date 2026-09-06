#!/usr/bin/env bash
# Branch protection — prevent direct commits to protected branches (main/master)
#
# Invoked by the Husky pre-commit hook (.husky/pre-commit).

set -euo pipefail

BRANCH="$(git rev-parse --abbrev-ref HEAD)"

PROTECTED_BRANCHES=("main" "master")

for protected in "${PROTECTED_BRANCHES[@]}"; do
  if [[ "$BRANCH" == "$protected" ]]; then
    echo "=============================================="
    echo "  ERROR: Direct commits to '$BRANCH' are forbidden."
    echo "  Create a feature branch from '$BRANCH' instead:"
    echo ""
    echo "    git checkout -b feature/my-change"
    echo "    git checkout -b bugfix/my-change"
    echo ""
    echo "  Then commit on that branch and open a PR."
    echo "=============================================="
    exit 1
  fi
done

exit 0
