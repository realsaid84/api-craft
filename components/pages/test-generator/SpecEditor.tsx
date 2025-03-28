'use client';
import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clipboard, Code, Eye } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { xonokai } from 'react-syntax-highlighter/dist/esm/styles/prism';
import * as yaml from 'js-yaml';

// Sample OpenAPI spec for new users
const SAMPLE_SPEC = `{
  "openapi": "3.0.3",
  "info": {
    "title": "Payment API",
    "description": "A RESTful API for payment processing",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://api.example.com/v1",
      "description": "Production server"
    },
    {
      "url": "https://dev-api.example.com/v1",
      "description": "Development server"
    }
  ],
  "tags": [
    {
      "name": "Payments",
      "description": "Payment operations"
    },
    {
      "name": "Accounts",
      "description": "Account operations"
    }
  ],
  "paths": {
    "/payments": {
      "post": {
        "tags": ["Payments"],
        "summary": "Create a new payment",
        "operationId": "createPayment",
        "requestBody": {
          "description": "Payment details",
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/PaymentRequest"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Payment created",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Payment"
                }
              }
            }
          },
          "400": {
            "description": "Invalid input"
          },
          "401": {
            "description": "Unauthorized"
          }
        }
      },
      "get": {
        "tags": ["Payments"],
        "summary": "List all payments",
        "operationId": "getPayments",
        "parameters": [
          {
            "name": "status",
            "in": "query",
            "description": "Filter by payment status",
            "required": false,
            "schema": {
              "type": "string",
              "enum": ["pending", "completed", "failed"]
            }
          }
        ],
        "responses": {
          "200": {
            "description": "List of payments",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/Payment"
                  }
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized"
          }
        }
      }
    },
    "/payments/{paymentId}": {
      "get": {
        "tags": ["Payments"],
        "summary": "Get payment by ID",
        "operationId": "getPaymentById",
        "parameters": [
          {
            "name": "paymentId",
            "in": "path",
            "description": "ID of the payment",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Payment details",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Payment"
                }
              }
            }
          },
          "404": {
            "description": "Payment not found"
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "PaymentRequest": {
        "type": "object",
        "required": ["amount", "currency", "source", "destination"],
        "properties": {
          "amount": {
            "type": "number",
            "format": "double",
            "description": "Payment amount",
            "example": 100.50
          },
          "currency": {
            "type": "string",
            "description": "Currency code",
            "example": "USD"
          },
          "source": {
            "type": "string",
            "description": "Source account ID",
            "example": "acc_123456"
          },
          "destination": {
            "type": "string",
            "description": "Destination account ID",
            "example": "acc_789012"
          },
          "description": {
            "type": "string",
            "description": "Payment description",
            "example": "Monthly subscription"
          }
        }
      },
      "Payment": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid",
            "description": "Payment ID",
            "example": "pay_123e4567-e89b-12d3-a456-426614174000"
          },
          "amount": {
            "type": "number",
            "format": "double",
            "description": "Payment amount",
            "example": 100.50
          },
          "currency": {
            "type": "string",
            "description": "Currency code",
            "example": "USD"
          },
          "source": {
            "type": "string",
            "description": "Source account ID",
            "example": "acc_123456"
          },
          "destination": {
            "type": "string",
            "description": "Destination account ID",
            "example": "acc_789012"
          },
          "status": {
            "type": "string",
            "enum": ["pending", "completed", "failed"],
            "description": "Payment status",
            "example": "completed"
          },
          "created_at": {
            "type": "string",
            "format": "date-time",
            "description": "Creation timestamp",
            "example": "2023-01-01T12:00:00Z"
          },
          "updated_at": {
            "type": "string",
            "format": "date-time",
            "description": "Last update timestamp",
            "example": "2023-01-01T12:05:00Z"
          }
        }
      }
    },
    "securitySchemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT"
      }
    }
  },
  "security": [
    {
      "bearerAuth": []
    }
  ]
}`;

interface SpecEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const SpecEditor: React.FC<SpecEditorProps> = ({ value, onChange }) => {
  const [editorMode, setEditorMode] = useState<'edit' | 'preview'>('edit');
  const [editorFormat, setEditorFormat] = useState<'json' | 'yaml'>('json');
  const [previewText, setPreviewText] = useState<string>('');

  useEffect(() => {
    // On first load, if no content, provide the sample
    if (!value && editorMode === 'edit') {
      onChange(SAMPLE_SPEC);
    }
  }, []);

  useEffect(() => {
    // Update preview whenever value changes
    try {
      if (value) {
        // Determine if the current content is JSON or YAML
        try {
          // Try to parse as JSON
          JSON.parse(value);
          // If it doesn't throw, it's valid JSON
          setEditorFormat('json');
          
          // For preview, we format it nicely
          const formatted = JSON.stringify(JSON.parse(value), null, 2);
          setPreviewText(formatted);
        } catch (jsonError) {
          // If not JSON, try YAML
          try {
            const parsedYaml = yaml.load(value);
            setEditorFormat('yaml');
            
            // For preview of YAML, we use the original text
            setPreviewText(value);
          } catch (yamlError) {
            // Not valid JSON or YAML, use as is
            setPreviewText(value);
          }
        }
      } else {
        setPreviewText('');
      }
    } catch (error) {
      console.error('Error updating preview:', error);
      setPreviewText(value || '');
    }
  }, [value]);

  const handleToggleFormat = () => {
    try {
      if (editorFormat === 'json' && value) {
        // Convert JSON to YAML
        const jsonObj = JSON.parse(value);
        const yamlStr = yaml.dump(jsonObj, { indent: 2 });
        onChange(yamlStr);
        setEditorFormat('yaml');
      } else if (editorFormat === 'yaml' && value) {
        // Convert YAML to JSON
        const yamlObj = yaml.load(value);
        const jsonStr = JSON.stringify(yamlObj, null, 2);
        onChange(jsonStr);
        setEditorFormat('json');
      }
    } catch (error) {
      console.error('Error converting format:', error);
      // Keep current format if conversion fails
    }
  };

  const handleCopyToClipboard = () => {
    if (value) {
      navigator.clipboard.writeText(value)
        .then(() => {
          // Could add a toast notification here
          console.log('Copied to clipboard');
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
        });
    }
  };

  const renderSyntaxHighlightedCode = () => {
    return (
      <SyntaxHighlighter
        language={editorFormat}
        style={xonokai}
        showLineNumbers={true}
        customStyle={{
          margin: 0,
          borderRadius: '0.375rem',
          height: '600px',
          fontSize: '0.9rem'
        }}
      >
        {previewText || '// No content to preview'}
      </SyntaxHighlighter>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditorMode(editorMode === 'edit' ? 'preview' : 'edit')}
            className="gap-1"
          >
            {editorMode === 'edit' ? (
              <>
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </>
            ) : (
              <>
                <Code className="h-4 w-4" />
                <span>Edit</span>
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleFormat}
            className="gap-1"
          >
            <span>Switch to {editorFormat === 'json' ? 'YAML' : 'JSON'}</span>
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyToClipboard}
          className="gap-1"
        >
          <Clipboard className="h-4 w-4" />
          <span>Copy</span>
        </Button>
      </div>
      
      {editorMode === 'edit' ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste or edit your OpenAPI specification here..."
          className="font-mono text-sm min-h-[600px] resize-none p-4"
        />
      ) : (
        <Card className="border rounded-md overflow-hidden">
          <CardContent className="p-0">
            {renderSyntaxHighlightedCode()}
          </CardContent>
        </Card>
      )}
      
      <div className="text-xs text-gray-500">
        {editorFormat === 'json' ? 'JSON' : 'YAML'} • OpenAPI {value?.includes('"openapi": "3.1') ? '3.1' : '3.0'}
      </div>
    </div>
  );
};

export { SpecEditor };