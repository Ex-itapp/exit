import React from 'react';
import { getMoodColor } from '@/lib/visualSystem';

export function DiaryShareTemplate({ data }: { data: any }) {
  const { content, date, mood, tag } = data;
  
  const bgColor = getMoodColor(mood);
  // Ensure readable contrast on dark backgrounds (ink, purple)
  const textColor = (bgColor === '#111111' || bgColor === '#8A2BE2') ? '#F5EFE6' : '#111111';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '64px',
        width: '100%',
        height: '100%',
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: 'Inter',
        border: `32px solid ${textColor}`,
        justifyContent: 'space-between',
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '64px', fontWeight: '900', letterSpacing: '-2px', textTransform: 'uppercase', lineHeight: 1 }}>EX-IT.</span>
          <span style={{ fontSize: '28px', fontWeight: 'bold', fontFamily: 'monospace', opacity: 0.7 }}>LOGBOOK ENTRY</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontFamily: 'monospace' }}>
          <span style={{ fontSize: '24px', opacity: 0.7 }}>DATE</span>
          <span style={{ fontSize: '32px', fontWeight: 'bold' }}>{date}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
        <span style={{ fontSize: '180px', fontFamily: 'serif', lineHeight: 0.5, color: textColor, opacity: 0.3, marginBottom: '40px' }}>"</span>
        <p style={{ 
          fontSize: content.length > 150 ? '56px' : '80px', 
          fontWeight: '500', 
          fontFamily: 'serif',
          lineHeight: 1.15,
          letterSpacing: '-2px'
        }}>
          {content}
        </p>
      </div>

      {/* Bottom Footer */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div style={{ width: '100%', height: '8px', backgroundColor: textColor, marginBottom: '40px', opacity: 0.2 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'monospace', opacity: 0.7, marginBottom: '16px' }}>MOOD / TAGS</span>
            <div style={{ display: 'flex' }}>
              <div style={{
                display: 'flex',
                backgroundColor: textColor,
                color: bgColor,
                padding: '16px 32px',
                borderRadius: '999px',
                fontSize: '28px',
                fontWeight: '900',
                textTransform: 'uppercase',
                marginRight: '16px'
              }}>
                {mood}
              </div>
              {tag && (
                <div style={{
                  display: 'flex',
                  border: `4px solid ${textColor}`,
                  color: textColor,
                  padding: '16px 32px',
                  borderRadius: '999px',
                  fontSize: '28px',
                  fontWeight: '900',
                  textTransform: 'uppercase'
                }}>
                  {tag}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
