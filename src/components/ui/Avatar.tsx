import React from 'react';
import { cn } from '@/lib/utils';

export type AvatarShape = 'circle' | 'square' | 'blob' | 'heart' | 'hexagon' | 'star';
export type AvatarEyes = 'dots' | 'happy' | 'sleepy' | 'surprised' | 'determined';
export type AvatarMouth = 'smile' | 'neutral' | 'open' | 'content' | 'pout';
export type AvatarAccessory = 'bandaid' | 'sparkle' | 'leaf' | 'flame' | 'none';

export interface AvatarConfig {
  shape: AvatarShape;
  fillColor: string;
  eyes: AvatarEyes;
  mouth: AvatarMouth;
  accessory: AvatarAccessory;
}

export const AVATAR_COLORS = [
  '#FFDF00', // yellow
  '#00E676', // green
  '#9D4EDD', // purple
  '#FF3366', // brand pink
  '#FF9F1C', // orange
  '#00B4D8', // blue
  '#F4A261', // peach
  '#E0E1DD'  // light gray
];

export const AVATAR_SHAPES: AvatarShape[] = ['circle', 'square', 'blob', 'heart', 'hexagon', 'star'];
export const AVATAR_EYES: AvatarEyes[] = ['dots', 'happy', 'sleepy', 'surprised', 'determined'];
export const AVATAR_MOUTHS: AvatarMouth[] = ['smile', 'neutral', 'open', 'content', 'pout'];
export const AVATAR_ACCESSORIES: AvatarAccessory[] = ['none', 'bandaid', 'sparkle', 'leaf', 'flame'];

interface AvatarProps {
  config: AvatarConfig;
  size?: number | string;
  className?: string;
}

const STROKE_WIDTH = 6;
const STROKE_COLOR = '#1A1A1A';

export function Avatar({ config, size = 64, className }: AvatarProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("select-none shrink-0", className)}
      style={{ minWidth: size, minHeight: size }}
    >
      <ShapeLayer shape={config.shape} fill={config.fillColor} />
      <FaceLayer eyes={config.eyes} mouth={config.mouth} />
      {config.accessory !== 'none' && <AccessoryLayer type={config.accessory} />}
    </svg>
  );
}

function ShapeLayer({ shape, fill }: { shape: AvatarShape, fill: string }) {
  const props = {
    fill,
    stroke: STROKE_COLOR,
    strokeWidth: STROKE_WIDTH,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (shape) {
    case 'circle':
      return <circle cx="50" cy="50" r="42" {...props} />;
    case 'square':
      return <rect x="12" y="12" width="76" height="76" rx="24" {...props} />;
    case 'blob':
      return (
        <path 
          d="M74.5,23.5 C88.1,35.4 89.2,56.7 78.4,70.1 C67.6,83.5 44.9,88.9 28.5,78.2 C12.1,67.5 2.2,40.7 13.8,24.3 C25.4,7.9 60.9,11.6 74.5,23.5 Z" 
          {...props} 
        />
      );
    case 'heart':
      return (
        <path 
          d="M50,88 C50,88 12,61 12,36 C12,21.5 23.5,10 38,10 C45.5,10 50,15 50,15 C50,15 54.5,10 62,10 C76.5,10 88,21.5 88,36 C88,61 50,88 50,88 Z" 
          {...props} 
        />
      );
    case 'hexagon':
      return (
        <path 
          d="M26.5,14.5 L73.5,14.5 C77.5,14.5 81.1,16.6 83.1,20.1 L106.6,60.8 C108.6,64.3 108.6,68.7 106.6,72.2 L83.1,112.9 C81.1,116.4 77.5,118.5 73.5,118.5 L26.5,118.5 C22.5,118.5 18.9,116.4 16.9,112.9 L-6.6,72.2 C-8.6,68.7 -8.6,64.3 -6.6,60.8 L16.9,20.1 C18.9,16.6 22.5,14.5 26.5,14.5 Z" 
          transform="matrix(0.7 0 0 0.7 15 5)"
          {...props} 
        />
      );
    case 'star':
      return (
        <path 
          d="M50,10 L61.5,35 L88,38 L68,56 L73.5,83 L50,70 L26.5,83 L32,56 L12,38 L38.5,35 Z" 
          strokeLinejoin="round"
          {...props} 
        />
      );
    default:
      return <circle cx="50" cy="50" r="42" {...props} />;
  }
}

function FaceLayer({ eyes, mouth }: { eyes: AvatarEyes, mouth: AvatarMouth }) {
  return (
    <g fill={STROKE_COLOR} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} strokeLinecap="round" strokeLinejoin="round">
      {/* Eyes */}
      {eyes === 'dots' && (
        <>
          <circle cx="36" cy="46" r="4" stroke="none" />
          <circle cx="64" cy="46" r="4" stroke="none" />
        </>
      )}
      {eyes === 'happy' && (
        <>
          <path d="M30 46 Q 36 40 42 46" fill="none" />
          <path d="M58 46 Q 64 40 70 46" fill="none" />
        </>
      )}
      {eyes === 'sleepy' && (
        <>
          <path d="M30 46 L 42 46" fill="none" />
          <path d="M58 46 L 70 46" fill="none" />
        </>
      )}
      {eyes === 'surprised' && (
        <>
          <circle cx="36" cy="44" r="5" fill="none" />
          <circle cx="64" cy="44" r="5" fill="none" />
        </>
      )}
      {eyes === 'determined' && (
        <>
          <path d="M30 42 L 40 46" fill="none" />
          <path d="M70 42 L 60 46" fill="none" />
          <circle cx="36" cy="48" r="3" stroke="none" />
          <circle cx="64" cy="48" r="3" stroke="none" />
        </>
      )}

      {/* Mouth */}
      {mouth === 'smile' && <path d="M40 60 Q 50 68 60 60" fill="none" />}
      {mouth === 'neutral' && <path d="M42 62 L 58 62" fill="none" />}
      {mouth === 'open' && <ellipse cx="50" cy="62" rx="4" ry="6" stroke="none" />}
      {mouth === 'content' && <path d="M45 60 Q 50 64 55 60" fill="none" strokeWidth={4} />}
      {mouth === 'pout' && <path d="M44 64 Q 50 58 56 64" fill="none" />}
    </g>
  );
}

function AccessoryLayer({ type }: { type: AvatarAccessory }) {
  const props = {
    stroke: STROKE_COLOR,
    strokeWidth: STROKE_WIDTH - 1,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (type) {
    case 'bandaid':
      return (
        <g transform="translate(65, 15) rotate(15)">
          <rect x="0" y="0" width="24" height="12" rx="4" fill="#FFCDB2" {...props} />
          <rect x="8" y="0" width="8" height="12" fill="#FFA384" {...props} stroke="none" />
          <line x1="8" y1="0" x2="8" y2="12" {...props} />
          <line x1="16" y1="0" x2="16" y2="12" {...props} />
        </g>
      );
    case 'sparkle':
      return (
        <g transform="translate(70, 15)">
          <path d="M10 0 C 10 5 15 10 20 10 C 15 10 10 15 10 20 C 10 15 5 10 0 10 C 5 10 10 5 10 0 Z" fill="#FFDF00" {...props} />
        </g>
      );
    case 'leaf':
      return (
        <g transform="translate(65, 10)">
          <path d="M10,20 C10,20 -2,10 5,2 C12,-6 22,2 22,2 C22,2 18,15 10,20 Z" fill="#00E676" {...props} />
          <line x1="10" y1="20" x2="16" y2="10" {...props} />
        </g>
      );
    case 'flame':
      return (
        <g transform="translate(68, 12)">
          <path d="M10 20 C 0 20 0 10 5 5 C 7 3 10 0 10 0 C 10 0 15 5 17 8 C 20 12 20 20 10 20 Z" fill="#FF9F1C" {...props} />
          <path d="M10 16 C 6 16 6 12 8 9 C 9 8 10 7 10 7 C 10 7 12 9 13 10 C 14 12 14 16 10 16 Z" fill="#FFDF00" stroke="none" />
        </g>
      );
    default:
      return null;
  }
}
