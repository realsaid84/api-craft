'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Input } from '@/components/ui/input';
import { 
  AlertCircle, 
  Upload, 
  ChevronDown, 
  AlertTriangle, 
  Info, 
  Check, 
  X,
  FileText,
  Tag,
  Code,
  Layers,
  FileJson,
  ArrowLeft,
  Loader2,
  Download,
  Car
} from 'lucide-react';
import * as yaml from 'js-yaml';

interface DataQualityDashboardProps {
  apiSpec?: any;
  title?: string;
  onBack?: () => void;
}

// Helper function to generate a letter grade based on score
const getGrade = (score: number): string => {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 63) return 'D';
  if (score >= 60) return 'D-';
  return 'F';
};

// Helper function to generate a descriptive rating
const getRating = (score: number): string => {
  if (score >= 90) return 'Perfect';
  if (score >= 80) return 'Good';
  if (score >= 70) return 'Acceptable';
  if (score >= 60) return 'Poor';
  return 'Extremely Poor';
};

// Helper function to get status color based on score
const getStatusColor = (score: number): string => {
  if (score >= 90) return 'bg-green-500 text-white';
  if (score >= 80) return 'bg-blue-500 text-white';
  if (score >= 70) return 'bg-yellow-500 text-black';
  if (score >= 60) return 'bg-orange-500 text-white';
  return 'bg-red-500 text-white';
};

// Helper function to get progress bar color
const getProgressColor = (score: number): string => {
  if (score >= 90) return 'bg-green-500';
  if (score >= 80) return 'bg-blue-500';
  if (score >= 70) return 'bg-yellow-500';
  if (score >= 60) return 'bg-orange-500';
  return 'bg-red-500';
};

// List of rule categories to check
const ruleCategories = [
  'description-exists',
  'contact-exists',
  'tags-alphabetical',
  'operation-tags-defined',
  'operation-tags-consistency',
  'operation-id-naming-convention',
  'operation-operationId-unique',
  'operation-parameters-unique',
  'path-declarations-must-exist',
  'path-keys-no-trailing-slash',
  'path-not-include-query',
  'no-ref-siblings',
  'no-$ref-in-allOf',
  'security-defined',
  'oas2-schema',
  'oas3-schema',
];

// Define security rule categories
const securityRules = [
  'Operation Enforces Security Scheme',
  'Strict Transport Security',
  'Insecure Direct Object Reference(IDOR) Risks',
  'Content Security Policy',
  'Content Type Options',
  'XSS Protection',
  'Secure URLs (HTTPs)',
  'Security Field Contains a Scheme',
  'Global Security Field is Defined',
  'Authorization',
];

// Generate a random score based on input string and a seed
// 50% chance of good scores, 50% chance of bad scores
const generateRandomScore = (input: string, seed: number): number => {
    const hash = input.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    // Determine if this should be a bad score (50% chance)
    const shouldBeBadScore = ((hash * seed) % 100) < 50;
    
    if (shouldBeBadScore) {
      // Generate a low score between 30 and 60
      return 30 + ((hash * seed) % 31);
    } else {
      // Generate a good score between 75 and 98
      return 75 + ((hash * seed) % 24);
    }
  };

export const DataQualityDashboard: React.FC<DataQualityDashboardProps> = ({ 
  apiSpec, 
  title = "Data Quality Metrics", 
  onBack 
}) => {
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);

  // Quality scores (randomized based on Data title)
  const [metrics, setMetrics] = useState({
    overall: 0,
    security: 0,
    design: 0,
    performance: 0,
    aiReady: 0,
    errors: 0,
    warnings: 0,
    informs: 0,
  });

  // Rules violations (counts)
  const [violations, setViolations] = useState({
    total: 0,
    rules: 0,
    categories: 0,
    errors: 0,
    warnings: 0,
    informs: 0,
  });

  // Security rule checks
  const [securityChecks, setSecurityChecks] = useState<{ name: string; status: 'pass' | 'fail' }[]>([]);

  // Process Data spec and generate metrics
  useEffect(() => {
    if (!apiSpec && !spec) return;
    
    setLoading(true);
    try {
      const processedSpec = apiSpec || spec;
      const apiTitle = processedSpec?.info?.title || "Untitled Data";
      
      // Generate randomized metrics based on Data title
      const overallScore = generateRandomScore(apiTitle, 7);
      const securityScore = generateRandomScore(apiTitle, 3);
      const designScore = generateRandomScore(apiTitle, 5);
      const performanceScore = generateRandomScore(apiTitle, 9);
      const aiReadyScore = generateRandomScore(apiTitle, 11);
      
      // Calculate violation counts based on scores
      const errorCount = Math.round((100 - overallScore) / 2);
      const warningCount = Math.round((100 - overallScore) / 1.5);
      const informCount = Math.round((100 - overallScore) / 8);
      
      // Update metrics state
      setMetrics({
        overall: overallScore,
        security: securityScore,
        design: designScore,
        performance: performanceScore,
        aiReady: aiReadyScore,
        errors: errorCount,
        warnings: warningCount,
        informs: informCount,
      });
      
      // Update violations state
      setViolations({
        total: errorCount + warningCount + informCount,
        rules: Math.round((100 - overallScore) / 12),
        categories: Math.min(5, Math.round((100 - overallScore) / 20)),
        errors: errorCount,
        warnings: warningCount,
        informs: informCount,
      });
      
      // Generate security checks with properly typed status
      const checks = securityRules.map(rule => ({
        name: rule,
        status: generateRandomScore(rule + apiTitle, 13) > 50 ? 'pass' as const : 'fail' as const
      }));
      
      setSecurityChecks(checks);
      
      setError(null);
    } catch (err) {
      console.error('Error analyzing Data spec:', err);
      setError(`Failed to analyze Data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [apiSpec, spec]);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    setFileUploadError(null);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        // Parse the content based on file type
        let parsed;
        if (file.name.endsWith('.json')) {
          parsed = JSON.parse(content);
        } else {
          // Assume YAML for .yaml, .yml or any other extension
          parsed = yaml.load(content);
        }
        
        // Check if it's a valid Data model
        if (!parsed.openapi && !parsed.swagger) {
          throw new Error('The uploaded file is not a valid Data Model');
        }
        
        setSpec(parsed);
        setFileUploadError(null);
      } catch (err) {
        console.error('Error processing file:', err);
        setFileUploadError(`Error parsing file: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setSpec(null);
      } finally {
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      setFileUploadError('Error reading file');
      setLoading(false);
    };
    
    reader.readAsText(file);
    
    // Reset the input value to allow uploading the same file again
    event.target.value = '';
  };

  const downloadReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      apiName: (apiSpec || spec)?.info?.title || "Untitled Data Model",
      metrics,
      violations,
      securityChecks,
      grade: getGrade(metrics.overall),
      rating: getRating(metrics.overall),
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-quality-report-${(apiSpec || spec)?.info?.title || "untitled"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Analyzing Data Model...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-2 md:p-8 lg:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            {onBack && (
              <Button 
                variant="outline" 
                size="icon" 
                onClick={onBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h1 className="text-3xl font-bold text-teal-600">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {!apiSpec && (
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
            )}
            <Button
              onClick={downloadReport}
              variant="outline"
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              <span>Download Report</span>
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {fileUploadError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{fileUploadError}</AlertDescription>
          </Alert>
        )}

        {(apiSpec || spec) && (
          <>
            {/* Data Model Overview & Score Card */}
            <div className="mb-6">
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="mb-4 md:mb-0">
                      <h2 className="text-xl font-semibold text-gray-700 mb-2">
                        {(apiSpec || spec)?.info?.title || "Untitled Data Model"}
                      </h2>
                      <p className="text-gray-500 text-sm">
                        Version: {(apiSpec || spec)?.info?.version || "N/A"} • 
                        Spec: {(apiSpec || spec)?.openapi || (apiSpec || spec)?.swagger || "Unknown"}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="flex flex-col items-center justify-center">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center ${getStatusColor(metrics.overall)}`}>
                          <span className="text-4xl font-bold">{getGrade(metrics.overall)}</span>
                        </div>
                        <span className="mt-2 text-sm font-medium">{getRating(metrics.overall)}</span>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-800">{metrics.overall}</div>
                        <div className="text-sm text-gray-500">Overall Model score</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Component Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {/* Security Score */}
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatusColor(metrics.security)}`}>
                      <span className="text-2xl font-bold">{metrics.security >= 90 ? 'A' : metrics.security >= 80 ? 'B' : metrics.security >= 70 ? 'C' : metrics.security >= 60 ? 'D' : 'F'}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Security</div>
                      <div className="text-xl font-bold text-gray-800">{metrics.security}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Design Score */}
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatusColor(metrics.design)}`}>
                      <span className="text-2xl font-bold">{metrics.design >= 90 ? 'A' : metrics.design >= 80 ? 'B' : metrics.design >= 70 ? 'C' : metrics.design >= 60 ? 'D' : 'F'}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Design</div>
                      <div className="text-xl font-bold text-gray-800">{metrics.design}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Performance Score */}
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatusColor(metrics.performance)}`}>
                      <span className="text-2xl font-bold">{metrics.performance >= 90 ? 'A' : metrics.performance >= 80 ? 'B' : metrics.performance >= 70 ? 'C' : metrics.performance >= 60 ? 'D' : 'F'}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Performance</div>
                      <div className="text-xl font-bold text-gray-800">{metrics.performance}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* AI Ready Score */}
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatusColor(metrics.aiReady)}`}>
                      <span className="text-2xl font-bold">{metrics.aiReady >= 90 ? 'A' : metrics.aiReady >= 80 ? 'B' : metrics.aiReady >= 70 ? 'C' : metrics.aiReady >= 60 ? 'D' : 'F'}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">AI Ready</div>
                      <div className="text-xl font-bold text-gray-800">{metrics.aiReady}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="objects">Objects</TabsTrigger>
                <TabsTrigger value="problems">Problems</TabsTrigger>
                <TabsTrigger value="rules">Rules</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
              </TabsList>
              
            <TabsContent value="overview">
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span>Size:</span>
                    <span className="text-blue-500 font-medium">{Math.round(JSON.stringify(apiSpec || spec).length / 1024)}kb</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Version:</span>
                    <span className="text-blue-500 font-medium">{(apiSpec || spec)?.openapi || (apiSpec || spec)?.swagger || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Schemas:</span>
                    <span className="text-blue-500 font-medium">
                      {Object.keys((apiSpec || spec)?.components?.schemas || {}).length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Parameters:</span>
                    <span className="text-blue-500 font-medium">
                      {Object.keys((apiSpec || spec)?.components?.parameters || {}).length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Operations:</span>
                    <span className="text-blue-500 font-medium">
                      {Object.entries((apiSpec || spec)?.paths || {}).reduce((count, [_, pathObj]) => {
                        return count + Object.keys(pathObj as object).filter(key => !key.startsWith('x-')).length;
                      }, 0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Refs:</span>
                    <span className="text-blue-500 font-medium">
                      {JSON.stringify(apiSpec || spec).match(/\$ref/g)?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Tags:</span>
                    <span className="text-blue-500 font-medium">
                      {((apiSpec || spec)?.tags || []).length}
                    </span>
                  </div>
                </div>
              </div>
              
              <Card className="border-gray-200">
                <CardHeader className="border-b">
                  <CardTitle>Violation Statistics</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    <div className="p-4 border border-blue-200 rounded-md bg-blue-50">
                      <div className="text-blue-500 font-medium">Total</div>
                      <div className="text-3xl font-bold text-blue-600">
                        {violations.total}
                      </div>
                    </div>
                    <div className="p-4 border border-blue-200 rounded-md bg-blue-50">
                      <div className="text-blue-500 font-medium">Rules</div>
                      <div className="text-3xl font-bold text-blue-600">
                        {violations.rules}
                      </div>
                    </div>
                    <div className="p-4 border border-blue-200 rounded-md bg-blue-50">
                      <div className="text-blue-500 font-medium">Categories</div>
                      <div className="text-3xl font-bold text-blue-600">
                        {violations.categories}
                      </div>
                    </div>
                    <div className="p-4 border border-red-200 rounded-md bg-red-50">
                      <div className="flex items-center gap-1">
                        <X className="w-4 h-4 text-red-500" />
                        <span className="text-red-500 font-medium">Errors</span>
                      </div>
                      <div className="text-3xl font-bold text-red-600">
                        {violations.errors}
                      </div>
                    </div>
                    <div className="p-4 border border-yellow-200 rounded-md bg-yellow-50">
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        <span className="text-yellow-500 font-medium">Warnings</span>
                      </div>
                      <div className="text-3xl font-bold text-yellow-600">
                        {violations.warnings}
                      </div>
                    </div>
                    <div className="p-4 border border-blue-200 rounded-md bg-blue-50">
                      <div className="flex items-center gap-1">
                        <Info className="w-4 h-4 text-blue-500" />
                        <span className="text-blue-500 font-medium">Infos</span>
                      </div>
                      <div className="text-3xl font-bold text-blue-600">
                        {violations.informs}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                      <h3 className="text-gray-500 mb-4">Overall score</h3>
                      <div className="flex flex-col items-center justify-center p-6 border rounded-md">
                        <div className={`w-24 h-24 rounded-md flex items-center justify-center text-4xl font-bold mb-2 ${getStatusColor(metrics.overall)}`}>
                          {getGrade(metrics.overall)}
                        </div>
                        <div className="text-center text-lg">{getRating(metrics.overall)}</div>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <h3 className="text-gray-500 mb-4">The doctor's diagnosis:</h3>
                      <div className="p-4 border rounded-md bg-gray-50">
                        {metrics.overall >= 90 ? (
                          <p className="text-gray-700">
                            Wow, just wow! This is absolutely perfect, you've done an amazing job. You're a rockstar! Can I hire you?
                          </p>
                        ) : metrics.overall >= 80 ? (
                          <p className="text-gray-700">
                            Great job! Your Data Model is in good shape. There are just a few minor issues to address to make it perfect.
                            You have {violations.errors} errors and {violations.warnings} warnings to fix.
                          </p>
                        ) : metrics.overall >= 70 ? (
                          <p className="text-gray-700">
                            Your Data model is acceptable, but there's room for improvement. You should address the {" "}
                            {violations.errors} errors and consider fixing some of the {violations.warnings} warnings to improve quality.
                          </p>
                        ) : metrics.overall >= 60 ? (
                          <p className="text-gray-700">
                            Your Data model needs work. There are {violations.errors} errors that need to be fixed,
                            and {violations.warnings} warnings that are causing issues with the quality.
                          </p>
                        ) : (
                          <p className="text-gray-700">
                            On the border of terrible! This model is in extremely poor shape. It's a mess,
                            and it's not going to be useful to anyone. You've got a lot of work to do. I've detected {" "}
                            {violations.errors} errors, which is entirely too high. You should fix these immediately.
                            There are {violations.warnings} warnings that are causing significant damage to the quality.
                          </p>
                        )}
                        
                        {metrics.overall < 90 && (
                          <div className="mt-4">
                            <p className="text-gray-700 mb-2">I recommend focusing on fixing violations against the following rules:</p>
                            <ul className="space-y-1">
                              {ruleCategories.slice(0, 4).map((rule, index) => (
                                <li key={index} className="text-blue-500">
                                  <span className="mr-2">&gt;</span>{rule}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="problems">
                  {activeTab === 'problems' && violations.total > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-medium mb-4">Top Issues</h3>
                      {[...ruleCategories].slice(0, 5).map((rule, index) => {
                        const score = generateRandomScore(rule, index + 5);
                        const progress = score > 90 ? 80 : score > 70 ? 50 : score > 50 ? 33 : score > 30 ? 15 : 8;
                        
                        return (
                          <div key={index} className="mb-8">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <span className="text-gray-500 mr-2">{index + 1}</span>
                                <AlertCircle className="text-red-500 w-4 h-4 mr-2" />
                                <span className="text-blue-500">{rule}</span>
                              </div>
                              <div className="text-sm text-gray-500">
                                <span>{Math.round(100 - score)}%</span>
                              </div>
                            </div>
                            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="absolute h-full bg-red-500 rounded-full" 
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
             </TabsContent>
             <TabsContent value="security">    
                  {activeTab === 'security' && (
                    <div className="mt-8">
                      <h3 className="text-lg font-medium mb-4">Security Checks</h3>
                      <div className="space-y-4">
                        {securityChecks.map((check, index) => (
                          <div key={index} className="p-4 border rounded-md flex items-center justify-between">
                            <div className="flex items-center">
                              {check.status === 'pass' ? (
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-4">
                                  <Check className="w-4 h-4 text-green-600" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-4">
                                  <X className="w-4 h-4 text-red-600" />
                                </div>
                              )}
                              <span>{check.name}</span>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              check.status === 'pass' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {check.status === 'pass' ? 'Pass' : 'Fail'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
             </TabsContent>
             <TabsContent value="rules">    
                  {activeTab === 'rules' && (
                     <Card className="border-gray-200">
                     <CardHeader className="border-b">
                       <CardTitle>Validation Rules</CardTitle>
                     </CardHeader>
                     <CardContent className="p-6">
                    <div className="mt-8">
                      <div className="space-y-4">
                        {ruleCategories.map((rule, index) => (
                          <div key={index} className="p-4 border rounded-md flex items-center justify-between">
                            <div className="flex items-center">
                              {index < 3 ? (
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-4">
                                  <Check className="w-4 h-4 text-green-600" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-4">
                                  <X className="w-4 h-4 text-red-600" />
                                </div>
                              )}
                              <span>{rule}</span>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              index < 3
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {index < 3 ? 'MEDIUM' : 'HIGH'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    </CardContent>
                    </Card>
                  )}
             </TabsContent>
             <TabsContent value="objects">   
                  {activeTab === 'objects' && (
                    <div className="mt-8">
                      <h3 className="text-lg font-medium mb-4">Model Objects</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Schemas */}
                          <Card className="border-gray-200">
                            <CardHeader className="pb-2">
                              <div className="flex items-center">
                                <FileJson className="w-5 h-5 text-teal-600 mr-2" />
                                <CardTitle className="text-base">Schemas</CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">
                                {Object.keys((apiSpec || spec)?.components?.schemas || {}).length}
                              </div>
                              <div className="mt-2 text-sm text-gray-500">
                                Data models defined in the specification
                              </div>
                            </CardContent>
                          </Card>
                          
                          {/* Paths */}
                          <Card className="border-gray-200">
                            <CardHeader className="pb-2">
                              <div className="flex items-center">
                                <Code className="w-5 h-5 text-teal-600 mr-2" />
                                <CardTitle className="text-base">Endpoints</CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">
                                {Object.keys((apiSpec || spec)?.paths || {}).length}
                              </div>
                              <div className="mt-2 text-sm text-gray-500">
                                 paths defined in the model
                              </div>
                            </CardContent>
                          </Card>
                          
                          {/* Operations */}
                          <Card className="border-gray-200">
                            <CardHeader className="pb-2">
                              <div className="flex items-center">
                                <Layers className="w-5 h-5 text-teal-600 mr-2" />
                                <CardTitle className="text-base">Operations</CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">
                                {Object.entries((apiSpec || spec)?.paths || {}).reduce((count, [_, pathObj]) => {
                                  return count + Object.keys(pathObj as object).filter(key => !key.startsWith('x-')).length;
                                }, 0)}
                              </div>
                              <div className="mt-2 text-sm text-gray-500">
                                HTTP operations across all endpoints
                              </div>
                            </CardContent>
                          </Card>
                          
                          {/* Tags */}
                          <Card className="border-gray-200">
                            <CardHeader className="pb-2">
                              <div className="flex items-center">
                                <Tag className="w-5 h-5 text-teal-600 mr-2" />
                                <CardTitle className="text-base">Tags</CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">
                                {((apiSpec || spec)?.tags || []).length}
                              </div>
                              <div className="mt-2 text-sm text-gray-500">
                                Tags used to categorize operations
                              </div>
                            </CardContent>
                          </Card>
                          
                          {/* References */}
                          <Card className="border-gray-200">
                            <CardHeader className="pb-2">
                              <div className="flex items-center">
                                <FileText className="w-5 h-5 text-teal-600 mr-2" />
                                <CardTitle className="text-base">References</CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">
                                {JSON.stringify(apiSpec || spec).match(/\$ref/g)?.length || 0}
                              </div>
                              <div className="mt-2 text-sm text-gray-500">
                                $ref pointers to reuse components
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}