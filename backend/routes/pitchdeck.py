from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import json
from routes.auth_utils import get_supabase
from supabase import Client
from routes.startup_utils import mark_step_completed

router = APIRouter()

class GenerateRequest(BaseModel):
    startup_id: str
    investor_type: str
    funding_amount: str
    current_stage: str
    traction: str

def get_missing_slide_fallback(number: int) -> dict:
    return {
        "number": number,
        "title": "Coming soon",
        "headline": "This slide could not be generated",
        "content": "Please regenerate the deck",
        "bullets": [],
        "speaker_note": ""
    }

@router.post("/api/pitchdeck/generate")
async def generate_pitchdeck(request: GenerateRequest, supabase: Client = Depends(get_supabase)):
    from agents.pitchdeck import build_pitchdeck_graph
    
    try:
        # Fetch all required context
        startup_resp = supabase.table("startups").select("*").eq("id", request.startup_id).execute()
        if not startup_resp.data:
            raise HTTPException(status_code=404, detail="Startup not found")
        startup = startup_resp.data[0]
        
        blueprint = startup.get("blueprint") or {}
        validation_score = startup.get("validation_score") or {}
        
        competitor_resp = supabase.table("competitor_analysis").select("*").eq("startup_id", request.startup_id).order("created_at", desc=True).limit(1).execute()
        competitor_analysis = competitor_resp.data[0] if competitor_resp.data else {}
        
        # Build initial state
        initial_state = {
            "startup_id": request.startup_id,
            "idea": startup.get("idea", ""),
            "stage": startup.get("stage", ""),
            "target_audience": startup.get("target_audience", ""),
            "problem_statement": startup.get("problem_statement", ""),
            "blueprint": blueprint,
            "validation_score": validation_score,
            "competitor_analysis": competitor_analysis,
            "investor_type": request.investor_type,
            "funding_amount": request.funding_amount,
            "current_stage": request.current_stage,
            "traction": request.traction,
            "slides": []
        }
        
        # Run graph
        graph = build_pitchdeck_graph()
        final_state = graph.invoke(initial_state)
        slides = final_state.get("slides", [])
        
        # Validate and fill missing slides
        valid_slides = []
        slide_map = {s.get("number"): s for s in slides if isinstance(s, dict) and s.get("number")}
        
        for i in range(1, 11):
            if i in slide_map:
                valid_slides.append(slide_map[i])
            else:
                valid_slides.append(get_missing_slide_fallback(i))
                
        # Save to database
        supabase.table("pitch_decks").delete().eq("startup_id", request.startup_id).execute()
        
        insert_data = {
            "startup_id": request.startup_id,
            "investor_type": request.investor_type,
            "funding_amount": request.funding_amount,
            "current_stage": request.current_stage,
            "traction": request.traction,
            "slides": valid_slides
        }
        
        supabase.table("pitch_decks").insert(insert_data).execute()
        
        mark_step_completed(supabase, request.startup_id, "pitchdeck")
        
        return insert_data
        
    except Exception as e:
        print(f"Error in generate_pitchdeck: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/pitchdeck/{startup_id}")
async def get_pitchdeck(startup_id: str, supabase: Client = Depends(get_supabase)):
    try:
        resp = supabase.table("pitch_decks").select("*").eq("startup_id", startup_id).order("created_at", desc=True).limit(1).execute()
        
        if resp.data and len(resp.data) > 0:
            return resp.data[0]
        else:
            return None
    except Exception as e:
        print(f"Error fetching pitch deck: {e}")
        raise HTTPException(status_code=500, detail=str(e))
