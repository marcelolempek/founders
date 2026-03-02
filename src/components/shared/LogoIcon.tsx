'use client';

import React from 'react';

interface LogoIconProps {
    size?: number;
    color?: string;
    className?: string;
}

/**
 * Empreendedores de Cristo Logo Icon
 * Abstract connection icon for professional branding
 */
export default function LogoIcon({
    size = 40,
    color = '#2563eb',
    className = ''
}: LogoIconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 50 50"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <filter id="icon-blue-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <g transform="translate(25, 25)" color={color} filter="url(#icon-blue-glow)">
                <path d="M0 -20 L-18 -10 V10 L0 20 L18 10 V-10 Z" stroke="currentColor" strokeWidth="2" fill="none" />
                <circle cx="0" cy="0" r="6" fill="currentColor" />
                <path d="M0 -20 V-12 M0 12 V20 M-18 -10 L-11 -6 M11 6 L18 10 M-18 10 L-11 6 M11 -6 L18 -10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </g>
        </svg>
    );
}
