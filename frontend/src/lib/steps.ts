export async function completeStep(startupId: string, step: string, token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/startup/${startupId}/complete-step`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ step })
    }
  );
  if (!res.ok) {
    throw new Error("Failed to complete step");
  }
  return res.json();
}
