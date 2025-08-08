"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRealtime } from '@/hooks/useRealtime';
import { useRoomStore } from '@/store/roomStore';
import { useAttachRemoteAudio } from '@/hooks/useRoomMedia';
import { SimpleVAD } from '@/lib/audio/vad';
import dynamic from 'next/dynamic';
const VoiceVisualizer = dynamic(() => import('@/components/VoiceVisualizer').then(m => m.VoiceVisualizer).catch(() => ({ default: () => null })), { ssr: false });

export default function RoomPage({ params }: { params: { id: string } }) {
  const roomId = params.id;
  const name = typeof window !== 'undefined' ? localStorage.getItem('verbio:name') || 'Guest' : 'Guest';
  const { peers, selfId } = useRealtime({ roomId, name });
  const setSpeaking = useRoomStore((s) => s.setSpeaking);
  const speaking = useRoomStore((s) => s.speaking);
  const [rms, setRms] = useState(0);
  const [zcr, setZcr] = useState(0);
  const vad = useMemo(() => new SimpleVAD({ rmsThreshold: 0.02, zcrThreshold: 0.02, hangoverMs: 250 }), []);
  useAttachRemoteAudio(peers);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const localAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    (async () => {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 48000 });
      await audioCtxRef.current.audioWorklet.addModule('/worklets/level-processor.js');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (localAudioRef.current) localAudioRef.current.srcObject = stream;
      const src = audioCtxRef.current.createMediaStreamSource(stream);
      const node = new AudioWorkletNode(audioCtxRef.current, 'level-processor');
      workletNodeRef.current = node;
      node.port.onmessage = (ev: MessageEvent) => {
        const { rms: r, zcr: z } = ev.data || {};
        setRms(r);
        setZcr(z);
        const speakingNow = vad.update(r, z);
        setSpeaking(selfId, speakingNow);
      };
      src.connect(node).connect(audioCtxRef.current.destination);
    })();
    return () => {
      workletNodeRef.current?.disconnect();
      audioCtxRef.current?.close();
    };
  }, [selfId, setSpeaking, vad]);

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-semibold">Room #{roomId}</h1>
      <div className="mb-3 text-sm text-white/70">Peers: {Object.keys(peers).length + 1}</div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <div className={`rounded-xl border p-4 ${speaking[selfId] ? 'ring-2 ring-primary' : ''}`}>
          <h3 className="mb-2 font-medium">You ({selfId.slice(0, 6)})</h3>
          <audio ref={localAudioRef} autoPlay muted playsInline />
          <div className="mt-2 text-xs">RMS: {rms.toFixed(3)} ZCR: {zcr.toFixed(3)}</div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded bg-white/10">
            <div className="h-2 bg-gradient-to-r from-indigo-500 to-pink-500" style={{ width: `${Math.min(100, Math.round(rms * 200))}%` }} />
          </div>
        </div>
        {Object.values(peers).map((p) => (
          <div key={p.id} className={`rounded-xl border p-4 ${speaking[p.id] ? 'ring-2 ring-primary' : ''}`}>
            <h3 className="mb-2 font-medium">Peer {p.id.slice(0, 6)}</h3>
            <audio id={`audio-${p.id}`} autoPlay playsInline />
          </div>
        ))}
      </div>
    </main>
  );
}


