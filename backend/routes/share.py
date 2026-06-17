import uuid
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from routes.auth_utils import get_supabase
from supabase import Client
from routes.startup_utils import mark_step_completed

router = APIRouter()

@router.post("/api/share/{startup_id}")
async def create_share_link(startup_id: str, supabase: Client = Depends(get_supabase)):
    """
    Generates a shareable token for a startup blueprint.
    Idempotent: returns existing token if already shared.
    """
    try:
        # Check if already shared
        existing = supabase.table("shared_blueprints").select("share_token, view_count").eq("startup_id", startup_id).execute()
        if existing.data and len(existing.data) > 0:
            return {
                "share_token": existing.data[0]["share_token"],
                "view_count": existing.data[0]["view_count"]
            }

        # Create new share token
        share_token = str(uuid.uuid4())
        response = supabase.table("shared_blueprints").insert({
            "startup_id": startup_id,
            "share_token": share_token
        }).execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create share link")

        mark_step_completed(supabase, startup_id, "shared")

        return {
            "share_token": share_token,
            "view_count": 0
        }

    except Exception as e:
        print(f"Error creating share link: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/share/view/{share_token}")
async def view_shared_blueprint(share_token: str):
    """
    Fetches the startup data for a given public share token and increments view count.
    Uses the global unauthenticated client because this is a public endpoint.
    """
    from main import supabase

    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")

    try:
        # Get share record
        share_resp = supabase.table("shared_blueprints").select("*").eq("share_token", share_token).execute()
        if not share_resp.data:
            raise HTTPException(status_code=404, detail="Shared blueprint not found")
        
        share_record = share_resp.data[0]
        startup_id = share_record["startup_id"]
        current_views = share_record["view_count"]

        # Increment view count
        new_views = current_views + 1
        supabase.table("shared_blueprints").update({"view_count": new_views}).eq("id", share_record["id"]).execute()

        # Get startup data (this will succeed publically because of public RLS policy or bypass)
        startup_resp = supabase.table("startups").select("*").eq("id", startup_id).execute()
        if not startup_resp.data:
            raise HTTPException(status_code=404, detail="Startup not found")

        startup_data = startup_resp.data[0]
        
        # Don't expose user_id or internal ids in public view
        return {
            "startup_name": startup_data.get("name"),
            "idea": startup_data.get("idea"),
            "stage": startup_data.get("stage"),
            "challenges": startup_data.get("challenges"),
            "target_audience": startup_data.get("target_audience"),
            "problem_statement": startup_data.get("problem_statement"),
            "blueprint": startup_data.get("blueprint"),
            "validation_score": startup_data.get("validation_score"),
            "view_count": new_views,
            "created_at": startup_data.get("created_at"),
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error viewing shared blueprint: {e}")
        raise HTTPException(status_code=500, detail=str(e))
