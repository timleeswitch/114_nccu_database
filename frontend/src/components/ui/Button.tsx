import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'text-white shadow-sm hover:-translate-y-0.5 hover:shadow-lg hover:opacity-90',
  secondary: 'text-gray-700 hover:-translate-y-0.5 hover:bg-white/80 hover:shadow-md',
  ghost: 'text-gray-500 hover:-translate-y-0.5 hover:bg-white/60 hover:text-gray-800',
  danger: 'text-white bg-red-500 hover:-translate-y-0.5 hover:bg-red-600 hover:shadow-lg',
};

const variantStyles: Record<NonNullable<ButtonProps['variant']>, CSSProperties> = {
  primary: { backgroundColor: '#036eb8' },
  secondary: {
    background: 'rgba(255,255,255,0.64)',
    border: '1px solid rgba(255,255,255,0.75)',
  },
  ghost: {},
  danger: {},
};

export default function Button({
  children,
  variant = 'primary',
  className = '',
  style,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        'inline-flex cursor-pointer items-center justify-center rounded-xl px-5 py-3 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        className,
      ].join(' ')}
      style={{ ...variantStyles[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  );
}
