from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import Optional
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
GEOAPIFY_KEY = os.environ.get("GEOAPIFY_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="Sustentar Diagnostic API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/spatial/{city_name}")
async def get_spatial_data(city_name: str):
    # 1. Check Supabase cache first
    cached = supabase.table("osm_cache").select("*").eq("city_name", city_name).execute()
    if cached.data:
        print(f"Cache hit for {city_name}")
        return cached.data[0]

    print(f"Cache miss for {city_name}, querying Geoapify...")

    async with httpx.AsyncClient(timeout=30.0) as client:
        # 2. Get city place_id
        geo_res = await client.get(
            "https://api.geoapify.com/v1/geocode/search",
            params={
                "text": city_name,
                "limit": 1,
                "apiKey": GEOAPIFY_KEY,
            }
        )
        geo_data = geo_res.json()

        if not geo_data.get("features"):
            raise HTTPException(status_code=404, detail=f"City not found: {city_name}")

        place_id = geo_data["features"][0]["properties"].get("place_id")
        if not place_id:
            raise HTTPException(status_code=404, detail=f"No place ID for: {city_name}")

        print(f"place_id: {place_id}")

        # 3. Query correct Geoapify categories
        # See: https://apidocs.geoapify.com/docs/places/#categories
        categories = {
            "cycleways":    "highway.cycleway",
            "bike_parking": "parking.bicycles",
            "bike_share":   "rental.bicycle",
            "pedestrian":   "highway.pedestrian",
            "bus_stops":    "public_transport.bus",
        }

        counts = {}
        for key, category in categories.items():
            res = await client.get(
                "https://api.geoapify.com/v2/places",
                params={
                    "categories": category,
                    "filter": f"place:{place_id}",
                    "limit": 500,
                    "apiKey": GEOAPIFY_KEY,
                }
            )
            data = res.json()
            if "error" in data or res.status_code != 200:
                raise HTTPException(status_code=502, detail=f"Geoapify error for {key}: {data.get('message', res.status_code)}")
            count = len(data.get("features", []))
            counts[key] = count
            print(f"{key} ({category}): {count}")

    # 4. Upsert to Supabase (handles duplicate key gracefully)
    row = {
        "city_name":    city_name,
        "cycleways":    counts["cycleways"],
        "bike_parking": counts["bike_parking"],
        "bike_share":   counts["bike_share"],
        "pedestrian":   counts["pedestrian"],
        "bus_stops":    counts["bus_stops"],
    }
    supabase.table("osm_cache").upsert(row, on_conflict="city_name").execute()
    return row


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
