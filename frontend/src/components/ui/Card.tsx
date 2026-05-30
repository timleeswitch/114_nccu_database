import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Card({ children, className = '', style, ...props }: CardProps) {
  return (
    <div
      className={['relative overflow-hidden rounded-3xl', className].join(' ')}
      style={{
        background: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(28px) saturate(170%)',
        WebkitBackdropFilter: 'blur(28px) saturate(170%)',
        border: '1px solid rgba(255, 255, 255, 0.62)',
        boxShadow:
          '0 4px 30px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -1px 0 rgba(255,255,255,0.1)',
        ...style,
      }}
      {...props}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.06) 42%, transparent 68%)',
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
