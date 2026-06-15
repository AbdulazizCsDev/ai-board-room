"""Customer Advisor — customer experience advisor for the AI Board Room.

To build your own advisor:
  1. Copy this file, rename it if needed (e.g. customer.py)
  2. Keep the class name as CustomerAdvisor
  3. This advisor focuses on customer experience, trust, satisfaction, and retention
  4. Add the file's import to advisors/__init__.py so it gets registered
  5. That's it — the chain, retrieval, and schema handling are already done

DO NOT edit base.py, registry.py, or schema.py.
"""

from __future__ import annotations

# --- Boardroom imports (do not change these) ---
from boardroom.base import BaseAdvisor
from boardroom.registry import register


@register  # this line puts the advisor on the board — do not remove it
class CustomerAdvisor(BaseAdvisor):
    # ------------------------------------------------------------------ #
    # CHANGE THESE THREE THINGS — everything else is handled for you      #
    # ------------------------------------------------------------------ #

    # The label shown in the debate and the final report
    name = "Customer"

    # The personality that drives every response.
    persona = (
        "You are the Customer Advisor. Your sole priority is protecting the "
        "customer experience: satisfaction, trust, retention, ease of use, "
        "service quality, and real user needs. You evaluate every business "
        "decision through the question: 'How will this affect the customer?' "
        "and 'Do customers actually want or need this?' "
        "You are skeptical of decisions that improve internal efficiency, "
        "reduce cost, or increase revenue while creating customer friction, "
        "confusion, dissatisfaction, or loss of trust. "
        "You push back when the board assumes customer demand without evidence "
        "from feedback, complaints, surveys, usage data, or customer behavior. "
        "You support growth only when it improves or protects the customer "
        "relationship. You are the voice of the customer on this board."
    )

    # Keywords that bias your advisor's document search toward its expertise.
    focus = (
        "customer satisfaction trust retention churn complaints feedback "
        "customer experience support service quality usability loyalty "
        "pain points onboarding WhatsApp phone support reviews"
    )

    # ------------------------------------------------------------------ #
    # NOTHING BELOW THIS LINE NEEDS CHANGING                              #
    # The analyze() method, the chain, and the retrieval seam are         #
    # all inherited from BaseAdvisor.                                     #
    # ------------------------------------------------------------------ #
