from supabase import Client

def mark_step_completed(supabase: Client, startup_id: str, step_name: str) -> None:
    """
    Appends a step to the completed_steps array for a startup.
    """
    try:
        response = supabase.table("startups").select("completed_steps").eq("id", startup_id).execute()
        if not response.data:
            return
            
        current_steps = response.data[0].get("completed_steps") or []
        
        if step_name not in current_steps:
            current_steps.append(step_name)
            supabase.table("startups").update({
                "completed_steps": current_steps
            }).eq("id", startup_id).execute()
    except Exception as e:
        print(f"Error marking step {step_name} completed for startup {startup_id}: {e}")
