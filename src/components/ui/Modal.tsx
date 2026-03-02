'use client';

import React, { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showCloseButton?: boolean;
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true
}: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
        }
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl'
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Modal Content */}
            <div
                onClick={(e) => e.stopPropagation()}
                className={`relative w-full ${sizeClasses[size]} bg-slate-100 border border-white/10 rounded-xl shadow-2xl animate-fade-in-up`}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                        {title && (
                            <div className="text-lg font-bold text-white">
                                {title}
                            </div>
                        )}

                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="flex items-center justify-center size-8 rounded-full hover:bg-white/10 text-text-secondary hover:text-slate-900 transition-colors ml-auto cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    close
                                </span>
                            </button>
                        )}
                    </div>
                )}

                {/* Body */}
                <div className="p-5">
                    {children}
                </div>
            </div>
        </div>
    );
}

// Confirm Modal variant
interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'default';
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'default'
}: ConfirmModalProps) {
    const variantClasses = {
        danger: 'bg-red-500 hover:bg-red-600',
        warning: 'bg-yellow-500 hover:bg-yellow-600 text-black',
        default: 'bg-primary hover:bg-primary/90'
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="flex flex-col gap-4">
                <p className="text-text-secondary text-sm">{message}</p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-900 font-medium text-sm rounded-lg hover:bg-white/10 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        className={`px-4 py-2 ${variantClasses[variant]} text-white font-bold text-sm rounded-lg transition-all active:scale-95 shadow-lg shadow-black/20`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
