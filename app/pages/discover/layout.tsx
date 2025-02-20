// app/pages/learn/layout.tsx
'use client';

import LearnLayout from '@/components/layouts/LearnLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <LearnLayout>{children}</LearnLayout>;
}