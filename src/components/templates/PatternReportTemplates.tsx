import React from 'react';
import { getMoodColor, getFlagColor } from '@/lib/visualSystem';

// --- Page 1: Overview ---
export function PatternReportOverview({ data }: { data: any }) {
  const { headline, stat_highlight, subtext } = data.page1_overview;
  
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '64px',
        width: '100%',
        height: '100%',
        backgroundColor: '#111111', // ink
        color: '#F5EFE6', // bg
        fontFamily: 'Inter',
      }}
    >
      <div style={{ display: 'flex', position: 'absolute', top: '48px', left: '48px' }}>
        <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFDF00' }}>EX-IT.</span>
      </div>
      
      <h1 style={{ fontSize: '96px', fontWeight: '900', textTransform: 'uppercase', lineHeight: 1.1, marginBottom: '48px' }}>
        {headline}
      </h1>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFDF00', // brand
        color: '#111111', // ink
        padding: '32px',
        border: '8px solid #111111',
        boxShadow: '16px 16px 0px 0px #F5EFE6', // brutalist shadow
        marginBottom: '32px'
      }}>
        <span style={{ fontSize: '48px', fontWeight: '900', textTransform: 'uppercase' }}>{stat_highlight}</span>
      </div>

      <p style={{ fontSize: '32px', fontWeight: '500', opacity: 0.9 }}>{subtext}</p>
    </div>
  );
}

// --- Page 2: Diary ---
export function PatternReportDiary({ data }: { data: any }) {
  const { headline, coping_comparison, mood_breakdown, standout_line } = data.page2_diary;
  
  // Pick the dominant mood color
  const dominantMood = mood_breakdown && mood_breakdown.length > 0 ? mood_breakdown[0].mood : 'default';
  const bgColor = getMoodColor(dominantMood);
  
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '64px',
        width: '100%',
        height: '100%',
        backgroundColor: bgColor,
        color: '#111111',
        fontFamily: 'Inter',
      }}
    >
      <div style={{ display: 'flex', position: 'absolute', top: '48px', left: '48px' }}>
        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>EX-IT. / DIARY</span>
      </div>

      <h1 style={{ fontSize: '80px', fontWeight: '900', textTransform: 'uppercase', lineHeight: 1.1, marginBottom: '40px' }}>
        {headline}
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '48px' }}>
        <span style={{ fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.7, marginBottom: '16px' }}>Moods Detected</span>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          {mood_breakdown?.slice(0, 3).map((m: any) => (
            <div key={m.mood} style={{ display: 'flex', backgroundColor: '#111111', color: '#FFF', padding: '8px 24px', borderRadius: '99px', fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase', marginRight: '16px' }}>
              {m.mood} ({m.count})
            </div>
          ))}
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#F5EFE6', 
        padding: '32px',
        border: '6px solid #111111',
        boxShadow: '12px 12px 0px 0px #111111',
        marginBottom: '40px'
      }}>
        <span style={{ fontSize: '36px', fontWeight: 'bold', fontStyle: 'italic' }}>"{standout_line}"</span>
      </div>

      <p style={{ fontSize: '28px', fontWeight: '600' }}>{coping_comparison}</p>
    </div>
  );
}

// --- Page 3: Red Flags ---
export function PatternReportRedFlags({ data }: { data: any }) {
  const { headline, top_pattern, pattern_counts, insight_line } = data.page3_redflags;
  
  const bgColor = getFlagColor(top_pattern);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '64px',
        width: '100%',
        height: '100%',
        backgroundColor: '#111111',
        color: '#F5EFE6',
        fontFamily: 'Inter',
      }}
    >
      <div style={{ display: 'flex', position: 'absolute', top: '48px', left: '48px' }}>
        <span style={{ fontSize: '24px', fontWeight: 'bold', color: bgColor }}>EX-IT. / RED FLAGS</span>
      </div>

      <h1 style={{ fontSize: '72px', fontWeight: '900', textTransform: 'uppercase', lineHeight: 1.1, marginBottom: '48px' }}>
        {headline}
      </h1>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: bgColor,
        color: '#111111',
        padding: '40px',
        border: '8px solid #F5EFE6',
        marginBottom: '48px'
      }}>
        <span style={{ fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.8, marginBottom: '16px' }}>Top Pattern</span>
        <span style={{ fontSize: '64px', fontWeight: '900', textTransform: 'uppercase' }}>{top_pattern}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '48px' }}>
        {pattern_counts?.slice(0, 3).map((p: any) => (
          <div key={p.category} style={{ display: 'flex', borderBottom: '4px solid #F5EFE6', paddingBottom: '8px', marginBottom: '16px', fontSize: '28px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {p.category} <span style={{ marginLeft: '12px', opacity: 0.7 }}>x{p.count}</span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: '32px', fontWeight: '500', color: bgColor }}>{insight_line}</p>
    </div>
  );
}
