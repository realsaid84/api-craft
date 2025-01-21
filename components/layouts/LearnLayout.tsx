'use client';

import React from 'react';

interface LearnLayoutProps {
  children: React.ReactNode;
}

export default function LearnLayout({ children }: LearnLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}