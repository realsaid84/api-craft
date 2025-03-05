'use client';


import { SchemaVisualizer } from '@/components/pages/JSONSchemaVisualizer';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from 'lucide-react';
import { sampleDataModels } from '@/public/data/data-models';

// Example schema for fallback/testing
const FALLBACK_SCHEMA = {
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

// Sample markdown with mermaid for demonstration purposes
const FALLBACK_MARKDOWN = `
# Payment Model Documentation

This document provides a comprehensive overview of the Payment Model used in our API.

## Data Flow Diagram

The following diagram illustrates how payment data flows through our system:

\`\`\`mermaid
flowchart TD
    A[Client] -->|Payment Request| B(API Gateway)
    B --> C{Payment Router}
    C -->|Credit Card| D[Card Processor]
    C -->|Bank Transfer| E[ACH Processor]
    C -->|Digital Wallet| F[Wallet Service]
    D --> G[Payment Database]
    E --> G
    F --> G
    G --> H[Reconciliation Service]
    H --> I[Accounting System]
    
    style A fill:#f9f9f9,stroke:#333,stroke-width:1px
    style G fill:#e1f5fe,stroke:#01579b,stroke-width:1px
    style I fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px
\`\`\`

## Entity Relationship

The payment model relates to other entities as shown:

\`\`\`mermaid
erDiagram
    PAYMENT {
        string id PK
        string customerId FK
        decimal amount
        string currency
        string status
        datetime createdAt
    }
    CUSTOMER {
        string id PK
        string name
        string email
    }
    ACCOUNT {
        string id PK
        string customerId FK
        decimal balance
        string currency
    }
    TRANSACTION {
        string id PK
        string paymentId FK
        string type
        decimal amount
        datetime timestamp
    }
    
    PAYMENT ||--o{ TRANSACTION : "generates"
    CUSTOMER ||--o{ PAYMENT : "makes"
    CUSTOMER ||--o{ ACCOUNT : "owns"
    ACCOUNT ||--o{ TRANSACTION : "affects"
\`\`\`

## State Transitions

A payment can transition through various states:

\`\`\`mermaid
stateDiagram-v2
    [*] --> Created
    Created --> Authorized: authorize()
    Authorized --> Captured: capture()
    Authorized --> Voided: void()
    Captured --> Refunded: refund()
    Voided --> [*]
    Refunded --> [*]
    Created --> Failed: timeout/reject
    Failed --> [*]
    
    note right of Created
        Initial state when payment is submitted
    end note
    
    note right of Captured
        Payment has been settled
    end note
\`\`\`
`;

export default function Page() {
  const searchParams = useSearchParams();
  const [schema, setSchema] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modelName, setModelName] = useState<string>('PaymentInstruction');
  const [markdownModel, setMarkdownModel] = useState<string | undefined>(undefined);

  const id = searchParams.get('id');
  const schemaUrl = searchParams.get('schemaUrl');
  const modelUrl = searchParams.get('modelUrl');

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);

        // 1. Get model name if ID is provided
        if (id) {
          const model = sampleDataModels.find(model => model.id === id);
          if (model) {
            setModelName(model.name);
          } else {
            console.warn(`Model with ID ${id} not found`);
          }
        }

        // 2. Load schema (either from URL or fallback)
        let schemaData = FALLBACK_SCHEMA;
        if (schemaUrl) {
          try {
            const response = await fetch(schemaUrl);
            if (!response.ok) {
              throw new Error(`Failed to load schema: ${response.status} ${response.statusText}`);
            }
            schemaData = await response.json();
          } catch (err) {
            console.warn('Error fetching schema, using fallback:', err);
            // Continue with fallback schema
          }
        }
        setSchema(schemaData);

        // 3. Load markdown model (either from URL or fallback)
        let markdownData: string | undefined = FALLBACK_MARKDOWN;
        if (modelUrl) {
          console.log('Loading markdown model from URL:', modelUrl);
          try {
            const response = await fetch(modelUrl);
            if (!response.ok) {
              throw new Error(`Failed to load markdown model: ${response.status} ${response.statusText}`);
            }
            
            // Check content type to determine how to parse the response
            const contentType = response.headers.get('content-type') || '';

            if (contentType.includes('application/json')) {
              // Handle JSON response
              const data = await response.json();
              
              // Handle potential response formats - either direct string or object with content property
              if (typeof data === 'string') {
                markdownData = data;
              } else if (data && data.content && typeof data.content === 'string') {
                markdownData = data.content;
              } else {
                console.warn('Unexpected markdown model format, using fallback');
              }
            } else {
              // Handle plain text/markdown response
              markdownData = await response.text();
              console.log('Markdown model loaded:', markdownData);
            }
          } catch (err) {
            console.warn('Error fetching markdown model, using fallback:', err);
            // Continue with fallback markdown
          }
        }
        setMarkdownModel(markdownData);

      } catch (err) {
        console.error('Error loading data:', err);
        setError(`Failed to load data: ${err instanceof Error ? err.message : 'Unknown error'}`);
        
        // Set fallbacks for all data
        setSchema(FALLBACK_SCHEMA);
        setModelName('PaymentInstruction');
        setMarkdownModel(FALLBACK_MARKDOWN);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [id, schemaUrl, modelUrl]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading schema data...</p>
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

  return (
    <SchemaVisualizer 
      schema={schema} 
      modelName={modelName} 
      title={`${modelName} Schema`} 
      schemaUrl={schemaUrl || ''}
      markdownModel={markdownModel}
    />
  );
}