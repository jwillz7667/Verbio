import { useCallback, useEffect, useRef, useState } from 'react';

interface UseRealtimeVoiceRealtimeOptions {
  onError?: (e: Error) => void;
  onPartialText?: (text: string) => void;
}

export function useRealtimeVoiceRealtime(options: UseRealtimeVoiceRealtimeOptions = {}) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    remoteAudioRef.current = new Audio();
    remoteAudioRef.current.autoplay = true;
  }, []);

  const disconnect = useCallback(() => {
    dataChannelRef.current?.close();
    pcRef.current?.getSenders().forEach((s) => s.track?.stop());
    pcRef.current?.close();
    dataChannelRef.current = null;
    pcRef.current = null;
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  const connect = useCallback(async () => {
    if (isConnecting || isConnected) return;
    setIsConnecting(true);
    try {
      const tokenResp = await fetch('/api/realtime/session');
      if (!tokenResp.ok) throw new Error('Failed to create realtime session');
      const { client_secret } = await tokenResp.json();
      if (!client_secret) throw new Error('No client secret');

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
      });
      pcRef.current = pc;

      // Incoming audio
      pc.ontrack = (event) => {
        const [stream] = event.streams;
        if (remoteAudioRef.current) remoteAudioRef.current.srcObject = stream;
      };

      // DataChannel for events and partials
      const dc = pc.createDataChannel('oai-events');
      dataChannelRef.current = dc;
      dc.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.type === 'response.delta' && typeof msg.text === 'string') {
            options.onPartialText?.(msg.text);
          }
        } catch {}
      };

      // Add mic track
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          noiseSuppression: true,
          echoCancellation: true,
        },
      });
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      const offer = await pc.createOffer({ offerToReceiveAudio: true });
      await pc.setLocalDescription(offer);

      // Send SDP to OpenAI Realtime
      const sdpResp = await fetch(`https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${client_secret}`,
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp,
      });
      if (!sdpResp.ok) throw new Error('Realtime SDP exchange failed');
      const answerSdp = await sdpResp.text();
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });

      setIsConnected(true);
    } catch (e) {
      options.onError?.(e as Error);
      disconnect();
    } finally {
      setIsConnecting(false);
    }
  }, [disconnect, isConnected, isConnecting, options]);

  return { connect, disconnect, isConnected, isConnecting };
}


