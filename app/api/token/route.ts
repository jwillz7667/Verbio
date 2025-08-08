import { NextRequest } from 'next/server';
import { SignJWT } from 'jose';

export const runtime = 'edge';

const TTL_SECONDS = 120; // ephemeral

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }
  return new TextEncoder().encode(secret);
}

export async function POST(req: NextRequest) {
  try {
    const { roomId, peerId, name } = await req.json();
    if (!roomId || !peerId) {
      return new Response(JSON.stringify({ error: 'roomId and peerId required' }), { status: 400 });
    }

    const now = Math.floor(Date.now() / 1000);
    const exp = now + TTL_SECONDS;

    const token = await new SignJWT({ roomId, sub: peerId, name: name || 'Guest' })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt(now)
      .setExpirationTime(exp)
      .sign(getSecret());

    return new Response(JSON.stringify({ token, exp }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'failed to mint token' }), { status: 500 });
  }
}


