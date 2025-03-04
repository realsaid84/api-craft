import React, { useState } from 'react';
import { Settings, ShieldCheck, Code, Activity, Heart, FileSearch, BookOpen, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/theme-toggle';

// Main Layout Component
const LandingLayout = () => {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  return (
    <div className="flex min-h-screen bg-background text-foreground relative">
      <Sidebar visible={sidebarVisible} onToggle={() => setSidebarVisible(!sidebarVisible)} />
      <div className={`transition-all duration-300 ease-in-out ${sidebarVisible ? 'ml-64' : 'ml-0'} flex-1`}>
        <MainContent showSidebarCategories={!sidebarVisible} />
      </div>
    </div>
  );
};

export default LandingLayout;

export const Sidebar = ({ visible = true, onToggle }: { visible: boolean, onToggle: () => void }) => {
  const menuSections = [
    {
      title: 'LEARN',
      items: [
        { name: 'OpenAPI 3.0 Cheatsheet', path: '/pages/learn/openapi-cheatsheet' },
        { name: 'OpenAPI Workshop', path: '/pages/learn/openapi-workshop' }
      ]
    },
    {
      title: 'DISCOVER',
      items: [
        { name: 'Reusable Data Models', path: '/pages/discover/data-models' },
        { name: 'API Contracts', path: '/pages/discover/api-contracts' },
        { name: 'API Common Components', path: '/pages/discover/components' },
        { name: 'Interactive Data Dictionaries', path: '/pages/discover/dictionaries' }
      ]
    },
    {
      title: 'OBSERVE',
      items: [
        { name: 'Data Quality', path: '/pages/observe/data-quality' },
        { name: 'API Quality', path: '/pages/observe/api-quality' },
        { name: 'Governance Metrics', path: '/pages/observe/metrics' }
      ]
    },
    {
      title: 'DESIGN',
      items: [
        { name: 'Design an API', path: '/pages/design/api-boot' },
        { name: 'Define a Data Model', path: '/pages/design/data-model' },
        { name: 'Generate BDD Features', path: '/pages/design/bdd' }
      ]
    },
    {
      title: 'PERFORM',
      items: [
        { name: 'Routine Actions', path: '/pages/perform/routine-actions' },
        { name: 'Preview', path: '/pages/design/api-editor' },
        { name: 'Code Gen', path: '/pages/perform/codegen' }
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

  return (
    <div 
      className={`fixed top-0 left-0 w-64 min-h-screen bg-background border-r z-20 transition-transform duration-300 ease-in-out ${
        visible ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 right-0 translate-x-1/2 z-30 bg-background border rounded-full shadow-sm"
        onClick={onToggle}
      >
        {visible ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>
      <div className="p-6 border-b">
        <div className="flex items-center justify-center mb-2">
          <div className="w-32 h-32 relative">
            <img 
              src="/assets/DAPA2.jpeg" 
              alt="DAPA Icon" 
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
        </div>
        <a href="/" className="inline-block hover:opacity-80 transition-opacity">
          <h1 className="text-center text-xl font-bold text-gray-700">
            DATA & API Accelerator Studio
          </h1>
        </a>
        <p className="text-center text-sm text-gray-400">Quick Tour</p>
        <div className="flex items-center justify-center"> 
          <ThemeToggle />
        </div>
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

interface CategoryButtonProps {
  title: string;
  items: { name: string, path: string }[];
}

const CategoryButton: React.FC<CategoryButtonProps> = ({ title, items }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button 
        variant="outline" 
        className="mb-2 justify-between w-full" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </Button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-30 bg-white border rounded-md shadow-lg p-2 mt-1">
          {items.map((item) => (
            <a
              key={item.name}
              href={item.path}
              className="block px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
            >
              {item.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

interface MainContentProps {
  showSidebarCategories?: boolean;
}

const MainContent: React.FC<MainContentProps> = ({ showSidebarCategories = false }) => {
  const menuSections = [
    {
      title: 'LEARN',
      items: [
        { name: 'OpenAPI 3.0 Cheatsheet', path: '/pages/learn/openapi-cheatsheet' },
        { name: 'OpenAPI Workshop', path: '/pages/learn/openapi-workshop' }
      ]
    },
    {
      title: 'DISCOVER',
      items: [
        { name: 'Reusable Data Models', path: '/pages/discover/data-models' },
        { name: 'API Contracts', path: '/pages/discover/api-contracts' },
        { name: 'API Common Components', path: '/pages/discover/api-contracts' },
        { name: 'Interactive Data Dictionaries', path: '/pages/discover/data-models' }
      ]
    },
    {
      title: 'OBSERVE',
      items: [
        { name: 'Data Quality', path: '/pages/observe/data-quality' },
        { name: 'API Quality', path: '/pages/observe/api-quality' },
        { name: 'Governance Metrics', path: '/pages/observe/metrics' }
      ]
    },
    {
      title: 'DESIGN',
      items: [
        { name: 'Design an API', path: '/pages/design/api-boot' },
        { name: 'Define a Data Model', path: '/pages/design/data-model' },
        { name: 'Generate BDD Features', path: '/pages/design/bdd' }
      ]
    },
    {
      title: 'PERFORM',
      items: [
        { name: 'Routine Actions', path: '/pages/perform/routine-actions' },
        { name: 'Preview', path: '/pages/design/api-editor' },
        { name: 'Code Gen', path: '/pages/perform/codegen' }
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

  const features = [
    {
      icon: BookOpen,
      title: "Explore API Education →",
      description: "Master OpenAPI 3.0 with our comprehensive cheatsheet and interactive workshop for API design best practices. Thereafter, discover API standards and patterns.",
      link: "/pages/learn/openapi-cheatsheet"
    },
    {
      icon: FileSearch,
      title: "Discover Reusable Data Models →",
      description: "Search your entire data ecosystem, including dashboards, datasets, ML models, and raw files.",
      link: "/pages/discover/data-models"
    },
    {
      icon: Settings,
      title: "Discover API Common Components and Contracts →",
      description: "Discover API common components, Templates and existing contracts.",
      link: "/pages/discover/api-contracts"
    },
    {
      icon: ShieldCheck,
      title: "Data and API Quality Control →",
      description: "Improve data and API quality through metadata tests, assertions, governance validations, and conformance checks.",
      link: "/pages/observe/data-quality"
    },
    {
      icon: Code,
      title: "Design APIs and Data Models →",
      description: "Easily author APIs leveraging data models and standard templates to kicks-sart your API design using an intuitive.",
      link: "/pages/design/api-editor"
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
      link: "/pages/perform/routine-actions"
    }
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto p-8">
        {/* Quick Navigation Categories - Only shown when sidebar is hidden */}
        {showSidebarCategories && (
          <div className="mb-8 mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {menuSections.map((section) => (
              <CategoryButton 
                key={section.title} 
                title={section.title} 
                items={section.items} 
              />
            ))}
          </div>
        )}

        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 text-teal-600">Get Started</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Author, discover, and manage your API delivery ecosystem with ease.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            To get started, simply explore and discover the vast Domain assets of reusable data models and API common components.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <a href="/pages/discover/data-models">Get Started</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/learn/openapi-cheatsheet">API Education</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/discover/dictionaries">Reusable Data Models</a>
            </Button> 
            <Button variant="outline" asChild>
              <a href="/pages/discover/api-contracts">APIs</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/pages/discover/components">API Common Components and Templates</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/pages/perform/routine-actions">Lifecycle actions</a>
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