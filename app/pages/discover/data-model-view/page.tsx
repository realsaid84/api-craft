'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SchemaVisualizer } from '@/components/pages/JSONSchemaVisualizer';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from 'lucide-react';
import { sampleDataModels } from '@/public/data/data-models';

// Example schema for fallback/testing
const exampleSchema = {
  "title": "PaymentInstruction",
  "description": "Payment instruction domain model",
  "type": "object",
  "properties": {
    "requestedExecutionDate": {
      "type": "string",
      "format": "date"
    },
    "paymentIdentifiers": {
      "type": "object",
      "properties": {
        "endToEndId": {
          "type": "string"
        }
      },
      "required": ["endToEndId"]
    },
    "otherPaymentReferences": {
      "type": "object",
      "properties": {
        "relatedReferenceId": {
          "type": "string"
        },
        "uetr": {
          "type": "string"
        }
      }
    },
    "value": {
      "type": "object",
      "properties": {
        "currency": {
          "type": "string"
        },
        "amount": {
          "type": "string"
        }
      },
      "required": ["currency", "amount"]
    },
    "transferType": {
      "type": "string",
      "enum": ["CREDIT", "DEBIT"]
    },
    "paymentType": {
      "type": "string",
      "enum": ["DOMESTIC", "INTERNATIONAL"]
    },
    "paymentTypeInformation": {
      "type": "object",
      "properties": {
        "serviceLevelCode": {
          "type": "string"
        }
      }
    },
    "localInstrumentCode": {
      "type": "object",
      "properties": {
        "code": {
          "type": "string"
        },
        "proprietary": {
          "type": "string"
        }
      }
    },
    "paymentContext": {
      "type": "string"
    },
    "debtor": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "postalAddress": {
          "type": "object"
        }
      }
    },
    "account": {
      "type": "object",
      "properties": {
        "accountNumber": {
          "type": "string"
        },
        "accountType": {
          "type": "string"
        }
      }
    }
  },
  "required": ["requestedExecutionDate", "paymentIdentifiers", "value", "transferType", "paymentType"]
};

export default function Page() {
  const searchParams = useSearchParams();
  const [schema, setSchema] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modelName, setModelName] = useState<string>('');

  const id = searchParams.get('id');
  const schemaUrl = searchParams.get('schemaUrl');

  useEffect(() => {
    const fetchSchema = async () => {
      if (!id && !schemaUrl) {
        setError('No model ID or schema URL provided');
        setIsLoading(false);
        // Fallback to example schema for demo purposes
        setSchema(exampleSchema);
        setModelName('PaymentInstruction');
        return;
      }

      try {
        setIsLoading(true);
        
        // Find the model in our sample data to get the name
        if (id) {
          const model = sampleDataModels.find(model => model.id === id);
          if (model) {
            setModelName(model.name);
          }
        }

        // Use the provided schema URL to fetch the schema
        if (schemaUrl) {
          try {
            const response = await fetch(schemaUrl);
            if (!response.ok) {
              throw new Error(`Failed to load schema: ${response.statusText}`);
            }
            const data = await response.json();
            setSchema(data);
          } catch (fetchErr) {
            console.warn('Error fetching schema, using fallback:', fetchErr);
            // Use fallback schema for demo purposes
            setSchema(exampleSchema);
            setModelName(modelName || 'PaymentInstruction');
          }
        } else {
          // Use fallback schema for demo purposes
          setSchema(exampleSchema);
          setModelName(modelName || 'PaymentInstruction');
        }
      } catch (err) {
        console.error('Error loading schema:', err);
        setError(`Failed to load schema: ${err instanceof Error ? err.message : 'Unknown error'}`);
        
        // Use fallback schema for demo purposes
        setSchema(exampleSchema);
        setModelName('PaymentInstruction');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchema();
  }, [id, schemaUrl]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading schema...</p>
        </div>
      </div>
    );
  }

  if (error && !schema) {
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

  return <SchemaVisualizer schema={schema} modelName={modelName} title={`${modelName} Schema`} />;
}