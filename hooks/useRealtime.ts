import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SignalMessage } from '@/lib/ws/schema';

export interface Peer {
  id: string;
  name: string;
  pc: RTCPeerConnection;
  stream: MediaStream;
}

interface UseRealtimeOpts {
  roomId: string;
  name?: string;
}

export function useRealtime({ roomId, name }: UseRealtimeOpts) {
  const [peers, setPeers] = useState<Record<string, Peer>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const selfId = useMemo(() => crypto.randomUUID(), []);

  const connectWS = useCallback(async () => {
    const tokRes = await fetch('/api/token', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ roomId, peerId: selfId, name }),
    });
    if (!tokRes.ok) throw new Error('token failed');
    const { token } = await tokRes.json();
    const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/api/ws?token=${encodeURIComponent(token)}`);
    wsRef.current = ws;

    ws.onmessage = async (ev) => {
      const msg = JSON.parse(ev.data) as SignalMessage;
      if (msg.type === 'peer-join' && msg.peerId !== selfId) {
        await ensurePeer(msg.peerId);
        await makeOffer(msg.peerId);
      } else if (msg.type === 'offer' && msg.target === selfId) {
        await handleOffer(msg.peerId, msg.sdp);
      } else if (msg.type === 'answer' && msg.target === selfId) {
        await handleAnswer(msg.peerId, msg.sdp);
      } else if (msg.type === 'ice' && msg.target === selfId) {
        const p = peersRef.current[msg.peerId];
        if (p) await p.pc.addIceCandidate(msg.candidate);
      } else if (msg.type === 'peer-leave') {
        const p = peersRef.current[msg.peerId];
        if (p) {
          p.pc.close();
        }
        setPeers((prev) => {
          const copy = { ...prev };
          delete copy[msg.peerId];
          return copy;
        });
      }
    };
  }, [roomId, selfId, name]);

  const peersRef = useRef<Record<string, Peer>>({});
  useEffect(() => {
    peersRef.current = peers;
  }, [peers]);

  const ensurePeer = useCallback(async (peerId: string) => {
    if (peersRef.current[peerId]) return peersRef.current[peerId];
    const pc = new RTCPeerConnection({ iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] });
    const stream = new MediaStream();
    pc.ontrack = (e) => {
      e.streams[0]?.getTracks().forEach((t) => stream.addTrack(t));
      setPeers((prev) => ({ ...prev, [peerId]: { ...(prev[peerId] || { id: peerId, name: 'Peer' }), pc, stream } }));
    };
    pc.onicecandidate = (e) => {
      if (e.candidate && wsRef.current) {
        wsRef.current.send(
          JSON.stringify({ type: 'ice', candidate: e.candidate.toJSON(), target: peerId })
        );
      }
    };

    // add local tracks lazily
    if (!localStreamRef.current) {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    }
    localStreamRef.current.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current!));

    const wrapped: Peer = { id: peerId, name: 'Peer', pc, stream };
    setPeers((prev) => ({ ...prev, [peerId]: wrapped }));
    return wrapped;
  }, []);

  const makeOffer = useCallback(async (peerId: string) => {
    const p = peersRef.current[peerId] || (await ensurePeer(peerId));
    const offer = await p.pc.createOffer({ offerToReceiveAudio: true });
    await p.pc.setLocalDescription(offer);
    wsRef.current?.send(JSON.stringify({ type: 'offer', sdp: offer.sdp, target: peerId }));
  }, [ensurePeer]);

  const handleOffer = useCallback(async (peerId: string, sdp: string) => {
    const p = peersRef.current[peerId] || (await ensurePeer(peerId));
    await p.pc.setRemoteDescription({ type: 'offer', sdp });
    const answer = await p.pc.createAnswer();
    await p.pc.setLocalDescription(answer);
    wsRef.current?.send(JSON.stringify({ type: 'answer', sdp: answer.sdp, target: peerId }));
  }, [ensurePeer]);

  const handleAnswer = useCallback(async (peerId: string, sdp: string) => {
    const p = peersRef.current[peerId];
    if (!p) return;
    await p.pc.setRemoteDescription({ type: 'answer', sdp });
  }, []);

  useEffect(() => {
    connectWS();
    return () => {
      wsRef.current?.close();
      Object.values(peersRef.current).forEach((p) => p.pc.close());
    };
  }, [connectWS]);

  return { peers, selfId };
}


