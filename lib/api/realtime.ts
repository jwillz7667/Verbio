export async function mintRealtimeSession() {
  const res = await fetch('/api/realtime/session');
  if (!res.ok) throw new Error('Failed to mint realtime session');
  return res.json() as Promise<{ client_secret: string; expires_at: string; model: string }>;
}


