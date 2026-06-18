#!/usr/bin/env bash
# graphify_mcp.sh — launch the graphify MCP server over stdio.
#
# Registered in .mcp.json so Claude Code (and other MCP clients) can query the
# project knowledge graph through native tools (query_graph, get_node,
# get_neighbors, shortest_path, ...) instead of shelling out.
#
# Self-installs graphify in fresh/ephemeral containers so the server always
# comes up.

export PATH="$HOME/.local/bin:$PATH"

# Run from the repo root so the relative graph path resolves.
cd "$(dirname "$0")/.." || exit 1

if ! command -v graphify-mcp >/dev/null 2>&1; then
  if command -v uv >/dev/null 2>&1; then
    uv tool install -q "graphifyy[mcp]" >/dev/null 2>&1
  elif command -v pipx >/dev/null 2>&1; then
    pipx install "graphifyy[mcp]" >/dev/null 2>&1
  elif command -v pip >/dev/null 2>&1; then
    pip install --user -q "graphifyy[mcp]" >/dev/null 2>&1
  fi
  export PATH="$HOME/.local/bin:$PATH"
fi

exec graphify-mcp graphify-out/graph.json
