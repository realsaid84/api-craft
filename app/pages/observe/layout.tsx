// app/pages/discover/layout.tsx
'use client';

import ObserveLayout from '@/components/layouts/MainLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ObserveLayout>{children}</ObserveLayout>;
}