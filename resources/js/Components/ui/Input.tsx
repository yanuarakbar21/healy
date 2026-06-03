import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label className="text-sm font-semibold text-on-surface font-[family-name:var(--font-family-body)]">
                    {label}
                </label>
            )}
            <input
                className={`rounded-full border border-outline bg-surface px-5 py-2.5 text-base text-on-surface
                    placeholder:text-on-surface-variant/50 transition-all duration-200
                    focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                    ${error ? 'border-error focus:border-error focus:ring-error/20' : ''}
                    ${className}`}
                {...props}
            />
            {error && <span className="text-xs text-error mt-0.5">{error}</span>}
        </div>
    );
}
