# ── Stage 1: build the React frontend ──────────────────────────────────────
FROM node:20-slim AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build          # → /app/frontend/dist

# ── Stage 2: Python runtime that serves API + built UI ──────────────────────
FROM python:3.11-slim
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONIOENCODING=utf-8 \
    PYTHONPATH=/app/src

# libgomp1 is needed by faiss-cpu
RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Backend source + onboarding page + docs folder for RAG uploads
COPY src/ ./src/
COPY frontend/onboarding.html ./frontend/onboarding.html
COPY documents/ ./documents/

# Built frontend from stage 1
COPY --from=frontend /app/frontend/dist ./frontend/dist

EXPOSE 8000
# Managed hosts inject $PORT; default to 8000 locally. Shell form expands it.
CMD uvicorn boardroom.api:app --host 0.0.0.0 --port ${PORT:-8000}
