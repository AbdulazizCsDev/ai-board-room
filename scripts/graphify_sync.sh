#!/usr/bin/env bash
# graphify_sync.sh — keep the project knowledge graph fresh.
#
# Used by .claude/settings.json hooks:
#   - SessionStart : ensure graphify is installed, then rebuild the graph so
#                    every new session starts with an up-to-date graph.json.
#   - PostToolUse  : after a file is created/edited, refresh the graph so it
#                    stays "live" as the project changes.
#
# Code-only extraction (`graphify update`) needs no LLM API key.
# This script never fails a tool call: it always exits 0.

set +e

# graphify (installed via `uv tool install graphifyy`) lives here.
export PATH="$HOME/.local/bin:$PATH"

cd "$(dirname "$0")/.." || exit 0

# In a fresh/ephemeral container graphify may not be installed yet.
if ! command -v graphify >/dev/null 2>&1; then
  # Only attempt an install if we have a tool to do it with.
  if command -v uv >/dev/null 2>&1; then
    uv tool install -q graphifyy >/dev/null 2>&1
  elif command -v pipx >/dev/null 2>&1; then
    pipx install graphifyy >/dev/null 2>&1
  elif command -v pip >/dev/null 2>&1; then
    pip install --user -q graphifyy >/dev/null 2>&1
  fi
  export PATH="$HOME/.local/bin:$PATH"
fi

# Still not available? Give up quietly — don't break the session.
command -v graphify >/dev/null 2>&1 || exit 0

# Rebuild the code graph (no LLM key required, no HTML for speed).
graphify update . >/dev/null 2>&1

exit 0
