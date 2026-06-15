"""The three-round board debate orchestrator.

This is the engine. It runs whatever advisors are registered through
three rounds and assembles a BoardResult. Adding or removing an advisor
never requires touching this file.
"""

from __future__ import annotations

from langchain_core.prompts import ChatPromptTemplate

import boardroom.advisors  # triggers all @register decorators
from boardroom.llm import get_llm
from boardroom.registry import get_advisors
from boardroom.schema import (
    AdvisorResponse,
    BoardResult,
    ChairmanVerdict,
)


def _format_round1(responses: list[AdvisorResponse]) -> str:
    """Format round 1 positions for the round 2 prompt."""
    lines = []
    for r in responses:
        lines.append(f"[{r.advisor}] Vote: {r.vote.value}\n{r.reasoning}")
    return "\n\n".join(lines)


def run_board(decision: str, context: str = "") -> BoardResult:
    """Run a full three-round board meeting on a business decision."""

    advisors = get_advisors()
    if not advisors:
        raise RuntimeError(
            "No advisors registered. Add at least one to advisors/__init__.py"
        )

    # ── Round 1: independent analysis ───────────────────────────────────
    print(f"\n[Round 1] {len(advisors)} advisors analyzing independently...")
    round1: list[AdvisorResponse] = []
    for advisor in advisors:
        print(f"  → {advisor.name} thinking...")
        round1.append(advisor.analyze(decision, context))

    # ── Round 2: debate (each advisor reads the others) ──────────────────
    print("\n[Round 2] Advisors reading each other and responding...")
    others_summary = _format_round1(round1)
    round2: list[AdvisorResponse] = []
    for advisor in advisors:
        print(f"  → {advisor.name} responding...")
        debate_context = (
            f"Other advisors have weighed in:\n\n{others_summary}\n\n"
            f"Company context:\n{context or 'None provided.'}"
        )
        round2.append(advisor.analyze(decision, context=debate_context))

    # ── Round 3: chairman synthesis ──────────────────────────────────────
    print("\n[Round 3] Chairman synthesizing...")
    verdict = _chairman_synthesize(decision, round1, round2)

    return BoardResult(
        decision=decision,
        round1_analyses=round1,
        round2_rebuttals=round2,
        verdict=verdict,
    )


def _chairman_synthesize(
    decision: str,
    round1: list[AdvisorResponse],
    round2: list[AdvisorResponse],
) -> ChairmanVerdict:
    """The chairman reads all arguments and produces a final verdict."""

    all_arguments = "\n\n".join(
        [f"[{r.advisor} — Round 1] {r.reasoning}" for r in round1]
        + [f"[{r.advisor} — Round 2] {r.reasoning}" for r in round2]
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system",
         "You are the Chairman of the board. You have heard all advisors argue "
         "their positions across two rounds of debate. Your job is to weigh every "
         "argument, identify where they conflict, and produce a clear, actionable "
         "recommendation. Be decisive — a neutral 'it depends' is not acceptable."),
        ("human",
         "Business decision:\n{decision}\n\n"
         "Board arguments:\n{arguments}\n\n"
         "Produce your final verdict."),
    ])

    llm = get_llm(temperature=0.3)  # lower temp — chairman should be decisive
    chain = prompt | llm.with_structured_output(ChairmanVerdict)

    return chain.invoke({
        "decision": decision,
        "arguments": all_arguments,
    })
