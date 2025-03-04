import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronRight,
  ChevronLeft,
  X, 
  Menu, 
  BookOpen, 
  Search, 
  Shield, 
  Settings, 
  Activity, 
  Code
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';

// Icon mapping for section titles
const sectionIcons: Record<string, React.ReactNode> = {
  'LEARN': <BookOpen className="h-5 w-5" />,
  'DISCOVER': <Search className="h-5 w-5" />,
  'OBSERVE': <Shield className="h-5 w-5" />,
  'DESIGN': <Settings className="h-5 w-5" />,
  'PERFORM': <Activity className="h-5 w-5" />,
  'TEST': <Code className="h-5 w-5" />,
};

interface MenuItem {
  name: string;
  path: string;
  icon?: React.ReactNode;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
  icon?: React.ReactNode;
}

interface EnhancedSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  sections?: MenuSection[];
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  logoUrl?: string;
  title?: string;
  subtitle?: string;
}

export const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({ 
  isCollapsed = false,
  onToggleCollapse,
  sections,
  isMobileOpen = false,
  onMobileClose,
  logoUrl,
  title = "API Craft Accelerator",
  subtitle = "Quick Tour"
}) => {
  // Default menu sections if none provided
  const defaultMenuSections: MenuSection[] = [
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
        { name: 'Interactive Data Dictionaries', path: '/pages/discover/dictionaries' }
      ]
    },
    {
      title: 'OBSERVE',
      icon: sectionIcons['OBSERVE'],
      items: [
        { name: 'Data Quality', path: '/pages/observe/data-quality' },
        { name: 'API Quality', path: '/pages/observe/api-quality' },
        { name: 'Governance Metrics', path: '/pages/observe/metrics' }
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
        { name: 'Routine Actions', path: '/pages/perform/routine' },
        { name: 'Preview', path: '/pages/design/api-editor' },
        { name: 'Code Gen', path: '/pages/perform/codegen' }
      ]
    },
    {
      title: 'TEST',
      icon: sectionIcons['TEST'],
      items: [
        { name: 'Generate Tests', path: '/test/generate' },
        { name: 'Execute Tests', path: '/test/execute' },
        { name: 'Explore Tests', path: '/test/explore' }
      ]
    }
  ];

  const menuSections = sections || defaultMenuSections;

  // Store the expanded state for each section
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    LEARN: true,  // Default expanded sections
    DISCOVER: true
  });

  // Effect to handle body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileOpen]);

  // Get active section based on current URL
  useEffect(() => {
    const currentPath = window.location.pathname;
    
    // Find which section contains the current path
    for (const section of menuSections) {
      const match = section.items.some(item => 
        currentPath.includes(item.path) || 
        (item.path !== '/' && currentPath.endsWith(item.path))
      );
      
      if (match) {
        // Expand the section that matches current path
        setExpandedSections(prev => ({
          ...prev,
          [section.title]: true
        }));
        break;
      }
    }
  }, [menuSections]);
  
  // Toggle section expansion
  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  // Calculate style for main sidebar
  const sidebarStyle = `${isCollapsed ? 'w-20' : 'w-64'} z-30 min-h-screen bg-background border-r transition-all duration-300 hidden md:block fixed md:static`;
  
  // Mobile overlay style
  const mobileOverlayStyle = `md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
    isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
  }`;
  
  // Mobile sidebar style
  const mobileSidebarStyle = `md:hidden fixed inset-y-0 left-0 w-64 bg-background border-r z-50 transform transition-transform duration-300 overflow-y-auto ${
    isMobileOpen ? 'translate-x-0' : '-translate-x-full'
  }`;

  const renderSidebarContent = () => (
    <>
      {/* Sidebar Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-center mb-2">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-8 w-auto" />
          ) : (
            <div className="w-8 h-8 relative">
              <div className="absolute inset-0 bg-teal-500 opacity-60 transform rotate-45"></div>
              <div className="absolute inset-0 bg-teal-500 opacity-75 transform rotate-90"></div>
            </div>
          )}
        </div>
        
        {!isCollapsed && (
          <>
            <a href="/" className="inline-block hover:opacity-80 transition-opacity">
              <h1 className="text-center text-xl font-bold text-gray-700">
                {title}
              </h1>
            </a>
            <p className="text-center text-sm text-gray-400">{subtitle}</p>
          </>
        )}
        
        <div className="flex items-center justify-center mt-2">
          <ThemeToggle />
        </div>
      </div>
      
      {/* Sidebar Navigation */}
      <nav className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
        {menuSections.map((section) => (
          <div key={section.title} className="mb-6">
            {/* Section Header */}
            <div
              className="flex items-center justify-between cursor-pointer group"
              onClick={() => toggleSection(section.title)}
            >
              <div className="flex items-center gap-2">
                {/* Section Icon */}
                {section.icon && (
                  <div className="text-teal-500">
                    {section.icon}
                  </div>
                )}
                
                {/* Section Title */}
                <h2 className="text-teal-500 text-sm font-semibold mb-2 truncate">
                  {isCollapsed ? section.title.substring(0, 1) : section.title}
                </h2>
              </div>
              
              {!isCollapsed && (
                expandedSections[section.title] 
                  ? <ChevronDown className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" /> 
                  : <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
            
            {/* Section Items */}
            {(expandedSections[section.title] || isCollapsed) && (
              <div className="space-y-1">
                {section.items.map((item) => (
                  <a
                    key={item.name}
                    href={item.path}
                    className={`block px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors ${
                      isCollapsed ? 'text-center' : ''
                    }`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    {isCollapsed ? item.name.substring(0, 1) : item.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      
      {/* Collapse Toggle Button */}
      {onToggleCollapse && !isCollapsed && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      )}
      
      {/* Expand Toggle Button */}
      {onToggleCollapse && isCollapsed && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={sidebarStyle}>
        {renderSidebarContent()}
      </div>
      
      {/* Mobile Overlay */}
      {onMobileClose && (
        <div 
          className={mobileOverlayStyle}
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}
      
      {/* Mobile Sidebar */}
      <div className={mobileSidebarStyle}>
        {/* Mobile Close Button */}
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        
        {renderSidebarContent()}
      </div>
    </>
  );
};

export default EnhancedSidebar;