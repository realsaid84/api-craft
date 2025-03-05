'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Grid, Plus, AlertCircle, Table } from 'lucide-react';
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
import { sampleDataModels } from '@/public/data/data-models';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { xonokai } from 'react-syntax-highlighter/dist/cjs/styles/prism';

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
      Create a Greenfield Model
    </Button>
    <Button>
      <Plus className="w-4 h-4 mr-2" />
      Create a Brownfield Model
    </Button>
  </div>
);


const demoDataModel = `specification com.app.api-framework.DemoDataModel

struct Account:
  string accountId:
    id
  string accountName
  string accountType
  string currency
  double balance
  boolean isActive
  dateTime openedDate

struct Transaction:
  string transactionId:
    id
  Account account:
    reference
  double amount
  string description
  dateTime transactionDate
  string category
  boolean isCleared

struct Customer:
  string customerId:
    id
  string firstName
  string lastName
  string email
  dateTime dateOfBirth
  string customerType
`;

const DataModelCard = ({ model, onClick }: { model: DataModel; onClick: (model: DataModel) => void }) => {
  try {
    return (
      <Card 
        className="block p-6 rounded-lg border bg-card text-card-foreground hover:bg-accent/50 transition-colors cursor-pointer"
        onClick={() => onClick(model)}
      >
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
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filter, setFilter] = useState<DataModelFilter>({
    search: '',
    domain: null,
    status: null
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showJsonDialog, setShowJsonDialog] = useState(false);
  const [modelInput, setModelInput] = useState(demoDataModel);
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
      //setError('There was an error filtering the data models.');
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
      //setError('There was an error updating the filters.');
    }
  };

  const handleModelClick = (model: DataModel) => {
    // Navigate to the data model view page with the model ID as a query parameter
    router.push(`/pages/discover/data-model-view?id=${model.id}&schemaUrl=${encodeURIComponent(model.schema)}&modelUrl=${encodeURIComponent(model.erDiagram)}`);
  };

  const handleGenerateSchema = () => {
      // Update the schema safely
      // Note: In a real application, you'd need to handle this properly
      // This is a workaround for the TypeScript error
      setShowJsonDialog(false);  
  };

  if (error) {
    //return <ErrorAlert message={error} />;
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-teal-600">Data Models</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Discover and manage reusable data models across different domains.
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
              <Button onClick={() => setShowJsonDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Greenfield Model
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
                <DataModelCard key={model.id} model={model} onClick={handleModelClick} />
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
                    <th className="py-3 px-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredModels.map((model) => (
                    <tr key={model.id} className="border-b last:border-0 hover:bg-accent/50 cursor-pointer" onClick={() => handleModelClick(model)}>
                      <td className="py-3 px-4">
                        <div>
                          <div className="text-lg text-teal-600 font-medium">{model.name}</div>
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
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm" className="text-teal-600" onClick={(e) => {
                          e.stopPropagation();
                          handleModelClick(model);
                        }}>
                          View Model
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
        {/* JSON to Schema Dialog */}
    <Dialog open={showJsonDialog} onOpenChange={setShowJsonDialog}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create a Greefield Model using Marple</DialogTitle>
          <DialogDescription>
            Declare your marple model definitions, and we will generate a model from it.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="border rounded-md">
            <SyntaxHighlighter
              language="javascript"
              style={xonokai}
              customStyle={{
                margin: 0,
                borderRadius: '0.375rem',
                minHeight: '300px',
              }}
              contentEditable={true}
              onInput={(e: React.FormEvent<HTMLElement>) => {
                if (e.currentTarget.textContent) {
                  setModelInput(e.currentTarget.textContent);
                }
              }}
            >
              {modelInput}
            </SyntaxHighlighter>
          </div>
          
        </div>
        
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleGenerateSchema}>Generate Model</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  );
};