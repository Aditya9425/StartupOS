from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from agents.debate import debate_workflow
from routes.auth_utils import get_supabase
from supabase import Client
from routes.startup_utils import mark_step_completed

router = APIRouter()

class EventTriggerRequest(BaseModel):
    startup_id: str
    event: str
    event_type: str


@router.post("/api/trigger-event")
async def trigger_event(request: EventTriggerRequest, supabase: Client = Depends(get_supabase)):
    """
    Run the 5-agent debate graph for a market event,
    save the result to Supabase, and return it.
    """
    # Fetch startup to get company name
    try:
        startup_resp = supabase.table("startups").select("name").eq("id", request.startup_id).execute()
        company_name = startup_resp.data[0]["name"] if startup_resp.data else "Unnamed Startup"
    except Exception:
        company_name = "Unnamed Startup"

    initial_state = {
        "startup_id": request.startup_id,
        "company_name": company_name,
        "event": request.event,
        "event_type": request.event_type,
        "marketing_argument": None,
        "finance_argument": None,
        "product_argument": None,
        "engineering_argument": None,
        "ceo_decision": None,
        "supabase_client": supabase, # Pass the authenticated supabase client!
    }

    try:
        result = debate_workflow.invoke(initial_state)

        # Save to Supabase
        db_record = {
            "startup_id": request.startup_id,
            "event": request.event,
            "event_type": request.event_type,
            "marketing_argument": result.get("marketing_argument"),
            "finance_argument": result.get("finance_argument"),
            "product_argument": result.get("product_argument"),
            "engineering_argument": result.get("engineering_argument"),
            "ceo_decision": result.get("ceo_decision"),
        }

        inserted_data = supabase.table("debates").insert(db_record).execute()
        if not inserted_data.data:
            raise HTTPException(status_code=500, detail="Failed to save debate")

        # Save to memory system
        from memory.store import MemoryStore
        memory_content = f"Event: {request.event}. Decision: {result.get('ceo_decision')}"
        MemoryStore.save_memory(
            startup_id=request.startup_id,
            memory_type="decision",
            content=memory_content,
            metadata={"event_type": request.event_type},
            supabase_client=supabase # Pass the authenticated client!
        )

        # Include memory stats in response
        response_data = inserted_data.data[0]
        response_data["relevant_memory_count"] = result.get("relevant_memory_count", 0)

        mark_step_completed(supabase, request.startup_id, "debate")

        return response_data

    except Exception as e:
        print(f"Error executing debate: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/debates/{startup_id}")
async def get_debates(startup_id: str, supabase: Client = Depends(get_supabase)):
    """Fetch past debates for a startup."""
    try:
        response = supabase.table("debates").select("*").eq("startup_id", startup_id).order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        print(f"Error fetching debates: {e}")
        raise HTTPException(status_code=500, detail=str(e))
