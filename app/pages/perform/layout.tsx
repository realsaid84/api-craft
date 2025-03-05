// app/pages/discover/layout.tsx
'use client';

import LifecycleLayout from '@/components/layouts/MainLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <LifecycleLayout>{children}</LifecycleLayout>;
}