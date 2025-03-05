'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from 'lucide-react';
import * as yaml from 'js-yaml';
import { APIQualityDashboard } from '@/components/pages/api-quality/APIQualityDashboard';

// Define a fallback specification in case one isn't provided
const FALLBACK_SPEC = `
openapi: 3.0.3
info:
  title: Sample API Specification
  version: 1.0.0
  description: A sample API specification for testing
  contact: 
    name: API Support Team
    url: https://example.com/support
  license:
    name: Apache 2.0
    url: https://www.apache.org/licenses/LICENSE-2.0.html
servers:
  - url: https://api.example.com/v1
    description: Production server
tags:
  - name: resources
    description: Operations related to resources
paths:
  /resources:
    get:
      summary: Get resources
      description: Get a list of resources
      operationId: getResources
      tags: 
        -  resources
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Resource'
components:
  schemas:
    Resource:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        createdAt:
          type: string
          format: date-time
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
`;

const ApiQualityPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [apiSpec, setApiSpec] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Check if a spec was passed via query params
        const schemaUrl = searchParams.get('schemaUrl');

        
        // Case: Schema URL provided to fetch
        if (schemaUrl) {
          try {
            const response = await fetch(schemaUrl);
            if (!response.ok) {
              throw new Error(`Failed to load schema: ${response.status} ${response.statusText}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
              const jsonData = await response.json();
              setApiSpec(jsonData);
            } else {
              // Assume YAML
              const yamlText = await response.text();
              const yamlData = yaml.load(yamlText);
              setApiSpec(yamlData);
            }
            
            setLoading(false);
            return;
          } catch (err) {
            console.warn('Error fetching schema:', err);
            // Fall back to default spec
          }
        }
        
        // Case 2: No valid spec found, use fallback
        try {
          const fallbackData = yaml.load(FALLBACK_SPEC);
          setApiSpec(fallbackData);
        } catch (err) {
          setError(`Failed to load fallback spec: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      } catch (err) {
        setError(`Error loading data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [searchParams]);

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading API specification...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const apiTitle = apiSpec?.info?.title || "API Quality Dashboard";

  return <APIQualityDashboard apiSpec={apiSpec} title={`${apiTitle} - Quality Score Card`} onBack={handleBack} />;
};

export default ApiQualityPage;