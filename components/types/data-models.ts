// components/types/data-models.ts
export interface DataModel {
    id: string;
    name: string;
    description: string;
    version: string;
    domain: 'Payment' | 'Account' | 'Receivables' | 'Risk' | 'Connectivity';
    //category: 'Core' | 'Business' | 'Integration' | 'Security' | 'Custom';
    status: 'Draft' | 'Published' | 'Deprecated';
    lastModified: string;
    owner: string;
    tags: string[];
    schema: {
      type: string;
      format?: string;
      properties?: Record<string, unknown>;
    };
  }
  
  export interface DataModelFilter {
    search: string;
    domain: string | null;
    status: string | null;
  }