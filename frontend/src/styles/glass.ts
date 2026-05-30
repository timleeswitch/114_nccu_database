import type { CSSProperties } from 'react';

const shadow3D = '0 8px 32px rgba(100,140,180,0.2), 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -2px 4px rgba(0,0,0,0.04)';
const shadowButton = '0 6px 20px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -1px 0 rgba(255,255,255,0.1)';

export const glassCard: CSSProperties = {
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  border: '1px solid rgba(255, 255, 255, 0.6)',
  boxShadow: shadow3D,
};

export const glassInput: CSSProperties = {
  background: 'rgba(255, 255, 255, 0.25)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: '1px solid rgba(255,255,255,0.6)',
  boxShadow: shadow3D,
};

export const glassButton: CSSProperties = {
  background: 'rgba(237, 233, 233, 0.09)',
  backdropFilter: 'blur(40px) saturate(180%)',
  WebkitBackdropFilter: 'blur(40px) saturate(180%)',
  border: '1px solid rgba(255, 255, 255, 0.45)',
  boxShadow: shadowButton,
};
