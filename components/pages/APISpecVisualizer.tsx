import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
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
} from 'lucide-react';
import * as yaml from 'js-yaml';

// Interface for API Contract data
interface APIContractData {
  projectName: string;
  namespace: string;
  majorVersion: string;
  apiType: string;
  securityScheme: string;
  specLanguage: string;
  domain: string;
  enableWebhooks: boolean;
}

export const APISpecVisualizer = () => {
  const router = useRouter();
  const [activeView, setActiveView] = useState<'code' | 'visual'>('visual');
  const [specContent, setSpecContent] = useState<string>('');
  const [parsedSpec, setParsedSpec] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [contractData, setContractData] = useState<APIContractData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fileName, setFileName] = useState<string>('api-specification.yaml');

  // Load demo OpenAPI spec from file
  const loadDemoSpec = async () => {
    try {
      setIsLoading(true);
      // Using the Next.js public directory to fetch the YAML file
      const response = await fetch('/data/open-api-demo.yaml');
      if (!response.ok) {
        throw new Error(`Failed to load demo spec: ${response.status} ${response.statusText}`);
      }
      const content = await response.text();
      setSpecContent(content);
      
      // Parse the loaded content
      const parsed = yaml.load(content);
      setParsedSpec(parsed);
      setError(null);
    } catch (err) {
      console.error('Error loading demo spec:', err);
      
      // Fallback to a minimal OpenAPI spec if file can't be loaded
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
          description: Successful response`;
          
      setSpecContent(fallbackSpec);
      try {
        const parsed = yaml.load(fallbackSpec);
        setParsedSpec(parsed);
      } catch (parseErr) {
        setError('Error parsing fallback specification');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load the demo spec initially
    loadDemoSpec();
    
    // Check if we have contract data from navigation
    const query = router.query;
    if (query.projectName) {
      const newContractData: APIContractData = {
        projectName: query.projectName as string,
        namespace: query.namespace as string,
        majorVersion: query.majorVersion as string,
        apiType: query.apiType as string,
        securityScheme: query.securityScheme as string,
        specLanguage: query.specLanguage as string,
        domain: query.domain as string,
        enableWebhooks: query.enableWebhooks === 'true',
      };
      setContractData(newContractData);

      // Generate a new spec based on the contract data
      generateSpecFromContract(newContractData);
    }
  }, [router.query]);

  const generateSpecFromContract = async (data: APIContractData) => {
    setIsLoading(true);
    try {
      // First try to load the template based on API type
      let templateContent = '';
      try {
        // Attempt to load a template file based on API type
        const templatePath = `/data/templates/${data.apiType}-template.yaml`;
        const response = await fetch(templatePath);
        if (response.ok) {
          templateContent = await response.text();
        }
      } catch (err) {
        console.warn('Template not found, using default spec generation');
      }
      
      // If no template found, generate a basic spec
      if (!templateContent) {
        templateContent = `openapi: 3.0.3
info:
  title: ${data.projectName || 'API Specification'}
  version: ${data.majorVersion || 'v1'}
  description: ${data.projectName || 'API'} specification
servers:
  - url: https://api.example.com/${data.namespace || 'api'}/${data.majorVersion || 'v1'}
    description: Production server
${data.enableWebhooks ? `
webhooks:
  newItem:
    post:
      requestBody:
        description: Information about the new item
        content:
          application/json:
            schema:
              type: object
              properties:
                itemId:
                  type: string
      responses:
        '200':
          description: Webhook processed successfully` : ''}
paths:
  /${data.namespace || 'resources'}:
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
    ${data.securityScheme || 'BearerAuth'}:
      type: http
      scheme: bearer`;
      }

      setSpecContent(templateContent);
      setFileName(`${data.projectName || 'api'}-spec.yaml`);

      try {
        const parsed = yaml.load(templateContent);
        setParsedSpec(parsed);
        setError(null);
      } catch (err) {
        setError('Error parsing generated YAML: ' + (err as Error).message);
      }
    } finally {
      setIsLoading(false);
    }
  };

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

    setFileName(file.name);
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        setSpecContent(content);
        const parsed = yaml.load(content);
        setParsedSpec(parsed);
        setError(null);
      } catch (err) {
        setError('Error parsing uploaded file: ' + (err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Error reading file');
      setIsLoading(false);
    };
    reader.readAsText(file);
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

    return (
      <div className="space-y-4">
        {Object.entries(parsedSpec.paths).map(([path, methods]: [string, any]) => (
          <Card key={path}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-teal-600">{path}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(methods).map(([method, details]: [string, any]) => (
                  <div key={`${path}-${method}`} className="p-2 border rounded-md">
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
              onClick={() => router.push('/api-contracts')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold text-teal-600">
              {contractData?.projectName || parsedSpec?.info?.title || 'API Specification'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => router.push('/learn/openapi-cheatsheet')}
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
              <div className="px-4 py-2 bg-primary text-white rounded-md flex items-center gap-2 hover:bg-primary/90 transition-colors">
                <FileText className="w-4 h-4" />
                <span>Upload Spec</span>
              </div>
            </label>
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
              <textarea
                value={specContent}
                onChange={(e) => handleSpecChange(e.target.value)}
                className="w-full h-[70vh] font-mono text-sm p-4 bg-gray-50 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="paths" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="paths">Paths</TabsTrigger>
              <TabsTrigger value="schemas">Schemas</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              {parsedSpec?.webhooks && <TabsTrigger value="webhooks">Webhooks</TabsTrigger>}
            </TabsList>

            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-teal-600">API Information</CardTitle>
                  <CardDescription>Basic information about the API</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="font-medium">Title</div>
                      <div>{parsedSpec?.info?.title || 'No title defined'}</div>
                    </div>
                    <div>
                      <div className="font-medium">Description</div>
                      <div>{parsedSpec?.info?.description || 'No description defined'}</div>
                    </div>
                    <div>
                      <div className="font-medium">Version</div>
                      <div>{parsedSpec?.info?.version || 'No version defined'}</div>
                    </div>
                    <div>
                      <div className="font-medium">Servers</div>
                      <div className="space-y-2 mt-2">
                        {parsedSpec?.servers?.map((server: any, index: number) => (
                          <div key={index} className="p-2 border rounded">
                            <div className="font-medium">{server.url}</div>
                            {server.description && <div className="text-sm text-gray-600">{server.description}</div>}
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
                          <div className="font-medium text-lg">{name}</div>
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

export default APISpecVisualizer;