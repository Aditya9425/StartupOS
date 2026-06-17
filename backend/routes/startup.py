from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import uuid
import re
from supabase import Client
from routes.auth_utils import get_supabase
from utils.validate_idea import validate_idea

router = APIRouter()

class StartupCreateRequest(BaseModel):
    idea: str
    stage: str | None = None
    challenges: list[str] | None = None
    target_audience: str | None = None
    problem_statement: str | None = None

def generate_startup_name(idea: str) -> str:
    # Take first 2 words and capitalize them
    words = re.findall(r'\b\w+\b', idea)
    if not words:
        return "Unknown AI"
    first_words = words[:2]
    name = " ".join(first_words).capitalize()
    return f"{name} AI"

@router.post("/api/create-startup")
async def create_startup(request: StartupCreateRequest, supabase: Client = Depends(get_supabase)):
    try:
        validation = validate_idea(request.idea)
        if not validation.get("is_valid"):
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "invalid_idea", 
                    "message": validation.get("reason", "Invalid idea")
                }
            )
            
        startup_name = generate_startup_name(request.idea)
        new_id = str(uuid.uuid4())
        
        # Save auth_user_id (extracted from JWT via dependency) with startup record
        response = supabase.table("startups").insert({
            "id": new_id,
            "name": startup_name,
            "idea": request.idea,
            "user_id": "default_user", # Keep existing column for backward compatibility
            "auth_user_id": supabase.auth_user_id,
            "status": "created",
            "stage": request.stage,
            "challenges": request.challenges,
            "target_audience": request.target_audience,
            "problem_statement": request.problem_statement
        }).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to create startup")
            
        inserted_row = response.data[0]
        
        return {
            "startup_id": inserted_row["id"],
            "name": inserted_row["name"],
            "status": inserted_row["status"]
        }
        
    except Exception as e:
        print(f"Error creating startup: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/startup/my-startups")
async def get_my_startups(supabase: Client = Depends(get_supabase)):
    """Fetch startups strictly owned by the authenticated user."""
    try:
        user_id = getattr(supabase, "auth_user_id", None)
        if not user_id:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        response = supabase.table("startups").select("*").eq("auth_user_id", user_id).order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        print(f"Error fetching user startups: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/startup/{startup_id}")
async def get_startup(startup_id: str, supabase: Client = Depends(get_supabase)):
    try:
        response = supabase.table("startups").select("*").eq("id", startup_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Startup not found")
            
        return response.data[0]
    except Exception as e:
        print(f"Error fetching startup: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/startups")
async def get_startups(supabase: Client = Depends(get_supabase)):
    """Fetch all startups accessible to the authenticated user."""
    try:
        # RLS will automatically restrict this to user-owned startups (and auth_user_id IS NULL)
        response = supabase.table("startups").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        print(f"Error fetching startups list: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class ValidateIdeaRequest(BaseModel):
    idea: str

@router.post("/api/startup/validate-idea")
async def validate_idea_endpoint(request: ValidateIdeaRequest):
    validation = validate_idea(request.idea)
    return validation

class CompleteStepRequest(BaseModel):
    step: str

@router.patch("/api/startup/{startup_id}/complete-step")
async def complete_step(startup_id: str, request: CompleteStepRequest, supabase: Client = Depends(get_supabase)):
    valid_steps = {"blueprint", "competitors", "debate", "pitchdeck", "shared"}
    if request.step not in valid_steps:
        raise HTTPException(status_code=400, detail="Invalid step")
        
    try:
        # Fetch current steps
        result = supabase.table("startups").select("completed_steps").eq("id", startup_id).single().execute()
        current_steps = result.data.get("completed_steps", []) or []
        
        # Add new step if not already there
        if request.step not in current_steps:
            current_steps.append(request.step)
            
            # Save back
            supabase.table("startups").update({"completed_steps": current_steps}).eq("id", startup_id).execute()
            
        return {"completed_steps": current_steps}
    except Exception as e:
        print(f"Error updating completed_steps: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/api/startup/{startup_id}")
async def delete_startup(startup_id: str, supabase: Client = Depends(get_supabase)):
    try:
        user_id = getattr(supabase, "auth_user_id", None)
        if not user_id:
            raise HTTPException(status_code=401, detail="Not authenticated")
            
        # Verify ownership
        result = supabase.table("startups").select("auth_user_id").eq("id", startup_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="Startup not found")
            
        if result.data[0].get("auth_user_id") != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
            
        # Delete sequentially
        tables = [
            "memories",
            "conversations",
            "debates",
            "competitor_analysis",
            "pitch_decks",
            "pitch_feedback",
            "metrics",
            "events",
            "simulation_events_pool",
            "shared_blueprints"
        ]
        
        for table in tables:
            try:
                supabase.table(table).delete().eq("startup_id", startup_id).execute()
            except Exception as e:
                print(f"Skipping or failed to delete from {table}: {e}")
                
        # Finally delete startup
        try:
            supabase.table("startups").delete().eq("id", startup_id).execute()
        except Exception as e:
            print(f"Failed to delete from startups table: {e}")
            
        return {
            "deleted": True,
            "startup_id": startup_id,
            "message": "Startup and all data deleted"
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error deleting startup: {e}")
        raise HTTPException(status_code=500, detail=str(e))
