from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="Sustentar Diagnostic API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── CITIES ─────────────────────────────────────────────────────
@app.get("/api/cities")
def get_cities():
    res = supabase.table("cities").select("*").order("country, name").execute()
    # Group by country
    grouped = {}
    for city in res.data:
        country = city["country"]
        if country not in grouped:
            grouped[country] = []
        grouped[country].append(city["name"])
    return [{"country": k, "cities": v} for k, v in grouped.items()]


# ── QUESTIONS ──────────────────────────────────────────────────
@app.get("/api/questions")
def get_questions(lang: str = "es"):
    cats = supabase.table("categories").select("*").order("sort_order").execute()
    questions = supabase.table("questions").select("*").order("sort_order").execute()
    options = supabase.table("question_options").select("*").order("sort_order").execute()

    # Build options map
    opts_map = {}
    for opt in options.data:
        qid = opt["question_id"]
        if qid not in opts_map:
            opts_map[qid] = []
        opts_map[qid].append({
            "label": opt[f"label_{lang}"],
            "score": opt["score"]
        })

    # Build questions map by category
    qs_map = {}
    for q in questions.data:
        slug = q["category_slug"]
        if slug not in qs_map:
            qs_map[slug] = []
        qs_map[slug].append({
            "id": q["question_id"],
            "text": q[f"text_{lang}"],
            "options": opts_map.get(q["question_id"], [])
        })

    # Build categories
    result = []
    for cat in cats.data:
        result.append({
            "id": cat["slug"],
            "label": cat[f"label_{lang}"],
            "maxScore": cat["max_score"],
            "questions": qs_map.get(cat["slug"], [])
        })

    return result


# ── MEASURES ───────────────────────────────────────────────────
@app.get("/api/measures")
def get_measures(lang: str = "es"):
    groups = supabase.table("measure_groups").select("*").order("sort_order").execute()
    measures = supabase.table("measures").select("*").execute()

    measures_map = {}
    for m in measures.data:
        g = m["group_letter"]
        if g not in measures_map:
            measures_map[g] = []
        measures_map[g].append({
            "code": m["code"],
            "name": m[f"name_{lang}"],
            "desc": m[f"desc_{lang}"],
            "tipos": m[f"tipos_{lang}"],
            "horizonte": m[f"horizonte_{lang}"],
            "costo": m[f"costo_{lang}"],
            "ambito": m[f"ambito_{lang}"],
            "ecm": m[f"ecm_{lang}"],
            "diagCats": m["diag_cats"]
        })

    result = []
    for g in groups.data:
        result.append({
            "group": g["group_letter"],
            "label": g[f"label_{lang}"],
            "color": g["color"],
            "bg": g["bg"],
            "light": g["light"],
            "measures": measures_map.get(g["group_letter"], [])
        })

    return result


# ── OSM DATA ───────────────────────────────────────────────────
@app.get("/api/osm/{city_name}")
def get_osm_data(city_name: str):
    res = supabase.table("osm_demo_data").select("*").eq("city_name", city_name).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail=f"No OSM data for {city_name}")
    return res.data[0]


# ── SAVE DIAGNOSTIC ────────────────────────────────────────────
class DiagnosticPayload(BaseModel):
    city_name: str
    answers: dict
    scores: dict

@app.post("/api/diagnostics")
def save_diagnostic(payload: DiagnosticPayload):
    res = supabase.table("diagnostics").insert({
        "city_name": payload.city_name,
        "answers": payload.answers,
        "scores": payload.scores
    }).execute()
    return {"id": res.data[0]["id"], "message": "Diagnostic saved"}

class FeedbackPayload(BaseModel):
    city: Optional[str] = None
    name: Optional[str] = None
    message: str

@app.post("/api/feedback")
def submit_feedback(payload: FeedbackPayload):
    supabase.table("feedback").insert({
        "city": payload.city,
        "name": payload.name,
        "message": payload.message
    }).execute()
    return {"message": "Feedback received"}

@app.get("/api/health")
def health():
    return {"status": "ok"}
