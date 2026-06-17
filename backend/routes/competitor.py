from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import json
from routes.auth_utils import get_supabase
from supabase import Client
from routes.startup_utils import mark_step_completed

router = APIRouter()

class AnalyzeRequest(BaseModel):
    startup_id: str

@router.post("/api/competitor/analyze")
async def analyze_competitors(request: AnalyzeRequest, supabase: Client = Depends(get_supabase)):
    from agents.competitor import build_competitor_graph
    
    try:
        # Fetch startup context
        startup_resp = supabase.table("startups").select("*").eq("id", request.startup_id).execute()
        if not startup_resp.data:
            raise HTTPException(status_code=404, detail="Startup not found")
        startup = startup_resp.data[0]
        
        # Build initial state
        initial_state = {
            "startup_id": request.startup_id,
            "idea": startup.get("idea", ""),
            "target_audience": startup.get("target_audience", ""),
            "problem_statement": startup.get("problem_statement", ""),
            "stage": startup.get("stage", ""),
            "competitors": [],
            "indian_competitors": [],
            "global_competitors": [],
            "market_gaps": [],
            "india_market_gaps": [],
            "global_learnings": [],
            "competitive_advantage": "",
            "threat_level": "",
            "threat_reasoning": "",
            "moat": "",
            "india_moat": "",
            "strategy": ""
        }
        
        # Run graph
        graph = build_competitor_graph()
        final_state = graph.invoke(initial_state)
        
        # Combine for backward compatibility
        combined_competitors = (final_state.get("indian_competitors") or []) + (final_state.get("global_competitors") or [])
        
        # Save to database (upsert via delete then insert)
        supabase.table("competitor_analysis").delete().eq("startup_id", request.startup_id).execute()
        
        insert_data = {
            "startup_id": request.startup_id,
            "competitors": combined_competitors,
            "indian_competitors": final_state.get("indian_competitors") or [],
            "global_competitors": final_state.get("global_competitors") or [],
            "market_gaps": final_state.get("market_gaps") or [],
            "india_market_gaps": final_state.get("india_market_gaps") or [],
            "global_learnings": final_state.get("global_learnings") or [],
            "competitive_advantage": final_state.get("competitive_advantage") or "",
            "threat_level": final_state.get("threat_level") or "",
            "threat_reasoning": final_state.get("threat_reasoning") or "",
            "moat": final_state.get("moat") or "",
            "india_moat": final_state.get("india_moat") or "",
            "strategy": final_state.get("strategy") or ""
        }
        
        supabase.table("competitor_analysis").insert(insert_data).execute()
        
        mark_step_completed(supabase, request.startup_id, "competitors")
        
        return insert_data
        
    except Exception as e:
        print(f"Error in analyze_competitors: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/competitor/{startup_id}")
async def get_competitor_analysis(startup_id: str, supabase: Client = Depends(get_supabase)):
    try:
        resp = supabase.table("competitor_analysis").select("*").eq("startup_id", startup_id).order("created_at", desc=True).limit(1).execute()
        
        if resp.data and len(resp.data) > 0:
            return resp.data[0]
        else:
            return None
    except Exception as e:
        print(f"Error fetching competitor analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))
