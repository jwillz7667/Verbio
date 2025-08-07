import { NextResponse } from 'next/server';
import { APP_CONFIG } from '@/lib/constants';
import type { HealthCheckResponse } from '@/types/index';

const startTime = Date.now();

export async function GET() {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  
  let openaiStatus = false;
  let databaseStatus = false;
  let redisStatus = false;
  
  try {
    if (process.env.OPENAI_API_KEY) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          signal: controller.signal,
        });
        openaiStatus = response.ok;
      } finally {
        clearTimeout(timeoutId);
      }
    }
  } catch (error) {
    console.error('OpenAI health check failed:', error);
  }
  
  try {
    if (process.env.DATABASE_URL) {
      databaseStatus = true;
    }
  } catch (error) {
    console.error('Database health check failed:', error);
  }
  
  try {
    if (process.env.KV_URL) {
      redisStatus = true;
    }
  } catch (error) {
    console.error('Redis health check failed:', error);
  }
  
  const allServicesHealthy = openaiStatus && (!process.env.DATABASE_URL || databaseStatus) && (!process.env.KV_URL || redisStatus);
  const someServicesHealthy = openaiStatus || databaseStatus || redisStatus;
  
  const status: HealthCheckResponse['status'] = allServicesHealthy 
    ? 'healthy' 
    : someServicesHealthy 
    ? 'degraded' 
    : 'unhealthy';
  
  const response: HealthCheckResponse = {
    status,
    version: APP_CONFIG.version,
    uptime,
    services: {
      openai: openaiStatus,
      database: databaseStatus,
      redis: redisStatus,
    },
  };
  
  return NextResponse.json(response, {
    status: status === 'healthy' ? 200 : status === 'degraded' ? 206 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}