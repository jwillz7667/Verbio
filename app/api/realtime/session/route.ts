export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { REALTIME_CONFIG } from '@/lib/constants';

export async function GET(_req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'OPENAI_API_KEY not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Mint an ephemeral client token for WebRTC per OpenAI Realtime best practices
    const resp = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'realtime=v1',
      },
      body: JSON.stringify({
        model: REALTIME_CONFIG.model || 'gpt-4o-realtime-preview-2024-12-17',
        voice: 'verse',
        input_audio_format: 'pcm16',
        output_audio_format: 'opus',
        modalities: ['text', 'audio'],
        // Enable VAD-based turn detection server-side
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500,
        },
        input_audio_transcription: { model: 'gpt-4o-mini-transcribe' },
        // Keep TTL at default (~1 min) per ephemeral token guidance
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return new Response(text, { status: resp.status });
    }

    const data = await resp.json();
    // data.client_secret.value contains the ephemeral token
    return new Response(JSON.stringify({
      client_secret: data.client_secret?.value,
      expires_at: data.expires_at,
      model: data.model,
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Failed to mint realtime session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}


