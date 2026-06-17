"""
StartupOS Agent State Definition
Defines the shared state that flows through the LangGraph agent pipeline.
"""

from typing import TypedDict, Optional


class StartupState(TypedDict):
    """State shared across all agents in the LangGraph pipeline."""
    startup_id: str
    idea: str
    company_name: str
    stage: Optional[str]
    challenges: Optional[list[str]]
    target_audience: Optional[str]
    problem_statement: Optional[str]
    ceo_output: Optional[str]
    product_output: Optional[str]
    marketing_output: Optional[str]
    finance_output: Optional[str]
    engineering_output: Optional[str]
    blueprint: Optional[dict]
    validation_score: Optional[dict]
