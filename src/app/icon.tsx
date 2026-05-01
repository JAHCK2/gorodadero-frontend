import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'transparent',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0f172a',
          fontWeight: 900,
          fontFamily: 'sans-serif',
          fontStyle: 'italic',
        }}
      >
        <div style={{ display: 'flex', transform: 'scaleY(1.1) skewX(-10deg)' }}>
            <span style={{ color: '#0f172a' }}>G</span>
            <span style={{ color: '#eab308' }}>O</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
