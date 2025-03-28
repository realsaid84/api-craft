// app/pages/test/layout.tsx
'use client';

import TestLayout from '@/components/layouts/MainLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <TestLayout>{children}</TestLayout>;
}