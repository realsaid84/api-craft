// components/utils/pageFactory.tsx
import React from 'react';
import PageLayout from '../layouts/MainLayout';
import { BasePageProps } from '../types';

interface PageFactoryProps extends BasePageProps {
  content: React.ReactNode;
}


interface PageProps {
  title: string;
  description: string;
  content: React.ReactNode;
}

export const createPage = (title: string, description: string, content: React.ReactNode) => {
  return () => (
    <PageLayout>
      {content}
    </PageLayout>
  );
};

// Pre-built pages using the factory
export const APIComponentsPage = createPage(
  "API Components Discovery",
  "Browse and discover reusable API components and patterns.",
  <div className="space-y-4">
    {/* Add component-specific content here */}
    <p>Component content goes here...</p>
  </div>
);

export const DataQualityPage = createPage(
  "Data Quality Control",
  "Monitor and improve data quality across your APIs.",
  <div className="space-y-4">
    {/* Add data quality-specific content here */}
    <p>Data quality content goes here...</p>
  </div>
);