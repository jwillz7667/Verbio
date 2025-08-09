import { NextRequest } from 'next/server';

// Ensure sufficient execution window without relying on vercel.json functions config
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('No OpenAI API key found');
    return new Response('API key required', { status: 401 });
  }

  try {
    const body = await request.json();
    const { audio, autoDetectLanguage = true, preferredVoiceGender = 'auto' } = body;
    
    console.log('Received translation request:', {
      audioLength: audio?.length,
      autoDetectLanguage
    });

    // Create form data for audio transcription
    const formData = new FormData();
    
    // Convert base64 audio to blob
    const audioData = Buffer.from(audio, 'base64');
    console.log('Audio buffer size:', audioData.length);
    
    const audioBlob = new Blob([audioData], { type: 'audio/wav' });
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-1');
    
    // First, transcribe the audio to detect language
    console.log('Transcribing audio...');
    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData
    });

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      console.error('Transcription failed:', errorText);
      throw new Error(`Transcription failed: ${transcriptionResponse.statusText}`);
    }

    const transcriptionData = await transcriptionResponse.json();
    const transcribedText = transcriptionData.text;
    console.log('Transcribed text:', transcribedText);

    // Detect language only - we'll add proper audio-based gender detection later
    const languageDetectionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a language detector. Respond with ONLY "en" for English or "es" for Spanish. Nothing else.'
          },
          {
            role: 'user',
            content: transcribedText
          }
        ],
        temperature: 0,
        max_tokens: 5
      })
    });

    if (!languageDetectionResponse.ok) {
      throw new Error('Language detection failed');
    }

    const languageData = await languageDetectionResponse.json();
    const detectedLanguage = languageData.choices[0].message.content.trim().toLowerCase();
    const sourceLanguage = detectedLanguage === 'es' ? 'es' : 'en';
    const targetLanguage = sourceLanguage === 'en' ? 'es' : 'en';
    
    console.log(`Detected: language=${sourceLanguage}, translating to: ${targetLanguage}`);

    // Translate the text - IMPORTANT: No content filtering
    const translationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate EXACTLY what is said from ${sourceLanguage === 'en' ? 'English' : 'Spanish'} to ${targetLanguage === 'en' ? 'English' : 'Spanish'}. 
            IMPORTANT: 
            - Translate EVERYTHING including vulgar language, profanity, slang, and colloquialisms
            - Maintain the exact tone, emotion, and intensity
            - Preserve emotional nuances, pauses (with ...), and exclamations
            - Keep informal speech patterns natural (contractions, colloquialisms)
            - Do NOT censor or filter any content
            - Make it sound like natural spoken language, not written text
            - Respond with ONLY the translation, no explanations or warnings`
          },
          {
            role: 'user',
            content: transcribedText
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!translationResponse.ok) {
      throw new Error(`Translation failed: ${translationResponse.statusText}`);
    }

    const translationData = await translationResponse.json();
    const translatedText = translationData.choices[0].message.content;
    console.log('Translated text:', translatedText);

    // Select voice based on user preference or use versatile default
    // OpenAI voices: alloy (neutral), echo (male), fable (male), onyx (male), nova (female), shimmer (female)
    let selectedVoice;
    let genderUsed = preferredVoiceGender;
    
    if (preferredVoiceGender === 'auto' || preferredVoiceGender === 'neutral') {
      // Use the most versatile, neutral-sounding voices
      if (targetLanguage === 'es') {
        selectedVoice = 'alloy'; // Most neutral voice, works well for Spanish
      } else {
        selectedVoice = 'nova'; // Clear and versatile for English
      }
      genderUsed = 'neutral';
    } else if (preferredVoiceGender === 'male') {
      // User specifically wants male voice
      if (targetLanguage === 'es') {
        selectedVoice = 'onyx'; // Deep, natural male voice for Spanish
      } else {
        selectedVoice = 'echo'; // Clear, natural male voice for English
      }
      genderUsed = 'male';
    } else if (preferredVoiceGender === 'female') {
      // User specifically wants female voice
      if (targetLanguage === 'es') {
        selectedVoice = 'nova'; // Warm, natural female voice for Spanish
      } else {
        selectedVoice = 'shimmer'; // Expressive, natural female voice for English
      }
      genderUsed = 'female';
    } else {
      // Fallback to most neutral
      selectedVoice = 'alloy';
      genderUsed = 'neutral';
    }
    
    console.log(`Using voice: ${selectedVoice} (${genderUsed}) for ${targetLanguage}`);

    // Generate speech from translated text - Use tts-1-hd for better quality
    const speechResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1-hd', // Higher quality for more natural sound
        input: translatedText,
        voice: selectedVoice,
        response_format: 'mp3',
        speed: 0.95 // Slightly slower for more natural cadence
      })
    });

    if (!speechResponse.ok) {
      throw new Error(`Speech generation failed: ${speechResponse.statusText}`);
    }

    const speechBuffer = await speechResponse.arrayBuffer();
    const audioBase64 = Buffer.from(speechBuffer).toString('base64');

    return new Response(JSON.stringify({
      success: true,
      transcription: transcribedText,
      translation: translatedText,
      audio: audioBase64,
      detectedLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
      voiceGender: genderUsed,
      voiceUsed: selectedVoice
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Translation failed' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Health check endpoint
export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  return new Response(JSON.stringify({
    status: 'ok',
    hasApiKey: !!apiKey,
    timestamp: new Date().toISOString()
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}