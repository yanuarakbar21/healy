import { ReactNode } from 'react';

interface ChipProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'tertiary';
}

const chipVariants = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    tertiary: 'bg-tertiary-container/30 text-on-tertiary-container',
};

export default function Chip({ children, variant = 'primary' }: ChipProps) {
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${chipVariants[variant]}`}>
            {children}
        </span>
    );
}
