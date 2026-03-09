'use client';

import Image from 'next/image';

export function Header() {
  return (
    <header className="border-b border-gray-200 px-8 py-4 bg-white">
      <div className="flex items-center max-w-7xl mx-auto">
        {/* Logo - Links to root */}
        <a href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <Image
            src="/threshold-logo.svg"
            alt="Threshold 360 Enterprise"
            width={160}
            height={40}
            priority
          />
        </a>
      </div>
    </header>
  );
}
