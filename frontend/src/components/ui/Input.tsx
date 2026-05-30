import type { CSSProperties, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const inputStyle: CSSProperties = {
  background: 'rgba(255, 255, 255, 0.74)',
  border: '1px solid rgba(255,255,255,0.6)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
};

export default function Input({ label, className = '', ...props }: InputProps) {
  return (
    <label className="block">
      {label && <span className="mb-2 block text-base text-gray-600">{label}</span>}
      <input
        className={[
          'w-full rounded-xl px-5 py-4 text-base text-gray-700 outline-none transition-colors placeholder:text-gray-400',
          className,
        ].join(' ')}
        style={inputStyle}
        {...props}
      />
    </label>
  );
}
