import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, MetricsData } from '@/types';

let metricsStore = {
  totalTranslations: 0,
  totalResponseTime: 0,
  activeUsers: new Set<string>(),
  errors: 0,
  requests: 0,
  lastReset: Date.now(),
};

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.METRICS_API_KEY}`) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
      },
      { status: 401 }
    );
  }

  const now = Date.now();
  const timeSinceReset = now - metricsStore.lastReset;
  
  if (timeSinceReset > 3600000) {
    metricsStore = {
      totalTranslations: 0,
      totalResponseTime: 0,
      activeUsers: new Set<string>(),
      errors: 0,
      requests: 0,
      lastReset: now,
    };
  }

  const metrics: MetricsData = {
    totalTranslations: metricsStore.totalTranslations,
    averageResponseTime: metricsStore.requests > 0 
      ? metricsStore.totalResponseTime / metricsStore.requests 
      : 0,
    activeUsers: metricsStore.activeUsers.size,
    errorRate: metricsStore.requests > 0 
      ? metricsStore.errors / metricsStore.requests 
      : 0,
    timestamp: new Date(),
  };

  return NextResponse.json<ApiResponse<MetricsData>>(
    {
      success: true,
      data: metrics,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.METRICS_API_KEY}`) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
      },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { event, userId, responseTime, error } = body;

    metricsStore.requests++;

    if (userId) {
      metricsStore.activeUsers.add(userId);
    }

    if (event === 'translation_completed') {
      metricsStore.totalTranslations++;
    }

    if (responseTime) {
      metricsStore.totalResponseTime += responseTime;
    }

    if (error) {
      metricsStore.errors++;
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          message: 'Invalid request',
          code: 'INVALID_REQUEST',
        },
      },
      { status: 400 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}