"""RAG layer — builds a FAISS retriever from PDFs in the documents/ folder.

Usage (called once by board.py):
    from boardroom.rag import build_retriever
    retriever = build_retriever()          # returns None if no docs found
    advisor = CFOAdvisor(retriever=retriever)
"""

from __future__ import annotations

from pathlib import Path

from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

from .config import settings

DOCUMENTS_DIR = Path(__file__).resolve().parents[2] / "documents"

_CHUNK_SIZE = 1000
_CHUNK_OVERLAP = 150
_TOP_K = 4


def build_retriever(documents_dir: Path = DOCUMENTS_DIR, k: int = _TOP_K):
    """Load every PDF in documents_dir, embed, and return a FAISS retriever.

    Returns None if the folder is empty or contains no PDFs — advisors fall
    back to their 'no documents' placeholder in that case.
    """
    pdf_paths = sorted(documents_dir.glob("*.pdf"))
    if not pdf_paths:
        print(f"[RAG] No PDFs found in {documents_dir}. Advisors will run without context.")
        return None

    print(f"[RAG] Loading {len(pdf_paths)} PDF(s)...")
    docs = []
    for path in pdf_paths:
        loader = PyPDFLoader(str(path))
        docs.extend(loader.load())

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=_CHUNK_SIZE,
        chunk_overlap=_CHUNK_OVERLAP,
    )
    chunks = splitter.split_documents(docs)
    print(f"[RAG] {len(docs)} pages → {len(chunks)} chunks")

    embeddings = OpenAIEmbeddings(api_key=settings.openai_api_key or None)
    vectorstore = FAISS.from_documents(chunks, embeddings)

    print("[RAG] Vector store ready.")
    return vectorstore.as_retriever(search_kwargs={"k": k})
