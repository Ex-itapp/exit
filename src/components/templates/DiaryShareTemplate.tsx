import React from 'react';
import { getMoodColor } from '@/lib/visualSystem';

export function DiaryShareTemplate({ data }: { data: any }) {
  const { content, date, mood, tag, bgColor } = data;
  
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
        padding: '64px'
      }}
    >
      {/* Subtle Watermark - Only show if mood is genuinely selected */}
      {mood && mood.toLowerCase() !== 'default' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-5deg)',
          fontSize: '30vw',
          lineHeight: 0.8,
          letterSpacing: '-0.05em',
          whiteSpace: 'nowrap',
          fontWeight: 'bold',
          opacity: 0.05,
          zIndex: 0,
          pointerEvents: 'none'
        }}>
          {mood.toUpperCase()}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, borderBottom: `4px solid ${textColor}`, paddingBottom: '32px' }}>
        <span style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '2px', opacity: 0.7 }}>
          {date}
        </span>
        
        {/* Top Right Mood Circle */}
        {mood && mood.toLowerCase() !== 'default' && (
           <div style={{
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             width: '160px',
             height: '160px',
             border: `6px solid ${textColor}`,
             borderRadius: '999px',
             backgroundColor: 'transparent',
             color: textColor
           }}>
             <span style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center', lineHeight: 1.1 }}>
               {mood}
             </span>
           </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '64px' }}>
        <p style={{ 
          fontSize: content.length > 80 ? '64px' : '96px', 
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
        paddingBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', border: `4px solid ${textColor}`, backgroundColor: finalBgColor, padding: '16px 32px', boxShadow: `8px 8px 0px ${textColor}` }}>
          <div style={{ width: '24px', height: '24px', backgroundColor: '#FEFF9C', border: '4px solid #111111', marginRight: '16px', transform: 'rotate(-10deg)' }} />
          <span style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '4px', textTransform: 'uppercase' }}>
            EX-IT.
          </span>
        </div>
      </div>
    </div>
  );
}
