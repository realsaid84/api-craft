'use client';

import React from 'react';
import { Sidebar } from '@/components/landing';

interface LearnLayoutProps {
  children: React.ReactNode;
}

export default function LearnLayout({ children }: LearnLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}