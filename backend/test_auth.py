import os
from supabase import create_client
from supabase.lib.client_options import ClientOptions

url = "https://cwpzvnjwijsjxucymrmp.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." # dummy key format

try:
    client = create_client(url, key, options=ClientOptions(headers={"Authorization": f"Bearer fake_token"}))
    user_resp = client.auth.get_user("fake_token")
    print(user_resp)
except Exception as e:
    print(f"Error: {type(e).__name__}: {str(e)}")
