from fastapi import Header, HTTPException
from supabase import Client

def get_supabase(authorization: str = Header(None)) -> Client:
    """
    FastAPI dependency to extract the Supabase access token from the Authorization header,
    verify it against Supabase Auth, and return a request-specific authenticated client.
    """
    import os
    from supabase import create_client
    from supabase.lib.client_options import ClientOptions
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.split(" ")[1]
    
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    if not url or not key:
        raise HTTPException(status_code=500, detail="Supabase environment variables not configured")
        
    try:
        # Create a user-authenticated client
        client = create_client(url, key, options=ClientOptions(headers={"Authorization": f"Bearer {token}"}))
        # Verify token by fetching user details from Supabase Auth
        user_resp = client.auth.get_user(token)
        if not user_resp or not user_resp.user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        # Store user ID on client object for easy retrieval in route handlers
        client.auth_user_id = user_resp.user.id
        return client
    except Exception:
        raise HTTPException(status_code=401, detail="Not authenticated")
