"use client";
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  Code,
  Eye,
  Save,
  Download,
  AlertCircle,
  Copy,
  Search,
  ArrowLeft,
  BookOpen,
  BookOpen as BookOpenIcon,
  ShieldCheck,
  BadgePercent,
  Activity,
  Binoculars
} from 'lucide-react';
import * as yaml from 'js-yaml';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { xonokai } from 'react-syntax-highlighter/dist/esm/styles/prism';


const MarkdownRenderer: React.FC<{ children: string }> = ({ children }) => (
  <ReactMarkdown>{children}</ReactMarkdown>
);

export const APIDesignEditor = () => {
  const [activeView, setActiveView] = useState<'code' | 'visual'>('visual');
  const [specContent, setSpecContent] = useState<string>('');
  const [parsedSpec, setParsedSpec] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fileName, setFileName] = useState<string>('api-specification.yaml');

  // Load demo OpenAPI spec from file
  const loadDemoSpec = async () => {
    try {
      setIsLoading(true);
      // First, try to load the YAML file from public directory
      try {
        const response = await fetch('/data/open-api-demo.yaml');
        
        if (response.ok) {
          const content = await response.text();
          setSpecContent(content);
          
          // Parse the loaded content
          const parsed = yaml.load(content);
          setParsedSpec(parsed);
          setError(null);
          setIsLoading(false);
          return; // Exit early if successful
        } else {
          console.warn(`Failed to load specification: ${response.status} ${response.statusText}`);
        }
      } catch (fetchErr) {
        console.error('Error fetching OpenAPI spec file:', fetchErr);
      }
      
      // Fallback spec if file can't be loaded
      const fallbackSpec = `openapi: 3.0.3
info:
  title: API Specification
  version: 1.0.0
  description: A sample API specification
paths:
  /resources:
    get:
      summary: Get resources
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Resource'
    post:
      summary: Create a resource
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ResourceInput'
      responses:
        '201':
          description: Resource created
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
    ResourceInput:
      type: object
      properties:
        name:
          type: string
      required:
        - name
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer`;
          
      setSpecContent(fallbackSpec);
      try {
        const parsed = yaml.load(fallbackSpec);
        setParsedSpec(parsed);
        setError(null);
      } catch (parseErr) {
        setError('Error parsing specification');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load the demo spec initially
    loadDemoSpec();
  }, []);

  const handleSpecChange = (newContent: string) => {
    setSpecContent(newContent);
    try {
      const parsed = yaml.load(newContent);
      setParsedSpec(parsed);
      setError(null);
    } catch (err) {
      setError('Error parsing YAML: ' + (err as Error).message);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Update file name and set loading state
    setFileName(file.name);
    setIsLoading(true);

    // Show file information in console to help debug
    console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        // Log first 100 characters to help debug content
        console.log(`File content preview: ${content.substring(0, 100)}...`);
        
        // Update the spec content in the textarea
        setSpecContent(content);
        
        // Parse the content based on file type
        let parsed;
        if (file.name.endsWith('.json')) {
          parsed = JSON.parse(content);
        } else {
          // Assume YAML for .yaml, .yml or any other extension
          parsed = yaml.load(content);
        }
        
        // Update the parsed spec for the visual view
        setParsedSpec(parsed);
        setError(null);
        
        // Switch to 'code' view to show the uploaded content
        setActiveView('code');
        
        // Notify user
        alert(`Successfully loaded specification from ${file.name}`);
      } catch (err) {
        console.error('Error processing file:', err);
        setError('Error parsing uploaded file: ' + (err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.onerror = (event) => {
      console.error('FileReader error:', event);
      setError('Error reading file');
      setIsLoading(false);
    };
    
    // Start reading the file as text
    reader.readAsText(file);
    
    // Reset the input value to allow uploading the same file again
    event.target.value = '';
  };

  const downloadSpec = () => {
    const blob = new Blob([specContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(specContent)
      .then(() => {
        // Could add a toast notification here
        console.log('Copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  const renderPaths = () => {
    if (!parsedSpec?.paths) return <p>No paths defined</p>;

    const renderParameters = (parameters: any[]) => {
      if (!parameters || parameters.length === 0) return null;
      
      return (
        <div className="mt-3">
          <h4 className="text-sm font-medium mb-2">Parameters</h4>
          <div className="bg-gray-50 p-2 rounded-md">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-1">Name</th>
                  <th className="text-left p-1">Location</th>
                  <th className="text-left p-1">Type</th>
                  <th className="text-left p-1">Required</th>
                  <th className="text-left p-1">Description</th>
                </tr>
              </thead>
              <tbody>
                {parameters.map((param, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="p-1 font-medium">{param.name}</td>
                    <td className="p-1">{param.in}</td>
                    <td className="p-1">{param.schema?.type || 'any'}</td>
                    <td className="p-1">{param.required ? 'Yes' : 'No'}</td>
                    <td className="p-1">{param.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    };

    const renderRequestBody = (requestBody: any) => {
      if (!requestBody) return null;
      
      return (
        <div className="mt-3">
          <h4 className="text-sm font-medium mb-2">Request Body</h4>
          <div className="bg-gray-50 p-3 rounded-md">
            {requestBody.description && (
               <div className="text-xs text-gray-600 mb-2">
               <MarkdownRenderer>{requestBody.description}</MarkdownRenderer>
             </div>
            )}
            {requestBody.required && (
              <p className="text-xs text-red-600 mb-2">Required</p>
            )}
            {requestBody.content && Object.entries(requestBody.content).map(([contentType, contentTypeObj]: [string, any]) => (
              <div key={contentType} className="mb-2">
                <span className="text-xs font-medium">Content Type: </span>
                <span className="text-xs bg-gray-200 px-1 py-0.5 rounded">{contentType}</span>
                
                {contentTypeObj.schema && (
                  <div className="mt-2 text-xs">
                    <span className="font-medium">Schema: </span>
                    {contentTypeObj.schema.$ref ? (
                      <span className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                        {contentTypeObj.schema.$ref.split('/').pop()}
                      </span>
                    ) : (
                      <span>
                        {contentTypeObj.schema.type}
                        {contentTypeObj.schema.format && ` (${contentTypeObj.schema.format})`}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    };

    const renderResponses = (responses: any) => {
      if (!responses) return null;
      
      return (
        <div className="mt-3">
          <h4 className="text-sm font-medium mb-2">Responses</h4>
          <div className="space-y-2">
            {Object.entries(responses).map(([code, response]: [string, any]) => (
              <div key={code} className="bg-gray-50 p-2 rounded-md">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                    code.startsWith('2') ? 'bg-green-100 text-green-800' :
                    code.startsWith('4') ? 'bg-yellow-100 text-yellow-800' :
                    code.startsWith('5') ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {code}
                  </span>
                  <div className="text-xs text-gray-600 mb-2">
                    <MarkdownRenderer>{response.description}</MarkdownRenderer>
                  </div>
                </div>
                
                {response.content && Object.entries(response.content).map(([contentType, contentTypeObj]: [string, any]) => (
                  <div key={contentType} className="pl-2 mt-1 text-xs">
                    <span className="text-xs font-medium">Content Type: </span>
                    <span className="text-xs bg-gray-200 px-1 py-0.5 rounded">{contentType}</span>
                    
                    {contentTypeObj.schema && (
                      <div className="mt-1 ml-2 text-xs">
                        <span className="font-medium">Schema: </span>
                        {contentTypeObj.schema.$ref ? (
                          <span className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                            {contentTypeObj.schema.$ref.split('/').pop()}
                          </span>
                        ) : contentTypeObj.schema.items && contentTypeObj.schema.items.$ref ? (
                          <span>
                            Array of <span className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                              {contentTypeObj.schema.items.$ref.split('/').pop()}
                            </span>
                          </span>
                        ) : (
                          <span>
                            {contentTypeObj.schema.type}
                            {contentTypeObj.schema.format && ` (${contentTypeObj.schema.format})`}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-4">
        {Object.entries(parsedSpec.paths).map(([path, methods]: [string, any]) => (
          <Card key={path}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-teal-600">{path}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(methods).map(([method, details]: [string, any]) => (
                  <div key={`${path}-${method}`} className="p-3 border rounded-md">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${
                        method === 'get' ? 'bg-blue-100 text-blue-800' :
                        method === 'post' ? 'bg-green-100 text-green-800' :
                        method === 'put' ? 'bg-yellow-100 text-yellow-800' :
                        method === 'delete' ? 'bg-red-100 text-red-800' :
                        method === 'patch' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {method}
                      </span>
                      <span className="font-medium">{details.summary || 'No summary'}</span>
                    </div>
                    

                    {details.description && (
                      <div className="text-xs text-gray-600 mb-2">
                        <MarkdownRenderer>{details.description}</MarkdownRenderer>
                      </div>
                    )}
                    
                    {/* For GET operations, show parameters and responses */}
                    {method.toLowerCase() === 'get' && (
                      <>
                        {renderParameters(details.parameters)}
                        {renderResponses(details.responses)}
                      </>
                    )}
                    
                    {/* For POST, PUT, PATCH, DELETE operations show request body and responses */}
                    {['post', 'put', 'patch', 'delete'].includes(method.toLowerCase()) && (
                      <>
                        {renderParameters(details.parameters)}
                        {renderRequestBody(details.requestBody)}
                        {renderResponses(details.responses)}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };


  const renderSchemas = () => {
    if (!parsedSpec?.components?.schemas) return <p>No schemas defined</p>;

    return (
      <div className="space-y-4">
        {Object.entries(parsedSpec.components.schemas).map(([name, schema]: [string, any]) => (
          <Card key={name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-teal-600">{name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {schema.type === 'object' && (
                  <div className="space-y-2">
                    <div className="font-medium">Properties:</div>
                    {schema.properties && Object.entries(schema.properties).map(([propName, propDetails]: [string, any]) => (
                      <div key={propName} className="ml-4 p-1 border-l-2 border-gray-200">
                        <span className="font-medium">{propName}</span>
                        <span className="text-gray-600 ml-2">
                          {propDetails.type}
                          {propDetails.format && ` (${propDetails.format})`}
                        </span>
                        {propDetails.description && (
                          <p className="text-xs text-gray-500">{propDetails.description}</p>
                        )}
                      </div>
                    ))}
                    {schema.required && schema.required.length > 0 && (
                      <div>
                        <span className="font-medium">Required:</span>
                        <span className="ml-2">{schema.required.join(', ')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto p-2 md:p-8 lg:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold text-teal-600">
              {parsedSpec?.info?.title || 'API Specification'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => window.location.href = '/learn/openapi-cheatsheet'}
            >
              <BookOpenIcon className="h-4 w-4" />
              <span>OpenAPI Cheatsheet</span>
            </Button>
            <Button
              onClick={downloadSpec}
              variant="outline"
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </Button>
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="flex items-center gap-1"
            >
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </Button>
          </div>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center mr-4">
              <div className="mr-1 text-sm font-medium">Spec:</div>
              <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {parsedSpec?.openapi || 'OpenAPI 3.0.3'}
              </div>
            </div>
            <div className="flex items-center">
              <div className="mr-1 text-sm font-medium">Version:</div>
              <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {parsedSpec?.info?.version || '1.0.0'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".yaml,.yml,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="px-4 py-2 bg-gray-100 text-black rounded-md flex items-center gap-2 hover:bg-primary/40 transition-colors cursor-pointer">
                <FileText className="w-4 h-4" />
                <span>Upload Spec</span>
              </div>
            </label>
            <div className="px-4 py-2 bg-gray-100 text-black rounded-md flex items-center gap-2 hover:bg-primary/40 transition-colors cursor-pointer">
                <ShieldCheck className="w-4 h-4" />
                <span>Validate</span>
            </div>
            <div className="px-4 py-2 bg-gray-100 text-black rounded-md flex items-center gap-2 hover:bg-primary/40 transition-colors cursor-pointer">
                <BadgePercent className="w-4 h-4" />
                <span>Map to Model</span>
            </div>
            <div className="px-4 py-2 bg-gray-100 text-black rounded-md flex items-center gap-2 hover:bg-primary/40 transition-colors cursor-pointer">
                <Activity className="w-4 h-4" />
                <span>Bundle</span>
            </div>
            <a href="/pages/design/api-visualizer" className="no-underline">
              <div className="px-4 py-2 bg-gray-100 text-black rounded-md flex items-center gap-2 hover:bg-primary/40 transition-colors cursor-pointer">
                <Binoculars className="w-4 h-4" />
                <span>Preview</span>
              </div>
            </a>
            <div className="flex p-0.5 bg-gray-100 rounded-md">
              <Button
                variant={activeView === 'visual' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('visual')}
                className="flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                <span>Visual</span>
              </Button>
              <Button
                variant={activeView === 'code' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('code')}
                className="flex items-center gap-1"
              >
                <Code className="h-4 w-4" />
                <span>Code</span>
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : activeView === 'code' ? (
          <Card>
            <CardContent className="pt-6"> 
            <div className="w-full h-[70vh] font-mono text-sm border rounded focus-within:ring-2 focus-within:ring-teal-500 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-full overflow-auto" style={{ backgroundColor: '#1e1e1e' }}>
                <SyntaxHighlighter
                  language="yaml"
                  style={xonokai}
                  customStyle={{
                    margin: 0,
                    padding: '16px',
                    minHeight: '100%',
                    width: '100%',
                    backgroundColor: '#1e1e1e',
                    overflow: 'visible'
                  }}
                  wrapLines={true}
                  lineProps={{ style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' } }}
                >
                  {specContent}
                </SyntaxHighlighter>
                <textarea
                  value={specContent}
                  onChange={(e) => handleSpecChange(e.target.value)}
                  className="absolute top-0 left-0 w-full h-full font-mono text-sm p-4 border-none resize-none focus:outline-none z-10"
                  spellCheck="false"
                  style={{
                    color: 'transparent',
                    caretColor: 'white',
                    backgroundColor: 'transparent',
                    overflow: 'auto'
                  }}
                />
              </div>
            </div>

            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="paths" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="paths">Paths</TabsTrigger>
              <TabsTrigger value="schemas">Schemas</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="parameters">Parameters</TabsTrigger>
              {parsedSpec?.webhooks && <TabsTrigger value="webhooks">Webhooks</TabsTrigger>}
            </TabsList>

            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-teal-600">Title</CardTitle>
                  <CardDescription className="p-2 border rounded text-sm text-gray-600">{parsedSpec?.info?.title || 'No title defined'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="font-medium text-teal-600">Description</div>
                      <div className="p-2 border rounded text-sm text-gray-600"><MarkdownRenderer>{parsedSpec?.info?.description || 'No description defined'}</MarkdownRenderer></div>
                    </div>
                    <div>
                      <div className="font-medium text-teal-600">Version</div>
                      <div className="mb-8 flex items-center justify-between">
                        <div className="p-2 border rounded text-sm text-gray-600">{parsedSpec?.info?.version || 'No version defined'}</div>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-teal-600">Tags</div>
                      <div className="space-x-2 mb-8 flex items-left">
                        {parsedSpec?.tags?.map((tag: any, index: number) => (
                              <div key={index} className="flex p-4 border rounded">
                                <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">{tag.name}</div>
                                {tag.description && <div className="text-sm text-gray-600">{tag.description}
                              </div>}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-teal-600">Servers</div>
                      <div className="space-y-2 mt-2">
                        {parsedSpec?.servers?.map((server: any, index: number) => (
                          <div key={index} className="bg-gray-100 p-2 border rounded">
                            <div className="font-medium text-green-800">{server.url}</div>
                            {server.description && <div className="text-sm text-green-800">{server.description}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="paths">
              {renderPaths()}
            </TabsContent>

            <TabsContent value="schemas">
              {renderSchemas()}
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-teal-600">Security Schemes</CardTitle>
                  <CardDescription>Authentication and authorization methods</CardDescription>
                </CardHeader>
                <CardContent>
                  {parsedSpec?.components?.securitySchemes ? (
                    <div className="space-y-4">
                      {Object.entries(parsedSpec.components.securitySchemes).map(([name, scheme]: [string, any]) => (
                        <div key={name} className="p-4 border rounded">
                          <div className="font-medium text-lg text-teal-600">{name}</div>
                          <div className="mt-2 space-y-2">
                            <div>
                              <span className="font-medium">Type:</span>
                              <span className="ml-2">{scheme.type}</span>
                            </div>
                            {scheme.scheme && (
                              <div>
                                <span className="font-medium">Scheme:</span>
                                <span className="ml-2">{scheme.scheme}</span>
                              </div>
                            )}
                            {scheme.bearerFormat && (
                              <div>
                                <span className="font-medium">Bearer Format:</span>
                                <span className="ml-2">{scheme.bearerFormat}</span>
                              </div>
                            )}
                            {scheme.description && (
                              <div>
                                <span className="font-medium">Description:</span>
                                <span className="ml-2">{scheme.description}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No security schemes defined</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="parameters">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-teal-600">Reusable Parameters</CardTitle>
                  <CardDescription>Reusable path, query, header and cookie parameters</CardDescription>
                </CardHeader>
                <CardContent>
                  {parsedSpec?.components?.parameters ? (
                    <div className="space-y-4">
                      {Object.entries(parsedSpec.components.parameters).map(([name, parameter]: [string, any]) => (
                        <div key={name} className="p-4 border rounded">
                          <div className="font-medium text-lg text-teal-600">{name}</div>
                          <div className="mt-2 space-y-2">
                            <div>
                              <span className="font-medium">In:</span>
                              <span className="ml-2">{parameter.in}</span>
                            </div>
                            {parameter.description && (
                              <div>
                                <span className="font-medium">Description:</span>
                                <div className="p-2 border rounded text-sm text-gray-600">{parameter.description }</div>
                              </div>
                            )}
                            {parameter.required && (
                              <div>
                                <span className="font-medium">Required:</span>
                                <span className="ml-2">true</span>
                              </div>
                            )}
                            {parameter.schema && (
                              <div>
                                <span className="font-medium">Schema:</span>
                                <div className="p-2 border rounded text-sm text-gray-600">{JSON.stringify(parameter.schema, null, 2)}</div>
                              </div>
                            )}
                            {parameter.example && (
                              <div>
                                <span className="font-medium">Sample:</span>
                                <span className="ml-2">{JSON.stringify(parameter.example, null, 2)}</span>
                              </div>
                            )}
                            {parameter.examples && (
                              <div>
                                <span className="font-medium">Examples:</span>
                                <span className="ml-2">{JSON.stringify(parameter.examples, null, 2)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No Reusable Parameters defined</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {parsedSpec?.webhooks && (
              <TabsContent value="webhooks">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl text-teal-600">Webhooks</CardTitle>
                    <CardDescription>API callback definitions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(parsedSpec.webhooks).map(([name, webhook]: [string, any]) => (
                        <div key={name} className="p-4 border rounded">
                          <div className="font-medium text-lg">{name}</div>
                          <div className="mt-2 space-y-2">
                            {Object.entries(webhook).map(([method, details]: [string, any]) => (
                              <div key={`${name}-${method}`} className="p-2 border rounded-md">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${
                                    method === 'get' ? 'bg-blue-100 text-blue-800' :
                                    method === 'post' ? 'bg-green-100 text-green-800' :
                                    method === 'put' ? 'bg-yellow-100 text-yellow-800' :
                                    method === 'delete' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {method}
                                  </span>
                                  <span className="font-medium">{details.summary || 'No summary'}</span>
                                </div>
                                {details.description && (
                                  <p className="text-sm text-gray-600 mt-1">{details.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default APIDesignEditor;