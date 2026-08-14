import React from 'react';
import { getMoodColor, getMoodTailwind } from '@/lib/visualSystem';

export function DiaryShareTemplate({ data }: { data: any }) {
  const { content, date, mood, tag } = data;
  
  const bgColor = getMoodColor(mood);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '64px',
        width: '100%',
        height: '100%',
        backgroundColor: '#F5EFE6', // bg
        color: '#111111', // ink
        fontFamily: 'Inter',
        border: `32px solid ${bgColor}`
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <span style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '2px', color: bgColor }}>EX-IT. DIARY</span>
        <span style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'monospace' }}>{date}</span>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ 
          fontSize: content.length > 100 ? '48px' : '72px', 
          fontWeight: 'bold', 
          lineHeight: 1.3,
          fontStyle: 'italic',
          textAlign: 'center'
        }}>
          "{content}"
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '40px', gap: '16px' }}>
        <div style={{
          display: 'flex',
          backgroundColor: bgColor,
          color: '#111111',
          padding: '12px 24px',
          borderRadius: '99px',
          border: '4px solid #111111',
          fontSize: '24px',
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}>
          MOOD: {mood}
        </div>
        {tag && (
          <div style={{
            display: 'flex',
            backgroundColor: '#111111',
            color: '#F5EFE6',
            padding: '12px 24px',
            borderRadius: '99px',
            fontSize: '24px',
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}>
            {tag}
          </div>
        )}
      </div>
    </div>
  );
}
