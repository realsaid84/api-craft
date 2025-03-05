import React from 'react';
import { BookOpen, FileSearch, Settings, ShieldCheck, Code, Activity, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CollapsibleSidebar from '@/components/widgets/CollapsibleSidebar'; 
import { useState, useEffect } from 'react';

// FeatureCard Component
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

// MainContent Component - We'll keep this to reuse
const MainContent: React.FC = () => {
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
      title: "Data Hygiene →",
      description: "Improve data quality through metadata tests, assertions, governance validations, and conformance checks.",
      link: "/pages/observe/data-quality"
    },
    {
      icon: Activity,
      title: "API Quality Control →",
      description: "Improve API quality through validations, tests, assertions, governance and conformance checks.",
      link: "/pages/observe/api--quality"
    },
    {
      icon: Code,
      title: "Design APIs →",
      description: "Easily author APIs leveraging data models and standard templates to kicks-sart your API design using an intuitive.",
      link: "/pages/design/api-editor"
    },
    {
      icon: Heart,
      title: "Perform API Route-to-Live Lifecycle Actions →",
      description: "Perform routine API delivery lifecycle actions such as Code Gen, Bundling, Proxying and mocking.",
      link: "/pages/perform/lifecycle-actions"
    }
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto p-8">
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


// We replace the LandingLayout with our CollapsibleSidebar
const LandingLayout = () => {

  return (
    <CollapsibleSidebar>
      <MainContent />
    </CollapsibleSidebar>
  );
};

export default LandingLayout;