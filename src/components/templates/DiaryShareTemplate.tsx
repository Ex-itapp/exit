import React from 'react';
import { getMoodColor } from '@/lib/visualSystem';

export function DiaryShareTemplate({ data }: { data: any }) {
  const { content, date, mood, tag } = data;
  
  const bgColor = getMoodColor(mood);
  const textColor = (bgColor === '#111111' || bgColor === '#8A2BE2') ? '#F5EFE6' : '#111111';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: 'Inter',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Huge Watermark */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        fontSize: '400px',
        fontWeight: '900',
        letterSpacing: '-20px',
        opacity: 0.05,
        color: textColor,
        lineHeight: 0.8,
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'none'
      }}>
        <span>EX</span>
        <span>IT</span>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        border: `32px solid ${textColor}`,
        padding: '48px',
        justifyContent: 'space-between',
        zIndex: 10
      }}>
        
        {/* Top Header - Brutalist Grid style */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `8px solid ${textColor}`, paddingBottom: '24px', marginBottom: '24px' }}>
            <span style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-2px', textTransform: 'uppercase' }}>LOGBOOK ENTRY</span>
            <span style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-2px' }}>{date}</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex' }}>
            <span style={{ 
              fontSize: '120px', 
              fontWeight: '900',
              lineHeight: 0.8, 
              marginRight: '24px' 
            }}>
              "
            </span>
            <p style={{ 
              fontSize: content.length > 100 ? '64px' : '88px', 
              fontWeight: '800', 
              lineHeight: 1.1,
              letterSpacing: '-2px',
              textTransform: 'uppercase',
              margin: 0
            }}>
              {content}
            </p>
          </div>
        </div>

        {/* Bottom Metadata - Grid layout instead of pills */}
        <div style={{ display: 'flex', width: '100%', borderTop: `8px solid ${textColor}` }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, borderRight: `8px solid ${textColor}`, padding: '32px 32px 0 0' }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold', opacity: 0.7, textTransform: 'uppercase', marginBottom: '8px' }}>DETECTED MOOD</span>
            <span style={{ fontSize: '48px', fontWeight: '900', textTransform: 'uppercase' }}>{mood}</span>
          </div>
          
          {tag ? (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '32px 0 0 32px' }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold', opacity: 0.7, textTransform: 'uppercase', marginBottom: '8px' }}>TAGGED</span>
              <span style={{ fontSize: '48px', fontWeight: '900', textTransform: 'uppercase' }}>{tag}</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flex: 1, padding: '32px 0 0 32px', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '4px' }}>EX-IT.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
