'use client'

import Image from 'next/image'

interface LogoProps {
  width?: number
  height?: number
  className?: string
  showTagline?: boolean
}

export default function Logo({
  width = 240,
  height = 60,
  className = '',
}: LogoProps) {
  return (
    <Image
      src="/founders_logo.png"
      alt="Empreendedores de Cristo"
      width={width}
      height={height}
      className={`h-auto ${className}`}
      priority
    />
  )
}