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
import { RedocStandalone } from 'redoc'


export const APIVisualizer = () => {
  const [activeView, setActiveView] = useState<'visual' | 'code'>('code');
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
            <div className="px-4 py-2 bg-gray-100 text-black rounded-md flex items-center gap-2 hover:bg-primary/40 transition-colors cursor-pointer">
                <Binoculars className="w-4 h-4" />
                <span>Preview</span>
            </div>
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
              <TabsTrigger value="api">API</TabsTrigger>
            </TabsList>

            <TabsContent value="api">
                  {parsedSpec && (
                    <div className="h-[1000vh] border rounded overflow-hidden">
                    <RedocStandalone 
                      spec={parsedSpec}
                      options={{
                        nativeScrollbars: true,
                        hideDownloadButton: true,
                        theme: { colors: { primary: { main: '#0f766e' } } } // Match your teal color
                      }}
                    />
                    </div>
                  )}
            </TabsContent>

          </Tabs>
        )}
      </div>
    </div>
  );
};

export default APIVisualizer;