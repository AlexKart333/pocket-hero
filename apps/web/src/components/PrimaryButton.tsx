import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  full?: boolean;
}

const variants = {
  primary: 'bg-primary text-white shadow-glow active:scale-[0.98]',
  secondary: 'bg-white/10 text-white border border-white/10 active:scale-[0.98]',
  danger: 'bg-danger text-white active:scale-[0.98]',
  ghost: 'bg-transparent text-white/80 active:bg-white/10'
};

export function PrimaryButton({ children, variant = 'primary', full = true, className = '', disabled, ...props }: PrimaryButtonProps) {
  return (
    <button
      className={`${full ? 'w-full' : ''} rounded-2xl px-4 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
