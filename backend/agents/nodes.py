"""
StartupOS Agent Nodes
Each function is a LangGraph node that calls Groq's llama-3.3-70b-versatile
to generate one section of the startup blueprint.
"""

import os
from typing import Any
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from agents.state import StartupState
from utils.india_context import get_india_context, get_agent_prefix
import json

GROQ_MODEL = "llama-3.3-70b-versatile"


def _get_llm(temperature: float = 0.7) -> Any:
    """Create a ChatGroq instance with fallbacks for rate limits."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not set in the environment")
    
    primary = ChatGroq(model=GROQ_MODEL, api_key=api_key, temperature=temperature)
    fallback_70b = ChatGroq(model="llama-3.3-70b-specdec", api_key=api_key, temperature=temperature)
    fallback_8b = ChatGroq(model="llama-3.1-8b-instant", api_key=api_key, temperature=temperature)
    
    return primary.with_fallbacks([fallback_70b, fallback_8b])


def ceo_agent(state: StartupState) -> dict:
    """CEO Agent — generates mission, vision, and strategic goals."""
    llm = _get_llm()
    company_name = state.get('company_name', 'TBD')
    idea = state.get('idea', '')
    stage = state.get('stage', 'Unknown')
    target_audience = state.get('target_audience', 'General')
    problem_statement = state.get('problem_statement', 'Unknown')
    challenges = ", ".join(state.get('challenges') or [])

    prompt = f"""
{get_agent_prefix('CEO', company_name, idea)}

Stage: {stage}
Target audience: {target_audience}
Problem: {problem_statement}
Challenges: {challenges}

Define for this Indian startup:
1. Mission statement (India-focused)
2. Vision for next 3 years in Indian market
3. Top 3 strategic goals specific to India
   (mention Indian market dynamics, competition,
   regulatory environment where relevant)

Be specific to THIS startup and India.
No generic global advice.
Keep under 150 words.
"""

    response = llm.invoke([
        SystemMessage(content="You are a visionary startup CEO with experience building companies from 0 to 1. Be concise, strategic, and specific."),
        HumanMessage(content=prompt)
    ])
    return {"ceo_output": response.content}


def product_agent(state: StartupState) -> dict:
    """Product Agent — generates features, user personas, and MVP roadmap."""
    llm = _get_llm()
    company_name = state.get('company_name', 'TBD')
    idea = state.get('idea', '')
    stage = state.get('stage', 'Unknown')
    target_audience = state.get('target_audience', 'General')
    ceo_output = state.get('ceo_output', 'Not yet available')

    prompt = f"""
{get_agent_prefix('Product Manager', company_name, idea)}

Stage: {stage}
Target audience: {target_audience}
CEO output: {ceo_output}

Define for Indian users:
1. Top 3 features for Indian market
   (consider mobile-first, vernacular, 
   price sensitivity, offline capability)
2. User personas specific to India
   (include city tier, income level, 
   device type, language preference)
3. MVP roadmap for Indian launch
   (what to build first to win Indian users)

Reference how Indian users actually behave.
Keep under 150 words.
"""

    response = llm.invoke([
        SystemMessage(content="You are a product strategist who excels at defining MVPs. Be practical and user-focused."),
        HumanMessage(content=prompt)
    ])
    return {"product_output": response.content}


def marketing_agent(state: StartupState) -> dict:
    """Marketing Agent — generates go-to-market and customer acquisition strategy."""
    llm = _get_llm()
    company_name = state.get('company_name', 'TBD')
    idea = state.get('idea', '')
    stage = state.get('stage', 'Unknown')
    target_audience = state.get('target_audience', 'General')
    product_output = state.get('product_output', 'Not yet available')

    prompt = f"""
{get_agent_prefix('Marketing Head', company_name, idea)}

Stage: {stage}
Target audience: {target_audience}
Product output: {product_output}

Create India-specific go-to-market:
1. Top 3 acquisition channels for India
   (WhatsApp, Instagram Reels, college 
   ambassadors, influencers — be specific)
2. Pricing strategy in INR
   (free tier, paid tier, what justifies 
   the price for Indian users)
3. First 1000 users playbook for India
   (specific tactics that work in India)

Never suggest email as primary channel.
Always think WhatsApp-first.
Keep under 150 words.
"""

    response = llm.invoke([
        SystemMessage(content="You are a growth-focused CMO experienced in startup marketing with limited budgets. Be data-driven and creative."),
        HumanMessage(content=prompt)
    ])
    return {"marketing_output": response.content}


def finance_agent(state: StartupState) -> dict:
    """Finance Agent — generates revenue model, pricing, and budget breakdown."""
    llm = _get_llm()
    company_name = state.get('company_name', 'TBD')
    idea = state.get('idea', '')
    stage = state.get('stage', 'Unknown')
    target_audience = state.get('target_audience', 'General')
    marketing_output = state.get('marketing_output', 'Not yet available')

    prompt = f"""
{get_agent_prefix('Finance Director', company_name, idea)}

Stage: {stage}
Target audience: {target_audience}
Marketing output: {marketing_output}

Build India-specific financial model:
1. Revenue model in INR
   (pricing tiers appropriate for Indian market)
2. Monthly burn rate estimate in INR
   (use Indian cost benchmarks — developer 
   salaries, office costs, cloud costs in India)
3. Path to profitability in India
   (realistic timeline given Indian market)
4. Funding recommendation
   (which Indian VCs/angels to target first)

All numbers in INR. No USD.
Indian salary benchmarks: 
Junior dev ₹6-12 LPA, Senior dev ₹15-30 LPA
Keep under 150 words.
"""

    response = llm.invoke([
        SystemMessage(content="You are a startup CFO with deep knowledge of SaaS/startup finance. Be precise with numbers and realistic about projections."),
        HumanMessage(content=prompt)
    ])
    return {"finance_output": response.content}


def engineering_agent(state: StartupState) -> dict:
    """Engineering Agent — generates tech stack and system architecture."""
    llm = _get_llm()
    company_name = state.get('company_name', 'TBD')
    idea = state.get('idea', '')
    stage = state.get('stage', 'Unknown')
    target_audience = state.get('target_audience', 'General')
    finance_output = state.get('finance_output', 'Not yet available')

    prompt = f"""
{get_agent_prefix('Engineering Lead', company_name, idea)}

Stage: {stage}
Target audience: {target_audience}
Finance output: {finance_output}

Design for Indian infrastructure:
1. Tech stack recommendation
   (optimized for Indian internet speeds,
   mobile-first, low-bandwidth consideration)
2. Architecture for Indian scale
   (handle India-specific traffic patterns,
   festival season spikes, UPI integration)
3. Build vs buy decisions
   (Indian SaaS tools: Razorpay, MSG91,
   Exotel, Shiprocket, etc.)
4. Team structure and hiring plan
   (Indian developer costs and where to hire:
   Bangalore, Hyderabad, Pune, remote India)

Keep under 150 words.
"""

    response = llm.invoke([
        SystemMessage(content="You are a pragmatic startup CTO who values speed-to-market and scalability. Choose proven technologies and keep it lean."),
        HumanMessage(content=prompt)
    ])

    # Compile the full blueprint
    blueprint = {
        "ceo": state.get("ceo_output", ""),
        "product": state.get("product_output", ""),
        "marketing": state.get("marketing_output", ""),
        "finance": state.get("finance_output", ""),
        "engineering": response.content,
    }

    return {
        "engineering_output": response.content,
        "blueprint": blueprint,
    }


def validation_agent(state: StartupState) -> dict:
    """Validation Agent — scores the startup based on the generated blueprint."""
    llm = _get_llm(temperature=0.4)
    idea = state.get('idea', '')
    stage = state.get('stage', 'Unknown')
    target_audience = state.get('target_audience', 'General')
    problem_statement = state.get('problem_statement', 'Unknown')
    
    ceo_output = state.get('ceo_output', '')
    product_output = state.get('product_output', '')
    marketing_output = state.get('marketing_output', '')
    finance_output = state.get('finance_output', '')
    engineering_output = state.get('engineering_output', '')
    
    all_agent_outputs = f"CEO: {ceo_output}\nProduct: {product_output}\nMarketing: {marketing_output}\nFinance: {finance_output}\nEngineering: {engineering_output}"

    prompt = f"""You are a brutally honest YC partner reviewing 
hundreds of pitches. Most ideas you see are 
mediocre. You must score this with the same 
distribution a real YC partner would use:

SCORE DISTRIBUTION YOU MUST FOLLOW:
- 70% of ideas you see score 30-55 (most ideas)
- 20% of ideas score 56-75 (decent, differentiated)
- 8% of ideas score 76-90 (excellent, fundable)
- 2% of ideas score 91-100 (exceptional, rare)

Startup to evaluate:
Idea: {idea}
Stage: {stage}
Target audience: {target_audience}
Problem: {problem_statement}

Agent outputs:
{all_agent_outputs}

ANCHOR EXAMPLES — use these as your scoring baseline:

Example scoring 35/100:
'A food delivery app for college students'
(generic, no differentiation, saturated market)

Example scoring 58/100:
'A WhatsApp-based tiffin delivery service 
targeting tier 3 Indian cities where Zomato 
and Swiggy don't operate, using local home 
cooks as suppliers'
(clear niche, real gap, but execution risk high,
 unproven unit economics, small initial market)

Example scoring 82/100:
'A B2B SaaS that helps Indian D2C brands 
automate GST-compliant invoicing, already has
3 paying pilot customers and ₹50,000 MRR'
(validated demand, clear monetization, 
 underserved market, proven traction)

Score the given startup AGAINST these anchors.
If it's similar quality to the 35 example,
score it 30-40. Do not be generous.

6 DIMENSIONS TO SCORE (1-10 each):

1. Market Size — Is this a real, large, 
   underserved India opportunity? 
   Or a crowded saturated space?
   
2. Competition — How many well-funded players
   already dominate this exact space?
   More competitors with no edge = lower score.
   
3. Execution Risk — How likely is the team to
   actually pull this off given the stage?
   Vague ideas score low. Specific plans score higher.
   
4. Revenue Potential — Is there a clear,
   validated path to revenue in India?
   Or just hope and assumptions?
   
5. Technical Feasibility — Can this realistically
   be built with reasonable resources?
   
6. Time to Market — How fast can this launch 
   and start getting real user feedback?

CALCULATE OVERALL:
overall = (market_size + revenue_potential) * 0.3
        + (competition + execution_risk) * 0.25
        + (technical_feasibility + time_to_market) * 0.2
        
Round to nearest integer between 0-100.

MANDATORY CHECKS before responding:
- If the idea description is under 30 words 
  and vague: overall MUST be under 45
- If the idea explicitly says 'better version of X' 
  or 'like X but improved': overall MUST be under 50
- If the idea has zero differentiation from 
  existing players: competition score MUST be 2-3
- If the idea has no clear revenue model mentioned: 
  revenue_potential MUST be under 5

VERDICT — 8-12 words, brutally specific:
BAD: 'Promising idea with good potential'
GOOD: 'Crowded niche — differentiate or expect 
        high CAC in tier 1 cities'
GOOD: 'Real gap in tier 3 cities, validate 
        cook supply chain before scaling'

Respond ONLY in JSON:
{{
  "scores": {{
    "market_size": X,
    "competition": X,
    "execution_risk": X,
    "revenue_potential": X,
    "technical_feasibility": X,
    "time_to_market": X
  }},
  "overall": X,
  "verdict": "...",
  "strengths": ["specific strength 1", 
                "specific strength 2"],
  "risks": ["specific risk 1", "specific risk 2"]
}}"""

    try:
        response = llm.bind(response_format={"type": "json_object"}).invoke([
            SystemMessage(content="You are a strict and objective startup validation expert. You MUST output ONLY valid JSON."),
            HumanMessage(content=prompt)
        ])
        score_data = json.loads(response.content)

        import re

        clone_patterns = [
            r'another\s+\w+', r'like\s+\w+\s+but',
            r'better\s+version', r'similar\s+to',
            r'copy\s+of', r'clone'
        ]

        idea_lower = idea.lower()
        is_likely_clone = any(
            re.search(p, idea_lower) for p in clone_patterns
        )

        word_count = len(idea.split())

        if is_likely_clone and score_data.get('overall', 0) > 50:
            score_data['overall'] = min(score_data['overall'], 45)
            
        if word_count < 15 and score_data.get('overall', 0) > 55:
            score_data['overall'] = min(score_data['overall'], 50)

    except Exception as e:
        print(f"Validation Agent JSON Error: {e}")
        score_data = {
            "scores": {
                "market_size": 5, "competition": 5,
                "execution_risk": 5, "revenue_potential": 5,
                "technical_feasibility": 5, "time_to_market": 5
            },
            "overall": 50,
            "verdict": "Analysis incomplete — try regenerating",
            "strengths": ["Idea submitted successfully"],
            "risks": ["Could not fully analyze — please retry"]
        }

    return {"validation_score": score_data}
