import asyncio
import sys
import os

# Adjust paths
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from unittest.mock import MagicMock
from routes.competitor import analyze_competitors, AnalyzeRequest

async def test():
    req = AnalyzeRequest(startup_id="test_123")
    supabase = MagicMock()
    mock_resp = MagicMock()
    mock_resp.data = [{
        "id": "test_123",
        "idea": "Food delivery",
        "target_audience": "Students",
        "problem_statement": "Hunger",
        "stage": "Idea"
    }]
    
    # Setup mock chain
    table_mock = MagicMock()
    supabase.table.return_value = table_mock
    select_mock = MagicMock()
    table_mock.select.return_value = select_mock
    eq_mock = MagicMock()
    select_mock.eq.return_value = eq_mock
    eq_mock.execute.return_value = mock_resp
    
    # We also need to mock delete
    delete_mock = MagicMock()
    table_mock.delete.return_value = delete_mock
    delete_eq_mock = MagicMock()
    delete_mock.eq.return_value = delete_eq_mock
    delete_eq_mock.execute.return_value = MagicMock()
    
    # Mock insert
    table_mock.insert.return_value.execute.return_value = MagicMock()
    
    try:
        res = await analyze_competitors(req, supabase)
        print("Success!")
    except Exception as e:
        print("Error inside route:")
        import traceback
        traceback.print_exc()

asyncio.run(test())
