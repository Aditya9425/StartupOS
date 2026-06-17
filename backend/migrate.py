import os
from supabase import create_client

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    from dotenv import load_dotenv
    load_dotenv("../.env")
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_KEY")

supabase = create_client(supabase_url, supabase_key)

sql = """
ALTER TABLE pitch_decks ADD COLUMN IF NOT EXISTS investor_type TEXT;
ALTER TABLE pitch_decks ADD COLUMN IF NOT EXISTS funding_amount TEXT;
ALTER TABLE pitch_decks ADD COLUMN IF NOT EXISTS current_stage TEXT;
ALTER TABLE pitch_decks ADD COLUMN IF NOT EXISTS traction TEXT;
"""

try:
    # We can try to use supabase.rpc or rest api, but supabase-py might not support arbitrary SQL.
    # Instead, we can use psycopg2 or just print the instruction if we can't do it directly.
    # Actually, we can use HTTP request to Supabase postgres interface if allowed, but psycopg2 is safer if we have connection string.
    pass
except Exception as e:
    print("Error:", e)
