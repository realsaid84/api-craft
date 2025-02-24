// components/types/api-contracts.ts
export interface APIContractModel {
    id: string;
    name: string;
    description: string;
    version: string;
    domain: 'Payment' | 'Account' | 'Receivables' | 'Risk' | 'Connectivity';
    status: 'Alpha' | 'Beta' | 'GA'| 'Active' | 'Deprecated' | 'Retired';
    lastModified: string;
    owner: string;
    tags: string[];
    link: string;
    schema: {
      type: string;
      format?: string;
      properties?: Record<string, unknown>;
    };
  }
  
  export interface APIContractModelFilter {
    search: string;
    domain: string | null;
    status: string | null;
  }