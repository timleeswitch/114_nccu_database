import type { CSSProperties, SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const selectStyle: CSSProperties = {
  background: 'rgba(219, 225, 227, 0.48)',
  border: '1px solid rgba(255,255,255,0.58)',
  boxShadow: '0 8px 24px rgba(100,140,180,0.08), inset 0 1px 0 rgba(255,255,255,0.68)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
};

export default function Select({ label, className = '', children, style, ...props }: SelectProps) {
  return (
    <label className="block">
      {label && <span className="mb-2 block text-base text-gray-600">{label}</span>}
      <select
        className={[
          'w-full rounded-xl px-5 py-4 text-base text-gray-700 outline-none transition-colors',
          className,
        ].join(' ')}
        style={{ ...selectStyle, ...style }}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
