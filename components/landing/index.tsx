import React from 'react';
import { Eye, Settings, ShieldCheck, Code, Activity, Heart, FileSearch, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/theme-toggle';

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
      title: 'PERFORM',
      items: [
        { name: 'Routine Actions', path: '/perform/routine' },
        { name: 'Preview', path: '/perform/preview' },
        { name: 'Code Gen', path: '/perform/codegen' }
      ]
    },
    {
      title: 'TEST',
      items: [
        { name: 'Generate Tests', path: '/test/generate' },
        { name: 'Execute Tests', path: '/test/execute' },
        { name: 'Explore Tests', path: '/test/explore' }
      ]
    }
  ];

  <ThemeToggle />
  return (
    <div className="w-64 min-h-screen bg-background border-r">
      <div className="p-6 border-b">
        <div className="flex items-center justify-center mb-2">
          <div className="w-8 h-8 relative">
            <div className="absolute inset-0 bg-teal-500 opacity-60 transform rotate-45"></div>
            <div className="absolute inset-0 bg-teal-500 opacity-75 transform rotate-90"></div>
          </div>
        </div>
        <h1 className="text-center text-xl font-bold text-gray-600">API Design Studio</h1>
        <p className="text-center text-sm text-gray-400">Quick Tour</p>
        <div className="flex items-center justify-center"> <ThemeToggle /></div>
      </div>
      <nav className="p-4">
        {menuSections.map((section) => (
          <div key={section.title} className="mb-6">
            <h2 className="text-teal-500 text-sm font-semibold mb-2">
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
      <h3 className="text-lg text-teal-600 font-semibold">{title}</h3>
    </div>
    <p className="text-sm text-muted-foreground mb-4">{description}</p>
    <Button variant="outline" asChild>
      <a href={link}>Learn More →</a>
    </Button>
  </div>
);
  

const MainContent = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Learn OpenAPI →",
      description: "Master OpenAPI 3.0 with our comprehensive cheatsheet and interactive workshop for API design best practices.",
      link: "/learn/openapi-cheatsheet"
    },
    {
      icon: FileSearch,
      title: "Data Model Discovery →",
      description: "Search your entire data ecosystem, including dashboards, datasets, ML models, and raw files.",
      link: "/discover/data-models"
    },
    {
      icon: Code,
      title: "API Components and Contracts Discovery →",
      description: "Discover API common components, Templates and existing contracts.",
      link: "/discover/components"
    },
    {
      icon: ShieldCheck,
      title: "Data Quality Control →",
      description: "Improve data quality through metadata tests, assertions, data freshness checks, and data contracts.",
      link: "/observe/data-quality"
    },
    {
      icon: Settings,
      title: "Design APIs and Data Models →",
      description: "Easily author APIs leveraging data models and standard templates to kicks-sart your API design using an intuitive.",
      link: "/design/api"
    },
    {
      icon: Activity,
      title: "Manage Tests →",
      description: "Document BDD features, Generate, Execute and Explore various API Tests.",
      link: "/test/generate"
    },
    {
      icon: Heart,
      title: "Perform API Route-to-Live Lifecycle Actions →",
      description: "Perform routine API delivery lifecycle actions such as Code Gen, Bundling, Proxying and mocking.",
      link: "/perform/routine"
    }
  ];

  return (
    <div className="flex-1 overflow-auto">
<div className="max-w-6xl mx-auto p-8">
  <div className="mb-12">
    <h1 className="text-4xl font-bold mb-4">Get Started</h1>
    <p className="text-xl text-muted-foreground mb-6">
      Author, discover, and manage your API delivery ecosystem with ease. 
    </p>
    <p className="text-sm text-muted-foreground mb-4">
      To get started, simply explore and discover the vast Domain assets of reusable data models and API common components.
    </p>
    <div className="flex gap-4">
      <Button asChild>
        <a href="/discover/data-models">Get Started</a>
      </Button>
      <Button variant="outline" asChild>
        <a href="/learn/openapi-cheatsheet">Learn OpenAPI</a>
      </Button>
      <Button variant="outline" asChild>
        <a href="/learn/openapi-workshop">Take a Workshop</a>
      </Button>
      <Button variant="outline" asChild>
        <a href="/discover/components">Discover API Common Components</a>
      </Button>
      <Button variant="outline" asChild>
        <a href="/discover/dictionaries">Discover Data Dictionaries and existing API contracts</a>
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



