"""
StartupOS Memory Store
Manages creating vector embeddings for text and performing similarity search
against the Supabase memories table using pgvector.
"""

from typing import List, Dict, Any, Optional
from sentence_transformers import SentenceTransformer
# Global import of supabase removed to prevent circular import

# Load the model locally (approx 90MB). 
# It will be downloaded and cached on first run.
# all-MiniLM-L6-v2 outputs a 384-dimensional vector.
model = SentenceTransformer("all-MiniLM-L6-v2")


class MemoryStore:
    @staticmethod
    def _get_embedding(text: str) -> List[float]:
        """Generate a 384-dimensional vector embedding for a given text."""
        # The encode method returns a numpy array, convert to list of floats
        vector = model.encode(text).tolist()
        return vector

    @staticmethod
    def save_memory(startup_id: str, memory_type: str, content: str, metadata: dict = None, supabase_client: Any = None) -> Optional[dict]:
        """
        Embed and save a memory to Supabase.
        memory_type: 'decision', 'outcome', or 'event'
        """
        client = supabase_client
        if not client:
            from main import supabase
            client = supabase
        if not client:
            print("Warning: Supabase not configured. Memory not saved.")
            return None

        try:
            embedding = MemoryStore._get_embedding(content)
            
            record = {
                "startup_id": startup_id,
                "memory_type": memory_type,
                "content": content,
                "embedding": embedding,
                "metadata": metadata or {}
            }
            
            result = client.table("memories").insert(record).execute()
            if result.data:
                return result.data[0]
            return None
            
        except Exception as e:
            print(f"Error saving memory: {e}")
            return None

    @staticmethod
    def search_memories(startup_id: str, query: str, limit: int = 3, supabase_client: Any = None) -> List[Dict[str, Any]]:
        """
        Search for past memories using cosine similarity via the search_memories RPC.
        """
        client = supabase_client
        if not client:
            from main import supabase
            client = supabase
        if not client:
            print("Warning: Supabase not configured. Memory search failed.")
            return []

        try:
            query_embedding = MemoryStore._get_embedding(query)
            
            # Call the pgvector RPC function defined in the SQL script
            result = client.rpc(
                "search_memories",
                {
                    "query_embedding": query_embedding,
                    "match_startup_id": startup_id,
                    "match_count": limit
                }
            ).execute()
            
            return result.data if result.data else []
            
        except Exception as e:
            print(f"Error searching memories: {e}")
            return []

    @staticmethod
    def format_memories_for_prompt(memories: List[Dict[str, Any]]) -> str:
        """
        Format a list of retrieved memory records into a single readable string 
        for injection into LLM prompts.
        """
        if not memories:
            return "No relevant past experiences found."
            
        formatted = []
        for i, mem in enumerate(memories):
            content = mem.get("content", "")
            memory_type = mem.get("memory_type", "unknown")
            meta = mem.get("metadata", {})
            
            # Format impact nicely if it exists
            impact_str = ""
            if meta and "impact" in meta:
                impacts = [f"{k}: {v}" for k, v in meta["impact"].items()]
                impact_str = f" | Outcome Impact: {', '.join(impacts)}"
                
            formatted.append(f"Memory {i+1} [{memory_type}]: {content}{impact_str}")
            
        return "\n".join(formatted)
