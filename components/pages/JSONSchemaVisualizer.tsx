import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  ArrowLeft, 
  Code, 
  AlertTriangle, 
  Plus, 
  Workflow, 
  GitCompare, 
  GitMerge,  
  Info, 
  AlertCircle, 
  FileJson,
  Copy,
  Activity,
  Eye
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import mermaid from 'mermaid';


// Initialize mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  flowchart: { useMaxWidth: false, htmlLabels: true },
});

// Define types for JSON Schema
interface JSONSchema {
  $schema?: string;
  title?: string;
  description?: string;
  type?: string;
  xModelType?: string;
  properties?: Record<string, JSONSchema>;
  required?: string[];
  definitions?: Record<string, JSONSchema>;
  $defs?: Record<string, JSONSchema>;
  items?: JSONSchema;
  format?: string;
  example?: any;
  examples?: any[] | Record<string, any>;
  [key: string]: any; // For other properties that might exist
}

interface SchemaVisualizerProps {
  schema: JSONSchema;
  title?: string;
  modelName?: string;
  schemaUrl: string;
  markdownModel?: string;
  onBack?: () => void;
}

// Mermaid diagram rendering component
const MermaidDiagram = ({ content }: { content: string }) => {
  const [svg, setSvg] = useState<string>('');
  
  React.useEffect(() => {
    const renderDiagram = async () => {
      try {
        // Generate SVG with Mermaid
        const { svg } = await mermaid.render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, content);
        setSvg(svg);
      } catch (error) {
        console.error('Failed to render mermaid diagram:', error);
        setSvg(`<pre>Failed to render diagram:\n${content}</pre>`);
      }
    };
    
    renderDiagram();
  }, [content]);
  
  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
};

// Markdown renderer with Mermaid support
const MarkdownRenderer = ({ markdown }: { markdown: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        // Handle code blocks specifically for mermaid
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';
          
          if (language === 'mermaid') {
            return <MermaidDiagram content={String(children).replace(/\n$/, '')} />;
          }

          return (
            <SyntaxHighlighter
              language={language}
              style={xonokai}
              customStyle={{
                margin: '1rem 0',
                borderRadius: '0.375rem',
              }}
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          );
        }
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
};





export const SchemaVisualizer: React.FC<SchemaVisualizerProps> = ({ 
  schema: initialSchema, 
  title = "Schema Visualizer", 
  modelName,
  markdownModel: initialMarkdownModel,
  schemaUrl: initialSchemaUrl, 
}: SchemaVisualizerProps) => {
  const router = useRouter();
  const [viewTab, setViewTab] = useState<'visual' | 'code' | 'preview'>('visual');
  const [schemaTab, setSchemaTab] = useState<'schema' | 'definitions' | 'examples' | 'extensions'>('schema');
  const [isInternal, setIsInternal] = useState(false);
  const [warningCount] = useState(1);
  const [showJsonDialog, setShowJsonDialog] = useState(false);
  const [jsonInput, setJsonInput] = useState('{\n  "example": "value"\n}');
  const [jsonError, setJsonError] = useState('');
  const [selectedExample, setSelectedExample] = useState<string>('default');
  const [schema, setSchema] = useState(initialSchema);
  const [markdownModel, setMarkdownModel] = useState<string | undefined>(initialMarkdownModel);
  const [schemaUrl, setSchemaUrl] = useState<string | undefined>(initialSchemaUrl);

  const modelTitle = modelName || schema.title || title;

  // Extract definitions from schema
  const getDefinitions = (): Record<string, JSONSchema> => {
    // Handle both 'definitions' (older drafts) and '$defs' (newer drafts)
    return schema.definitions || schema.$defs || {};
  };
  
  // Extract examples from schema
  const getExamples = (): Record<string, any> => {
    const examples: Record<string, any> = {};
    
    // Add the singular example if it exists
    if (schema.example !== undefined) {
      examples['default'] = schema.example;
    }
    
    // Add multiple examples if they exist
    if (schema.examples) {
      if (Array.isArray(schema.examples)) {
        // If examples is an array
        schema.examples.forEach((example, index) => {
          examples[`example-${index + 1}`] = example;
        });
      } else if (typeof schema.examples === 'object') {
        // If examples is an object with named examples
        Object.entries(schema.examples).forEach(([key, value]) => {
          examples[key] = value;
        });
      }
    }
    
    return examples;
  };

  // Handle Quality Metrics button click
  const handleQualityMetricsClick = () => {
    try {
      console.log('Stored API spec for quality analysis in session storage');
      // Navigate to the quality page without the large query parameter
      router.push(`/pages/observe/data-quality?schemaUrl=${schemaUrl}`);
    } catch (error) {
      console.error('Error fushing API spec url:', error);
    }
  };

  const getSchemaJson = (): string => {
    return JSON.stringify(schema, null, 2);
  };
  
  // Function to generate JSON Schema from a JSON object
  const generateSchemaFromJson = (jsonObj: any): JSONSchema => {
    try {
      // Parse the JSON if it's a string
      const obj = typeof jsonObj === 'string' ? JSON.parse(jsonObj) : jsonObj;
      
      // Basic schema generation function
      const generateSchema = (value: any, title = ''): JSONSchema => {
        if (value === null) {
          return { type: 'null' };
        }
        
        const type = Array.isArray(value) ? 'array' : typeof value;
        
        const schema: JSONSchema = { type };
        if (title) schema.title = title;
        
        switch (type) {
          case 'object':
            schema.properties = {};
            schema.required = [];
            
            for (const [key, propValue] of Object.entries(value)) {
              if (schema.properties) {
                schema.properties[key] = generateSchema(propValue, key);
              }
              if (propValue !== null && propValue !== undefined && schema.required) {
                schema.required.push(key);
              }
            }
            
            if (schema.required && schema.required.length === 0) {
              delete schema.required;
            }
            break;
            
          case 'array':
            if (value.length > 0) {
              // Try to infer a common type for array items
              const itemSchemas = value.map((item: any) => generateSchema(item));
              const commonType = itemSchemas.reduce((common: string | null, schema: JSONSchema) => {
                if (common === null) return schema.type;
                return common === schema.type ? common : 'mixed';
              }, null);
              
              if (commonType === 'mixed') {
                // If items have different types, use oneOf
                schema.items = {
                  oneOf: [...new Set(itemSchemas)]
                };
              } else {
                // If items have the same type, infer more details
                if (commonType === 'object') {
                  // Merge properties from all objects
                  const mergedProperties: Record<string, JSONSchema> = {};
                  const allRequired = new Set<string>();
                  
                  itemSchemas.forEach((itemSchema: JSONSchema) => {
                    if (!itemSchema.properties) return;
                    
                    for (const [propName, propSchema] of Object.entries(itemSchema.properties)) {
                      if (!mergedProperties[propName]) {
                        mergedProperties[propName] = propSchema;
                      }
                    }
                    
                    if (itemSchema.required) {
                      itemSchema.required.forEach((req: string) => allRequired.add(req));
                    }
                  });
                  
                  schema.items = {
                    type: 'object',
                    properties: mergedProperties
                  };
                  
                  if (allRequired.size > 0) {
                    schema.items.required = [...allRequired];
                  }
                } else {
                  // Simple type for all items
                  schema.items = { type: commonType as string };
                }
              }
            } else {
              schema.items = {}; // Empty array, no type to infer
            }
            break;
            
          case 'string':
            // Try to detect format
            if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
              schema.format = 'date';
            } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/.test(value)) {
              schema.format = 'date-time';
            } else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
              schema.format = 'uuid';
            } else if (/^[^@]+@[^@]+\.[^@]+$/.test(value)) {
              schema.format = 'email';
            } else if (/^https?:\/\//.test(value)) {
              schema.format = 'uri';
            }
            
            // Add example
            schema.example = value;
            break;
            
          case 'number':
          case 'boolean':
            // Add example
            schema.example = value;
            break;
        }
        
        return schema;
      };
      
      // Generate the schema
      const generatedSchema = generateSchema(obj);
      
      // Add JSON Schema metadata
      const finalSchema: JSONSchema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        ...generatedSchema,
        title: modelTitle || 'Generated Schema',
        description: 'Schema generated from JSON example'
      };
      
      return finalSchema;
    } catch (error) {
      console.error('Error generating schema:', error);
      throw new Error(`Failed to generate schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleGenerateSchema = () => {
    try {
      setJsonError('');
      const parsedJson = JSON.parse(jsonInput);
      const generatedSchema = generateSchemaFromJson(parsedJson);
      // Update the schema safely
      // Note: In a real application, you'd need to handle this properly
      // This is a workaround for the TypeScript error
      (schema as any) = generatedSchema;
      setShowJsonDialog(false);
      setViewTab('visual');  // Switch to visual view to display the new schema
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : String(error));
    }
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

  return (

    <div className="flex-1 overflow-auto p-2 md:p-8 lg:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => router.push('/pages/discover/data-models')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold text-teal-600">
              {modelTitle}
            </h1>
          </div>
          <div className="flex gap-2">
            <div className="border rounded-md overflow-hidden flex">
              <Button 
                variant={viewTab === 'visual' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setViewTab('visual')}
                className="gap-2 rounded-none"




              >
                <Eye className="h-4 w-4" />
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
        <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 mr-4">
                <Label htmlFor="internal-toggle" className="text-sm font-medium">INTERNAL</Label>
                <Switch 
                  id="internal-toggle" 
                  checked={isInternal} 
                  onCheckedChange={setIsInternal} 
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2 text-gray-700">
                <Code className="h-4 w-4" />
                <span>Bootstrap API</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-2 text-gray-700">
                <Workflow className="h-4 w-4" />
                <span>Forward Engineer</span>
              </Button>                  
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 text-teal-600"
                      onClick={() => setShowJsonDialog(true)}
                    >
                      <FileJson className="h-4 w-4" />
                      <span>Reverse Engineer from JSON</span>
                    </Button>
              <Button variant="outline" size="sm" className="gap-2 text-gray-700"
              onClick={handleQualityMetricsClick}>
                <Activity className="h-4 w-4" />
                <span>Quality Metrics</span>
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
            <Tabs value={schemaTab} onValueChange={(value) => setSchemaTab(value as any)} className="w-full">
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
                      onClick={() => setShowJsonDialog(true)}
                    >
                      <GitCompare className="h-4 w-4" />
                      <span>Map and Compare</span>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 text-gray-700">
                      <GitMerge className="h-4 w-4" />
                      <span>Merge and Validate</span>
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
                    <SyntaxHighlighter
                      language="json"
                      style={xonokai}
                      customStyle={{
                        margin: 0,
                        borderRadius: '0.375rem',
                      }}
                    >
                      {getSchemaJson()}
                    </SyntaxHighlighter>
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
                    {markdownModel ? (
                      <div className="markdown-preview prose max-w-none">
                        <MarkdownRenderer markdown={markdownModel} />
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                          <AlertCircle className="w-6 h-6 text-teal-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No Preview Available</h3>
                        <p className="text-muted-foreground mb-4">
                          This schema does not have any model diagram to preview.
                        </p>
                      </div>
                    )}
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
                    <SyntaxHighlighter
                      language="json"
                      style={xonokai}
                      customStyle={{
                        margin: 0,
                        borderRadius: '0.375rem',
                      }}
                    >
                      {JSON.stringify(getDefinitions(), null, 2) || '{}'}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <div className="p-4">
                    <h2 className="text-xl font-bold mb-4">Definitions Preview</h2>
                    <p className="text-gray-500">This is a preview of schema definitions.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="examples" className="m-0 p-0">
                {viewTab === 'visual' && Object.keys(getExamples()).length > 0 ? (
                  <div className="p-4">
                    {/* Example selector dropdown */}
                    <div className="border rounded-md mb-4 overflow-hidden">
                      <div className="bg-white shadow-sm">
                        <select 
                          className="w-full p-2 outline-none focus:ring-0 border-none cursor-pointer"
                          value={selectedExample}
                          onChange={(e) => setSelectedExample(e.target.value)}
                        >
                          {Object.keys(getExamples()).map(exampleKey => (
                            <option key={exampleKey} value={exampleKey}>
                              {exampleKey}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Selected example content */}
                      <div className="p-0">
                        <SyntaxHighlighter
                          language="json"
                          style={xonokai}
                          customStyle={{
                            margin: 0,
                            borderRadius: '0 0 0.375rem 0.375rem',
                          }}
                        >
                          {JSON.stringify(getExamples()[selectedExample] || {}, null, 2)}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                    
                    {/* Example metadata and description */}
                    <div className="mt-4 p-4 border rounded-md bg-gray-50">
                      <h3 className="text-lg font-medium mb-2">Example Details</h3>
                      <p className="text-sm text-gray-600">
                        This example demonstrates valid data conforming to the {modelTitle} schema.
                      </p>
                    </div>
                  </div>
                ) : viewTab === 'visual' ? (
                  <div className="p-4 text-gray-500">
                    No examples found in this schema.
                  </div>
                ) : viewTab === 'code' ? (
                  <div className="relative bg-gray-50 p-4">
                    <SyntaxHighlighter
                      language="json"
                      style={xonokai}
                      customStyle={{
                        margin: 0,
                        borderRadius: '0.375rem',
                      }}
                    >
                      {JSON.stringify(getExamples(), null, 2) || '{}'}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <div className="p-4">
                    <h2 className="text-xl font-bold mb-4">Examples Preview</h2>
                    <p className="text-gray-500">This is a preview of schema examples.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="extensions" className="m-0 p-4">
                <p>Schema extensions will appear here.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
   
    
    {/* JSON to Schema Dialog */}
    <Dialog open={showJsonDialog} onOpenChange={setShowJsonDialog}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Generate a Model from JSON</DialogTitle>
          <DialogDescription>
            Paste your JSON example, and we will generate a model from it.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="border rounded-md">
            <SyntaxHighlighter
              language="json"
              style={xonokai}
              customStyle={{
                margin: 0,
                borderRadius: '0.375rem',
                minHeight: '300px',
              }}
              contentEditable={true}
              onInput={(e: React.FormEvent<HTMLElement>) => {
                if (e.currentTarget.textContent) {
                  setJsonInput(e.currentTarget.textContent);
                }
              }}
            >
              {jsonInput}
            </SyntaxHighlighter>
          </div>
          
          {jsonError && (
            <div className="mt-2 text-red-500 text-sm">
              {jsonError}
            </div>
          )}
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

interface SchemaVisualTreeProps {
  schema: JSONSchema;
}

const SchemaVisualTree: React.FC<SchemaVisualTreeProps> = ({ schema }) => {
  // Count properties to show in the object title
  const countProperties = (obj: JSONSchema): number => {
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
      {schema.properties && Object.entries(schema.properties).map(([propName, propSchema], index) => (
        <SchemaPropertyRow 
          key={propName} 
          name={propName} 
          schema={propSchema} 
          required={schema.required?.includes(propName)}
          isLast={index === (schema.properties ? Object.keys(schema.properties).length - 1 : 0)}
        />
      ))}
    </div>
  );
};

interface SchemaPropertyRowProps {
  name: string;
  schema: JSONSchema;
  required?: boolean;
  level?: number;
  isLast?: boolean;
}

const SchemaPropertyRow: React.FC<SchemaPropertyRowProps> = ({ 
  name, 
  schema, 
  required = false, 
  level = 0,
  isLast = false
}) => {
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
          <span className="text-gray-500 ml-1">({(schema.enum as any[]).length})</span>
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
            Object.entries(schema.properties).map(([propName, propSchema], index) => (
              <SchemaPropertyRow 
                key={propName}
                name={propName}
                schema={propSchema}
                required={schema.required?.includes(propName)}
                level={level + 1}
                isLast={index === (schema.properties ? Object.keys(schema.properties).length - 1 : 0)}
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
                  {Object.entries(schema.items.properties).map(([propName, propSchema], index) => (
                    <SchemaPropertyRow 
                      key={propName}
                      name={propName}
                      schema={propSchema}
                      required={schema.items?.required?.includes(propName)}
                      level={level + 1}
                      isLast={index === (schema.items?.properties ? Object.keys(schema.items.properties).length - 1 : 0)}
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
            {(schema.enum as any[]).map((value, index) => (
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