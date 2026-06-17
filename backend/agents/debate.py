"""
StartupOS Debate Agent Engine
Executes a debate among 4 department agents in parallel over a market event,
followed by a final CEO decision.
"""

import os
from typing import TypedDict, Optional, Literal, List, Any
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, START, END
from langgraph.constants import Send
from memory.store import MemoryStore
from agents.nodes import _get_llm
from utils.india_context import get_india_context, get_agent_prefix


class DebateState(TypedDict):
    """State for the debate graph."""
    startup_id: str
    company_name: str
    event: str
    event_type: str
    marketing_argument: Optional[str]
    finance_argument: Optional[str]
    product_argument: Optional[str]
    engineering_argument: Optional[str]
    ceo_decision: Optional[str]
    relevant_memories: Optional[str]
    relevant_memory_count: Optional[int]
    supabase_client: Optional[Any]
    idea: Optional[str]


def fetch_memories(state: DebateState) -> dict:
    """Fetch relevant past memories before the debate begins."""
    query = f"Event: {state['event']} (Type: {state['event_type']})"
    memories = MemoryStore.search_memories(
        state['startup_id'], 
        query, 
        limit=3, 
        supabase_client=state.get("supabase_client")
    )
    
    formatted = MemoryStore.format_memories_for_prompt(memories)
    return {
        "relevant_memories": formatted,
        "relevant_memory_count": len(memories)
    }


def marketing_debate(state: DebateState) -> dict:
    llm = _get_llm()
    company_name = state.get('company_name', 'TBD')
    idea = state.get('idea', '')
    event = state.get('event', '')
    relevant_memories = state.get('relevant_memories', 'None')

    prompt = f"""
{get_agent_prefix('Marketing Head', company_name, idea)}

{get_india_context()}

A market event has occurred: {event}

Relevant past experiences:
{relevant_memories}

Argue from Indian marketing perspective:
- How does this affect Indian users specifically?
- What Indian channels help us respond?
  (WhatsApp campaigns, Instagram Reels, 
   college ambassador activation, etc.)
- What Indian consumer behavior should 
  we leverage?

STRICT FORMAT RULES:
- Maximum 60 words. Hard limit.
- ONE clear position statement
- ONE specific reason with India context
- ONE specific action recommendation
- No bullet points — flowing sentences only
- No bold text or markdown
- If you exceed 60 words you have failed
"""
    
    response = llm.invoke([
        SystemMessage(content="You are a marketing expert."),
        HumanMessage(content=prompt)
    ])
    return {"marketing_argument": response.content}


def finance_debate(state: DebateState) -> dict:
    llm = _get_llm()
    company_name = state.get('company_name', 'TBD')
    idea = state.get('idea', '')
    event = state.get('event', '')
    relevant_memories = state.get('relevant_memories', 'None')

    prompt = f"""
{get_agent_prefix('Finance Director', company_name, idea)}

{get_india_context()}

A market event has occurred: {event}

Relevant past experiences:
{relevant_memories}

Argue from Indian financial perspective:
- Impact on INR burn rate and runway
- Indian investor implications
- Price sensitivity of Indian customers
- UPI/payment behavior considerations
- Government scheme opportunities if relevant

STRICT FORMAT RULES:
- Maximum 60 words. Hard limit.
- ONE clear position statement
- ONE specific reason with India context
- ONE specific action recommendation
- No bullet points — flowing sentences only
- No bold text or markdown
- If you exceed 60 words you have failed
"""
    
    response = llm.invoke([
        SystemMessage(content="You are a finance expert."),
        HumanMessage(content=prompt)
    ])
    return {"finance_argument": response.content}


def product_debate(state: DebateState) -> dict:
    llm = _get_llm()
    company_name = state.get('company_name', 'TBD')
    idea = state.get('idea', '')
    event = state.get('event', '')
    relevant_memories = state.get('relevant_memories', 'None')

    prompt = f"""
{get_agent_prefix('Product Manager', company_name, idea)}

{get_india_context()}

A market event has occurred: {event}

Relevant past experiences:
{relevant_memories}

Argue from Indian product perspective:
- How do Indian users react to this event?
- Mobile-first implications for India
- Vernacular/regional language considerations
- Feature priorities for Indian market response

STRICT FORMAT RULES:
- Maximum 60 words. Hard limit.
- ONE clear position statement
- ONE specific reason with India context
- ONE specific action recommendation
- No bullet points — flowing sentences only
- No bold text or markdown
- If you exceed 60 words you have failed
"""
    
    response = llm.invoke([
        SystemMessage(content="You are a product expert."),
        HumanMessage(content=prompt)
    ])
    return {"product_argument": response.content}


def engineering_debate(state: DebateState) -> dict:
    llm = _get_llm()
    company_name = state.get('company_name', 'TBD')
    idea = state.get('idea', '')
    event = state.get('event', '')
    relevant_memories = state.get('relevant_memories', 'None')

    prompt = f"""
{get_agent_prefix('Engineering Lead', company_name, idea)}

{get_india_context()}

A market event has occurred: {event}

Relevant past experiences:
{relevant_memories}

Argue from Indian engineering perspective:
- Implementation feasibility with Indian team
- Cost in INR to execute
- Indian SaaS tools that could help
- Timeline with Indian developer resources

STRICT FORMAT RULES:
- Maximum 60 words. Hard limit.
- ONE clear position statement
- ONE specific reason with India context
- ONE specific action recommendation
- No bullet points — flowing sentences only
- No bold text or markdown
- If you exceed 60 words you have failed
"""
    
    response = llm.invoke([
        SystemMessage(content="You are an engineering expert."),
        HumanMessage(content=prompt)
    ])
    return {"engineering_argument": response.content}


def ceo_decision_node(state: DebateState) -> dict:
    llm = _get_llm()
    company_name = state.get('company_name', 'TBD')
    idea = state.get('idea', '')
    event = state.get('event', '')
    marketing_argument = state.get('marketing_argument', '')
    finance_argument = state.get('finance_argument', '')
    product_argument = state.get('product_argument', '')
    engineering_argument = state.get('engineering_argument', '')

    prompt = f"""
{get_agent_prefix('CEO', company_name, idea)}

{get_india_context()}

Market event: {event}

Your Indian team argued:
Marketing: {marketing_argument}
Finance: {finance_argument}
Product: {product_argument}
Engineering: {engineering_argument}

Make a final decision for THIS Indian startup:
1. Decision in one sentence
2. Which arguments influenced you (India context)
3. Action plan with India-specific steps:
   - Use Indian platforms and tools
   - Reference Indian market dynamics
   - All costs in INR

STRICT FORMAT RULES:
- Maximum 80 words. Hard limit.  
- State the decision in first sentence
- Name which agent(s) influenced you most
- List exactly 2 action items (not 3)
- All amounts in INR
- No bullet points or markdown
"""
    
    response = llm.invoke([
        SystemMessage(content="You are a decisive startup CEO."),
        HumanMessage(content=prompt)
    ])
    return {"ceo_decision": response.content}


def dispatch_debates(state: DebateState) -> List[Send]:
    """Router function to send the state to all 4 department agents in parallel."""
    return [
        Send("marketing_debate", state),
        Send("finance_debate", state),
        Send("product_debate", state),
        Send("engineering_debate", state)
    ]


def build_debate_graph() -> StateGraph:
    """Build and compile the LangGraph debate graph using Send for parallel execution."""
    graph = StateGraph(DebateState)

    # Add nodes
    graph.add_node("fetch_memories", fetch_memories)
    graph.add_node("marketing_debate", marketing_debate)
    graph.add_node("finance_debate", finance_debate)
    graph.add_node("product_debate", product_debate)
    graph.add_node("engineering_debate", engineering_debate)
    graph.add_node("ceo_decision", ceo_decision_node)

    # Fetch memories first, then dispatch to all agents
    graph.add_edge(START, "fetch_memories")
    graph.add_conditional_edges("fetch_memories", dispatch_debates, ["marketing_debate", "finance_debate", "product_debate", "engineering_debate"])
    
    # After all 4 finish, transition to CEO decision
    # In LangGraph, if multiple edges point to the same node, it waits for all incoming edges to complete.
    graph.add_edge("marketing_debate", "ceo_decision")
    graph.add_edge("finance_debate", "ceo_decision")
    graph.add_edge("product_debate", "ceo_decision")
    graph.add_edge("engineering_debate", "ceo_decision")
    
    graph.add_edge("ceo_decision", END)

    return graph.compile()


debate_workflow = build_debate_graph()
