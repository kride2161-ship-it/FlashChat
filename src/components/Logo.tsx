/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#1E50FF] to-[#00C6FF] shadow-lg shadow-[#2D6BFF]/30 animate-pulse`}>
        {/* Glowing aura */}
        <div className="absolute inset-0 rounded-2xl bg-[#2D6BFF]/40 blur-md -z-10" />
        
        {/* Lightning bolt SVG */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-3/5 h-3/5 text-white filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
        >
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>

        {/* Small flash star */}
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white animate-ping" />
      </div>
      <span className={`font-black tracking-tight bg-gradient-to-r from-[#2D6BFF] via-[#5F8DFF] to-[#00D2FF] bg-clip-text text-transparent select-none cursor-default ${textSizes[size]}`}>
        FlashChat
      </span>
    </div>
  );
}
