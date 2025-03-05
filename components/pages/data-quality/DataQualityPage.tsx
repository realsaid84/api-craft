'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from 'lucide-react';
import * as yaml from 'js-yaml';
import { DataQualityDashboard } from '@/components/pages/data-quality/DataQualityDashboard';

// Define a fallback specification in case one isn't provided
const FALLBACK_MODEL = `
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PaymentInstruction",
  "description": "Payment instruction domain model",
  "type": "object",
  "required": ["requestedExecutionDate", "paymentIdentifiers", "value", "transferType", "paymentType"],
  "properties": {
    "requestedExecutionDate": {
      "type": "string",
      "format": "date",
      "description": "The date when the payment should be executed"
    },
    "paymentIdentifiers": {
      "type": "object",
      "required": ["endToEndId"],
      "properties": {
        "endToEndId": {
          "type": "string",
          "description": "End-to-end identifier for the payment"
        },
        "otherPaymentReferences": {
          "type": "object",
          "properties": {
            "relatedReferenceId": {
              "type": "string"
            },
            "uetr": {
              "type": "string",
              "description": "Unique End-to-End Transaction Reference"
            }
          }
        }
      }
    },
    "value": {
      "type": "object",
      "required": ["currency", "amount"],
      "properties": {
        "currency": {
          "type": "string",
          "description": "The currency code of the payment amount"
        },
        "amount": {
          "type": "string",
          "description": "The payment amount"
        }
      }
    },
    "transferType": {
      "type": "string",
      "enum": ["CREDIT"],
      "description": "The type of transfer"
    },
    "paymentType": {
      "type": "string",
      "enum": ["DEFAULT"],
      "description": "The type of payment"
    }
  }
}`;

const DataQualityPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dataModel, setDataModel] = useState<any>(null);
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
              setDataModel(jsonData);
            } else {
              // Assume YAML
              const yamlText = await response.text();
              const yamlData = yaml.load(yamlText);
              setDataModel(yamlData);
            }
            
            setLoading(false);
            return;
          } catch (err) {
            console.warn('Error fetching schema:', err);
            // Fall back to default spec
          }
        }
        
        // Case 3: No valid spec found, use fallback
        try {
          const fallbackData = yaml.load(FALLBACK_MODEL);
          setDataModel(fallbackData);
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
  
  return <DataQualityDashboard dataModel={dataModel} title={`Data Hygiene Dashboard`} onBack={handleBack} />;
};

export default DataQualityPage;