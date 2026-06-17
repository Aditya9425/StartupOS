import sys
from dotenv import load_dotenv
load_dotenv('backend/.env')
sys.path.append('backend')

try:
    from agents.competitor import build_competitor_graph
    graph = build_competitor_graph()
    state = {
        "startup_id": "test",
        "idea": "Food delivery",
        "target_audience": "Students",
        "problem_statement": "Hunger",
        "stage": "Idea",
        "competitors": [],
        "indian_competitors": [],
        "global_competitors": [],
        "market_gaps": [],
        "india_market_gaps": [],
        "global_learnings": [],
        "competitive_advantage": "",
        "threat_level": "",
        "threat_reasoning": "",
        "moat": "",
        "india_moat": "",
        "strategy": ""
    }
    # Don't invoke the full graph as it uses real Groq, just call the agents manually or pass a mock LLM.
    # Actually, we can run it and see the output because the 500 error is immediate, maybe parsing or formatting.
    # No, running groq might work or fail. Let's just mock LLM.
    from agents import nodes
    class MockLLM:
        def invoke(self, messages):
            class MockResponse:
                content = "{}"
            return MockResponse()
        def bind(self, **kwargs):
            return self
    nodes._get_llm = lambda: MockLLM()
    
    from agents.competitor import research_agent, gap_analysis_agent, strategy_agent
    res1 = research_agent(state)
    print("res1", res1)
    state.update(res1)
    
    res2 = gap_analysis_agent(state)
    print("res2", res2)
    state.update(res2)
    
    res3 = strategy_agent(state)
    print("res3", res3)
except Exception as e:
    import traceback
    traceback.print_exc()
