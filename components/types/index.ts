export interface BasePageProps {
    title: string;
    description: string;
    children?: React.ReactNode;
  }
  
  export interface DataModel {
    id?: string;
    name: string;
    category: string;
    status: 'Draft' | 'Published' | 'Deprecated';
    lastModified?: Date;
    version?: string;
    owner?: string;
  }
  
  export interface APIComponent {
    id?: string;
    name: string;
    type: 'REST' | 'GraphQL' | 'gRPC' | 'Event';
    description: string;
    version: string;
    status: 'Active' | 'Deprecated' | 'Development';
    dependencies?: string[];
  }
  
  export interface TestCase {
    id: string;
    name: string;
    type: 'Integration' | 'Contract' | 'Performance';
    status: 'Pending' | 'Running' | 'Completed' | 'Failed';
    createdAt: Date;
    lastRun?: Date;
    duration?: number;
    results?: TestResult;
  }
  
  export interface TestResult {
    success: boolean;
    errorCount: number;
    coverage: number;
    executionTime: number;
    failureDetails?: string[];
  }
  
  export interface NavigationItem {
    name: string;
    path: string;
    icon?: React.ComponentType;
    children?: NavigationItem[];
  }
  
  export interface PageSection {
    title: string;
    items: NavigationItem[];
  }