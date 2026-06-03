interface ProgressBarProps {
    value: number;
    max?: number;
    color?: 'primary' | 'secondary';
    label?: string;
    showValue?: boolean;
}

export default function ProgressBar({ value, max = 100, color = 'primary', label, showValue = true }: ProgressBarProps) {
    const pct = Math.min((value / max) * 100, 100);
    const barColor = color === 'primary' ? 'bg-primary' : 'bg-secondary';

    return (
        <div className="flex flex-col gap-1.5 w-full">
            {(label || showValue) && (
                <div className="flex justify-between text-sm text-on-surface-variant font-[family-name:var(--font-family-body)]">
                    {label && <span>{label}</span>}
                    {showValue && <span>{value}/{max}</span>}
                </div>
            )}
            <div className="w-full h-3 rounded-full bg-tertiary-container/20 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}
