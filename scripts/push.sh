#!/usr/bin/env bash
# Push to GitHub using either the deploy key (preferred) or a saved token.
#
#   ./scripts/push.sh            # push the current branch to origin
#   ./scripts/push.sh develop    # push a specific branch
#
# Credentials are never written into the git remote, so nothing can leak
# through .git/config or `git remote -v`.
set -euo pipefail

REPO_SSH="git@github.com:kr8digitals/afristem-global-website.git"
REPO_HTTPS="https://github.com/kr8digitals/afristem-global-website.git"
BRANCH="${1:-main}"

# make sure the remote exists (it lives in .git/config, which some hosts exclude
# from snapshots)
if ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin "$REPO_SSH"
fi

KEY="$HOME/.ssh/afristem_deploy"
if [ -f "$KEY" ]; then
  GIT_SSH_COMMAND="ssh -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new" \
    git push origin "$BRANCH"
  echo "Pushed $BRANCH to $REPO_SSH (deploy key)"
  exit 0
fi

TOKEN="${GH_TOKEN:-}"
[ -z "$TOKEN" ] && [ -f ".github-token" ] && TOKEN="$(tr -d ' \n\r' < .github-token)"
[ -z "$TOKEN" ] && [ -f "$HOME/.github-token" ] && TOKEN="$(tr -d ' \n\r' < "$HOME/.github-token")"

if [ -z "$TOKEN" ]; then
  echo "No deploy key and no token found — see GITHUB-TOKEN-STEPS.md"
  exit 1
fi

git remote set-url origin "$REPO_HTTPS"
git -c credential.helper='!f() { echo "username=kr8digitals"; echo "password='"$TOKEN"'"; }; f' push origin "$BRANCH"
echo "Pushed $BRANCH to $REPO_HTTPS (token)"
