import sys
from dotenv import load_dotenv
load_dotenv('backend/.env')

sys.path.append('backend')

try:
    from agents.nodes import ceo_agent, product_agent, marketing_agent, finance_agent, engineering_agent, validation_agent
    print("Imports in nodes.py successful!")
    
    state = {
        "idea": "Food delivery",
        "company_name": "TestCo",
        "stage": "Idea",
        "challenges": None,
        "target_audience": "Students",
        "problem_statement": "Hunger",
        "ceo_output": "ceo",
        "product_output": "product",
        "marketing_output": "marketing",
        "finance_output": "finance",
        "engineering_output": "engineering"
    }
    
    # Fast test without LLM calls? We want to see if prompt generation crashes
    # Wait, the prompt generation happens before the LLM call. 
    # Let's mock the LLM
    from agents import nodes
    class MockLLM:
        def invoke(self, messages):
            class MockResponse:
                content = "Mocked"
            return MockResponse()
        def bind(self, **kwargs):
            return self
    
    nodes._get_llm = lambda: MockLLM()
    
    ceo_agent(state)
    print("ceo_agent OK")
    product_agent(state)
    print("product_agent OK")
    marketing_agent(state)
    print("marketing_agent OK")
    finance_agent(state)
    print("finance_agent OK")
    engineering_agent(state)
    print("engineering_agent OK")
    
    state["validation_score"] = {}
    
    # test validation agent
    # it uses json.loads
    class MockJSONLLM:
        def invoke(self, messages):
            class MockResponse:
                content = '{"scores":{}, "overall": 50, "verdict": "ok", "strengths": [], "risks": []}'
            return MockResponse()
        def bind(self, **kwargs):
            return self
    nodes._get_llm = lambda: MockJSONLLM()
    validation_agent(state)
    print("validation_agent OK")
    
    from agents.debate import ceo_decision_node, marketing_debate
    print("Debate imports OK")
    from agents.pitchdeck import pitch_deck_agent
    print("Pitchdeck imports OK")
    from agents.competitor import research_agent, gap_analysis_agent, strategy_agent
    print("Competitor imports OK")
    
except Exception as e:
    import traceback
    traceback.print_exc()

