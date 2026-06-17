import os
import json
from groq import Groq

def validate_idea(idea: str) -> dict:
    # Check 1: Minimum length (no LLM needed)
    if len(idea.strip()) < 20:
        return {
            "is_valid": False,
            "reason": "Please describe your startup idea in at least 20 characters."
        }
    
    # Check 2: LLM gibberish detection
    prompt = """
    You are an input validator for a startup platform.
    
    A user submitted this as their startup idea:
    "{idea}"
    
    Determine if this is a genuine startup idea 
    or random/gibberish text.
    
    A genuine idea:
    - Makes logical sense as a business concept
    - Has at least some coherent meaning
    - Is more than 3 real words strung together
    
    Gibberish examples (REJECT):
    - "asdfjkl qwerty zxcvbn"
    - "Dxfcgvhbjnkml fzsj jjjknmlnj"
    - "aaaaaaa bbbbb"
    - Random letters/numbers with no meaning
    
    Respond ONLY in JSON:
    {{
      "is_valid": true or false,
      "reason": "one sentence explanation"
    }}
    """
    
    groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", 
                       "content": prompt.format(idea=idea)}],
            response_format={"type": "json_object"}
        )
        
        result = json.loads(
            response.choices[0].message.content
        )
        return result
    except Exception as e:
        # Fallback to valid if API fails so we don't block users unnecessarily
        return {
            "is_valid": True,
            "reason": f"Validation skipped due to API error: {str(e)}"
        }
