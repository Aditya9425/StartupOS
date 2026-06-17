import requests

try:
    resp = requests.post("http://127.0.0.1:8000/api/generate-blueprint", json={
        "startup_id": "test_123",
        "idea": "Food delivery in India"
    })
    print(resp.status_code)
    print(resp.text)
except Exception as e:
    print(e)
