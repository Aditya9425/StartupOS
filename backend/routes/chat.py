import json
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from langchain_core.messages import SystemMessage, HumanMessage
from routes.auth_utils import get_supabase
from supabase import Client
from utils.india_context import get_india_context, get_agent_prefix

router = APIRouter()

class ChatRequest(BaseModel):
    startup_id: str
    message: str

@router.post("/api/chat")
async def process_chat(request: ChatRequest, supabase: Client = Depends(get_supabase)):
    from agents.nodes import _get_llm
    
    try:
        # Save user message
        supabase.table("conversations").insert({
            "startup_id": request.startup_id,
            "role": "user",
            "message": request.message
        }).execute()

        # Fetch startup context
        startup_resp = supabase.table("startups").select("*").eq("id", request.startup_id).execute()
        if not startup_resp.data:
            raise HTTPException(status_code=404, detail="Startup not found")
        startup = startup_resp.data[0]
        
        company_name = startup.get("name", "Unknown")
        idea = startup.get("idea", "")
        stage = startup.get("stage", "")
        target_audience = startup.get("target_audience", "")
        blueprint = startup.get("blueprint") or {}

        # Fetch conversation history (last 5 messages)
        history_resp = supabase.table("conversations").select("*").eq("startup_id", request.startup_id).order("created_at", desc=True).limit(5).execute()
        # history_resp returns descending. We reverse it to chronological.
        recent_history = list(reversed(history_resp.data)) if history_resp.data else []
        history_text = "\n".join([f"{msg['role'].capitalize() if msg['role'] == 'user' else msg['agent_name']}: {msg['message']}" for msg in recent_history])

        llm = _get_llm()

        # CEO Router
        router_prompt = f"""
{get_india_context()}

You are the CEO of {company_name}, 
an Indian startup: {idea}

A founder asked: '{request.message}'

Route to the right agent for India context.
Consider which agent best understands
Indian market implications of this question.

Respond ONLY in JSON:
{{
  "agents": ["Marketing"],
  "reasoning": "Question about Indian GTM"
}}
"""

        try:
            router_response = llm.bind(response_format={"type": "json_object"}).invoke([
                SystemMessage(content="You are the CEO router. Output valid JSON only."),
                HumanMessage(content=router_prompt)
            ])
            router_data = json.loads(router_response.content)
            selected_agents = router_data.get("agents", ["ceo"])
        except Exception as e:
            print(f"Router error: {e}")
            selected_agents = ["ceo"]

        # Normalize agent names
        agent_map = {
            "ceo": "CEO", "product": "Product", "marketing": "Marketing", 
            "finance": "Finance", "engineering": "Engineering"
        }
        
        valid_agents = []
        for a in selected_agents:
            key = a.lower()
            if key in agent_map:
                valid_agents.append(key)
        
        if not valid_agents:
            valid_agents = ["ceo"]

        # Gather agent responses
        agent_responses = []
        for agent_key in valid_agents:
            agent_role = agent_map[agent_key]
            agent_blueprint = blueprint.get(agent_key, "No blueprint available.")
            
            agent_prompt = f"""
{get_agent_prefix(agent_role, company_name, idea)}

Stage: {stage}
Target audience: {target_audience}
Your blueprint output: {agent_blueprint}

Conversation history:
{history_text}

Founder asks: {request.message}

Answer specifically for this Indian startup.
Use INR for any numbers.
Reference Indian market, tools, and platforms.
If asked irrelevant questions (not about 
the startup), respond:
"I'm your {agent_role} focused on 
{company_name}. Let's keep our discussion 
focused on growing your Indian startup. 
What business challenge can I help with?"

Keep under 120 words.
"""

            try:
                # Normal text response for agent
                response = llm.invoke([
                    SystemMessage(content=f"You are the {agent_role} of {company_name}. Be helpful and concise."),
                    HumanMessage(content=agent_prompt)
                ])
                answer = response.content.strip()
                
                # Save agent response
                supabase.table("conversations").insert({
                    "startup_id": request.startup_id,
                    "role": "agent",
                    "agent_name": agent_role,
                    "message": answer
                }).execute()
                
                agent_responses.append({
                    "agent": agent_role,
                    "message": answer
                })
            except Exception as e:
                print(f"Error invoking agent {agent_role}: {e}")

        return {"responses": agent_responses}

    except Exception as e:
        print(f"Error in /api/chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/chat/{startup_id}")
async def get_chat_history(startup_id: str, supabase: Client = Depends(get_supabase)):
    try:
        resp = supabase.table("conversations").select("*").eq("startup_id", startup_id).order("created_at", desc=True).limit(50).execute()
        history = list(reversed(resp.data)) if resp.data else []
        return {"history": history}
    except Exception as e:
        print(f"Error fetching chat history: {e}")
        raise HTTPException(status_code=500, detail=str(e))
