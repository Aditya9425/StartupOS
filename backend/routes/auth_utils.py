import logging
logger = logging.getLogger("uvicorn.error")

from fastapi import Header, HTTPException
from supabase import Client
import os

def get_supabase(authorization: str = Header(None)) -> Client:
    """
    FastAPI dependency to extract the Supabase access token,
    verify it against Supabase Auth, and return an 
    authenticated client.
    """
    from supabase import create_client
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.split(" ")[1]
    
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    if not url or not key:
        raise HTTPException(status_code=500, detail="Supabase environment variables not configured")
    
    try:
        # Create a plain client first (no custom ClientOptions)
        client = create_client(url, key)
        
        # Verify the token by fetching the user — pass token directly
        user_resp = client.auth.get_user(token)
        
        if not user_resp or not user_resp.user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        # Set the session so subsequent queries on this client 
        # are scoped to the authenticated user (for RLS)
        client.postgrest.auth(token)
        
        client.auth_user_id = user_resp.user.id
        return client
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Auth verification failed: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=401, detail="Not authenticated")
