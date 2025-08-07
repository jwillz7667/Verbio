import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIconDark() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b1623',
          color: '#539ddb',
          borderRadius: 40,
          fontSize: 84,
          fontWeight: 900,
        }}
      >
        V
      </div>
    ),
    { ...size }
  );
}


