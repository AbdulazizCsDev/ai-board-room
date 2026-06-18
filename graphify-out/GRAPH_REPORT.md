# Graph Report - ai-board-room  (2026-06-18)

## Corpus Check
- 32 files · ~19,182 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 220 nodes · 407 edges · 13 communities (11 shown, 2 thin omitted)
- Extraction: 82% EXTRACTED · 18% INFERRED · 0% AMBIGUOUS · INFERRED: 74 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7968f958`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 12|Community 12]]

## God Nodes (most connected - your core abstractions)
1. `AdvisorResponse` - 19 edges
2. `ChairmanVerdict` - 16 edges
3. `DiscoveryResult` - 16 edges
4. `IntakeResult` - 16 edges
5. `BoardResult` - 16 edges
6. `BaseAdvisor` - 15 edges
7. `run_board()` - 12 edges
8. `BoardRequest` - 10 edges
9. `AdvisorResponse` - 10 edges
10. `🪑 AI Board Room` - 10 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `run_board()`  [EXTRACTED]
  scripts/export_result.py → src/boardroom/board.py
- `TestCFO` --uses--> `BaseAdvisor`  [INFERRED]
  try_advisor.py → src/boardroom/base.py
- `DummyA` --uses--> `BaseAdvisor`  [INFERRED]
  try_registry.py → src/boardroom/base.py
- `DummyB` --uses--> `BaseAdvisor`  [INFERRED]
  try_registry.py → src/boardroom/base.py
- `AdvisorResponse` --uses--> `AdvisorResponse`  [INFERRED]
  src/boardroom/base.py → src/boardroom/schema.py

## Import Cycles
- 1-file cycle: `src/boardroom/advisors/__init__.py -> src/boardroom/advisors/__init__.py`

## Communities (13 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (30): AdvisorIcon(), ADVISORS, BOARD, buildLiveSession(), cannedSession(), deleteSaved(), deriveTensions(), downloadSession() (+22 more)

### Community 1 - "Community 1"
Cohesion: 0.16
Nodes (34): BaseModel, api_board(), BoardRequest, Run one round (advisors in parallel) and return all perspectives as JSON.      P, round_endpoint(), RoundRequest, RunRequest, verdict() (+26 more)

### Community 2 - "Community 2"
Cohesion: 0.10
Nodes (22): CFOAdvisor, CFO Advisor — example advisor for teammates to copy.  To build your own advisor:, Advisor roster — import every advisor module here so @register fires.  When a te, LegalAdvisor, Legal Advisor — Saudi Arabia legal perspective.  Original author: teammate (lega, MarketAdvisor, BaseAdvisor, BaseAdvisor (+14 more)

### Community 3 - "Community 3"
Cohesion: 0.13
Nodes (22): chairman_synthesize(), _context_block(), format_round_summary(), intake(), Render a round's perspectives as context for the next round / the chairman., Build the context block an advisor sees in round 2., Round 1 — every advisor gives an independent perspective, in parallel., Round 2 — every advisor responds to the others, in parallel. (+14 more)

### Community 4 - "Community 4"
Cohesion: 0.10
Nodes (20): dependencies, @fontsource/amiri, @fontsource/fraunces, @fontsource/ibm-plex-sans-arabic, @fontsource/inter, @fontsource/jetbrains-mono, react, react-dom (+12 more)

### Community 5 - "Community 5"
Cohesion: 0.15
Nodes (16): BaseSettings, onboard(), Accept company profile + PDFs, save to disk, rebuild RAG index., Configuration loaded once from the environment / .env file.  Anywhere you need a, Settings, _build_and_cache(), build_retriever(), _fingerprint() (+8 more)

### Community 6 - "Community 6"
Cohesion: 0.16
Nodes (11): board_run(), _build_context(), discover(), _format_profile(), intake_route(), FastAPI backend for AI Board Room.  Single-port app: serves the built React UI A, Run a board debate using the current session profile and RAG context., First read of the user's input: answer a question (and suggest a decision), (+3 more)

### Community 7 - "Community 7"
Cohesion: 0.18
Nodes (10): ➕ Add an advisor, 🪑 AI Board Room, 🔑 Configuration, 🧠 How it works, ⚠️ Notes, 📁 Project structure, 🚀 Run it locally, 🛠️ Tech stack (+2 more)

### Community 8 - "Community 8"
Cohesion: 0.40
Nodes (4): CLAUDE.md — AI Board Room, Keeping the graph fresh (automatic), Knowledge graph (graphify) — read this first, Project

## Knowledge Gaps
- **39 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+34 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BaseAdvisor` connect `Community 2` to `Community 1`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Why does `AdvisorResponse` connect `Community 1` to `Community 2`, `Community 3`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `run_board()` connect `Community 3` to `Community 1`, `Community 5`, `Community 6`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Are the 15 inferred relationships involving `AdvisorResponse` (e.g. with `BoardRequest` and `RoundRequest`) actually correct?**
  _`AdvisorResponse` has 15 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `ChairmanVerdict` (e.g. with `BoardRequest` and `RoundRequest`) actually correct?**
  _`ChairmanVerdict` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `DiscoveryResult` (e.g. with `BoardRequest` and `RoundRequest`) actually correct?**
  _`DiscoveryResult` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `IntakeResult` (e.g. with `BoardRequest` and `RoundRequest`) actually correct?**
  _`IntakeResult` has 13 INFERRED edges - model-reasoned connections that need verification._