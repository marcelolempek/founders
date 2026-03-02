'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextValue {
    toasts: Toast[];
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Global toast manager for use outside of React components (hooks, services, etc.)
type ToastCallback = (message: string, type: ToastType, duration: number) => void;
let globalShowToast: ToastCallback | null = null;

export const toast = {
    show: (message: string, type: ToastType = 'info', duration: number = 4000) => {
        if (globalShowToast) {
            globalShowToast(message, type, duration);
        } else {
            // Fallback to console if toast provider not mounted yet
            console.log(`[Toast ${type}]: ${message}`);
        }
    },
    success: (message: string) => toast.show(message, 'success'),
    error: (message: string) => toast.show(message, 'error'),
    warning: (message: string) => toast.show(message, 'warning'),
    info: (message: string) => toast.show(message, 'info'),
};

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 4000) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: Toast = { id, message, type, duration };

        setToasts((prev) => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    // Register global toast callback
    useEffect(() => {
        globalShowToast = showToast;
        return () => {
            globalShowToast = null;
        };
    }, [showToast]);

    return (
        <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    const icons: Record<ToastType, string> = {
        success: 'check_circle',
        error: 'error',
        warning: 'warning',
        info: 'info',
    };

    const colors: Record<ToastType, string> = {
        success: 'bg-emerald-500',
        error: 'bg-red-500',
        warning: 'bg-amber-500',
        info: 'bg-blue-500',
    };

    const bgColors: Record<ToastType, string> = {
        success: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30',
        error: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30',
        warning: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30',
        info: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30',
    };

    const textColors: Record<ToastType, string> = {
        success: 'text-emerald-800 dark:text-emerald-200',
        error: 'text-red-800 dark:text-red-200',
        warning: 'text-whitember-800 dark:text-whitember-200',
        info: 'text-blue-800 dark:text-blue-200',
    };

    return (
        <div
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm animate-slide-in-right ${bgColors[toast.type]}`}
            role="alert"
        >
            <div className={`shrink-0 size-6 rounded-full flex items-center justify-center ${colors[toast.type]}`}>
                <span className="material-symbols-outlined text-slate-900 text-sm filled">
                    {icons[toast.type]}
                </span>
            </div>
            <p className={`flex-1 text-sm font-medium ${textColors[toast.type]}`}>
                {toast.message}
            </p>
            <button
                onClick={onClose}
                className={`shrink-0 ${textColors[toast.type]} opacity-60 hover:opacity-100 transition-opacity`}
            >
                <span className="material-symbols-outlined text-lg">close</span>
            </button>
        </div>
    );
}

// Helper hook for common toast patterns
export function useNotify() {
    const { showToast } = useToast();

    return {
        success: (message: string) => showToast(message, 'success'),
        error: (message: string) => showToast(message, 'error'),
        warning: (message: string) => showToast(message, 'warning'),
        info: (message: string) => showToast(message, 'info'),
    };
}
