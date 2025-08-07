import { NextRequest, NextResponse } from 'next/server';
import { translateText, transcribeAudio } from '@/lib/openai';
import { RATE_LIMIT, ERROR_MESSAGES } from '@/lib/constants';
import type { ApiResponse, TranslationResult, LanguageCode, VoiceId } from '@/types';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: RATE_LIMIT.maxRequests,
  duration: RATE_LIMIT.windowMs / 1000,
});

export async function POST(request: NextRequest) {
  const clientIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';

  try {
    if (process.env.ENABLE_RATE_LIMITING === 'true') {
      await rateLimiter.consume(clientIp);
    }
  } catch (rateLimiterRes) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
          code: 'RATE_LIMIT_EXCEEDED',
        },
      },
      { 
        status: 429,
        headers: {
          'Retry-After': String(Math.round((rateLimiterRes as any).msBeforeNext / 1000) || 60),
          'X-RateLimit-Limit': String(RATE_LIMIT.maxRequests),
          'X-RateLimit-Remaining': String((rateLimiterRes as any).remainingPoints || 0),
        },
      }
    );
  }

  try {
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      const body = await request.json();
      const { text, sourceLanguage, targetLanguage, voice } = body;

      if (!text || !sourceLanguage || !targetLanguage) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              message: 'Missing required parameters',
              code: 'INVALID_REQUEST',
            },
          },
          { status: 400 }
        );
      }

      const result = await translateText({
        text,
        sourceLanguage: sourceLanguage as LanguageCode,
        targetLanguage: targetLanguage as LanguageCode,
        voice: (voice as VoiceId) || 'alloy',
      });

      const response: TranslationResult = {
        text: result.translatedText,
        language: targetLanguage as LanguageCode,
        audioUrl: result.audioUrl,
        confidence: result.confidence,
        detectedLanguage: result.detectedLanguage as LanguageCode,
      };

      return NextResponse.json<ApiResponse<TranslationResult>>(
        {
          success: true,
          data: response,
        },
        { status: 200 }
      );
    } else if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      const audioFile = formData.get('audio') as File;
      const sourceLanguage = formData.get('sourceLanguage') as string;
      const targetLanguage = formData.get('targetLanguage') as string;
      const voice = formData.get('voice') as string;

      if (!audioFile || !sourceLanguage || !targetLanguage) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              message: 'Missing required parameters',
              code: 'INVALID_REQUEST',
            },
          },
          { status: 400 }
        );
      }

      const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
      const transcription = await transcribeAudio(audioBuffer, sourceLanguage);

      const result = await translateText({
        text: transcription,
        sourceLanguage: sourceLanguage as LanguageCode,
        targetLanguage: targetLanguage as LanguageCode,
        voice: (voice as VoiceId) || 'alloy',
      });

      const response: TranslationResult = {
        text: result.translatedText,
        language: targetLanguage as LanguageCode,
        audioUrl: result.audioUrl,
        confidence: result.confidence,
        detectedLanguage: sourceLanguage as LanguageCode,
      };

      return NextResponse.json<ApiResponse<TranslationResult>>(
        {
          success: true,
          data: response,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            message: 'Unsupported content type',
            code: 'INVALID_CONTENT_TYPE',
          },
        },
        { status: 415 }
      );
    }
  } catch (error) {
    console.error('Translation error:', error);
    
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          message: ERROR_MESSAGES.TRANSLATION_FAILED,
          code: 'TRANSLATION_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}