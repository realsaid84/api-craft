'use client';

import React, { useState } from 'react';
import { Search, Filter, Plus, Table, Grid, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { APIContractModel, APIContractModelFilter } from '@/components/types/api-contracts';

// Empty State Component
const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-10">
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
      <AlertCircle className="w-6 h-6 text-primary" />
    </div>
    <h3 className="text-lg font-semibold mb-2">No API Contracts Found</h3>
    <p className="text-muted-foreground mb-4">{message}</p>
    <Button>
      <Plus className="w-4 h-4 mr-2" />
      Create New API Contract
    </Button>
  </div>
);

// Error Alert Component
const ErrorAlert = ({ message }: { message: string }) => (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

const APIModelCard = ({ model }: { model: APIContractModel }) => {
  try {
    return (
      <Card className="block p-6 rounded-lg border bg-card text-card-foreground hover:bg-accent/50 transition-colors">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg text-teal-600 font-semibold">{model.name}</CardTitle>
              <CardDescription>{model.description}</CardDescription>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs ${
              model.status === 'Active' ? 'bg-green-100 text-green-800' :
              model.status === 'Beta' ? 'bg-yellow-100 text-yellow-800' :
              model.status === 'GA' ? 'bg-teal-100 text-teal-800' :
              model.status === 'Alpha' ? 'bg-orange-100 text-orange-800' :
              model.status === 'Deprecated' ? 'bg-red-100 text-red-800' :
              model.status === 'Retired' ? 'bg-gray-100 text-gray-800' :
              'bg-red-100 text-red-800'
            }`}>
              {model.status}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Version {model.version}</span>
              <span>{model.domain}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {model.tags?.map(tag => (
                <span key={tag} className="px-2 py-1 bg-secondary rounded-md text-xs">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Updated {model.lastModified}</span>
              <span>{model.owner}</span>
            <Button variant="outline" asChild>
                    <a href={model.link}>{'>>'}</a>
            </Button>
            </div>
          </div> 
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error('Error rendering data model card:', error);
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>Error Loading Model</CardTitle>
          <CardDescription>There was an error displaying this data model.</CardDescription>
        </CardHeader>
      </Card>
    );
  }
};

export const APIContractsPage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filter, setFilter] = useState<APIContractModelFilter>({
    search: '',
    domain: null,
    status: null
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sample data - replace with actual data fetching
  const sampleDataModels: APIContractModel[] = [
    {
      id: '1',
      name: 'Global Payments',
      description: 'Global Payments API enabling initiation of payments across diverse methods and geograhies.',
      version: '1.1.13',
      domain: 'Payment',
      status: 'Active',
      lastModified: '2024-01-20',
      owner: 'Treasury Services',
      tags: ['payment', 'core'],
      link: '/openapi/demo-payments.oas.yaml',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          amount: { type: 'number' },
          currency: { type: 'string' }
        }
      }
    },
    {
      id: '2',
      name: 'Global Payments v2',
      description: 'Global Payments API enabling initiation of payments across diverse methods and geograhies.',
      version: '2.0.13',
      domain: 'Payment',
      status: 'Beta',
      lastModified: '2024-01-20',
      owner: 'Treasury Services',
      tags: ['payment', 'core'],
      link: '/openapi/demo-payments.oas.yaml',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          amount: { type: 'number' },
          currency: { type: 'string' }
        }
      }
    },

    {
      id: '3',
      name: 'Account Balances API',
      description: 'Enables seamless access to account information and balances',
      version: '2.0.1',
      domain: 'Account',
      status: 'Active',
      lastModified: '2025-01-20',
      owner: 'Treasury Services',
      tags: ['payment', 'account', 'balances', 'liquidity'],
      link: '/openapi/demo-payments.oas.yaml',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          amount: { type: 'number' },
          currency: { type: 'string' }
        }
      }
    },
    {
      id: '4',
      name: 'Transaction Details API',
      description: 'Enables seamless access to transaction details and history',
      version: '3.0.0',
      domain: 'Payment',
      status: 'GA',
      lastModified: '2024-01-20',
      owner: 'Treasury Services',
      tags: ['payment', 'reports', 'accounts', 'transactions'],
      link: '/openapi/demo-payments.oas.yaml',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          amount: { type: 'number' },
          currency: { type: 'string' }
        }
      }
    },
    {
      id: '5',
      name: 'Pay By Bank API',
      description: 'Facilitates Open Banking payments and account information services.',
      version: '2.0.0',
      domain: 'Receivables',
      status: 'GA',
      lastModified: '2024-12-02',
      owner: 'Treasury Services',
      tags: ['payment', 'reports', 'accounts', 'transactions'],
      link: '/openapi/demo-payments.oas.yaml',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          amount: { type: 'number' },
          currency: { type: 'string' }
        }
      }
    },
    {
      id: '6',
      name: 'Australia Realtime Payments API',
      description: 'Enables initiation of real-time payments in Australia',
      version: '1.0.0',
      domain: 'Payment',
      status: 'Deprecated',
      lastModified: '2020-12-02',
      owner: 'Treasury Services',
      tags: ['payment', 'core'],
      link: '/openapi/demo-payments.oas.yaml',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          amount: { type: 'number' },
          currency: { type: 'string' }
        }
      }
    },
    {
      id: '7',
      name: 'Elrond API',
      description: 'Faciltates payment initiation via an Elrond trust token',
      version: '1.0.0',
      domain: 'Risk',
      status: 'Retired',
      lastModified: '2020-12-02',
      owner: 'Treasury Services',
      tags: ['risk', 'core'],
      link: '/openapi/demo-payments.oas.yaml',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          amount: { type: 'number' },
          currency: { type: 'string' }
        }
      }
    }
  ];

  const filterModels = (models: APIContractModel[]) => {
    try {
      return models.filter(model => {
        const searchTerm = filter.search.toLowerCase();
        const matchesSearch = !searchTerm || 
          model.name.toLowerCase().includes(searchTerm) ||
          model.description.toLowerCase().includes(searchTerm) ||
          model.tags?.some(tag => tag.toLowerCase().includes(searchTerm));
        
        const matchesDomain = !filter.domain || model.domain === filter.domain;
        const matchesStatus = !filter.status || model.status === filter.status;
        
        return matchesSearch && matchesDomain && matchesStatus;
      });
    } catch (error) {
      console.error('Error filtering models:', error);
      setError('There was an error filtering the API Contracts.');
      return [];
    }
  };

  const filteredModels = filterModels(sampleDataModels);

  const handleFilterChange = (type: keyof APIContractModelFilter, value: string) => {
    try {
      setFilter(prev => ({
        ...prev,
        [type]: value === 'all' ? null : value
      }));
    } catch (error) {
      console.error('Error updating filters:', error);
      setError('There was an error updating the filters.');
    }
  };

  if (error) {
    return <ErrorAlert message={error} />;
  }

  return (
    <div className="flex-1 overflow-auto p-6 md:p-8 lg:p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold">API Contracts</h1>
        <p className="text-xl text-muted-foreground">
          Discover and manage API contracts across different domains.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-right p-8">
          <div className="flex-1 flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search APIs..."
                className="pl-10"
                value={filter.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            
            <Select
              value={filter.domain || 'all'}
              onValueChange={(value) => handleFilterChange('domain', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                <SelectItem value="Payment">Payment</SelectItem>
                <SelectItem value="Account">Account</SelectItem>
                <SelectItem value="Receivables">Receivables</SelectItem>
                <SelectItem value="Risk">Risk</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filter.status || 'all'}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Alpha">Alpha</SelectItem>
                <SelectItem value="Beta">Beta</SelectItem>
                <SelectItem value="GA">GA</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Deprecated">Deprecated</SelectItem>
                <SelectItem value="Retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4">
            <div className="flex gap-2 border rounded-md p-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('table')}
              >
                <Table className="h-4 w-4" />
              </Button>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New API Contract
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : filteredModels.length === 0 ? (
          <EmptyState 
            message={filter.search || filter.domain || filter.status ? 
              "No API Contracts match your filters. Try adjusting your search criteria." : 
              "No API Contracts available. Create your first data model to get started."}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ml-4">
            {filteredModels.map((model) => (
              <APIModelCard key={model.id} model={model} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left font-medium">Name</th>
                  <th className="py-3 px-4 text-left font-medium">Domain</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                  <th className="py-3 px-4 text-left font-medium">Version</th>
                  <th className="py-3 px-4 text-left font-medium">Last Modified</th>
                  <th className="py-3 px-4 text-left font-medium">Owner</th>
                </tr>
              </thead>
              <tbody>
                {filteredModels.map((model) => (
                  <tr key={model.id} className="border-b last:border-0">
                    <td className="py-3 px-4">
                      <div>
                        <div className="text-lg text-teal-600 font-medium
                        
                        
                        ">{model.name}</div>
                        <div className="text-sm text-muted-foreground">{model.description}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{model.domain}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        model.status === 'Active' ? 'bg-green-100 text-green-800' :
                        model.status === 'Beta' ? 'bg-yellow-100 text-yellow-800' :
                        model.status === 'Alpha' ? 'bg-orange-100 text-orange-800' :
                        model.status === 'Deprecated' ? 'bg-grey-100 text-grey-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {model.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{model.version}</td>
                    <td className="py-3 px-4">{model.lastModified}</td>
                    <td className="py-3 px-4">{model.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
  
};