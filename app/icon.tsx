import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a4363',
          color: 'white',
          borderRadius: 12,
          fontSize: 36,
          fontWeight: 800,
        }}
      >
        V
      </div>
    ),
    { ...size }
  );
}


