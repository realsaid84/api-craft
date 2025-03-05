"use client";
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Code,
  Eye,
  Download,
  AlertCircle,
  Copy,
  ArrowLeft,
  BookOpen,
  ShieldCheck,
  BadgePercent,
  Activity,
  Loader2,
  AlertTriangle,
  Upload,
} from 'lucide-react';
import * as yaml from 'js-yaml';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { xonokai } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { RedocStandalone } from 'redoc';
import { useRouter } from 'next/navigation';

interface APIVisualizerProps {
  schemaData?: any;  // Can be a string (YAML/JSON) or parsed object
  isLoading?: boolean;
  error?: string | null;
  modelName?: string;
  title?: string;
  schemaUrl?: string;
}

export const APIVisualizer: React.FC<APIVisualizerProps> = ({ 
  schemaData,
  isLoading: externalLoading = false,
  error: externalError = null,
  modelName,
  title = "API Specification",
  schemaUrl
}: APIVisualizerProps) => {
  const router = useRouter();
  const [activeView, setActiveView] = useState<'visual' | 'code'>('visual');
  const [specContent, setSpecContent] = useState<string>('');
  const [warningCount] = useState(1);
  const [parsedSpec, setParsedSpec] = useState<any>(null);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [internalLoading, setInternalLoading] = useState<boolean>(false);

  // Combine external and internal state
  const isLoading = externalLoading || internalLoading;
  const error = externalError || internalError;

  // Process the schema data when it changes
  useEffect(() => {
    if (!schemaData) return;
    
    try {
      setInternalLoading(true);
      
      // If schemaData is a string, we need to parse it
      if (typeof schemaData === 'string') {
        setSpecContent(schemaData);
        
        // Try to parse as JSON first
        try {
          const parsed = JSON.parse(schemaData);
          setParsedSpec(parsed);
        } catch (jsonError) {
          // If JSON parsing fails, try YAML
          try {
            const parsed = yaml.load(schemaData);
            setParsedSpec(parsed);
          } catch (yamlError) {
            throw new Error('Failed to parse schema as JSON or YAML'+ (yamlError as Error).message +"-"+ (jsonError as Error).message);
          }
        }
      } 
      // If it's already an object, just use it
      else if (typeof schemaData === 'object') {
        setParsedSpec(schemaData);
        // Convert object to YAML for code view
        try {
          const yamlContent = yaml.dump(schemaData);
          setSpecContent(yamlContent);
        } catch (err) {
          console.error('Error converting schema to YAML:', err);
          setSpecContent(JSON.stringify(schemaData, null, 2));
        }
      }
      
      setInternalError(null);
    } catch (err) {
      console.error('Error processing schema data:', err);
      setInternalError(`Error processing schema: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setInternalLoading(false);
    }
  }, [schemaData]);

  const handleSpecChange = (newContent: string) => {
    setSpecContent(newContent);
    try {
      const parsed = yaml.load(newContent);
      setParsedSpec(parsed);
      setInternalError(null);
    } catch (err) {
      setInternalError('Error parsing YAML: ' + (err as Error).message);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // set loading state
    setInternalLoading(true);

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
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
        setInternalError(null);
        
        // Switch to 'visual' view to show content
        setActiveView('visual');
      } catch (err) {
        console.error('Error processing file:', err);
        setInternalError('Error parsing uploaded file: ' + (err as Error).message);
      } finally {
        setInternalLoading(false);
      }
    };
    
    reader.onerror = () => {
      setInternalError('Error reading file');
      setInternalLoading(false);
    };
    
    // Start reading the file as text
    reader.readAsText(file);
    
    // Reset the input value to allow uploading the same file again
    event.target.value = '';
  };

  const downloadSpec = () => {
    // Get a filename based on API title if possible
    const apiTitle = parsedSpec?.info?.title || 'api-specification';
    const safeFileName = apiTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '.yaml';
    
    const blob = new Blob([specContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = safeFileName;
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

// Handle Quality Metrics button click
const handleQualityMetricsClick = () => {
  try {
    console.log('Stored API spec for quality analysis in session storage');
    // Navigate to the quality page without the large query parameter
    router.push(`/pages/observe/api-quality?schemaUrl=${schemaUrl}`);
  } catch (error) {
    console.error('Error fushing API spec url:', error);
  }
};


  // Get the title from props or the parsed spec
  const displayTitle = modelName || parsedSpec?.info?.title || title;

  // Show loading state if still loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading API specification...</p>
        </div>
      </div>
    );
  }

  // If there's no data at all, show a minimal message
  if (!parsedSpec && !specContent) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold text-teal-600">No Specification Available</h1>
          </div>
          <Card>
            <CardContent className="py-10 text-center">
              <p>No API specification data is available to visualize.</p>
              <Button 
                className="mt-4"
                onClick={() => router.push('/pages/discover/api-contracts')}
              >
                Return to API Contracts
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
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold text-teal-600">
              {displayTitle}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => router.push('/learn/openapi-cheatsheet')}
            >
              <BookOpen className="h-4 w-4" />
              <span>OpenAPI Cheatsheet</span>
            </Button>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".yaml,.yml,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="px-4 py-2 bg-gray-100 text-black rounded-md flex items-center gap-2 hover:bg-primary/40 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Import Spec</span>
              </div>
            </label>
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
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
            >
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>{warningCount} Warning</span>
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
            <div className="px-4 py-2 bg-gray-100 text-black rounded-md flex items-center gap-2 hover:bg-primary/40 transition-colors cursor-pointer"
            onClick={handleQualityMetricsClick}>
                <Activity className="w-4 h-4" />
                <span>Quality Metrics</span>
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

        {activeView === 'visual' ? (
          <div className="mb-8 flex items-center justify-between">
              {parsedSpec && (
                <div className="h-[1000vh] border rounded overflow-hidden">
                  <RedocStandalone 
                    spec={parsedSpec}
                    options={{
                      nativeScrollbars: true,
                      hideDownloadButton: true,
                      theme: { colors: { primary: { main: '#0f766e' } } } // Match teal color
                    }}
                  />
                </div>
              )}
           </div>
        ): (
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
        ) }
      </div>
    </div>
  );
};

export default APIVisualizer;