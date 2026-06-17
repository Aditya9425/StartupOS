import json
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from simulation.events import get_random_event
from routes.auth_utils import get_supabase
from supabase import Client

router = APIRouter()


class SimulationStartRequest(BaseModel):
    startup_id: str


class SimulationTickRequest(BaseModel):
    startup_id: str


@router.post("/api/simulation/start")
async def start_simulation(request: SimulationStartRequest, supabase: Client = Depends(get_supabase)):
    """Initialize metrics for a startup simulation."""
    startup_resp = supabase.table("startups").select("stage").eq("id", request.startup_id).execute()
    stage = startup_resp.data[0]["stage"] if startup_resp.data else None

    if stage == "Building MVP":
        revenue = 5000
        users = 25
        burn_rate = 40000
        market_share = 0.1
    elif stage == "Already launched":
        revenue = 30000
        users = 150
        burn_rate = 60000
        market_share = 0.5
    else:  # "Just an idea" or None
        revenue = 0
        users = 0
        burn_rate = 15000
        market_share = 0.0

    initial_metrics = {
        "startup_id": request.startup_id,
        "revenue": revenue,
        "users": users,
        "burn_rate": burn_rate,
        "market_share": market_share,
    }

    try:
        result = supabase.table("metrics").insert(initial_metrics).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to initialize metrics")
        return result.data[0]
    except Exception as e:
        print(f"Error starting simulation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/simulation/tick")
async def simulation_tick(request: SimulationTickRequest, supabase: Client = Depends(get_supabase)):
    """
    Run one simulation tick:
    1. Pick a random event
    2. Apply impact to current metrics
    3. Save new metrics + event
    4. Trigger a debate (non-blocking, best-effort)
    """
    try:
        # Get current (latest) metrics
        metrics_resp = (
            supabase.table("metrics")
            .select("*")
            .eq("startup_id", request.startup_id)
            .order("recorded_at", desc=True)
            .limit(1)
            .execute()
        )

        if not metrics_resp.data:
            raise HTTPException(
                status_code=400,
                detail="No metrics found. Start the simulation first.",
            )

        current = metrics_resp.data[0]

        # Pick random event
        event = get_random_event()
        impact = event["impact"]

        # Compute new metrics (clamp to 0 minimum)
        new_revenue = max(0, current["revenue"] + impact.get("revenue", 0))
        new_users = max(0, current["users"] + impact.get("users", 0))
        new_burn_rate = max(0, current["burn_rate"] + impact.get("burn_rate", 0))
        new_market_share = max(
            0, current["market_share"] + impact.get("market_share", 0)
        )

        # Save new metrics
        new_metrics = {
            "startup_id": request.startup_id,
            "revenue": new_revenue,
            "users": new_users,
            "burn_rate": new_burn_rate,
            "market_share": new_market_share,
        }
        metrics_result = supabase.table("metrics").insert(new_metrics).execute()

        # Save event
        event_record = {
            "startup_id": request.startup_id,
            "event_name": event["name"],
            "event_type": event["type"],
            "impact": impact,
        }
        supabase.table("events").insert(event_record).execute()

        # Trigger debate (best-effort — don't block the tick if it fails)
        debate_summary = None
        try:
            from agents.debate import debate_workflow

            # Get company name
            startup_resp = (
                supabase.table("startups")
                .select("name")
                .eq("id", request.startup_id)
                .execute()
            )
            company_name = (
                startup_resp.data[0]["name"] if startup_resp.data else "Startup"
            )

            debate_state = {
                "startup_id": request.startup_id,
                "company_name": company_name,
                "event": event["name"],
                "event_type": event["type"],
                "marketing_argument": None,
                "finance_argument": None,
                "product_argument": None,
                "engineering_argument": None,
                "ceo_decision": None,
                "supabase_client": supabase, # Pass the authenticated supabase client!
            }
            debate_result = debate_workflow.invoke(debate_state)

            debate_record = {
                "startup_id": request.startup_id,
                "event": event["name"],
                "event_type": event["type"],
                "marketing_argument": debate_result.get("marketing_argument"),
                "finance_argument": debate_result.get("finance_argument"),
                "product_argument": debate_result.get("product_argument"),
                "engineering_argument": debate_result.get("engineering_argument"),
                "ceo_decision": debate_result.get("ceo_decision"),
            }
            debate_insert = supabase.table("debates").insert(debate_record).execute()
            if debate_insert.data:
                debate_summary = debate_insert.data[0]
                debate_summary["relevant_memory_count"] = debate_result.get("relevant_memory_count", 0)
                
                # Save to memory system
                from memory.store import MemoryStore
                memory_content = f"Event: {event['name']}. Decision: {debate_result.get('ceo_decision')}"
                MemoryStore.save_memory(
                    startup_id=request.startup_id,
                    memory_type="outcome",
                    content=memory_content,
                    metadata={
                        "event_type": event["type"],
                        "impact": impact
                    },
                    supabase_client=supabase # Pass the authenticated supabase client!
                )

        except Exception as debate_err:
            print(f"Debate failed (non-blocking): {debate_err}")

        return {
            "event": event,
            "new_metrics": metrics_result.data[0] if metrics_result.data else new_metrics,
            "debate_summary": debate_summary,
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in simulation tick: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/simulation/metrics/{startup_id}")
async def get_simulation_data(startup_id: str, supabase: Client = Depends(get_supabase)):
    """Return last 20 metric snapshots and all events for a startup."""
    try:
        metrics_resp = (
            supabase.table("metrics")
            .select("*")
            .eq("startup_id", startup_id)
            .order("recorded_at", desc=True)
            .limit(20)
            .execute()
        )

        events_resp = (
            supabase.table("events")
            .select("*")
            .eq("startup_id", startup_id)
            .order("created_at", desc=True)
            .execute()
        )

        # Reverse metrics so oldest is first (for chart X axis)
        metrics = list(reversed(metrics_resp.data)) if metrics_resp.data else []

        return {
            "metrics": metrics,
            "events": events_resp.data or [],
        }
    except Exception as e:
        print(f"Error fetching simulation data: {e}")
        raise HTTPException(status_code=500, detail=str(e))
