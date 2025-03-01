
import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';


//@ts-ignore
const SchemaVisualizer = ({ schema, title = "Schema Visualizer" }: { schema: Schema; title?: string }) => {
  if (!schema) {
    return <div>No schema loaded</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-teal-600">{title}</CardTitle>
        <CardDescription className="p-2 border rounded text-sm text-gray-600">
          {schema.title || 'No schema title defined'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {schema.description && (
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm">{schema.description}</p>
            </div>
          )}
          
          <SchemaObject schema={schema} level={0} />
        </div>
      </CardContent>
    </Card>
  );
};

//@ts-ignore
const SchemaObject = ({ schema, level = 0, name = "", required = false }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  
  const renderType = () => {
    if (schema.type === 'object' && schema.properties) {
      return (
        <>
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span className="text-sm font-medium">
              {name && (
                <span className="mr-2">
                  {name}
                  {required && <span className="text-red-500 ml-1">*</span>}:
                </span>
              )}
              <span className="text-blue-600">object</span>
            </span>
            {isExpanded ? 
              <ChevronDown className="w-4 h-4" /> : 
              <ChevronRight className="w-4 h-4" />
            }
          </div>
          
          {isExpanded && schema.properties && (
            <div className={`ml-4 pl-4 border-l ${level > 0 ? 'mt-2' : 'mt-4'} space-y-4`}>
              {Object.entries(schema.properties).map(([propName, propSchema]) => (
                <SchemaObject 
                  key={propName} 
                  schema={propSchema} 
                  name={propName} 
                  level={level + 1}
                  required={schema.required?.includes(propName)}
                />
              ))}
            </div>
          )}
        </>
      );
    } else if (schema.type === 'array' && schema.items) {
      return (
        <>
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span className="text-sm font-medium">
              {name && (
                <span className="mr-2">
                  {name}
                  {required && <span className="text-red-500 ml-1">*</span>}:
                </span>
              )}
              <span className="text-green-600">array</span>
              {schema.items.type && 
                <span className="text-xs text-gray-500">of {schema.items.type}</span>
              }
            </span>
            {isExpanded ? 
              <ChevronDown className="w-4 h-4" /> : 
              <ChevronRight className="w-4 h-4" />
            }
          </div>
          
          {isExpanded && (
            <div className={`ml-4 pl-4 border-l ${level > 0 ? 'mt-2' : 'mt-4'}`}>
              <SchemaObject 
                schema={schema.items} 
                level={level + 1} 
              />
            </div>
          )}
        </>
      );
    } else if (schema.$ref) {
      // For references, just show the reference path
      return (
        <div className="text-sm">
          {name && (
            <span className="font-medium mr-2">
              {name}
              {required && <span className="text-red-500 ml-1">*</span>}:
            </span>
          )}
          <span className="text-purple-600">$ref: </span>
          <code className="bg-gray-100 px-1 rounded">{schema.$ref}</code>
        </div>
      );
    } else {
      // Simple property
      return (
        <div className="text-sm">
          {name && (
            <span className="font-medium mr-2">
              {name}
              {required && <span className="text-red-500 ml-1">*</span>}:
            </span>
          )}
          <span className={`
            ${schema.type === 'string' ? 'text-green-600' : ''}
            ${schema.type === 'number' || schema.type === 'integer' ? 'text-blue-600' : ''}
            ${schema.type === 'boolean' ? 'text-purple-600' : ''}
          `}>
            {schema.type}
          </span>
          {schema.format && (
            <span className="text-gray-500 ml-2">({schema.format})</span>
          )}
          {schema.enum && (
            <span className="ml-2">
              enum: 
              //ts-ignore
              <code className="bg-gray-100 px-1 rounded ml-1">
                [{schema.enum.map((e: any) => `"${e}"`).join(', ')}]
              </code>
            </span>
          )}
          {schema.default !== undefined && (
            <span className="text-gray-500 ml-2">
              default: <code className="bg-gray-100 px-1 rounded">{JSON.stringify(schema.default)}</code>
            </span>
          )}
          {schema.example !== undefined && (
            <span className="text-gray-500 ml-2">
              example: <code className="bg-gray-100 px-1 rounded">{JSON.stringify(schema.example)}</code>
            </span>
          )}
        </div>
      );
    }
  };
  
  return (
    <div>
      {renderType()}
      
      {schema.description && isExpanded && (
        <div className="mt-1 ml-4 text-xs text-gray-500">
          {schema.description}
        </div>
      )}
    </div>
  );
};

export default SchemaVisualizer;