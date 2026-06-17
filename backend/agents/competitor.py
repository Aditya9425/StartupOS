import json
from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import SystemMessage, HumanMessage
from utils.india_context import get_india_context

from agents.nodes import _get_llm

class CompetitorState(TypedDict):
    startup_id: str
    idea: str
    target_audience: str
    problem_statement: str
    stage: str
    competitors: List[Dict[str, Any]]
    indian_competitors: List[Dict[str, Any]]
    global_competitors: List[Dict[str, Any]]
    market_gaps: List[str]
    india_market_gaps: List[Dict[str, str]]
    global_learnings: List[Dict[str, str]]
    competitive_advantage: str
    threat_level: str
    threat_reasoning: str
    moat: str
    india_moat: str
    strategy: str

def research_agent(state: CompetitorState) -> CompetitorState:
    llm = _get_llm()
    
    prompt = f"""{get_india_context()}

CRITICAL RULE:
Find competitors that ACTUALLY operate in India
or DIRECTLY compete with this Indian startup.

DO NOT suggest: Google, Amazon, Microsoft,
Facebook, IBM, Apple, Netflix, Spotify
unless startup is literally building
the same type of product.

Find real Indian companies first.
Then find global companies with India presence
or India-relevant business models.

Startup idea: {state['idea']}
Target audience: {state['target_audience']}
Problem being solved: {state['problem_statement']}
Market: India (primary), Global (secondary)

Identify exactly 6 real competitors:
- 3 Indian competitors (most important)
- 3 Global competitors

These must be REAL companies that actually exist and actually compete in this space.

IMPORTANT: Do not suggest Google, Amazon, Microsoft, Facebook, IBM, or other generic tech giants unless the startup is literally building a search engine, e-commerce platform, cloud service, social network, or enterprise software. Find companies that are DIRECTLY solving the SAME problem for the SAME audience as this specific startup.

For Indian competitors — use these as reference examples of the TYPE of specificity required:
Food delivery -> Zomato, Swiggy, Dunzo
EdTech -> Byju's, Unacademy, PhysicsWallah
FinTech -> Razorpay, PayTM, PhonePe
Health -> Practo, PharmEasy, 1mg
Jobs/HR -> Naukri, LinkedIn India, Apna
Logistics -> Delhivery, Shiprocket, Porter
Travel -> MakeMyTrip, OYO, redBus
Social -> ShareChat, Moj, Josh

For each competitor provide a DETAILED profile:
- Real founding year
- Real headquarters city
- Real funding amount (if known)
- Real valuation (if known)
- Real number of users/customers
- What they do well in India specifically (or globally for global competitors)
- Where they fall short

Respond ONLY in JSON matching exactly this structure:
{{
  "indian_competitors": [
    {{
      "name": "Zomato",
      "type": "Indian",
      "founded": "2008",
      "headquarters": "Gurugram, Haryana",
      "funding": "$2.5 Billion",
      "valuation": "$5.4 Billion (Public)",
      "users": "80 million+ active users",
      "description": "India largest food delivery and restaurant discovery platform",
      "strengths": [
        "Largest restaurant network in India",
        "Strong brand recognition across tier 1-2 cities",
        "Deep logistics infrastructure"
      ],
      "weaknesses": [
        "High delivery fees alienate price-sensitive users",
        "Weak presence in tier 3 cities and rural areas",
        "Heavy losses despite scale"
      ],
      "position": "Leader",
      "funding_stage": "Public",
      "india_specific": "Dominates metro cities but struggles with profitability in smaller cities",
      "key_differentiator": "Restaurant discovery + food delivery combined platform"
    }}
  ],
  "global_competitors": [
    {{
      "name": "DoorDash",
      "type": "Global",
      "founded": "2013",
      "headquarters": "San Francisco, USA",
      "funding": "$2.5 Billion",
      "valuation": "$20 Billion (Public)",
      "users": "37 million+ active users in USA",
      "description": "Leading food delivery platform in North America",
      "strengths": [
        "Strong suburban market penetration",
        "DashPass subscription drives loyalty",
        "Advanced logistics technology"
      ],
      "weaknesses": [
        "Not present in India",
        "High customer acquisition costs",
        "Driver retention challenges"
      ],
      "position": "Leader",
      "funding_stage": "Public",
      "india_relevance": "Not in India but their suburban focus model could work in Indian tier 2-3 cities",
      "key_differentiator": "Suburban and non-urban market focus unlike urban-centric competitors"
    }}
  ]
}}"""

    fallback_competitor = [{
        "name": "Analysis unavailable",
        "type": "Indian",
        "founded": "N/A",
        "headquarters": "India",
        "funding": "Unknown",
        "valuation": "Unknown",
        "users": "Unknown",
        "description": "Could not analyze. Please retry.",
        "strengths": [],
        "weaknesses": [],
        "position": "Unknown",
        "funding_stage": "Unknown",
        "india_specific": "",
        "key_differentiator": ""
    }]

    try:
        response = llm.bind(response_format={"type": "json_object"}).invoke([
            SystemMessage(content="You are a market research expert. Output valid JSON only."),
            HumanMessage(content=prompt)
        ])
        
        try:
            data = json.loads(response.content)
            indian_competitors = data.get("indian_competitors") or []
            global_competitors = data.get("global_competitors") or []
            
            if not indian_competitors and not global_competitors:
                indian_competitors = fallback_competitor
        except Exception as json_err:
            print(f"JSON parsing error in research_agent: {{json_err}}")
            indian_competitors = fallback_competitor
            global_competitors = []
            
    except Exception as e:
        print(f"Error in research_agent: {{e}}")
        indian_competitors = fallback_competitor
        global_competitors = []
        
    return {
        "indian_competitors": indian_competitors,
        "global_competitors": global_competitors
    }

def gap_analysis_agent(state: CompetitorState) -> CompetitorState:
    llm = _get_llm()
    
    prompt = f"""You are a competitive strategy expert specializing in the Indian startup market.

Startup: {state['idea']}
Target audience: {state['target_audience']}
India context: Primary market is India

Indian competitors: {json.dumps(state.get('indian_competitors', []), indent=2)}
Global competitors: {json.dumps(state.get('global_competitors', []), indent=2)}

Analyze the competitive landscape:

1. What are the top 3 gaps in the INDIAN market that none of the Indian competitors fill? Be specific to India — pricing gaps, geographic gaps, language gaps, etc.
2. What can the startup learn from global competitors that Indian competitors haven't done yet? This is the global opportunity.
3. Threat level specifically for Indian market: Low/Medium/High
4. What moat to build specifically for India: (e.g. WhatsApp distribution network, Vernacular language support, Tier 2-3 city focus, Cash/UPI payment optimization, India-specific pricing model, Partnership with Indian institutions)

Respond ONLY in JSON:
{{
  "india_market_gaps": [
    {{
      "gap": "No competitor serves tier 3 cities",
      "opportunity": "Your opportunity here",
      "market_size": "estimated users/revenue"
    }}
  ],
  "global_learnings": [
    {{
      "company": "DoorDash",
      "learning": "Their suburban model could work for Indian tier 2-3 cities",
      "how_to_apply": "Specific implementation idea"
    }}
  ],
  "threat_level": "Medium",
  "threat_reasoning": "Why this threat level",
  "india_moat": "Specific moat for Indian market"
}}"""

    try:
        response = llm.bind(response_format={"type": "json_object"}).invoke([
            SystemMessage(content="You are a strategy expert. Output valid JSON only."),
            HumanMessage(content=prompt)
        ])
        
        try:
            data = json.loads(response.content)
            india_market_gaps = data.get("india_market_gaps") or []
            global_learnings = data.get("global_learnings") or []
            threat_level = data.get("threat_level") or "Unknown"
            threat_reasoning = data.get("threat_reasoning") or "Analysis failed"
            india_moat = data.get("india_moat") or "None"
        except Exception as json_err:
            print(f"JSON parsing error in gap_analysis_agent: {{json_err}}")
            india_market_gaps = []
            global_learnings = []
            threat_level = "Unknown"
            threat_reasoning = "JSON parsing failed"
            india_moat = "None"
            
    except Exception as e:
        print(f"Error in gap_analysis_agent: {{e}}")
        india_market_gaps = []
        global_learnings = []
        threat_level = "Unknown"
        threat_reasoning = "Analysis failed"
        india_moat = "None"
        
    return {
        "india_market_gaps": india_market_gaps,
        "global_learnings": global_learnings,
        "threat_level": threat_level,
        "threat_reasoning": threat_reasoning,
        "india_moat": india_moat,
        "moat": india_moat,
        "market_gaps": [gap.get("gap", "") for gap in india_market_gaps]
    }

def strategy_agent(state: CompetitorState) -> CompetitorState:
    llm = _get_llm()
    
    ind_comp_names = [c.get('name') for c in (state.get('indian_competitors') or [])]
    glob_comp_names = [c.get('name') for c in (state.get('global_competitors') or [])]
    all_competitors = ind_comp_names + glob_comp_names
    
    prompt = f"""You are the CEO.
    
You have analyzed your competition:
Competitors: {json.dumps(all_competitors)}
Market gaps: {json.dumps(state.get('india_market_gaps', []))}
Threat level: {state.get('threat_level', '')}

Write a competitive strategy in 3 parts:
1. How to position against each major competitor (one line each)
2. The 3 most important moves to make in the next 90 days to build defensibility in the Indian market
3. Which competitor to watch most closely and why

Be specific, direct, tactical.
Keep under 200 words total."""

    try:
        response = llm.invoke([
            SystemMessage(content="You are the CEO. Provide tactical strategy."),
            HumanMessage(content=prompt)
        ])
        strategy = response.content.strip()
    except Exception as e:
        print(f"Error in strategy_agent: {{e}}")
        strategy = "Strategy analysis failed. Please try again."
        
    return {"strategy": strategy}


def build_competitor_graph():
    workflow = StateGraph(CompetitorState)
    
    workflow.add_node("research_agent", research_agent)
    workflow.add_node("gap_analysis_agent", gap_analysis_agent)
    workflow.add_node("strategy_agent", strategy_agent)
    
    workflow.set_entry_point("research_agent")
    
    workflow.add_edge("research_agent", "gap_analysis_agent")
    workflow.add_edge("gap_analysis_agent", "strategy_agent")
    workflow.add_edge("strategy_agent", END)
    
    return workflow.compile()
