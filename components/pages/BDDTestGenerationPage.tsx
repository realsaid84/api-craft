'use client';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  Code, 
  Play, 
  FileCog,
  FileText, 
  FileCheck,
  Download,
  Trash,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  AlignLeft,
  Info,
  ArrowLeft
} from 'lucide-react';
import * as yaml from 'js-yaml';
import { generateBddFeatures } from './test-generator/Generator';
import { SpecEditor } from './test-generator/SpecEditor';
import { FeaturePreview } from './test-generator/FeaturePreview';
import { TestRunner } from './test-generator/TestRunner';
import { SettingsPanel } from './test-generator/SettingsPanel';
import { validateOpenApiSpec } from './test-generator/Validator';
import { ExportOptions } from './test-generator/ExportOptions';

// Define proper types for our data structures
interface Scenario {
  // Add any specific properties needed
  name: string;
}

interface Feature {
  name: string;
  scenarios: Scenario[];
  // Add any other properties needed
}

interface ValidationError {
  path: string;
  message: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface TestResultDetail {
  name: string;
  passed: boolean;
  duration: number;
  errors: string[];
}

interface TestResult {
  total: number;
  passed: number;
  failed: number;
  details: TestResultDetail[];
}

interface GenerationSettings {
  includeBackgroundSection: boolean;
  includeExamples: boolean;
  generateAssertions: boolean;
  testDepth: 'basic' | 'medium' | 'comprehensive';
  outputFormat: 'gherkin' | 'arazzo';
  includeValidation: boolean;
  targetEnvironment: string;
}

export default function BDDTestGenerationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('editor');
  const [specContent, setSpecContent] = useState('');
  const [generatedFeatures, setGeneratedFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [generationSettings, setGenerationSettings] = useState<GenerationSettings>({
    includeBackgroundSection: true,
    includeExamples: true,
    generateAssertions: true,
    testDepth: 'medium', // 'basic', 'medium', 'comprehensive'
    outputFormat: 'gherkin', // 'gherkin', 'arazzo'
    includeValidation: true,
    targetEnvironment: 'dev'
  });
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    try {
      setIsLoading(true);
      setError(null);
      const content = await file.text();
      
      // Determine if it's JSON or YAML and parse accordingly
      let spec;
      if (file.name.endsWith('.json')) {
        spec = JSON.parse(content);
      } else {
        spec = yaml.load(content);
      }
      
      // Validate the OpenAPI spec
      if (!spec.openapi) {
        throw new Error('Not a valid OpenAPI specification');
      }
      
      // Set the spec content for the editor
      setSpecContent(content);
      setActiveTab('editor');
    } catch (error) {
      console.error('Error parsing file:', error);
      setError(`Failed to parse file: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
      // Reset file input to allow uploading the same file again
      e.target.value = '';
    }
  };

  const handleValidateSpec = async () => {
    try {
      setIsValidating(true);
      setValidationResult(null);
      setError(null);
      
      // Parse the content
      let spec;
      try {
        // Try to parse as JSON first
        spec = JSON.parse(specContent);
      } catch (jsonError) {
        // If that fails, try as YAML
        try {
          spec = yaml.load(specContent);
        } catch (yamlError) {
          throw new Error('Could not parse as JSON or YAML');
        }
      }
      
      // Validate the spec
      const result = await validateOpenApiSpec(spec);
      setValidationResult(result);
      
      if (result.errors.length > 0) {
        setError(`OpenAPI spec validation failed with ${result.errors.length} errors`);
      }
    } catch (error) {
      console.error('Validation error:', error);
      setError(`Validation failed: ${(error as Error).message}`);
    } finally {
      setIsValidating(false);
    }
  };

  const handleGenerateTests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Parse the content
      let spec;
      try {
        // Try to parse as JSON first
        spec = JSON.parse(specContent);
      } catch (jsonError) {
        // If that fails, try as YAML
        try {
          spec = yaml.load(specContent);
        } catch (yamlError) {
          throw new Error('Could not parse as JSON or YAML');
        }
      }
      
      // Generate BDD features
      const features = await generateBddFeatures(spec, generationSettings);
      setGeneratedFeatures(features);
      
      // Switch to preview tab
      setActiveTab('preview');
    } catch (error) {
      console.error('Generation error:', error);
      setError(`Failed to generate tests: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunTests = async () => {
    try {
      setIsRunningTest(true);
      setError(null);
      
      // Simulate running tests with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock test results - in a real implementation, this would use a test runner
      const mockResults: TestResult = {
        total: generatedFeatures.length * 3, // Assuming 3 scenarios per feature on average
        passed: Math.floor((generatedFeatures.length * 3) * 0.8), // 80% pass rate for demo
        failed: Math.floor((generatedFeatures.length * 3) * 0.2), // 20% fail rate for demo
        details: generatedFeatures.map(feature => ({
          name: feature.name,
          passed: Math.random() > 0.2, // 80% chance to pass for demo
          duration: Math.floor(Math.random() * 1000) + 100, // Random duration between 100-1100ms
          errors: Math.random() > 0.8 ? ['Connection timeout', 'Expected 200 but got 404'] : []
        }))
      };
      
      setTestResults(mockResults);
      setActiveTab('runner');
    } catch (error) {
      console.error('Test execution error:', error);
      setError(`Failed to run tests: ${(error as Error).message}`);
    } finally {
      setIsRunningTest(false);
    }
  };

  const handleExport = () => {
    setShowExportOptions(true);
  };

  const handleClearAll = () => {
    setSpecContent('');
    setGeneratedFeatures([]);
    setValidationResult(null);
    setError(null);
    setTestResults(null);
  };

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
            <h1 className="text-3xl font-bold text-teal-600">BDD Test Generator</h1>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleValidateSpec}
              disabled={!specContent || isValidating}
              variant="outline"
              className="flex items-center gap-1"
            >
              {isValidating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <FileCheck className="h-4 w-4" />
              )}
              <span>Validate</span>
            </Button>
            <Button
              onClick={handleGenerateTests}
              disabled={!specContent || isLoading}
              className="bg-teal-600 hover:bg-teal-700 flex items-center gap-1"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span>Generate Tests</span>
            </Button>
          </div>
        </div>

        {/* File Upload Area & Action Buttons */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="col-span-2">
            <CardContent className="p-4 flex justify-between items-center">
              <div className="flex gap-4">
                <Button 
                  onClick={handleUploadClick} 
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload OpenAPI Spec</span>
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.yaml,.yml"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={handleClearAll}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <Trash className="h-4 w-4" />
                  <span>Clear All</span>
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleRunTests}
                  disabled={generatedFeatures.length === 0 || isRunningTest}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1"
                >
                  {isRunningTest ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  <span>Run Tests</span>
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={generatedFeatures.length === 0}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col justify-center items-center">
              <div className="text-center">
                <h3 className="font-medium mb-2">Test Outputs</h3>
                <div className="flex gap-4 justify-center">
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-bold text-teal-600">{generatedFeatures.length}</div>
                    <div className="text-xs text-gray-500">Features</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      {generatedFeatures.reduce((total, feature) => total + feature.scenarios.length, 0)}
                    </div>
                    <div className="text-xs text-gray-500">Scenarios</div>
                  </div>
                  {testResults && (
                    <>
                      <div className="flex flex-col items-center">
                        <div className="text-2xl font-bold text-green-600">{testResults.passed}</div>
                        <div className="text-xs text-gray-500">Passed</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="text-2xl font-bold text-red-600">{testResults.failed}</div>
                        <div className="text-xs text-gray-500">Failed</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Validation Results */}
        {validationResult && (
          <div className="mb-4">
            <Alert variant={validationResult.errors.length > 0 ? "destructive" : "default"} className="mb-2">
              {validationResult.errors.length > 0 ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4 text-teal-600" />
              )}
              <AlertDescription>
                {validationResult.errors.length > 0 
                  ? `${validationResult.errors.length} validation issues found`
                  : 'OpenAPI specification is valid'
                }
              </AlertDescription>
            </Alert>
            
            {validationResult.errors.length > 0 && (
              <div className="bg-gray-50 rounded-md p-4 overflow-auto max-h-40">
                <ul className="space-y-1">
                  {validationResult.errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-600">
                      • {error.path ? `${error.path}: ` : ''}{error.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="editor" className="flex items-center gap-1">
              <Code className="h-4 w-4" />
              <span>API Spec</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <FileCog className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-1">
              <AlignLeft className="h-4 w-4" />
              <span>Feature Preview</span>
            </TabsTrigger>
            <TabsTrigger value="runner" className="flex items-center gap-1">
              <Play className="h-4 w-4" />
              <span>Test Runner</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor">
            <Card>
              <CardHeader>
                <CardTitle>OpenAPI Specification</CardTitle>
                <CardDescription>
                  Edit or paste your OpenAPI 3.0/3.1 specification here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SpecEditor 
                  value={specContent} 
                  onChange={setSpecContent} 
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <SettingsPanel 
              settings={generationSettings}
              onChange={setGenerationSettings}
            />
          </TabsContent>
          
          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Generated BDD Features</CardTitle>
                <CardDescription>
                  Preview of the generated BDD test features
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedFeatures.length > 0 ? (
                  <FeaturePreview 
                    features={generatedFeatures} 
                    format={generationSettings.outputFormat}
                  />
                ) : (
                  <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                    <Info className="h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-lg mb-2">No features generated yet</p>
                    <p>
                      Click the "Generate Tests" button to create BDD features from your OpenAPI specification
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="runner">
            <TestRunner 
              features={generatedFeatures}
              testResults={testResults}
              onRun={handleRunTests}
              isRunning={isRunningTest}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Export Dialog */}
      {showExportOptions && (
        <ExportOptions
          features={generatedFeatures}
          format={generationSettings.outputFormat}
          onClose={() => setShowExportOptions(false)}
        />
      )}
    </div>
  );
}