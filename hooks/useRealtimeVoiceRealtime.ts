import { useCallback, useEffect, useRef, useState } from 'react';

interface UseRealtimeVoiceRealtimeOptions {
  onError?: (e: Error) => void;
  onPartialText?: (text: string) => void;
}

type Lang = 'en' | 'es';

export function useRealtimeVoiceRealtime(options: UseRealtimeVoiceRealtimeOptions = {}) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const sessionPrefsRef = useRef<{ source: Lang; target: Lang; voice?: string }>({ source: 'en', target: 'es' });

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

  const connect = useCallback(async (opts?: { sourceLanguage?: Lang; targetLanguage?: Lang; voice?: string }) => {
    if (isConnecting || isConnected) return;
    setIsConnecting(true);
    try {
      if (opts) {
        sessionPrefsRef.current = {
          source: opts.sourceLanguage ?? sessionPrefsRef.current.source,
          target: opts.targetLanguage ?? sessionPrefsRef.current.target,
          voice: opts.voice ?? sessionPrefsRef.current.voice,
        };
      }
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
      dc.onopen = () => {
        try {
          // Best practice: update session after DC opens with explicit translation instructions
          const prefs = sessionPrefsRef.current;
          const instructions = `You are a professional live interpreter. Translate spoken ${
            prefs.source === 'en' ? 'English' : 'Spanish'
          } into ${prefs.target === 'en' ? 'English' : 'Spanish'} in real time. Keep meaning, tone, and natural spoken cadence.`;
          const msg = {
            type: 'session.update',
            session: {
              instructions,
              voice: prefs.voice || 'verse',
              input_audio_format: 'pcm16',
              // Let server manage VAD per session mint config; we can still pass preferences here
              turn_detection: { type: 'server_vad', threshold: 0.5, prefix_padding_ms: 300, silence_duration_ms: 500 },
              input_audio_transcription: { model: 'gpt-4o-mini-transcribe' },
            },
          } as const;
          dc.send(JSON.stringify(msg));
        } catch {}
      };
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

  return { connect, disconnect, isConnected, isConnecting, remoteAudioRef };
}


