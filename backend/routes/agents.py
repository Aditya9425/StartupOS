from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from agents.graph import blueprint_workflow
from routes.auth_utils import get_supabase
from supabase import Client
from routes.startup_utils import mark_step_completed
from utils.validate_idea import validate_idea
from agents.nodes import validation_agent

router = APIRouter()


class BlueprintRequest(BaseModel):
    startup_id: str
    idea: str


@router.post("/api/generate-blueprint")
async def generate_blueprint(request: BlueprintRequest, supabase: Client = Depends(get_supabase)):
    """
    Run the 5-agent LangGraph pipeline to produce a startup blueprint,
    then persist the result in Supabase and return it.
    """
    validation = validate_idea(request.idea)
    if not validation.get("is_valid"):
        raise HTTPException(
            status_code=400,
            detail={
                "error": "invalid_idea",
                "message": validation.get("reason", "Invalid idea")
            }
        )

    try:
        startup_resp = supabase.table("startups").select("name, stage, challenges, target_audience, problem_statement").eq("id", request.startup_id).execute()
        startup_data = startup_resp.data[0] if startup_resp.data else {}
        company_name = startup_data.get("name", "Unnamed Startup")
    except Exception:
        startup_data = {}
        company_name = "Unnamed Startup"

    # Build initial state
    initial_state = {
        "startup_id": request.startup_id,
        "idea": request.idea,
        "company_name": company_name,
        "stage": startup_data.get("stage"),
        "challenges": startup_data.get("challenges"),
        "target_audience": startup_data.get("target_audience"),
        "problem_statement": startup_data.get("problem_statement"),
        "ceo_output": None,
        "product_output": None,
        "marketing_output": None,
        "finance_output": None,
        "engineering_output": None,
        "blueprint": None,
        "validation_score": None,
    }

    try:
        result = blueprint_workflow.invoke(initial_state)
        blueprint = result.get("blueprint", {})
        validation_score = result.get("validation_score")

        # Save blueprint to Supabase
        supabase.table("startups").update({
            "blueprint": blueprint,
            "validation_score": validation_score,
            "status": "blueprint_generated",
        }).eq("id", request.startup_id).execute()

        mark_step_completed(supabase, request.startup_id, "blueprint")

        return {
            "startup_id": request.startup_id,
            "status": "blueprint_generated",
            "blueprint": blueprint,
            "validation_score": validation_score,
        }

    except Exception as e:
        print(f"Error generating blueprint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class ValidateRequest(BaseModel):
    startup_id: str

@router.post("/api/validate-startup")
async def validate_startup(request: ValidateRequest, supabase: Client = Depends(get_supabase)):
    """
    Run only the validation agent for an existing startup blueprint.
    """
    from agents.nodes import validation_agent

    try:
        startup_resp = supabase.table("startups").select("*").eq("id", request.startup_id).execute()
        if not startup_resp.data:
            raise HTTPException(status_code=404, detail="Startup not found")
        
        startup_data = startup_resp.data[0]
        blueprint = startup_data.get("blueprint") or {}

        # Build mock state for validation agent
        state = {
            "startup_id": request.startup_id,
            "idea": startup_data.get("idea", ""),
            "company_name": startup_data.get("name", ""),
            "stage": startup_data.get("stage"),
            "challenges": startup_data.get("challenges"),
            "target_audience": startup_data.get("target_audience"),
            "problem_statement": startup_data.get("problem_statement"),
            "ceo_output": blueprint.get("ceo", ""),
            "product_output": blueprint.get("product", ""),
            "marketing_output": blueprint.get("marketing", ""),
            "finance_output": blueprint.get("finance", ""),
            "engineering_output": blueprint.get("engineering", ""),
        }

        result = validation_agent(state)
        validation_score = result.get("validation_score")

        supabase.table("startups").update({
            "validation_score": validation_score,
        }).eq("id", request.startup_id).execute()

        return {
            "startup_id": request.startup_id,
            "validation_score": validation_score,
        }

    except Exception as e:
        print(f"Error running validation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/blueprint/{startup_id}")
async def get_blueprint(startup_id: str, supabase: Client = Depends(get_supabase)):
    """
    Get the generated blueprint for a startup.
    """
    try:
        startup_resp = supabase.table("startups").select("blueprint, status, name").eq("id", startup_id).execute()
        if not startup_resp.data:
            raise HTTPException(status_code=404, detail="Startup not found")
        
        row = startup_resp.data[0]
        blueprint = row.get("blueprint")
        
        return {
            "startup_id": startup_id,
            "name": row.get("name"),
            "blueprint": blueprint,
            "status": row.get("status")
        }

    except Exception as e:
        print(f"Error fetching blueprint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class ValidateIdeaRequest(BaseModel):
    startup_id: str

@router.post("/api/validate-idea")
async def recalculate_validation_score(request: ValidateIdeaRequest, supabase: Client = Depends(get_supabase)):
    """
    Reruns ONLY the validation agent using existing blueprint data
    and updates the validation score in Supabase.
    """
    try:
        # Fetch existing startup and blueprint
        resp = supabase.table("startups").select("id, idea, stage, challenges, target_audience, problem_statement, blueprint").eq("id", request.startup_id).execute()
        if not resp.data:
            raise HTTPException(status_code=404, detail="Startup not found")
        
        startup_data = resp.data[0]
        blueprint = startup_data.get("blueprint") or {}
        
        # Build state for validation agent
        state = {
            "startup_id": startup_data["id"],
            "idea": startup_data.get("idea", ""),
            "stage": startup_data.get("stage"),
            "challenges": startup_data.get("challenges"),
            "target_audience": startup_data.get("target_audience"),
            "problem_statement": startup_data.get("problem_statement"),
            "ceo_output": blueprint.get("ceo", ""),
            "product_output": blueprint.get("product", ""),
            "marketing_output": blueprint.get("marketing", ""),
            "finance_output": blueprint.get("finance", ""),
            "engineering_output": blueprint.get("engineering", "")
        }
        
        # Run validation agent
        validation_result = validation_agent(state)
        
        # Extract score and update DB
        new_score = validation_result.get("overall_score")
        if not new_score:
            new_score = validation_result.get("overall")
            
        if new_score is not None:
            supabase.table("startups").update({
                "validation_score": new_score
            }).eq("id", request.startup_id).execute()
            
            return {"success": True, "validation_score": new_score}
        else:
            raise HTTPException(status_code=500, detail="Failed to calculate new score")
            
    except Exception as e:
        print(f"Error recalculating score: {e}")
        raise HTTPException(status_code=500, detail=str(e))
