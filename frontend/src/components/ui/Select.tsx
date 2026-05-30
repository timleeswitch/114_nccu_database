import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export default function Select({ label, className = '', children, ...props }: SelectProps) {
  return (
    <label className="block">
      {label && <span className="mb-2 block text-base text-gray-600">{label}</span>}
      <select
        className={[
          'w-full rounded-xl border border-white/60 bg-white/75 px-5 py-4 text-base text-gray-700 outline-none backdrop-blur transition-colors',
          className,
        ].join(' ')}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
