'use client';

import React from 'react';
import CollapsibleSidebar from '@/components/widgets/CollapsibleSidebar'; 
import { AIAssistant } from '@/components/widgets/dapa-intelligence';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {


  return (
    <>
      <CollapsibleSidebar>
        {children}
      </CollapsibleSidebar>
      <AIAssistant />
    </>
  );
}