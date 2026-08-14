import React from 'react';
import { getMoodColor, getMoodEmoji } from '@/lib/visualSystem';

export function DiaryShareTemplate({ data }: { data: any }) {
  const { content, date, mood, bgColor } = data;
  
  const finalBgColor = bgColor || getMoodColor(mood);
  const isDarkBg = finalBgColor.toLowerCase() === '#111111' || finalBgColor.toLowerCase() === '#8a2be2' || finalBgColor.toLowerCase() === '#ff3366' || finalBgColor.toLowerCase() === '#000000';
  const textColor = isDarkBg ? '#F5EFE6' : '#111111';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: finalBgColor,
        color: textColor,
        fontFamily: 'Inter',
        position: 'relative',
        padding: '96px',
        overflow: 'hidden'
      }}
    >
      {/* Emoji Pattern Background */}
      {mood && mood.toLowerCase() !== 'default' && (
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '-20%',
          right: '-20%',
          bottom: '-20%',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          gap: '80px',
          opacity: 0.15,
          zIndex: 0,
          pointerEvents: 'none',
          transform: 'rotate(-10deg)'
        }}>
          {Array.from({ length: 60 }).map((_, i) => (
            <span key={i} style={{ fontSize: '140px' }}>
              {getMoodEmoji(mood)}
            </span>
          ))}
        </div>
      )}
      {/* Header */}
      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, borderBottom: `8px solid ${textColor}`, paddingBottom: '48px' }}>
        <span style={{ fontSize: '48px', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '2px', opacity: 0.7 }}>
          {date}
        </span>
        
        {/* Top Right Mood Pill */}
        {mood && mood.toLowerCase() !== 'default' && (
           <div style={{
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             padding: '24px 48px',
             border: `8px solid ${textColor}`,
             borderRadius: '999px',
             backgroundColor: 'transparent',
             color: textColor
           }}>
             <span style={{ fontSize: '48px', fontWeight: 'bold', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '4px' }}>
               {mood}
             </span>
           </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '64px' }}>
        <p style={{ 
          fontSize: content.length > 80 ? '80px' : '120px', 
          fontWeight: '500', 
          fontFamily: 'serif',
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
          textAlign: 'center',
          margin: 0,
          zIndex: 10
        }}>
          {content}
        </p>
      </div>

      {/* Footer Branding */}
      <div style={{
        display: 'flex',
        width: '100%',
        justifyContent: 'center',
        zIndex: 10,
        paddingBottom: '48px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', border: `8px solid ${textColor}`, backgroundColor: finalBgColor, padding: '32px 64px', boxShadow: `16px 16px 0px ${textColor}` }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#FEFF9C', border: '8px solid #111111', marginRight: '32px', transform: 'rotate(-10deg)' }} />
          <span style={{ fontSize: '64px', fontWeight: '900', letterSpacing: '8px', textTransform: 'uppercase' }}>
            EX-IT.
          </span>
        </div>
      </div>
    </div>
  );
}
