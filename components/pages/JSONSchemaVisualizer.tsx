import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  ArrowLeft, 
  Code, 
  FormInput, 
  Eye, 
  AlertTriangle, 
  Plus, 
  Workflow, 
  GitCompare, 
  GitMerge, 
  Check, 
  Info, 
  AlertCircle, 
  FileJson,
  Copy,
  Activity
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SchemaVisualizerProps {
  schema: any;
  title?: string;
  modelName?: string;
  onBack?: () => void;
}

export const SchemaVisualizer = ({ 
  schema, 
  title = "Schema Visualizer", 
  modelName,
  onBack 
}: SchemaVisualizerProps) => {
  const router = useRouter();
  const [viewTab, setViewTab] = useState('visual');
  const [schemaTab, setSchemaTab] = useState('schema');
  const [isInternal, setIsInternal] = useState(false);
  const [warningCount] = useState(1);

  const modelTitle = modelName || schema.title || title;

  // Extract definitions from schema
  const getDefinitions = () => {
    // Handle both 'definitions' (older drafts) and '$defs' (newer drafts)
    return schema.definitions || schema.$defs || {};
  };

  if (!schema) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => router.push('/pages/discover/data-models')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold text-teal-600">No Schema Available</h1>
          </div>
          <Card>
            <CardContent className="py-10 text-center">
              <p>No schema data is available to visualize.</p>
              <Button 
                className="mt-4"
                onClick={() => router.push('/pages/discover/data-models')}
              >
                Return to Data Models
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getSchemaJson = () => {
    return JSON.stringify(schema, null, 2);
  };

  return (
    <div className="flex-1 bg-white">
      <div className="max-w-full mx-auto p-4">
        {/* Top navigation with buttons */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => router.push('/pages/discover/data-models')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <div className="border rounded-md overflow-hidden flex">
              <Button 
                variant={viewTab === 'visual' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setViewTab('visual')}
                className="gap-2 rounded-none"
              >
                <FormInput className="h-4 w-4" />
                <span>Visual</span>
              </Button>
              <Button 
                variant={viewTab === 'code' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setViewTab('code')}
                className="gap-2 rounded-none"
              >
                <Code className="h-4 w-4" />
                <span>Code</span>
              </Button>
              <Button 
                variant={viewTab === 'preview' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setViewTab('preview')}
                className="gap-2 rounded-none"
              >
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
            >
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>{warningCount} Warning</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 px-2"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Schema title and controls */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">{modelTitle}</h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 mr-4">
                <Label htmlFor="internal-toggle" className="text-sm font-medium">INTERNAL</Label>
                <Switch 
                  id="internal-toggle" 
                  checked={isInternal} 
                  onCheckedChange={setIsInternal} 
                />
              </div>
              <Button variant="outline" size="sm" className="gap-2 text-gray-700">
                <Code className="h-4 w-4" />
                <span>Bootstrap API</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-2 text-gray-700">
                <Workflow className="h-4 w-4" />
                <span>Forward Engineer</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-2 text-gray-700">
                <GitCompare className="h-4 w-4" />
                <span>Map and Compare</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-2 text-gray-700">
                <GitMerge className="h-4 w-4" />
                <span>Merge and Validate</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-2 text-gray-700">
                <Activity className="h-4 w-4" />
                <span>Model Metrics</span>
              </Button>
            </div>
          </div>
          {schema.description && (
            <p className="text-gray-600 mt-2">{schema.description}</p>
          )}
        </div>

        {/* Schema visualization */}
        <Card className="border rounded-md shadow-sm">
          <CardContent className="p-0">
            <Tabs value={schemaTab} onValueChange={setSchemaTab} className="w-full">
              <div className="border-b">
                <div className="flex justify-between items-center p-2">
                  <TabsList className="bg-transparent border-b-0">
                    <TabsTrigger value="schema" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none">Schema</TabsTrigger>
                    <TabsTrigger value="definitions" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none">Definitions</TabsTrigger>
                    <TabsTrigger value="examples" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none">Examples</TabsTrigger>
                    <TabsTrigger value="extensions" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none">Extensions</TabsTrigger>
                  </TabsList>
                  <div className="flex items-center ml-auto">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2 text-teal-600"
                    >
                      <FileJson className="h-4 w-4" />
                      <span>Generate from JSON</span>
                    </Button>
                  </div>
                </div>
              </div>
              
              <TabsContent value="schema" className="m-0 p-0">
                {viewTab === 'visual' && (
                  <SchemaVisualTree schema={schema} />
                )}
                
                {viewTab === 'code' && (
                  <div className="relative bg-gray-50 p-4">
                    <pre className="text-sm font-mono overflow-auto p-2">
                      {getSchemaJson()}
                    </pre>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="absolute top-4 right-4"
                      onClick={() => navigator.clipboard.writeText(getSchemaJson())}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                {viewTab === 'preview' && (
                  <div className="p-4">
                    <h2 className="text-xl font-bold mb-4">Schema Preview</h2>
                    <p className="text-gray-500">This is a preview of how the schema will be rendered in applications.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="definitions" className="m-0 p-0">
                {viewTab === 'visual' && Object.keys(getDefinitions()).length > 0 ? (
                  <div className="p-2">
                    {Object.entries(getDefinitions()).map(([defName, defSchema]) => (
                      <div key={defName} className="mb-4">
                        <div className="mb-2 p-2 flex items-center bg-gray-50 border-b">
                          <span className="text-gray-700">{defName}:</span>
                          <span className="font-medium text-pink-600 ml-2">object</span>
                        </div>
                        <SchemaVisualTree schema={defSchema} />
                      </div>
                    ))}
                  </div>
                ) : viewTab === 'visual' ? (
                  <div className="p-4 text-gray-500">
                    No definitions found in this schema.
                  </div>
                ) : viewTab === 'code' ? (
                  <div className="relative bg-gray-50 p-4">
                    <pre className="text-sm font-mono overflow-auto p-2">
                      {JSON.stringify(getDefinitions(), null, 2) || '{}'}
                    </pre>
                  </div>
                ) : (
                  <div className="p-4">
                    <h2 className="text-xl font-bold mb-4">Definitions Preview</h2>
                    <p className="text-gray-500">This is a preview of schema definitions.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="examples" className="m-0 p-4">
                <p>Examples of this data model will appear here.</p>
              </TabsContent>

              <TabsContent value="extensions" className="m-0 p-4">
                <p>Schema extensions will appear here.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Bottom toolbar */}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" size="sm" className="gap-2">
            <Code className="h-4 w-4" />
            <span>Bootstrap API</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Workflow className="h-4 w-4" />
            <span>Forward Engineer</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <GitCompare className="h-4 w-4" />
            <span>Map and Compare</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <GitMerge className="h-4 w-4" />
            <span>Merge and Validate</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

interface SchemaObjectProps {
  schema: any;
  level?: number;
  name?: string;
  required?: boolean;
}

interface SchemaVisualTreeProps {
  schema: any;
}

const SchemaVisualTree = ({ schema }: SchemaVisualTreeProps) => {
  // Count properties to show in the object title
  const countProperties = (obj: any) => {
    if (obj.properties) {
      return Object.keys(obj.properties).length;
    }
    return 0;
  };

  const propCount = countProperties(schema);

  return (
    <div className="p-2">
      <div className="mb-2 p-2 flex items-center bg-gray-50 border-b">
        <span className="font-medium text-pink-600">object</span>
        <span className="text-gray-500 ml-2">({propCount})</span>
      </div>
      {schema.properties && Object.entries(schema.properties).map(([propName, propSchema]: [string, any], index) => (
        <SchemaPropertyRow 
          key={propName} 
          name={propName} 
          schema={propSchema} 
          required={schema.required?.includes(propName)}
          isLast={index === Object.keys(schema.properties).length - 1}
        />
      ))}
    </div>
  );
};

interface SchemaPropertyRowProps {
  name: string;
  schema: any;
  required?: boolean;
  level?: number;
  isLast?: boolean;
}

const SchemaPropertyRow = ({ 
  name, 
  schema, 
  required = false, 
  level = 0,
  isLast = false
}: SchemaPropertyRowProps) => {
  const [isExpanded, setIsExpanded] = useState(level < 1);
  
  // Helper function to get status icon
  const getStatusIcon = () => {
    if (required) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex-shrink-0">
                <AlertCircle className="h-4 w-4 text-red-500" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Required field</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex-shrink-0">
              <Info className="h-4 w-4 text-gray-400" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Optional field</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };
  
  // Helper to get type-related UI elements
  const getTypeDetails = () => {
    // For object type
    if (schema.type === 'object' || (schema.properties && !schema.type)) {
      const propCount = schema.properties ? Object.keys(schema.properties).length : 0;
      return {
        expandable: true,
        typeDisplay: (
          <span className="text-pink-600">object</span>
        ),
        countDisplay: propCount > 0 ? (
          <span className="text-gray-500 ml-1">({propCount})</span>
        ) : null
      };
    }
    
    // For array type
    if (schema.type === 'array') {
      return {
        expandable: true,
        typeDisplay: (
          <span className="text-green-600">array</span>
        ),
        countDisplay: schema.items?.type ? (
          <span className="text-gray-500 ml-1">of {schema.items.type}</span>
        ) : null
      };
    }
    
    // For enum type
    if (schema.enum) {
      return {
        expandable: true,
        typeDisplay: (
          <span className="text-purple-600">enum</span>
        ),
        countDisplay: (
          <span className="text-gray-500 ml-1">({schema.enum.length})</span>
        )
      };
    }
    
    // For string type
    if (schema.type === 'string') {
      return {
        expandable: false,
        typeDisplay: (
          <span className="text-green-600">string</span>
        ),
        countDisplay: schema.format ? (
          <span className="text-gray-500 ml-1">&lt;{schema.format}&gt;</span>
        ) : null
      };
    }
    
    // For number or integer type
    if (schema.type === 'number' || schema.type === 'integer') {
      return {
        expandable: false,
        typeDisplay: (
          <span className="text-blue-600">{schema.type}</span>
        ),
        countDisplay: null
      };
    }
    
    // For boolean type
    if (schema.type === 'boolean') {
      return {
        expandable: false,
        typeDisplay: (
          <span className="text-orange-600">boolean</span>
        ),
        countDisplay: null
      };
    }
    
    // For reference ($ref) type
    if (schema.$ref) {
      return {
        expandable: false,
        typeDisplay: (
          <span className="text-purple-600">$ref</span>
        ),
        countDisplay: (
          <code className="bg-gray-100 text-xs px-1 rounded ml-1">{schema.$ref}</code>
        )
      };
    }
    
    // Default case
    return {
      expandable: false,
      typeDisplay: <span>{schema.type || 'unknown'}</span>,
      countDisplay: null
    };
  };
  
  const typeDetails = getTypeDetails();
  
  // Action buttons
  const ActionButtons = () => (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className="h-6 w-6 rounded">
        <Copy className="h-3 w-3 text-gray-500" />
      </Button>
      <Button variant="ghost" size="icon" className="h-6 w-6 rounded">
        <AlertCircle className="h-3 w-3 text-gray-500" />
      </Button>
    </div>
  );
  
  return (
    <div className={`border-b ${isLast ? 'border-b-0' : ''}`}>
      <div 
        className={`py-2 pr-2 flex items-center justify-between ${isExpanded ? 'bg-gray-50' : ''} hover:bg-gray-50`}
      >
        <div className="flex items-center">
          {typeDetails.expandable && (
            <Button
              variant="ghost" 
              size="icon"
              className="h-6 w-6 mr-2 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 
                <ChevronDown className="h-4 w-4" /> : 
                <ChevronRight className="h-4 w-4" />
              }
            </Button>
          )}
          {!typeDetails.expandable && schema.enum ? (
            <Button
              variant="ghost" 
              size="icon"
              className="h-6 w-6 mr-2 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 
                <ChevronDown className="h-4 w-4" /> : 
                <ChevronRight className="h-4 w-4" />
              }
            </Button>
          ) : !typeDetails.expandable && (
            <div className="w-8" />
          )}
          
          <div className="text-gray-700 mr-2 font-normal">{name}:</div>
          
          {typeDetails.typeDisplay}
          {typeDetails.countDisplay}
        </div>
        
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <ActionButtons />
        </div>
      </div>
      
      {isExpanded && typeDetails.expandable && (
        <div className="pl-8 ml-2 border-l">
          {schema.type === 'object' && schema.properties && 
            Object.entries(schema.properties).map(([propName, propSchema]: [string, any], index) => (
              <SchemaPropertyRow 
                key={propName}
                name={propName}
                schema={propSchema}
                required={schema.required?.includes(propName)}
                level={level + 1}
                isLast={index === Object.keys(schema.properties).length - 1}
              />
            ))
          }
          
          {schema.type === 'array' && schema.items && (
            <div className="py-2">
              <div className="flex items-center">
                <div className="text-gray-700 mr-2 font-normal">(items):</div>
                <span className={`
                  ${schema.items.type === 'string' ? 'text-green-600' : ''}
                  ${schema.items.type === 'number' || schema.items.type === 'integer' ? 'text-blue-600' : ''}
                  ${schema.items.type === 'boolean' ? 'text-orange-600' : ''}
                  ${schema.items.type === 'object' ? 'text-pink-600' : ''}
                `}>
                  {schema.items.type || 'any'}
                </span>
              </div>
              
              {schema.items.type === 'object' && schema.items.properties && (
                <div className="mt-2">
                  {Object.entries(schema.items.properties).map(([propName, propSchema]: [string, any], index) => (
                    <SchemaPropertyRow 
                      key={propName}
                      name={propName}
                      schema={propSchema}
                      required={schema.items.required?.includes(propName)}
                      level={level + 1}
                      isLast={index === Object.keys(schema.items.properties).length - 1}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {isExpanded && schema.enum && (
        <div className="pl-8 ml-2 border-l py-2">
          <div className="text-gray-700 mb-2 font-normal">Allowed values:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {schema.enum.map((value: any, index: number) => (
              <div key={index} className="px-2 py-1 bg-gray-100 rounded text-gray-800 text-sm">
                {typeof value === 'string' 
                  ? `"${value}"`
                  : typeof value === 'object' 
                    ? JSON.stringify(value) 
                    : String(value)
                }
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemaVisualizer;