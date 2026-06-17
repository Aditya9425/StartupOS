from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from routes.auth_utils import get_supabase
from supabase import Client

router = APIRouter()

class MemorySearchRequest(BaseModel):
    startup_id: str
    query: str


@router.get("/api/memory/{startup_id}")
async def get_memories(startup_id: str, supabase: Client = Depends(get_supabase)):
    """Return all memories for a startup, newest first."""
    try:
        response = (
            supabase.table("memories")
            .select("id, memory_type, content, metadata, created_at")
            .eq("startup_id", startup_id)
            .order("created_at", desc=True)
            .execute()
        )
        return response.data or []
    except Exception as e:
        print(f"Error fetching memories: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/memory/search")
async def search_memories(request: MemorySearchRequest, supabase: Client = Depends(get_supabase)):
    """Search past memories using vector similarity."""
    from memory.store import MemoryStore
    
    try:
        results = MemoryStore.search_memories(
            request.startup_id, 
            request.query, 
            limit=5,
            supabase_client=supabase
        )
        return results
    except Exception as e:
        print(f"Error searching memories: {e}")
        raise HTTPException(status_code=500, detail=str(e))
