import { useEffect, useRef } from 'react';

interface ConfirmModalProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({ open, title, message, confirmLabel = 'Hapus', cancelLabel = 'Batal', onConfirm, onCancel }: ConfirmModalProps) {
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open) {
            const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
            document.addEventListener('keydown', handler);
            return () => document.removeEventListener('keydown', handler);
        }
    }, [open, onCancel]);

    useEffect(() => {
        if (open && dialogRef.current) {
            const first = dialogRef.current.querySelector('button');
            first?.focus();
        }
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={onCancel} className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
            <div ref={dialogRef}
                className="relative bg-surface-container-lowest rounded-2xl shadow-[0_30px_60px_-15px_rgba(2,103,131,0.15)] p-8 w-full max-w-sm animate-scale-in">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-error-container/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-error">delete</span>
                    </div>
                    <h3 className="font-headline-md text-on-surface">{title}</h3>
                </div>
                <p className="font-body-md text-on-surface-variant mb-8 leading-relaxed">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onCancel}
                        className="flex-1 py-3 rounded-full border border-outline text-on-surface font-label-md hover:bg-surface-container transition-all active:scale-95">
                        {cancelLabel}
                    </button>
                    <button onClick={onConfirm}
                        className="flex-1 py-3 rounded-full bg-error text-on-error font-label-md shadow-md hover:bg-error/90 transition-all active:scale-95">
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
