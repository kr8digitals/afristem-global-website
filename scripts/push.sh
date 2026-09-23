#!/usr/bin/env bash
# Push to GitHub using the saved token.
#
# The token is read from (in order): $GH_TOKEN, .github-token, ~/.github-token.
# It is never written into the git remote, so it cannot leak through
# .git/config or `git remote -v`.
set -euo pipefail

REPO_URL="https://github.com/kr8digitals/afristem-global-website.git"
USER_NAME="kr8digitals"

TOKEN="${GH_TOKEN:-}"
if [ -z "$TOKEN" ] && [ -f ".github-token" ]; then TOKEN="$(tr -d ' \n\r' < .github-token)"; fi
if [ -z "$TOKEN" ] && [ -f "$HOME/.github-token" ]; then TOKEN="$(tr -d ' \n\r' < "$HOME/.github-token")"; fi

if [ -z "$TOKEN" ]; then
  echo "No GitHub token found."
  echo "  1. Create one: https://github.com/settings/tokens/new?scopes=repo&description=afristem-website-push"
  echo "  2. Save it:    echo 'ghp_xxx' > .github-token && chmod 600 .github-token"
  exit 1
fi

BRANCH="${1:-main}"
git -c credential.helper='!f() { echo "username='"$USER_NAME"'"; echo "password='"$TOKEN"'"; }; f' push origin "$BRANCH"
echo "Pushed $BRANCH to $REPO_URL"
