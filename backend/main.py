import os
import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv
import re

load_dotenv(override=True)

app = FastAPI(title="StartupOS API")

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "message": "StartupOS backend is running"
    }
# Register agent routes
from routes.agents import router as agents_router
from routes.debate import router as debate_router
from routes.simulation import router as simulation_router
from routes.memory import router as memory_router
from routes.share import router as share_router
from routes.chat import router as chat_router
from routes.competitor import router as competitor_router
from routes.pitchdeck import router as pitchdeck_router
from routes.startup import router as startup_router

app.include_router(agents_router)
app.include_router(debate_router)
app.include_router(simulation_router)
app.include_router(memory_router)
app.include_router(share_router)
app.include_router(chat_router)
app.include_router(competitor_router)
app.include_router(pitchdeck_router)
app.include_router(startup_router)



# Configure CORS
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
]

# Add production URL if set
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client | None = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    print("Warning: SUPABASE_URL or SUPABASE_KEY not found in environment variables.")

