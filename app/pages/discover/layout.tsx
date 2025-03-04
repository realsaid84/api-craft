// app/pages/discover/layout.tsx
'use client';

import DiscoveryLayout from '@/components/layouts/MainLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DiscoveryLayout>{children}</DiscoveryLayout>;
}