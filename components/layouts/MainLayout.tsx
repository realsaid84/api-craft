'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/landing';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        visible={sidebarVisible} 
        onToggle={() => setSidebarVisible(!sidebarVisible)} 
      />
      <div className={`transition-all duration-300 ease-in-out ${sidebarVisible ? 'ml-64' : 'ml-0'} flex-1`}>
        {children}
      </div>
    </div>
  );
}
 