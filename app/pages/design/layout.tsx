// app/pages/design/layout.tsx
'use client';

import DesignLayout from '@/components/layouts/MainLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DesignLayout>{children}</DesignLayout>;
}