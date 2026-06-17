"""
StartupOS Simulation Events
List of 12 random events with impact values for the simulation engine.
"""

import random

EVENTS = [
    {
        "name": "New Users Joined",
        "type": "opportunity",
        "impact": {"users": 150, "revenue": 2000, "burn_rate": 200},
    },
    {
        "name": "Server Costs Increased",
        "type": "internal_issue",
        "impact": {"burn_rate": 1500},
    },
    {
        "name": "Competitor Entered Market",
        "type": "competitor_action",
        "impact": {"users": -80, "market_share": -1.5},
    },
    {
        "name": "Viral Marketing Success",
        "type": "opportunity",
        "impact": {"users": 500, "revenue": 8000, "market_share": 2.0},
    },
    {
        "name": "Key Employee Left",
        "type": "internal_issue",
        "impact": {"burn_rate": 2000, "users": -20},
    },
    {
        "name": "Partnership Deal Closed",
        "type": "opportunity",
        "impact": {"revenue": 15000, "market_share": 3.0},
    },
    {
        "name": "Product Bug Found",
        "type": "internal_issue",
        "impact": {"users": -100, "revenue": -1000},
    },
    {
        "name": "Positive Press Coverage",
        "type": "opportunity",
        "impact": {"users": 300, "market_share": 1.0},
    },
    {
        "name": "Investor Interest",
        "type": "opportunity",
        "impact": {"revenue": 50000, "burn_rate": -1000},
    },
    {
        "name": "Regulatory Change",
        "type": "market_change",
        "impact": {"burn_rate": 3000, "users": -50},
    },
    {
        "name": "Customer Churn Spike",
        "type": "internal_issue",
        "impact": {"users": -200, "revenue": -3000},
    },
    {
        "name": "Feature Launch Success",
        "type": "opportunity",
        "impact": {"users": 400, "revenue": 6000, "market_share": 1.5},
    },
]


def get_random_event() -> dict:
    """Pick a random event from the predefined list."""
    return random.choice(EVENTS)
