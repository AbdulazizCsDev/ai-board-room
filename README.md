# 🪑 AI Board Room

> Bring any business decision to a board of AI advisors. They listen, debate, and hand you one clear, well‑reasoned recommendation — grounded in your own documents.

**AI Board Room** turns a single question into a structured boardroom session. Three AI advisors — a **CFO**, a **Legal counsel** (Saudi law), and a **Market strategist** — each reason from their own lens, build on each other across two collaborative rounds, and a **Chairman** synthesizes everything into a final verdict. It reads your uploaded financials/PDFs (RAG) so the advice is about *your* numbers, and it works fully in **Arabic and English**.

<sub>Built with LangChain · FastAPI · React · FAISS · OpenAI.</sub>

---

## ✨ What makes it different

- **A panel, not a single answer.** Three distinct experts deliberate; you see *who* says *what* and *who replies to whom*.
- **Collaborative, not adversarial.** Advisors give a **perspective + conditions + recommendations** instead of a blunt for/against vote. A missing license is a *condition to satisfy*, never a veto. If a topic is outside an advisor's lens, they say so instead of forcing an opinion.
- **Smart intake.** Ask a **question** ("how much budget do I have?") and the Chairman answers it from your documents and proposes a decision. Pose a **decision** and it goes straight to the board — asking clarifying questions only when it's genuinely vague.
- **Grounded in your data.** Upload your company profile and PDFs; a FAISS/RAG layer feeds the relevant figures into the debate.
- **Made for watching.** The debate **auto‑plays** at reading pace on an interactive boardroom table — active speaker highlighted, a connector line to whoever they're answering, a numbered timeline you can click to replay any point. No button‑mashing.
- **Interject live.** Drop in extra context mid‑session and the Chairman takes it into account.
- **Bilingual.** Full Arabic/English with RTL — the board replies in the language you use.

---

## 🧠 How it works

```
Your input
   │
   ▼
Intake ── question? ──► Chairman answers from your docs + suggests a decision
   │
 decision
   ▼
Discovery (only if vague) ──► a few clarifying questions
   ▼
Round 1 · three advisors give independent perspectives   (in parallel)
   ▼
Round 2 · they respond to each other, build, and refine  (in parallel)
   ▼
Chairman · synthesizes → verdict (proceed / conditional / against)
            + confidence, conditions, conflicts, tension map, next steps
```

Every advisor returns the same contract (`perspective`, `conditions`, `recommendations`, `reasoning`, `relevant`, `responds_to`), so the board can run any number of advisors without knowing who they are.

---

## 🛠️ Tech stack

| Layer | Tech |
|---|---|
| Orchestration | **LangChain** (structured output via Pydantic) |
| LLM | **OpenAI** `gpt-4o-mini` (configurable) |
| Retrieval (RAG) | **FAISS** + OpenAI embeddings over uploaded PDFs |
| API | **FastAPI** + Uvicorn (SSE streaming per round) |
| UI | **React** + Vite, custom warm‑editorial theme, RTL‑aware |
| Packaging | One service: FastAPI serves the API **and** the built UI |

---

## 🚀 Run it locally

**Prerequisites:** Python 3.11+, Node 18+, and an OpenAI API key.

```bash
git clone https://github.com/AbdulazizCsDev/ai-board-room.git
cd ai-board-room

# 1) Backend deps + key
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # then put your OPENAI_API_KEY inside

# 2) Frontend deps
cd frontend && npm install && cd ..
```

**Option A — production style (one port):**
```bash
cd frontend && npm run build && cd ..
PYTHONPATH=src python -m uvicorn boardroom.api:app --port 8000
# open http://localhost:8000
```

**Option B — dev with hot reload (two ports):**
```bash
# terminal 1 — API
PYTHONPATH=src python -m uvicorn boardroom.api:app --reload --port 8000
# terminal 2 — UI (proxies /api → :8000)
cd frontend && npm run dev          # open http://localhost:5173
```

**CLI (no browser):**
```bash
PYTHONPATH=src python -m boardroom.main "Should we open a new branch in Jeddah?"
```

---

## 🔑 Configuration

| Variable | Default | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | — | **Required.** Your OpenAI key. |
| `OPENAI_MODEL` | `gpt-4o-mini` | Model for advisors and chairman. |

Local: put these in `.env`. Hosted: set them as environment variables (never commit `.env`).

---

## 📁 Project structure

```
.
├── Dockerfile · render.yaml          # one-service deploy
├── requirements.txt
├── src/boardroom/
│   ├── schema.py                     # shared data contract (Pydantic)
│   ├── base.py                       # BaseAdvisor — one lens per advisor
│   ├── advisors/                     # cfo.py · legal.py · market.py
│   ├── board.py                      # intake, rounds, chairman synthesis
│   ├── rag.py                        # FAISS retriever over documents/
│   ├── registry.py                   # advisor auto-discovery
│   └── api.py                        # FastAPI: API + serves the built UI
└── frontend/
    ├── onboarding.html               # company profile + document upload
    └── src/                          # React board UI (table, timeline, verdict)
```

## ➕ Add an advisor

1. Copy `src/boardroom/advisors/cfo.py` to a new file and change `name`, `persona`, `focus`.
2. Register it with one line in `src/boardroom/advisors/__init__.py`:
   ```python
   from . import legal
   ```
That's it — the chain, retrieval, schema, and UI pick it up automatically.

---

## ⚠️ Notes

- **In‑memory session** (profile + RAG) — great for a demo, but state resets on restart and is shared across visitors; add per‑session storage for multi‑user use.
- **Cost** — each question is ~7 LLM calls; with `gpt-4o-mini` that's roughly a fraction of a cent. Hosting can be free; API usage is not.

---

<div dir="rtl">

## نبذة بالعربية

**قاعة المجلس** يحوّل أي قرار تجاري إلى نقاش بين مجلس من ثلاثة مستشارين بالذكاء الاصطناعي — مالي، وقانوني، ومستشار سوق — كلٌّ بزاويته. يطرحون منظورات وشروطاً وتوصيات (بدل تصويت مع/ضد)، ويبنون على كلام بعض على جولتين، ثم يجمع الرئيس الآراء في قرار واضح (نفّذ / بشروط / لا تنفّذ). يقرأ مستنداتك (PDF) ليكون النقاش مبنياً على أرقامك، ويدعم العربية والإنجليزية بالكامل. النقاش يُعرض تلقائياً على طاولة مجلس تفاعلية مع خط زمني مرقّم وإمكانية المقاطعة بإضافة سياق.

</div>
