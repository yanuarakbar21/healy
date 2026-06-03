import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    padding?: boolean;
}

export default function Card({ children, className = '', padding = true }: CardProps) {
    return (
        <div
            className={`bg-white rounded-[24px] shadow-[0_8px_30px_rgba(2,103,131,0.06)] ${padding ? 'p-6' : ''} ${className}`}
        >
            {children}
        </div>
    );
}
