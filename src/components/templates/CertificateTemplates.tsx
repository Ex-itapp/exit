import React from 'react';
import { getMoodColor } from '@/lib/visualSystem';

export function CertificateTemplate({ data }: { data: any }) {
  const { title, date, stat, caseNumber, streakType } = data;
  
  // Decide colors based on streakType or just use brutalist theme
  const bgColor = streakType === '90_day' ? '#FFDF00' : 
                  streakType === '30_day' ? '#00B4D8' : 
                  '#111111';
                  
  const fgColor = bgColor === '#111111' ? '#F5EFE6' : '#111111';
  const accentColor = bgColor === '#111111' ? '#FF3366' : '#111111';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '64px',
        width: '100%',
        height: '100%',
        backgroundColor: bgColor,
        color: fgColor,
        fontFamily: 'Inter',
        border: '32px solid #111111'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '80px' }}>
        <span style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '4px' }}>EX-IT.</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontFamily: 'monospace' }}>
          <span style={{ fontSize: '20px', opacity: 0.7 }}>DATE OF ISSUE</span>
          <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{date}</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <span style={{ fontSize: '32px', textTransform: 'uppercase', opacity: 0.8, marginBottom: '24px', fontFamily: 'monospace' }}>
          Official Achievement
        </span>
        <h1 style={{ fontSize: '96px', fontWeight: '900', textTransform: 'uppercase', lineHeight: 1, marginBottom: '48px', color: accentColor }}>
          {title}
        </h1>
        
        <div style={{
          display: 'flex',
          backgroundColor: fgColor,
          color: bgColor,
          padding: '24px 48px',
          border: `8px solid ${accentColor}`,
          width: 'fit-content',
          boxShadow: `12px 12px 0px 0px ${accentColor}`,
          marginBottom: '64px'
        }}>
          <span style={{ fontSize: '48px', fontWeight: 'bold', fontFamily: 'monospace' }}>{stat}</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: `4px solid ${fgColor}`, paddingTop: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'monospace' }}>
          <span style={{ fontSize: '16px', opacity: 0.6 }}>CASE FILE NO.</span>
          <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{caseNumber}</span>
        </div>
        
        <div style={{
          display: 'flex',
          width: '120px',
          height: '120px',
          borderRadius: '999px',
          border: `6px solid ${fgColor}`,
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'rotate(-15deg)',
        }}>
          <span style={{ fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center' }}>VERIFIED</span>
        </div>
      </div>
    </div>
  );
}
