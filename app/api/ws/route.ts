import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { kv } from '@vercel/kv';

export const runtime = 'edge';

async function verify(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
  return payload as { roomId: string; sub: string; name?: string };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  if (!token) return new Response('missing token', { status: 401 });

  const upgradeHeader = req.headers.get('upgrade') || '';
  if (upgradeHeader.toLowerCase() !== 'websocket') {
    return new Response('Expected websocket', { status: 426 });
  }

  // WebSocketPair is available in the Edge runtime but not typed in lib.dom.d.ts
  const pair = new (globalThis as any).WebSocketPair();
  type WebSocketWithAccept = WebSocket & { accept: () => void };
  const client = pair[0] as WebSocket;
  const server = pair[1] as WebSocketWithAccept;

  (async () => {
    try {
      const claims = await verify(token);
      const roomId = claims.roomId;
      const peerId = claims.sub;
      const name = claims.name || 'Guest';

      const ws = server as WebSocketWithAccept;
      ws.accept();

      // Track membership using Vercel KV if configured
      try {
        await kv.sadd(`room:${roomId}:peers`, peerId);
        await kv.expire(`room:${roomId}:peers`, 60 * 10);
      } catch {}

      // In-memory fan-out for this instance
      const g = globalThis as any;
      g.__rooms = g.__rooms || new Map<string, Set<WebSocket>>();
      if (!g.__rooms.has(roomId)) g.__rooms.set(roomId, new Set());
      const room = g.__rooms.get(roomId) as Set<WebSocket>;
      room.add(ws);

      const broadcast = (msg: any) => {
        const data = JSON.stringify(msg);
        for (const sock of room) {
          try { sock.send(data); } catch {}
        }
      };

      // announce join
      broadcast({ type: 'peer-join', peerId, name, roomId, ts: Date.now() });

      ws.addEventListener('message', (ev: MessageEvent) => {
        try {
          const msg = JSON.parse(ev.data as string);
          if (msg && typeof msg === 'object') {
            msg.peerId = peerId;
            msg.ts = Date.now();
            broadcast(msg);
          }
        } catch {}
      });

      ws.addEventListener('close', () => {
        room.delete(ws);
        broadcast({ type: 'peer-leave', peerId, roomId, ts: Date.now() });
        if (room.size === 0) g.__rooms.delete(roomId);
        try {
          kv.srem(`room:${roomId}:peers`, peerId).catch(() => {});
        } catch {}
      });
    } catch (e) {
      (server as any).close();
    }
  })();

  // The `webSocket` ResponseInit extension isn't in TypeScript's standard lib types
  return new Response(null, { status: 101, webSocket: client } as any);
}


