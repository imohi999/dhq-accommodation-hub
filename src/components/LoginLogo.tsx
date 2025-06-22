import React from 'react';
import Image from 'next/image';

export const LoginLogo = () => {
  return (
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-32 h-32 bg-emerald-500/20 rounded-full blur-xl"></div>
      </div>
      
      {/* Logo */}
      <div className="relative bg-zinc-900/50 backdrop-blur-sm p-6 rounded-2xl border border-zinc-800">
        <Image 
          src="/lovable-uploads/6dea8f38-4e85-41a5-95cc-343631f1cde0.png" 
          alt="DHQ Logo" 
          width={80}
          height={80}
          className="w-20 h-20 mx-auto"
        />
      </div>
    </div>
  );
};