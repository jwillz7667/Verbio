"use client";
import dynamic from 'next/dynamic';

export const ListeningOrb3D = dynamic(() => import('@/components/voice-app/ListeningOrb').then(m => m.ListeningOrb), { ssr: false });


