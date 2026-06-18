# CLAUDE.md — AI Board Room

Guidance for AI coding assistants (Claude Code, etc.) working in this repo.

## Project

**AI Board Room** — turns a business question into a structured boardroom
session. Three AI advisors (CFO, Saudi-law Legal counsel, Market strategist)
deliberate over two rounds and a Chairman synthesizes a verdict. Reads uploaded
documents via a FAISS/RAG layer. Bilingual (Arabic/English).

Stack: Python · LangChain · FastAPI · React · FAISS · OpenAI.

## Knowledge graph (graphify) — read this first

This repo ships a **persistent knowledge graph** of the codebase in
`graphify-out/`. Use it before grepping/reading files to understand structure,
relationships, and "what connects to what".

- `graphify-out/GRAPH_REPORT.md` — start here. Lists the core abstractions
  ("god nodes"), communities (subsystems), import cycles, and surprising
  connections.
- `graphify-out/graph.json` — the queryable graph (212+ nodes / 401+ edges).

Query it from the shell (no API key needed):

```bash
graphify query "how does a board session flow from intake to verdict?"
graphify path "run_board()" "ChairmanVerdict"   # shortest path between nodes
graphify explain "BaseAdvisor"                   # a node and its neighbors
graphify affected "AdvisorResponse"              # what breaks if this changes
```

Core abstractions to know: `BaseAdvisor`, `AdvisorResponse`, `run_board()`,
`ChairmanVerdict`, `IntakeResult`, `DiscoveryResult`, `BoardResult`.

## Keeping the graph fresh (automatic)

`.claude/settings.json` installs two hooks that call
`scripts/graphify_sync.sh`:

- **SessionStart** — installs graphify if missing and rebuilds the graph, so
  every session (including fresh cloud containers) starts up to date.
- **PostToolUse** (Write/Edit) — refreshes the graph right after files change,
  so it stays live as the project grows.

Manual refresh: `graphify update .` (code-only, no LLM key required).
To also semantically index the docs/markdown, set an LLM key (e.g.
`GEMINI_API_KEY` or `OPENAI_API_KEY`) and run `graphify . --update`.
