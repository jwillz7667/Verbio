import { useEffect } from 'react';

export function useAttachRemoteAudio(peers: Record<string, { id: string; stream: MediaStream }>) {
  useEffect(() => {
    Object.values(peers).forEach((p) => {
      const el = document.getElementById(`audio-${p.id}`) as HTMLAudioElement | null;
      if (el && el.srcObject !== p.stream) {
        el.srcObject = p.stream;
      }
    });
  }, [peers]);
}


