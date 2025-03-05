'use client';

import React from 'react';
import { Code, FileSearch, BookOpen } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';

const Sidebar = () => {
  const menuSections = [
    {
      title: 'LEARN',
      items: [
        { name: 'OpenAPI 3.0 Cheatsheet', path: '/learn/openapi-cheatsheet' },
        { name: 'OpenAPI Workshop', path: '/learn/openapi-workshop' }
      ]
    },
    {
      title: 'DISCOVER',
      items: [
        { name: 'Reusable Data Models', path: '/discover/data-models' },
        { name: 'API Common Components', path: '/discover/components' },
        { name: 'Interactive Data Dictionaries', path: '/discover/dictionaries' },
        { name: 'API Contracts', path: '/discover/contracts' }
      ]
    },
    {
      title: 'OBSERVE',
      items: [
        { name: 'Data Quality', path: '/observe/data-quality' },
        { name: 'API Quality', path: '/observe/api-quality' },
        { name: 'Governance Metrics', path: '/observe/metrics' }
      ]
    },
    {
      title: 'DESIGN',
      items: [
        { name: 'Design an API', path: '/design/api' },
        { name: 'Define a Data Model', path: '/design/data-model' },
        { name: 'Document BDD Features', path: '/design/bdd' }
      ]
    },
    {
      title: 'TEST',
      items: [
        { name: 'Generate Tests', path: '/test/generate' },
        { name: 'Execute Tests', path: '/test/execute' },
        { name: 'Explore Tests', path: '/test/explore' }
      ]
    },
    {
      title: 'PERFORM',
      items: [
        { name: 'ROUTINE ACTIONS', path: '/perform/routine' },
        { name: 'CODE GEN', path: '/perform/codegen' },
        { name: 'PREVIEW', path: '/perform/preview' }
      ]
    }
  ];

  return (
    <div className="w-64 min-h-screen bg-background border-r">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Code className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="font-semibold">API Studio</h1>
          </div>
          <ThemeToggle />
        </div>
      </div>
      <nav className="p-4">
        {menuSections.map((section) => (
          <div key={section.title} className="mb-6">
            <h2 className="text-xs font-semibold text-muted-foreground mb-2 px-2">
              {section.title}
            </h2>
            <div className="space-y-1">
              {section.items.map((item) => (
                <a
                  key={item.name}
                  href={item.path}
                  className="block px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
};

// Feature Card Component
interface FeatureCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  link: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, link }) => (
  <div className="block p-6 rounded-lg border bg-card text-card-foreground hover:bg-accent/50 transition-colors">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <p className="text-sm text-muted-foreground mb-4">{description}</p>
    <Button variant="outline" asChild>
      <a href={link}>Learn More →</a>
    </Button>
  </div>
);

// Main Content Component
const MainContent = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Learn OpenAPI →",
      description: "Master OpenAPI 3.0 with our comprehensive cheatsheet and interactive workshop.",
      link: "/learn/openapi-cheatsheet"
    },
    {
      icon: FileSearch,
      title: "Data Model Discovery →",
      description: "Search your entire data ecosystem, including dashboards, datasets, and models.",
      link: "/discover/data-models"
    },
    // ... other features
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">API Design Studio</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Create, discover, and manage your API ecosystem with ease.
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <a href="/learn/openapi-cheatsheet">Get Started</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/learn/openapi-workshop">Take Workshop</a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Layout Component
const Layout = () => {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <MainContent />
    </div>
  );
};

export default Layout;