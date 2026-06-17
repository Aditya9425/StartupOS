import json
from typing import TypedDict, Dict, Any, List
from langgraph.graph import StateGraph, END
from langchain_core.messages import SystemMessage, HumanMessage
from utils.india_context import get_india_context

from agents.nodes import _get_llm

class PitchDeckState(TypedDict):
    startup_id: str
    idea: str
    stage: str
    target_audience: str
    problem_statement: str
    blueprint: Dict[str, Any]
    validation_score: Dict[str, Any]
    competitor_analysis: Dict[str, Any]
    investor_type: str
    funding_amount: str
    current_stage: str
    traction: str
    slides: List[Dict[str, Any]]

INVESTOR_CONTEXT = {
  "Angel Investor": """
    Angel investors are individuals investing 
    their own money. They care about:
    - The founder's passion and story
    - Simple, clear business model
    - Early market validation
    - Realistic ask (usually under $500K)
    - Personal connection to the problem
    Tone: Conversational, story-driven, 
    founder-focused. Less jargon.
  """,
  
  "Venture Capital": """
    VCs manage institutional funds and need 
    to show returns to their LPs. They care about:
    - Massive market opportunity (TAM > $1B)
    - Scalable business model
    - Strong team and unfair advantages
    - Clear path to 10x-100x returns
    - Competitive moats
    Tone: Data-driven, market-focused, 
    growth-oriented. Use metrics.
  """,
  
  "Accelerator / Incubator": """
    Accelerators like YC want to see:
    - Early traction (even small amounts)
    - Founders who move fast and learn
    - A problem worth solving
    - Genuine founder-market fit
    - Coachability and self-awareness
    Tone: Direct, honest about weaknesses,
    show what you've learned. Be brief.
  """,
  
  "Strategic / Corporate": """
    Corporate investors want strategic value:
    - How does this fit their ecosystem?
    - Technology or market access they lack
    - Partnership potential beyond money
    - Reduced risk through validation
    - Clear integration possibilities
    Tone: Business-focused, emphasize 
    synergies and strategic fit.
  """
}

def pitch_deck_agent(state: PitchDeckState) -> PitchDeckState:
    llm = _get_llm()
    
    # Extract blueprint data
    bp = state.get("blueprint", {})
    ceo_output = json.dumps(bp.get("ceo", {}))
    product_output = json.dumps(bp.get("product", {}))
    marketing_output = json.dumps(bp.get("marketing", {}))
    finance_output = json.dumps(bp.get("finance", {}))
    engineering_output = json.dumps(bp.get("engineering", {}))
    all_outputs = f"CEO: {ceo_output}\nProduct: {product_output}\nMarketing: {marketing_output}\nFinance: {finance_output}\nEngineering: {engineering_output}"
    
    # Extract validation score
    vs = state.get("validation_score", {})
    overall_score = vs.get("overall_score", 0)
    
    # Extract competitive advantage
    ca = state.get("competitor_analysis", {})
    competitive_advantage = ca.get("competitive_advantage", "We have a unique approach.")
    
    idea = state.get("idea", "")
    problem_statement = state.get("problem_statement", "")
    target_audience = state.get("target_audience", "")
    
    investor_type = state.get("investor_type", "Angel Investor")
    funding_amount = state.get("funding_amount", "")
    current_stage = state.get("current_stage", "")
    traction = state.get("traction", "")
    investor_context = INVESTOR_CONTEXT.get(investor_type, INVESTOR_CONTEXT["Angel Investor"])

    prompt = f"""
{get_india_context()}

You are a world-class pitch deck writer
who specializes in Indian startups.

You have helped Indian startups raise from
Sequoia Surge, Elevation Capital, 100X.VC,
and top Indian angel investors.

Startup context:
- Idea: {idea}
- Stage: {current_stage}
- Target audience: {target_audience}
- Problem: {problem_statement}
- Traction: {traction}
- Raising: {funding_amount}
- Investor type: {investor_type}

All previous agent outputs:
{all_outputs}

Generate 10 slides for an INDIAN startup:
- All market sizes in INR or Indian context
- Competitors must be Indian companies first
- Pricing in INR
- GTM focused on Indian channels
- Team slide references Indian execution
- The Ask slide references Indian VCs 
  if investor type is VC

Make it specific to India. No generic global
startup template content.

Respond ONLY in this exact JSON format:
{{
  "slides": [
    {{
      "number": 1,
      "title": "The Problem",
      "headline": "One powerful sentence",
      "content": "Main body content",
      "bullets": ["point 1", "point 2", "point 3"],
      "speaker_note": "What to say when presenting"
    }}
  ]
}}

The 10 slides must be:
1. The Problem — pain point with real stats
2. The Solution — your product in simple terms
3. Market Opportunity — TAM/SAM/SOM estimates
4. Product — key features and how it works
5. Business Model — how you make money
6. Go-to-Market — how you get first 1000 customers
7. Competitive Landscape — vs competitors, your edge
8. Traction — current stage and milestones
9. The Team — AI agents as founding team
10. The Ask — funding amount and use of funds

Make each slide punchy, specific, investor-ready.
Speaker notes should be conversational and confident.
"""

    try:
        response = llm.bind(response_format={"type": "json_object"}).invoke([
            SystemMessage(content="You are a pitch deck expert. Output valid JSON only."),
            HumanMessage(content=prompt)
        ])
        data = json.loads(response.content)
        slides = data.get("slides", [])
    except Exception as e:
        print(f"Error in pitch_deck_agent: {e}")
        slides = []
        
    return {"slides": slides}

def build_pitchdeck_graph():
    workflow = StateGraph(PitchDeckState)
    workflow.add_node("pitch_deck_agent", pitch_deck_agent)
    workflow.set_entry_point("pitch_deck_agent")
    workflow.add_edge("pitch_deck_agent", END)
    return workflow.compile()
