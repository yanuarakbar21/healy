import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;
}

const variants = {
    primary: 'bg-primary text-on-primary shadow-md hover:bg-primary/90',
    secondary: 'bg-secondary text-on-secondary shadow-md hover:bg-secondary/90',
    ghost: 'border border-outline text-on-surface hover:bg-surface-container',
    danger: 'bg-error text-on-error hover:bg-error/90',
};

const sizes = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
};

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
    return (
        <button
            className={`rounded-full font-semibold transition-all duration-200 ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
