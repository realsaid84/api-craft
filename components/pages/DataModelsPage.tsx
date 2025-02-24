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
import type { DataModel, DataModelFilter } from '@/components/types/data-models';

// Empty State Component
const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-10">
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
      <AlertCircle className="w-6 h-6 text-primary" />
    </div>
    <h3 className="text-lg font-semibold mb-2">No Data Models Found</h3>
    <p className="text-muted-foreground mb-4">{message}</p>
    <Button>
      <Plus className="w-4 h-4 mr-2" />
      Create New Model
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

const DataModelCard = ({ model }: { model: DataModel }) => {
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
              model.status === 'Published' ? 'bg-green-100 text-green-800' :
              model.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
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

export const DataModelsPage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filter, setFilter] = useState<DataModelFilter>({
    search: '',
    domain: null,
    status: null
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sample data - replace with actual data fetching
  const sampleDataModels: DataModel[] = [
    {
      id: '1',
      name: 'Payment Instruction',
      description: 'Core payment instruction model capturing payment details, routing, and processing requirements',
      version: '2.0.0',
      domain: 'Payment',
      status: 'Published',
      lastModified: '2024-01-20',
      owner: 'Treasury Team',
      tags: ['payment', 'core', 'transaction'],
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
      name: 'Bank Account',
      description: 'Account information model including balance, account type, and ownership details',
      version: '1.5.0',
      domain: 'Account',
      status: 'Published',
      lastModified: '2024-01-15',
      owner: 'Treasury Team',
      tags: ['account', 'treasury'],
      schema: {
        type: 'object',
        properties: {
          accountNumber: { type: 'string' },
          type: { type: 'string' },
          currency: { type: 'string' }
        }
      }
    },
    {
      id: '3',
      name: 'Posting Entry',
      description: 'Accounting entry model for financial transactions and reconciliation',
      version: '1.2.0',
      domain: 'Account',
      status: 'Published',
      lastModified: '2024-01-18',
      owner: 'Finance Team',
      tags: ['accounting', 'reconciliation', 'treasury'],
      schema: {
        type: 'object',
        properties: {
          entryId: { type: 'string' },
          amount: { type: 'number' },
          postingDate: { type: 'string', format: 'date' }
        }
      }
    },
    {
      id: '4',
      name: 'Balance Position',
      description: 'Real-time balance tracking model for accounts and positions',
      version: '1.0.0',
      domain: 'Account',
      status: 'Published',
      lastModified: '2024-01-10',
      owner: 'Treasury Team',
      tags: ['balance', 'real-time', 'position'],
      schema: {
        type: 'object',
        properties: {
          accountId: { type: 'string' },
          balance: { type: 'number' },
          timestamp: { type: 'string', format: 'date-time' }
        }
      }
    },
    {
      id: '5',
      name: 'Receivable Invoice',
      description: 'Invoice and receivables management model for tracking payables',
      version: '1.1.0',
      domain: 'Receivables',
      status: 'Published',
      lastModified: '2024-01-12',
      owner: 'Receivables Domain',
      tags: ['invoice', 'receivables', 'payment'],
      schema: {
        type: 'object',
        properties: {
          invoiceId: { type: 'string' },
          dueDate: { type: 'string', format: 'date' },
          status: { type: 'string' }
        }
      }
    },
    {
      id: '6',
      name: 'Liquidity Forecast',
      description: 'Cash flow and liquidity forecasting model for treasury management',
      version: '0.9.0',
      domain: 'Account',
      status: 'Draft',
      lastModified: '2024-01-19',
      owner: 'Global Liquidity and Accounts',
      tags: ['liquidity', 'forecast', 'cash-flow'],
      schema: {
        type: 'object',
        properties: {
          forecastId: { type: 'string' },
          periodStart: { type: 'string', format: 'date' },
          forecastAmount: { type: 'number' }
        }
      }
    },
    {
      id: '7',
      name: 'Payment Schedule',
      description: 'Recurring and scheduled payments management model',
      version: '1.3.0',
      domain: 'Payment',
      status: 'Published',
      lastModified: '2024-01-17',
      owner: 'Treasury Services',
      tags: ['payment', 'schedule', 'recurring'],
      schema: {
        type: 'object',
        properties: {
          scheduleId: { type: 'string' },
          frequency: { type: 'string' },
          nextDate: { type: 'string', format: 'date' }
        }
      }
    },
    {
      id: '8',
      name: 'Statement',
      description: 'Bank statement reconciliation and processing model',
      version: '1.4.0',
      domain: 'Account',
      status: 'Published',
      lastModified: '2024-01-16',
      owner: 'Global Liquidity and Accounts',
      tags: ['statement', 'reconciliation', 'treasury'],
      schema: {
        type: 'object',
        properties: {
          statementId: { type: 'string' },
          accountId: { type: 'string' },
          period: { type: 'string' }
        }
      }
    },
    {
      id: '9',
      name: 'Payment Gateway Config',
      description: 'Payment gateway integration and configuration model',
      version: '0.8.0',
      domain: 'Connectivity',
      status: 'Draft',
      lastModified: '2024-01-14',
      owner: 'Integration Team',
      tags: ['gateway', 'integration', 'config'],
      schema: {
        type: 'object',
        properties: {
          gatewayId: { type: 'string' },
          settings: { type: 'object' },
          status: { type: 'string' }
        }
      }
    },
    {
      id: '10',
      name: 'Treasury Limits',
      description: 'Treasury operation limits and threshold configuration model',
      version: '1.0.0',
      domain: 'Risk',
      status: 'Published',
      lastModified: '2024-01-13',
      owner: 'Risk Team',
      tags: ['limits', 'risk', 'compliance'],
      schema: {
        type: 'object',
        properties: {
          limitId: { type: 'string' },
          thresholds: { type: 'object' },
          currency: { type: 'string' }
        }
      }
    }
  ];

  const filterModels = (models: DataModel[]) => {
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
      setError('There was an error filtering the data models.');
      return [];
    }
  };

  const filteredModels = filterModels(sampleDataModels);

  const handleFilterChange = (type: keyof DataModelFilter, value: string) => {
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
        <h1 className="text-4xl font-bold">Data Models</h1>
        <p className="text-xl text-muted-foreground">
          Discover and manage reusable data models across your organization.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-right p-8">
          <div className="flex-1 flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search data models..."
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
                <SelectItem value="all">All Categories</SelectItem>
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
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
                <SelectItem value="Deprecated">Deprecated</SelectItem>
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
              New Model
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
              "No data models match your filters. Try adjusting your search criteria." : 
              "No data models available. Create your first data model to get started."}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ml-4">
            {filteredModels.map((model) => (
              <DataModelCard key={model.id} model={model} />
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
                        model.status === 'Published' ? 'bg-green-100 text-green-800' :
                        model.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
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