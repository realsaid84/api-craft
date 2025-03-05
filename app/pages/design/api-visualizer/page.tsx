'use client';

import { APIVisualizer } from '@/components/pages/APIVisualizer';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiContractModels } from '@/public/data/api-models';

// Example schema for fallback/testing
const FALLBACK_SCHEMA = {
  openapi: "3.0.3",
  info: {
    title: "API Specification",
    version: "1.0.0",
    description: "A sample API specification",
    contact: {
      name: "Example API Support Team",
      url: "https://example.com/support"
    },
    license: {
      name: "Apache 2.0",
      url: "https://www.apache.org/licenses/LICENSE-2.0.html"
    }
  },
  // Additional fallback schema content...
  paths: {
    "/resources": {
      get: {
        summary: "Get resources",
        description: "Get a list of resources",
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Resource"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Resource: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid"
          },
          name: {
            type: "string"
          }
        }
      }
    }
  }
};

export default function APIVisualizerPage() {
  const searchParams = useSearchParams();
  const [schemaData, setSchemaData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modelName, setModelName] = useState<string>('API Specification');

  const id = searchParams.get('id');
  const schemaUrl = searchParams.get('schemaUrl') ?? undefined;

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Get model name and schema URL if ID is provided
        if (id) {
          const model = apiContractModels.find(model => model.id === id);
          if (model) {
            setModelName(model.name);
            
            // If we found a model but there's no explicit schemaUrl in the 
            // query params, use the one from the model
            if (!schemaUrl && model.schema) {
              try {
                await fetchSchema(model.schema);
                return; // Exit early if we successfully fetched the schema
              } catch (err) {
                console.warn(`Failed to load schema from model URL: ${model.schema}`, err);
                // Continue with explicit URL or fallback
              }
            }
          } else {
            console.warn(`Model with ID ${id} not found`);
          }
        }

        // 2. Try to load schema from explicit URL in query params
        if (schemaUrl) {
          try {
            await fetchSchema(schemaUrl);
            return; // Exit early if we successfully fetched the schema
          } catch (err) {
            console.warn('Error fetching schema from URL, using fallback:', err);
            setError(`Failed to load schema from URL: ${err instanceof Error ? err.message : 'Unknown error'}`);
            // Continue with fallback schema
          }
        }

        // 3. Use fallback schema if we couldn't load from model or URL
        setSchemaData(FALLBACK_SCHEMA);
        
      } catch (err) {
        console.error('Error in loadData:', err);
        setError(`Failed to load API specification: ${err instanceof Error ? err.message : 'Unknown error'}`);
        
        // Set fallback
        setSchemaData(FALLBACK_SCHEMA);
        setModelName('API Specification');
      } finally {
        setIsLoading(false);
      }
    }

    // Helper function to fetch schema from URL
    async function fetchSchema(url: string) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load schema: ${response.status} ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      let data;
      
      // Parse based on content type
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // For YAML or unknown formats, get as text
        data = await response.text();
      }
      
      setSchemaData(data);
    }

    loadData();
  }, [id, schemaUrl]);

  return (
    <APIVisualizer 
      schemaData={schemaData} 
      isLoading={isLoading}
      error={error}
      modelName={modelName}
      title="API Specification"
      schemaUrl={schemaUrl}
    />
  );
}