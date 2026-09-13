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
          justifyContent: 'space-around',
          alignItems: 'center',
          gap: '80px',
          opacity: 0.15,
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
      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', borderBottom: `4px solid ${textColor}30`, paddingBottom: '48px' }}>
        <span style={{ fontSize: '48px', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '2px', opacity: 0.7 }}>
          {date}
        </span>
        
        {/* Top Right Mood Pill */}
        {mood && mood.toLowerCase() !== 'default' && (
           <div style={{
             display: 'flex',
             alignItems: 'center',
             gap: '16px',
             padding: '16px 32px',
             border: `2px solid ${textColor}20`,
             backgroundColor: `${textColor}05`,
             boxShadow: `4px 4px 0px ${textColor}10`
           }}>
             <span style={{ fontSize: '32px' }}>{getMoodEmoji(mood)}</span>
             <span style={{ fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: 'monospace', opacity: 0.9 }}>{mood}</span>
           </div>
        )}
      </div>

      {/* Main Content Body */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        padding: '80px 0'
      }}>
        <p style={{
          fontSize: content.length > 150 ? '42px' : '56px',
          fontWeight: '500',
          lineHeight: 1.4,
          fontStyle: 'italic',
          letterSpacing: '-1px'
        }}>
          "{content}"
        </p>
      </div>

      {/* Footer Branding */}
      <div style={{
        display: 'flex',
        width: '100%',
        justifyContent: 'center',
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
