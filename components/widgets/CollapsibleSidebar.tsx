import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight,
  ChevronLeft,
  BookOpen, 
  Search, 
  Shield, 
  Settings, 
  Activity, 
  Code
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/theme-toggle';

interface CollapsibleSidebarProps {
  children?: React.ReactNode;
}

const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
 
  // Icon mapping for section titles
  const sectionIcons: Record<string, React.ReactNode> = {
    'LEARN': <BookOpen className="h-5 w-5" />,
    'DISCOVER': <Search className="h-5 w-5" />,
    'OBSERVE': <Shield className="h-5 w-5" />,
    'DESIGN': <Settings className="h-5 w-5" />,
    'PERFORM': <Activity className="h-5 w-5" />,
    'TEST': <Code className="h-5 w-5" />,
  };

  const menuSections = [
    {
      title: 'LEARN',
      icon: sectionIcons['LEARN'],
      items: [
        { name: 'OpenAPI 3.0 Cheatsheet', path: '/pages/learn/openapi-cheatsheet' },
        { name: 'OpenAPI Workshop', path: '/pages/learn/openapi-workshop' }
      ]
    },
    {
      title: 'DISCOVER',
      icon: sectionIcons['DISCOVER'],
      items: [
        { name: 'Reusable Data Models', path: '/pages/discover/data-models' },
        { name: 'API Contracts', path: '/pages/discover/api-contracts' },
        { name: 'API Common Components', path: '/pages/discover/components' },
        { name: 'Interactive Data Dictionaries', path: '/pages/discover/data-models' }
      ]
    },
    {
      title: 'OBSERVE',
      icon: sectionIcons['OBSERVE'],
      items: [
        { name: 'Data Quality', path: '/pages/observe/data-quality' },
        { name: 'API Quality', path: '/pages/observe/api-quality' }
      ]
    },
    {
      title: 'DESIGN',
      icon: sectionIcons['DESIGN'],
      items: [
        { name: 'Design an API', path: '/pages/design/api-boot' },
        { name: 'Define a Data Model', path: '/pages/design/data-model' },
        { name: 'Generate BDD Features', path: '/pages/design/bdd' }
      ]
    },
    {
      title: 'PERFORM',
      icon: sectionIcons['PERFORM'],
      items: [
        { name: 'Lifecycle Actions', path: '/pages/perform/lifecycle-actions' },
        { name: 'Lifecycle Dashboard', path: '/pages/perform/lifecycle-dashboard' },
        { name: 'OAS Preview', path: '/pages/design/api-visualizer' }
      ]
    },
    {
      title: 'TEST',
      icon: sectionIcons['TEST'],
      items: [
        { name: 'Generate Tests', path: '/pages/test/generate' },
        { name: 'Execute Tests', path: '/pages/test/execute' },
        { name: 'Explore Tests', path: '/pages/test/explore' }
      ]
    }
  ];

  const toggleSection = (title: string) => {
    if (expandedSection === title) {
      setExpandedSection(null);
    } else {
      setExpandedSection(title);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div 
        className={`bg-background border-r transition-all duration-300 ease-in-out h-screen ${
          collapsed ? 'w-16' : 'w-64'
        } fixed left-0 top-0 z-10`}
      >
        {/* Logo and Header */}
        <div className="p-4 border-b flex flex-col items-center">
          <div className={`${collapsed ? 'w-10 h-10' : 'w-24 h-24'} relative transition-all duration-300`}>
            <img 
              src="/assets/DAPA2.jpeg" 
              alt="DAPA Icon" 
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
          {!collapsed && (
            <>
              <a href="/" className="inline-block hover:opacity-80 transition-opacity">
                <h1 className="text-center text-xl font-bold text-gray-700">
                  DATA & API Accelerator Studio
                </h1>
              </a>
              <p className="text-center text-sm text-gray-400">Quick Tour</p>
              <div className="flex items-center justify-center"> 
                <ThemeToggle />
              </div>
            </>
          )}
        </div>

        {/* Sidebar Content */}
        <nav className="p-2 overflow-y-auto h-[calc(100vh-180px)]">
          {menuSections.map((section) => (
            <div key={section.title} className="mb-2">
              {collapsed ? (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="w-full flex justify-center items-center py-2"
                  title={section.title}
                >
                  <div className="text-teal-500">
                    {section.icon}
                  </div>
                </Button>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    {/* Section Icon */}
                    <div className="text-teal-500">
                      {section.icon}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-full flex justify-between items-center py-2 px-3"
                      onClick={() => toggleSection(section.title)}
                    >
                      <span className="text-teal-500 text-xs font-semibold">{section.title}</span>
                      <ChevronDown 
                        className={`h-3 w-3 text-gray-500 transition-transform ${
                          expandedSection === section.title ? 'transform rotate-180' : ''
                        }`} 
                      />
                    </Button>
                  </div>
                  {expandedSection === section.title && (
                    <div className="ml-2 space-y-1 mt-1">
                      {section.items.map((item) => (
                        <a
                          key={item.name}
                          href={item.path}
                          className="block px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>

        {/* Collapse Button */}
        <Button 
          variant="ghost" 
          size="sm"
          className="absolute bottom-4 right-0 translate-x-1/2 z-30 bg-background border rounded-full shadow-sm"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ease-in-out ${
        collapsed ? 'ml-16' : 'ml-64'
      } flex-1`}>
        {children}
      </div>
    </div>
  );
};

export default CollapsibleSidebar;