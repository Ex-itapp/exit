import React from 'react';
import { getMoodColor } from '@/lib/visualSystem';

export function DiaryShareTemplate({ data }: { data: any }) {
  const { content, date, mood } = data;
  
  // The background of the whole image is the mood color
  const bgColor = getMoodColor(mood);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: bgColor,
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter',
        position: 'relative',
        padding: '64px'
      }}
    >
      {/* Background Pattern / Texture (subtle stripes using linear gradient) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.05) 75%, transparent 75%, transparent)',
        backgroundSize: '32px 32px',
        opacity: 0.5,
      }} />

      {/* The Sticky Note */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FEFF9C', // classic sticky note yellow
        padding: '64px',
        width: '80%',
        minHeight: '60%',
        boxShadow: '16px 16px 0px rgba(0,0,0,0.2)', // hard brutalist shadow for the note
        transform: 'rotate(-3deg)',
        zIndex: 10,
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', marginBottom: '48px', opacity: 0.6 }}>
          <span style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'monospace', textTransform: 'uppercase' }}>{mood}</span>
          <span style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'monospace' }}>{date}</span>
        </div>

        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ 
            fontSize: content.length > 100 ? '48px' : '64px', 
            fontWeight: '600', 
            fontFamily: 'serif',
            fontStyle: 'italic',
            lineHeight: 1.3,
            color: '#111111',
            textAlign: 'center',
            margin: 0
          }}>
            {content}
          </p>
        </div>
      </div>

      {/* Simple Branding at the bottom */}
      <div style={{
        position: 'absolute',
        bottom: '64px',
        display: 'flex',
        width: '100%',
        justifyContent: 'center',
        zIndex: 10
      }}>
        <span style={{ 
          fontSize: '32px', 
          fontWeight: '900', 
          letterSpacing: '4px', 
          color: '#111111', 
          backgroundColor: '#F5EFE6',
          padding: '12px 24px',
          boxShadow: '8px 8px 0px rgba(0,0,0,1)'
        }}>
          EX-IT.
        </span>
      </div>
    </div>
  );
}
