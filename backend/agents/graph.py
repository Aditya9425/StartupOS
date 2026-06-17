"""
StartupOS LangGraph Workflow
Defines the sequential agent pipeline: CEO → Product → Marketing → Finance → Engineering
"""

from langgraph.graph import StateGraph, END
from agents.state import StartupState
from agents.nodes import (
    ceo_agent,
    product_agent,
    marketing_agent,
    finance_agent,
    engineering_agent,
    validation_agent,
)


def build_blueprint_graph() -> StateGraph:
    """Build and compile the LangGraph StateGraph for blueprint generation."""
    graph = StateGraph(StartupState)

    # Add nodes
    graph.add_node("ceo", ceo_agent)
    graph.add_node("product", product_agent)
    graph.add_node("marketing", marketing_agent)
    graph.add_node("finance", finance_agent)
    graph.add_node("engineering", engineering_agent)
    graph.add_node("validation", validation_agent)

    # Define sequential flow
    graph.set_entry_point("ceo")
    graph.add_edge("ceo", "product")
    graph.add_edge("product", "marketing")
    graph.add_edge("marketing", "finance")
    graph.add_edge("finance", "engineering")
    graph.add_edge("engineering", "validation")
    graph.add_edge("validation", END)

    return graph.compile()


# Pre-compiled graph instance for reuse
blueprint_workflow = build_blueprint_graph()
