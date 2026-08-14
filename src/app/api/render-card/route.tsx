import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { PatternReportOverview, PatternReportDiary, PatternReportRedFlags } from '@/components/templates/PatternReportTemplates';
import { CertificateTemplate } from '@/components/templates/CertificateTemplates';
import { DiaryShareTemplate } from '@/components/templates/DiaryShareTemplate';
import React from 'react';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { template, data } = await req.json();

    let element;
    let width = 1080;
    let height = 1920;

    switch (template) {
      case 'pattern-report-1':
        element = <PatternReportOverview data={data} />;
        break;
      case 'pattern-report-2':
        element = <PatternReportDiary data={data} />;
        break;
      case 'pattern-report-3':
        element = <PatternReportRedFlags data={data} />;
        break;
      case 'certificate':
        element = <CertificateTemplate data={data} />;
        width = 1080;
        height = 1080;
        break;
      case 'diary-share':
        element = <DiaryShareTemplate data={data} />;
        width = 1080;
        height = 1080;
        break;
      default:
        return new Response('Template not found', { status: 404 });
    }

    return new ImageResponse(element, {
      width,
      height,
    });
  } catch (e: any) {
    console.error('Render error', e.message);
    return new Response('Failed to generate image', { status: 500 });
  }
}
