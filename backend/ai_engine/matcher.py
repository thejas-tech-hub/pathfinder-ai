"""
AI Semantic Matcher - Local NLP with sentence-transformers
CRS Formula:
  Semantic Skill Match  → 50%
  Project Relevance     → 30%
  Resume Completeness   → 20%
Uses: all-MiniLM-L6-v2 (local, no external API calls)
"""
from typing import Dict, List, Optional
import re
import math
import uuid
import hashlib
import numpy as np

# ── Lazy-load model to avoid slow startup ────────────────────────────────────
_model = None

def get_model():
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer("all-MiniLM-L6-v2")
            print("✅ Loaded sentence-transformers model: all-MiniLM-L6-v2")
        except Exception as e:
            print(f"⚠️  Could not load sentence-transformers: {e}. Using fallback similarity.")
            _model = "FALLBACK"
    return _model


def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Pure-python cosine similarity (fallback)."""
    dot = sum(a * b for a, b in zip(vec1, vec2))
    mag1 = math.sqrt(sum(a * a for a in vec1))
    mag2 = math.sqrt(sum(b * b for b in vec2))
    if mag1 == 0 or mag2 == 0:
        return 0.0
    return dot / (mag1 * mag2)


def embed_texts(texts: List[str]) -> List[List[float]]:
    """Generate embeddings; fall back to keyword-overlap if model unavailable."""
    model = get_model()
    if model == "FALLBACK":
        return _fallback_embeddings(texts)
    try:
        embeddings = model.encode(texts, convert_to_numpy=True)
        return embeddings.tolist()
    except Exception:
        return _fallback_embeddings(texts)


def _fallback_embeddings(texts: List[str]) -> List[List[float]]:
    """
    Stable hash-based bag-of-words fallback embeddings.
    Returns fixed 300-dim vectors so they can be indexed and queried later.
    """
    dim = 300
    vecs = []
    for text in texts:
        tokens = re.findall(r"\b\w+\b", text.lower())
        vec = [0.0] * dim
        for t in tokens:
            token_hash = int(hashlib.sha1(t.encode("utf-8")).hexdigest(), 16)
            vec[token_hash % dim] += 1.0
        # L2 normalize
        norm = math.sqrt(sum(x * x for x in vec)) or 1.0
        vecs.append([x / norm for x in vec])
    return vecs


def _l2_normalize(vectors: np.ndarray) -> np.ndarray:
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    return vectors / norms


class SemanticVectorIndex:
    """Vector index abstraction over FAISS/Chroma with a pure-python fallback."""

    def __init__(self, dim: int, backend: str = "auto"):
        self.dim = dim
        self.backend = "python"
        self.texts: List[str] = []
        self.metadatas: List[Dict] = []
        self._vectors: List[np.ndarray] = []
        self._faiss_index = None
        self._chroma_collection = None

        backend = (backend or "auto").lower()
        if backend in ("auto", "faiss"):
            try:
                import faiss  # type: ignore
                self._faiss_index = faiss.IndexFlatIP(dim)
                self.backend = "faiss"
                return
            except Exception:
                pass

        if backend in ("auto", "chromadb", "chroma"):
            try:
                import chromadb  # type: ignore
                client = chromadb.Client()
                name = f"matcher_{uuid.uuid4().hex[:8]}"
                self._chroma_collection = client.create_collection(
                    name=name,
                    metadata={"hnsw:space": "cosine"},
                )
                self.backend = "chroma"
                return
            except Exception:
                pass

    def add(self, texts: List[str], vectors: np.ndarray, metadatas: Optional[List[Dict]] = None) -> None:
        if not texts:
            return

        vectors = vectors.astype("float32")
        vectors = _l2_normalize(vectors)
        metadatas = metadatas or [{} for _ in texts]

        if self.backend == "faiss" and self._faiss_index is not None:
            self._faiss_index.add(vectors)
            self.texts.extend(texts)
            self.metadatas.extend(metadatas)
            return

        if self.backend == "chroma" and self._chroma_collection is not None:
            ids = [str(uuid.uuid4()) for _ in texts]
            self._chroma_collection.add(
                ids=ids,
                embeddings=vectors.tolist(),
                documents=texts,
                metadatas=metadatas,
            )
            return

        self.texts.extend(texts)
        self.metadatas.extend(metadatas)
        self._vectors.extend(vectors)

    def query(self, query_vector: np.ndarray, top_k: int = 3) -> List[Dict]:
        if top_k <= 0:
            return []

        query_vector = query_vector.astype("float32").reshape(1, -1)
        query_vector = _l2_normalize(query_vector)

        if self.backend == "faiss" and self._faiss_index is not None and self._faiss_index.ntotal > 0:
            top_k = min(top_k, self._faiss_index.ntotal)
            distances, indices = self._faiss_index.search(query_vector, top_k)
            results = []
            for score, idx in zip(distances[0], indices[0]):
                if idx < 0:
                    continue
                results.append({
                    "text": self.texts[idx],
                    "metadata": self.metadatas[idx] if idx < len(self.metadatas) else {},
                    "score": float(score),
                })
            return results

        if self.backend == "chroma" and self._chroma_collection is not None:
            result = self._chroma_collection.query(
                query_embeddings=query_vector.tolist(),
                n_results=top_k,
                include=["documents", "metadatas", "distances"],
            )
            docs = result.get("documents", [[]])[0]
            metas = result.get("metadatas", [[]])[0]
            dists = result.get("distances", [[]])[0]
            rows = []
            for doc, meta, dist in zip(docs, metas, dists):
                cosine_similarity_score = 1.0 - float(dist)
                rows.append({
                    "text": doc,
                    "metadata": meta or {},
                    "score": cosine_similarity_score,
                })
            return rows

        if not self._vectors:
            return []

        matrix = np.vstack(self._vectors).astype("float32")
        sims = matrix @ query_vector[0]
        best_indices = np.argsort(-sims)[: min(top_k, len(sims))]
        return [{
            "text": self.texts[i],
            "metadata": self.metadatas[i] if i < len(self.metadatas) else {},
            "score": float(sims[i]),
        } for i in best_indices]


def build_vector_index(texts: List[str], metadatas: Optional[List[Dict]] = None, backend: str = "auto") -> SemanticVectorIndex:
    """Build a vector index from text documents and store embeddings."""
    if not texts:
        return SemanticVectorIndex(dim=384, backend=backend)
    vectors = np.array(embed_texts(texts), dtype="float32")
    index = SemanticVectorIndex(dim=vectors.shape[1], backend=backend)
    index.add(texts, vectors, metadatas=metadatas)
    return index


def query_similar_texts(index: SemanticVectorIndex, query_text: str, top_k: int = 3) -> List[Dict]:
    """Query top-k most similar indexed texts for a query text."""
    query_vector = np.array(embed_texts([query_text])[0], dtype="float32")
    return index.query(query_vector, top_k=top_k)


def extract_skills_from_text(text: str) -> List[str]:
    """Extract skill keywords from resume or JD text."""
    # Tech skills dictionary for matching
    KNOWN_SKILLS = {
        "python", "java", "javascript", "typescript", "golang", "go", "c++", "c#",
        "react", "vue", "angular", "next.js", "node.js", "express", "django", "flask",
        "fastapi", "spring", "spring boot", "hibernate", "laravel", "php",
        "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch", "kafka",
        "docker", "kubernetes", "aws", "azure", "gcp", "terraform", "jenkins", "ci/cd",
        "machine learning", "deep learning", "nlp", "computer vision", "pytorch", "tensorflow",
        "pandas", "numpy", "scikit-learn", "transformers", "hugging face",
        "rest api", "graphql", "grpc", "microservices", "system design",
        "data structures", "algorithms", "oop", "devops", "agile", "scrum",
        "power bi", "tableau", "data analysis", "statistics",
        "android", "kotlin", "ios", "swift", "react native", "flutter",
        "cybersecurity", "ethical hacking", "network security",
        "html", "css", "bootstrap", "tailwind",
        "git", "linux", "bash", "shell scripting",
        "socket.io", "websocket", "redis", "celery",
        "embedded c", "rtos", "arduino", "raspberry pi", "iot", "vlsi", "verilog", "matlab",
    }
    text_lower = text.lower()
    found = []
    for skill in KNOWN_SKILLS:
        if skill in text_lower:
            found.append(skill.title())
    return list(set(found))


def compute_semantic_similarity(text1: str, text2: str) -> float:
    """Compute semantic similarity by indexing text2 and querying with text1."""
    index = build_vector_index([text2], metadatas=[{"kind": "target"}], backend="auto")
    result = query_similar_texts(index, text1, top_k=1)
    if not result:
        return 0.0
    return max(0.0, min(1.0, float(result[0]["score"])))


def compute_project_relevance(projects: List[str], jd_text: str) -> float:
    """Score how relevant student projects are to the JD."""
    if not projects:
        return 0.3  # some base score if no projects listed
    project_text = " ".join(projects)
    sim = compute_semantic_similarity(project_text, jd_text)
    # Scale: 0.3–1.0 → normalize to 0–100
    normalized = min(1.0, max(0.0, (sim - 0.1) / 0.7))
    return normalized


def compute_completeness_score(student: Dict) -> float:
    """
    Score resume completeness:
    - Has skills listed    → 30 pts
    - Has projects         → 30 pts
    - Has certifications   → 20 pts
    - Has phone/contact    → 10 pts
    - Has resume text      → 10 pts
    """
    score = 0
    if student.get("skills") and len(student["skills"]) >= 3:
        score += 30
    elif student.get("skills"):
        score += 15
    if student.get("projects") and len(student["projects"]) >= 1:
        score += 30
    if student.get("certifications") and len(student["certifications"]) >= 1:
        score += 20
    if student.get("phone"):
        score += 10
    if student.get("resume_text") and len(student["resume_text"]) > 100:
        score += 10
    return score / 100.0


def compute_crs(student: Dict, drive: Dict) -> Dict:
    """
    Compute Career Readiness Score (CRS).

    CRS = (Semantic Skill Match × 0.5) + (Project Relevance × 0.3) + (Resume Completeness × 0.2)
    All components normalized to 0–100. Final CRS is 0–100.
    """
    student_skills = student.get("skills", [])
    drive_skills = drive.get("required_skills", [])
    jd_text = drive.get("jd_text", " ".join(drive_skills))
    student_resume = student.get("resume_text", " ".join(student_skills + student.get("projects", [])))

    # ── Component 1: Semantic Skill Match (50%) ───────────────────────────────
    skill_sim = compute_semantic_similarity(student_resume, jd_text)
    semantic_score = min(100.0, skill_sim * 150)  # scale up for better discrimination

    # Identify matched and missing skills
    student_skills_lower = [s.lower() for s in student_skills]
    matched_skills = [s for s in drive_skills if s.lower() in student_skills_lower or
                     any(s.lower() in sk.lower() or sk.lower() in s.lower() for sk in student_skills_lower)]
    missing_skills = [s for s in drive_skills if s not in matched_skills]

    # Boost score if direct skill matches found
    if drive_skills:
        direct_match_ratio = len(matched_skills) / len(drive_skills)
        semantic_score = max(semantic_score, direct_match_ratio * 100)

    # ── Component 2: Project Relevance (30%) ──────────────────────────────────
    project_relevance = compute_project_relevance(student.get("projects", []), jd_text)
    project_score = project_relevance * 100

    # ── Component 3: Resume Completeness (20%) ────────────────────────────────
    completeness = compute_completeness_score(student)
    completeness_score = completeness * 100

    # ── Final CRS ─────────────────────────────────────────────────────────────
    crs = (semantic_score * 0.5) + (project_score * 0.3) + (completeness_score * 0.2)
    crs = round(min(100.0, max(0.0, crs)), 1)

    return {
        "crs_score": crs,
        "semantic_score": round(semantic_score, 1),
        "project_score": round(project_score, 1),
        "completeness_score": round(completeness_score, 1),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "improvement_suggestions": generate_suggestions(missing_skills, crs),
    }


def generate_suggestions(missing_skills: List[str], crs: float) -> List[str]:
    """Generate career improvement suggestions based on gaps."""
    suggestions = []
    if missing_skills:
        suggestions.append(f"📚 Learn missing skills: {', '.join(missing_skills[:3])}")
    if crs < 50:
        suggestions.append("🔨 Build 2–3 real-world projects to improve project relevance score")
        suggestions.append("📝 Complete relevant online certifications on Coursera or Udemy")
    elif crs < 75:
        suggestions.append("⬆️ Strengthen your portfolio with more domain-specific projects")
        suggestions.append("🏆 Consider getting an industry-recognized certification")
    else:
        suggestions.append("✅ Strong profile! Focus on competitive programming to stand out")
        suggestions.append("🌟 Contribute to open-source to boost visibility")
    return suggestions
