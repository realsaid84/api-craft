'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  AlertCircle, 
  Upload, 
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
  Shield,
  BarChart,
  Database,
  Link,
  Lock,
  Users,
  BookOpen,
  History,
  Copy,
  Filter,
  Eye,
  ExternalLink,
  Percent
} from 'lucide-react';
import * as yaml from 'js-yaml';

interface DataQualityDashboardProps {
  dataModel?: any;
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
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 70) return 'Satisfactory';
  if (score >= 60) return 'Needs Improvement';
  return 'Critical Issues';
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

// A simple temporary List icon since it was used but not imported
const List = ({ className }: { className: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
  );
};

// List of data quality rule categories
const dataQualityRules = [
  { 
    id: 'completeness',
    name: 'Completeness', 
    description: 'Ensures all required data elements are present',
    icon: <Eye className="w-5 h-5" />
  },
  { 
    id: 'accuracy',
    name: 'Accuracy', 
    description: 'Validates data values against expected ranges and patterns',
    icon: <Check className="w-5 h-5" />
  },
  { 
    id: 'consistency',
    name: 'Consistency', 
    description: 'Ensures data follows consistent patterns and structures',
    icon: <Copy className="w-5 h-5" />
  },
  { 
    id: 'security',
    name: 'Security', 
    description: 'Validates security-related aspects of the data model',
    icon: <Shield className="w-5 h-5" />
  },
  { 
    id: 'validity',
    name: 'Validity', 
    description: 'Checks if data conforms to format and domain rules',
    icon: <Check className="w-5 h-5" />
  },
  { 
    id: 'referentialIntegrity',
    name: 'Referential Integrity', 
    description: 'Ensures proper relationships between data elements',
    icon: <Link className="w-5 h-5" />
  },
  { 
    id: 'modelAdherence',
    name: 'Model Adherence', 
    description: 'Measures how well the data adheres to the defined model',
    icon: <Database className="w-5 h-5" />
  },
  { 
    id: 'complianceMarkersPresence',
    name: 'Compliance Markers', 
    description: 'Checks for required compliance markers in data',
    icon: <FileText className="w-5 h-5" />
  },
  { 
    id: 'privacyMarkersPresence',
    name: 'Privacy Markers', 
    description: 'Validates privacy classifications and markers',
    icon: <Lock className="w-5 h-5" />
  },
  { 
    id: 'dataLineageMarkers',
    name: 'Data Lineage Markers', 
    description: 'Verifies presence of data origin and transformation records',
    icon: <History className="w-5 h-5" />
  },
  { 
    id: 'noOrphans',
    name: 'No Orphans', 
    description: 'Ensures no orphaned data elements exist',
    icon: <Link className="w-5 h-5" />
  },
  { 
    id: 'dataDeduplication',
    name: 'Data Deduplication', 
    description: 'Checks for duplicate data elements',
    icon: <Filter className="w-5 h-5" />
  },
  { 
    id: 'businessAttributeNaming',
    name: 'Business Attribute Naming', 
    description: 'Validates naming conventions for business attributes',
    icon: <Tag className="w-5 h-5" />
  },
  { 
    id: 'businessTermDescriptions',
    name: 'Business Term Descriptions', 
    description: 'Ensures business terms are properly described',
    icon: <BookOpen className="w-5 h-5" />
  },
  { 
    id: 'ownershipInformation',
    name: 'Ownership Information', 
    description: 'Validates data ownership metadata',
    icon: <Users className="w-5 h-5" />
  },
  { 
    id: 'boundContextAndDomain',
    name: 'Bounded Context & Domain', 
    description: 'Ensures proper domain and context boundaries',
    icon: <Tag className="w-5 h-5" />
  },
  { 
    id: 'namingAdherence',
    name: 'Naming Adherence', 
    description: 'Validates adherence to naming conventions',
    icon: <Code className="w-5 h-5" />
  },
  { 
    id: 'referenceDataAsEnums',
    name: 'Reference Data as Enums', 
    description: 'Ensures reference data is properly modeled as enumerations',
    icon: <List className="w-5 h-5" />
  },
  { 
    id: 'criticalDataElementsAdherence',
    name: 'Critical Data Elements Adherence', 
    description: 'Validates special handling of critical data elements',
    icon: <AlertCircle className="w-5 h-5" />
  }
];

// Define quality areas for grouping rules
const qualityAreas = [
  {
    id: 'structure',
    name: 'Structural Quality',
    rules: ['completeness', 'consistency', 'validity', 'modelAdherence', 'noOrphans', 'dataDeduplication']
  },
  {
    id: 'semantics',
    name: 'Semantic Quality',
    rules: ['accuracy', 'businessAttributeNaming', 'businessTermDescriptions', 'referenceDataAsEnums', 'namingAdherence']
  },
  {
    id: 'governance',
    name: 'Governance Quality',
    rules: ['ownershipInformation', 'boundContextAndDomain', 'complianceMarkersPresence', 'privacyMarkersPresence', 'dataLineageMarkers']
  },
  {
    id: 'security',
    name: 'Security & Compliance',
    rules: ['security', 'criticalDataElementsAdherence', 'referentialIntegrity']
  }
];

// Simple function to get a rule by ID
const getRuleById = (id: string) => {
  return dataQualityRules.find(rule => rule.id === id);
};

// Generate a random score based on input string and a seed
const generateRandomScore = (input: string, seed: number): number => {
  const hash = input.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  // Determine if this should be a bad score (30% chance)
  const shouldBeBadScore = ((hash * seed) % 100) < 30;
  
  if (shouldBeBadScore) {
    // Generate a low score between 30 and 60
    return 30 + ((hash * seed) % 31);
  } else {
    // Generate a good score between 70 and 98
    return 70 + ((hash * seed) % 29);
  }
};

export const DataQualityDashboard: React.FC<DataQualityDashboardProps> = ({ 
  dataModel, 
  title = "Data Quality Assessment", 
  onBack 
}) => {
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  // Quality scores (randomized based on Data title)
  const [metrics, setMetrics] = useState({
    overall: 0,
    structure: 0,
    semantics: 0,
    governance: 0,
    security: 0,
    errors: 0,
    warnings: 0,
    infos: 0,
  });

  // Rules violations (counts)
  const [violations, setViolations] = useState({
    total: 0,
    highSeverity: 0,
    mediumSeverity: 0,
    lowSeverity: 0,
    errors: 0,
    warnings: 0,
    infos: 0,
  });

  // Individual rule scores
  const [ruleScores, setRuleScores] = useState<Record<string, number>>({});

  // Process Data spec and generate metrics
  useEffect(() => {
    if (!dataModel && !spec) return;
    
    setLoading(true);
    try {
      const processedSpec = dataModel || spec;
      const modelTitle = processedSpec?.title || processedSpec?.info?.title || "Untitled Data Model";
      
      // Generate randomized metrics based on Data title
      const overallScore = generateRandomScore(modelTitle, 7);
      const structureScore = generateRandomScore(modelTitle, 3);
      const semanticsScore = generateRandomScore(modelTitle, 5);
      const governanceScore = generateRandomScore(modelTitle, 9);
      const securityScore = generateRandomScore(modelTitle, 11);
      
      // Calculate violation counts based on scores
      const errorCount = Math.round((100 - overallScore) / 5);
      const warningCount = Math.round((100 - overallScore) / 3);
      const infoCount = Math.round((100 - overallScore) / 2);
      
      // Update metrics state
      setMetrics({
        overall: overallScore,
        structure: structureScore,
        semantics: semanticsScore,
        governance: governanceScore,
        security: securityScore,
        errors: errorCount,
        warnings: warningCount,
        infos: infoCount,
      });
      
      // Update violations state
      setViolations({
        total: errorCount + warningCount + infoCount,
        highSeverity: errorCount,
        mediumSeverity: warningCount,
        lowSeverity: infoCount,
        errors: errorCount,
        warnings: warningCount,
        infos: infoCount,
      });
      
      // Generate individual rule scores
      const scores: Record<string, number> = {};
      dataQualityRules.forEach(rule => {
        scores[rule.id] = generateRandomScore(`${modelTitle}-${rule.id}`, 13);
      });
      
      setRuleScores(scores);
      
      setError(null);
    } catch (err) {
      console.error('Error analyzing Data Model:', err);
      setError(`Failed to analyze Data Model: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [dataModel, spec]);

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
      modelName: (dataModel || spec)?.title || (dataModel || spec)?.info?.title || "Untitled Data Model",
      metrics,
      violations,
      ruleScores,
      grade: getGrade(metrics.overall),
      rating: getRating(metrics.overall),
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-quality-report-${(dataModel || spec)?.title || "untitled"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Returns array of failing rules (score < 70)
  const getFailingRules = () => {
    return dataQualityRules
      .filter(rule => (ruleScores[rule.id] || 0) < 70)
      .sort((a, b) => (ruleScores[a.id] || 0) - (ruleScores[b.id] || 0))
      .slice(0, 5);
  };

  // Filter rules by area
  const getRulesByArea = (areaId: string) => {
    const area = qualityAreas.find(a => a.id === areaId);
    if (!area) return [];
    
    return area.rules.map(ruleId => {
      const rule = getRuleById(ruleId);
      if (!rule) return null;
      
      return {
        ...rule,
        score: ruleScores[ruleId] || 0
      };
    }).filter(Boolean);
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
         
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".yaml,.yml,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="px-4 py-2 bg-gray-100 text-black rounded-md flex items-center gap-2 hover:bg-primary/40 transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Import Brownfield Model</span>
                </div>
              </label>
            
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

        {(dataModel || spec) && (
          <>
            {/* Data Model Overview & Score Card */}
            <div className="mb-6">
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="mb-4 md:mb-0">
                      <h2 className="text-xl font-bold text-teal-600">
                        {`${dataModel?.title} Model` || "Untitled Data Model"}
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {(dataModel || spec)?.version && (
                          <span className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-700">
                            Version: {(dataModel || spec)?.version || (dataModel || spec)?.info?.version || "N/A"}
                          </span>
                        )}
                        {(dataModel || spec)?.$schema && (
                          <span className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-700">
                            Schema: {(dataModel || spec)?.$schema?.split('/').pop()?.replace('.json', '') || "Unknown"}
                          </span>
                        )}
                        {(dataModel)?.xModelType && (
                          <span className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-700">
                            Type: {(dataModel)?.xModelType || "Unknown"}
                          </span>
                        )}
                      </div>
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
                        <div className="text-sm text-gray-500">Overall Quality Score</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Quality Area Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {/* Structure Score */}
              <Card className="border-gray-200 cursor-pointer hover:shadow-md transition-shadow" 
                onClick={() => {
                  setActiveTab('rules');
                  setSelectedArea('structure');
                }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatusColor(metrics.structure)}`}>
                      <Database className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Structural Quality</div>
                      <div className="text-xl font-bold text-gray-800">{metrics.structure}</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Progress value={metrics.structure} className="h-1.5" 
                      style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                      <div className={`h-full ${getProgressColor(metrics.structure)}`} 
                        style={{ width: `${metrics.structure}%` }}></div>
                    </Progress>
                  </div>
                </CardContent>
              </Card>
              
              {/* Semantics Score */}
              <Card className="border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setActiveTab('rules');
                  setSelectedArea('semantics');
                }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatusColor(metrics.semantics)}`}>
                      <Tag className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Semantic Quality</div>
                      <div className="text-xl font-bold text-gray-800">{metrics.semantics}</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Progress value={metrics.semantics} className="h-1.5" 
                      style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                      <div className={`h-full ${getProgressColor(metrics.semantics)}`} 
                        style={{ width: `${metrics.semantics}%` }}></div>
                    </Progress>
                  </div>
                </CardContent>
              </Card>
              
              {/* Governance Score */}
              <Card className="border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setActiveTab('rules');
                  setSelectedArea('governance');
                }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatusColor(metrics.governance)}`}>
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Governance Quality</div>
                      <div className="text-xl font-bold text-gray-800">{metrics.governance}</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Progress value={metrics.governance} className="h-1.5" 
                      style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                      <div className={`h-full ${getProgressColor(metrics.governance)}`} 
                        style={{ width: `${metrics.governance}%` }}></div>
                    </Progress>
                  </div>
                </CardContent>
              </Card>
              
              {/* Security Score */}
              <Card className="border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setActiveTab('rules');
                  setSelectedArea('security');
                }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatusColor(metrics.security)}`}>
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Security & Compliance</div>
                      <div className="text-xl font-bold text-gray-800">{metrics.security}</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Progress value={metrics.security} className="h-1.5" 
                      style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                      <div className={`h-full ${getProgressColor(metrics.security)}`} 
                        style={{ width: `${metrics.security}%` }}></div>
                    </Progress>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="rules">Quality Rules</TabsTrigger>
                <TabsTrigger value="elements">Data Elements</TabsTrigger>
                <TabsTrigger value="violations">Violations</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <Card className="border-gray-200 mb-6">
                  <CardHeader className="border-b">
                    <CardTitle>Data Model Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="p-4 border rounded-md">
                        <div className="text-sm text-gray-500 mb-1">Schema Size</div>
                        <div className="text-xl font-semibold flex items-center gap-2">
                          <FileJson className="w-5 h-5 text-blue-500" />
                          {Math.round(JSON.stringify(dataModel || spec).length / 1024)}kb
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-md">
                        <div className="text-sm text-gray-500 mb-1">Properties</div>
                        <div className="text-xl font-semibold flex items-center gap-2">
                          <Layers className="w-5 h-5 text-blue-500" />
                          {Object.keys((dataModel || spec)?.properties || {}).length}
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-md">
                        <div className="text-sm text-gray-500 mb-1">Required Fields</div>
                        <div className="text-xl font-semibold flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-blue-500" />
                          {((dataModel || spec)?.required || []).length}
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-md">
                        <div className="text-sm text-gray-500 mb-1">References</div>
                        <div className="text-xl font-semibold flex items-center gap-2">
                          <Link className="w-5 h-5 text-blue-500" />
                          {JSON.stringify(dataModel || spec).match(/\$ref/g)?.length || 0}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                      <div className="md:col-span-1">
                        <h3 className="text-gray-500 mb-4">Quality Assessment</h3>
                        <div className="flex flex-col items-center justify-center p-6 border rounded-md">
                          <div className={`w-24 h-24 rounded-md flex items-center justify-center text-4xl font-bold mb-2 ${getStatusColor(metrics.overall)}`}>
                            {getGrade(metrics.overall)}
                          </div>
                          <div className="text-center text-lg">{getRating(metrics.overall)}</div>
                        </div>
                      </div>
                      
                      <div className="md:col-span-2">
                        <h3 className="text-gray-500 mb-4">Quality Analysis</h3>
                        <div className="p-4 border rounded-md bg-gray-50">
                          {metrics.overall >= 90 ? (
                            <p className="text-gray-700">
                              This data model meets high quality standards. It demonstrates excellent structural integrity, 
                              clear semantics, proper governance, and strong security considerations. 
                              It is ready for enterprise adoption and integration.
                            </p>
                          ) : metrics.overall >= 80 ? (
                            <p className="text-gray-700">
                              This data model shows good quality with minor improvements needed. 
                              There are {violations.warnings} warnings that should be addressed before 
                              wider adoption. Focus on semantic quality and consistent naming conventions.
                            </p>
                          ) : metrics.overall >= 70 ? (
                            <p className="text-gray-700">
                              The data model has acceptable quality but needs attention in several areas. 
                              Address the {violations.errors} errors to improve overall quality.
                              Pay particular attention to governance and security aspects.
                            </p>
                          ) : metrics.overall >= 60 ? (
                            <p className="text-gray-700">
                              This data model has significant quality issues that need immediate attention. 
                              The {violations.errors} errors and {violations.warnings} warnings indicate 
                              structural and semantic problems that could lead to implementation challenges.
                            </p>
                          ) : (
                            <p className="text-gray-700">
                              Critical quality issues detected. This data model requires substantial rework
                              before it can be considered for implementation. The high number of errors ({violations.errors})
                              indicates fundamental problems with structure, semantics, and governance.
                            </p>
                          )}
                          
                          {getFailingRules().length > 0 && (
                            <div className="mt-4">
                              <p className="text-gray-700 mb-2 font-medium">Top issues to address:</p>
                              <ul className="space-y-1">
                                {getFailingRules().map((rule, index) => (
                                  <li key={index} className="flex items-center text-blue-600">
                                    <span className="mr-2">•</span>
                                    {rule.name}: {rule.description}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8">
                      <h3 className="text-gray-500 mb-4">Violation Distribution</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-md flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                            <X className="w-6 h-6 text-red-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">High Severity</div>
                            <div className="text-2xl font-bold">{violations.highSeverity}</div>
                          </div>
                        </div>
                        
                        <div className="p-4 border rounded-md flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-yellow-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Medium Severity</div>
                            <div className="text-2xl font-bold">{violations.mediumSeverity}</div>
                          </div>
                        </div>
                        
                        <div className="p-4 border rounded-md flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <Info className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Low Severity</div>
                            <div className="text-2xl font-bold">{violations.lowSeverity}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="rules">
                <Card className="border-gray-200">
                  <CardHeader className="border-b">
                    <div className="flex justify-between items-center">
                      <CardTitle>
                        {selectedArea 
                          ? `${qualityAreas.find(a => a.id === selectedArea)?.name} Rules` 
                          : 'Data Quality Rules'
                        }
                      </CardTitle>
                      
                      {selectedArea && (
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedArea(null)}
                        >
                          View All Rules
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {!selectedArea ? (
                      <>
                        {qualityAreas.map(area => (
                          <div key={area.id} className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-medium text-gray-800">
                                {area.name}
                              </h3>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedArea(area.id)}
                              >
                                View Details
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {area.rules.slice(0, 4).map(ruleId => {
                                const rule = getRuleById(ruleId);
                                if (!rule) return null;
                                
                                const score = ruleScores[ruleId] || 0;
                                
                                return (
                                  <div key={ruleId} className="p-4 border rounded-md">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(score)}`}>
                                        {rule.icon}
                                      </div>
                                      <div className="font-medium">{rule.name}</div>
                                    </div>
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm text-gray-500">{rule.description}</span>
                                      <span className={`font-medium ${
                                        score >= 80 ? 'text-green-600' : 
                                        score >= 60 ? 'text-yellow-600' : 
                                        'text-red-600'
                                      }`}>
                                        {score}/100
                                      </span>
                                    </div>
                                    <Progress value={score} className="h-1.5" 
                                      style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                                      <div className={`h-full ${getProgressColor(score)}`} 
                                        style={{ width: `${score}%` }}></div>
                                    </Progress>
                                  </div>
                                );
                              })}
                              {area.rules.length > 4 && (
                                <div className="p-4 border rounded-md border-dashed flex items-center justify-center">
                                  <Button 
                                    variant="ghost"
                                    onClick={() => setSelectedArea(area.id)}
                                  >
                                    View {area.rules.length - 4} more rules
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="space-y-4">
                        {getRulesByArea(selectedArea).map((rule: any) => (
                          <div key={rule.id} className="p-4 border rounded-md">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(rule.score)}`}>
                                  {rule.icon}
                                </div>
                                <div>
                                  <div className="font-medium">{rule.name}</div>
                                  <div className="text-sm text-gray-500">{rule.description}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`text-xl font-bold ${
                                  rule.score >= 80 ? 'text-green-600' : 
                                  rule.score >= 60 ? 'text-yellow-600' : 
                                  'text-red-600'
                                }`}>
                                  {rule.score}/100
                                </div>
                                <div className="text-xs text-gray-500">
                                  {rule.score >= 80 ? 'Good' : 
                                  rule.score >= 60 ? 'Needs Improvement' : 
                                  'Critical Issue'}
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <Progress value={rule.score} className="h-2" 
                                style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                                <div className={`h-full ${getProgressColor(rule.score)}`} 
                                  style={{ width: `${rule.score}%` }}></div>
                              </Progress>
                            </div>
                            
                            {rule.score < 70 && (
                              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md">
                                <div className="flex items-start gap-2">
                                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                                  <div>
                                    <div className="font-medium text-red-800">Improvement needed</div>
                                    <div className="text-sm text-red-600">
                                      {rule.id === 'completeness' && 'Required fields are missing or incomplete in the data model.'}
                                      {rule.id === 'accuracy' && 'Data validation rules are insufficient for ensuring accurate data entry.'}
                                      {rule.id === 'consistency' && 'Inconsistent naming patterns or attribute definitions detected.'}
                                      {rule.id === 'security' && 'Security-related attributes or classifications are missing or incomplete.'}
                                      {rule.id === 'validity' && 'Domain constraints or patterns are not properly defined.'}
                                      {rule.id === 'referentialIntegrity' && 'References between entities lack proper integrity constraints.'}
                                      {rule.id === 'modelAdherence' && 'The model does not fully adhere to organizational or industry standards.'}
                                      {rule.id === 'complianceMarkersPresence' && 'Compliance markers are missing from regulated data elements.'}
                                      {rule.id === 'privacyMarkersPresence' && 'Privacy classification markers are missing or insufficient.'}
                                      {rule.id === 'dataLineageMarkers' && 'The model lacks proper data lineage tracking information.'}
                                      {rule.id === 'noOrphans' && 'Orphaned entities or attributes detected in the model.'}
                                      {rule.id === 'dataDeduplication' && 'Duplicate or redundant data definitions found in the model.'}
                                      {rule.id === 'businessAttributeNaming' && 'Business attribute naming does not follow established conventions.'}
                                      {rule.id === 'businessTermDescriptions' && 'Business terms lack proper descriptions or context.'}
                                      {rule.id === 'ownershipInformation' && 'Data ownership or stewardship information is missing.'}
                                      {rule.id === 'boundContextAndDomain' && 'Domain boundaries or context definitions are unclear.'}
                                      {rule.id === 'namingAdherence' && 'Naming patterns violate organizational standards.'}
                                      {rule.id === 'referenceDataAsEnums' && 'Reference data not properly modeled as enumerations.'}
                                      {rule.id === 'criticalDataElementsAdherence' && 'Critical data elements lack proper handling definitions.'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="elements">
                <Card className="border-gray-200">
                  <CardHeader className="border-b">
                    <CardTitle>Data Model Elements</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 border rounded-md bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                          <Database className="w-5 h-5 text-teal-600" />
                          <h3 className="font-medium">Properties</h3>
                        </div>
                        <div className="text-2xl font-bold mb-1">
                          {Object.keys((dataModel || spec)?.properties || {}).length}
                        </div>
                        <div className="text-sm text-gray-500">
                          Defined data elements in model
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-md bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-5 h-5 text-teal-600" />
                          <h3 className="font-medium">Required Elements</h3>
                        </div>
                        <div className="text-2xl font-bold mb-1">
                          {((dataModel || spec)?.required || []).length}
                        </div>
                        <div className="text-sm text-gray-500">
                          Mandatory data elements
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-md bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                          <Percent className="w-5 h-5 text-teal-600" />
                          <h3 className="font-medium">Completeness</h3>
                        </div>
                        <div className="text-2xl font-bold mb-1">
                          {ruleScores['completeness'] || 0}%
                        </div>
                        <div className="text-sm text-gray-500">
                          Comprehensive definition score
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-gray-100 p-3 font-medium">Properties Overview</div>
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b">
                            <th className="px-4 py-2 text-left">Property</th>
                            <th className="px-4 py-2 text-left">Type</th>
                            <th className="px-4 py-2 text-left">Format</th>
                            <th className="px-4 py-2 text-left">Required</th>
                            <th className="px-4 py-2 text-left">Quality</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries((dataModel || spec)?.properties || {}).map(([key, value]: [string, any]) => {
                            // Generate a random quality score for each property
                            const qualityScore = generateRandomScore(key, 17);
                            
                            return (
                              <tr key={key} className="border-b">
                                <td className="px-4 py-2 font-medium">{key}</td>
                                <td className="px-4 py-2">{value.type || 'object'}</td>
                                <td className="px-4 py-2">{value.format || '-'}</td>
                                <td className="px-4 py-2">
                                  {((dataModel || spec)?.required || []).includes(key) ? (
                                    <Check className="w-5 h-5 text-green-500" />
                                  ) : (
                                    <span className="text-gray-400">Optional</span>
                                  )}
                                </td>
                                <td className="px-4 py-2">
                                  <div className="flex items-center gap-2">
                                    <Progress value={qualityScore} className="h-1.5 w-20" 
                                      style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                                      <div className={`h-full ${getProgressColor(qualityScore)}`} 
                                        style={{ width: `${qualityScore}%` }}></div>
                                    </Progress>
                                    <span className={`text-xs ${
                                      qualityScore >= 80 ? 'text-green-600' : 
                                      qualityScore >= 60 ? 'text-yellow-600' : 
                                      'text-red-600'
                                    }`}>
                                      {qualityScore}%
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="violations">
                <Card className="border-gray-200">
                  <CardHeader className="border-b">
                    <CardTitle>Quality Violations</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 border rounded-md border-red-200 bg-red-50">
                        <div className="flex items-center gap-2 mb-2">
                          <X className="w-5 h-5 text-red-600" />
                          <h3 className="font-medium text-red-700">High Severity</h3>
                        </div>
                        <div className="text-2xl font-bold text-red-700 mb-1">
                          {violations.highSeverity}
                        </div>
                        <div className="text-sm text-red-600">
                          Critical issues requiring immediate attention
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-md border-yellow-200 bg-yellow-50">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          <h3 className="font-medium text-yellow-700">Medium Severity</h3>
                        </div>
                        <div className="text-2xl font-bold text-yellow-700 mb-1">
                          {violations.mediumSeverity}
                        </div>
                        <div className="text-sm text-yellow-600">
                          Important issues to address
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-md border-blue-200 bg-blue-50">
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="w-5 h-5 text-blue-600" />
                          <h3 className="font-medium text-blue-700">Low Severity</h3>
                        </div>
                        <div className="text-2xl font-bold text-blue-700 mb-1">
                          {violations.lowSeverity}
                        </div>
                        <div className="text-sm text-blue-600">
                          Minor issues for consideration
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {[...dataQualityRules]
                        .filter(rule => (ruleScores[rule.id] || 0) < 75)
                        .sort((a, b) => (ruleScores[a.id] || 0) - (ruleScores[b.id] || 0))
                        .map(rule => {
                          const score = ruleScores[rule.id] || 0;
                          const severity = score < 60 ? 'high' : score < 75 ? 'medium' : 'low';
                          
                          return (
                            <div key={rule.id} className={`p-4 border rounded-md ${
                              severity === 'high' ? 'border-red-200 bg-red-50' : 
                              severity === 'medium' ? 'border-yellow-200 bg-yellow-50' : 
                              'border-blue-200 bg-blue-50'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {severity === 'high' ? (
                                    <X className="w-5 h-5 text-red-600" />
                                  ) : severity === 'medium' ? (
                                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                  ) : (
                                    <Info className="w-5 h-5 text-blue-600" />
                                  )}
                                  <div className="font-medium">{rule.name}</div>
                                </div>
                                <div className={`px-2 py-1 text-xs rounded-full ${
                                  severity === 'high' ? 'bg-red-200 text-red-800' : 
                                  severity === 'medium' ? 'bg-yellow-200 text-yellow-800' : 
                                  'bg-blue-200 text-blue-800'
                                }`}>
                                  {severity === 'high' ? 'High' : 
                                   severity === 'medium' ? 'Medium' : 'Low'} Severity
                                </div>
                              </div>
                              
                              <div className="mt-2 text-sm">
                                {rule.description}
                              </div>
                              
                              <div className="mt-4">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-500">Quality Score</span>
                                  <span className={`font-medium ${
                                    severity === 'high' ? 'text-red-600' : 
                                    severity === 'medium' ? 'text-yellow-600' : 
                                    'text-blue-600'
                                  }`}>
                                    {score}/100
                                  </span>
                                </div>
                                <Progress value={score} className="h-1.5" 
                                  style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                                  <div className={`h-full ${getProgressColor(score)}`} 
                                    style={{ width: `${score}%` }}></div>
                                </Progress>
                              </div>
                              
                              <div className="mt-4 text-sm">
                                <div className={`font-medium ${
                                  severity === 'high' ? 'text-red-700' : 
                                  severity === 'medium' ? 'text-yellow-700' : 
                                  'text-blue-700'
                                }`}>
                                  Violation details:
                                </div>
                                <div className={`mt-1 ${
                                  severity === 'high' ? 'text-red-600' : 
                                  severity === 'medium' ? 'text-yellow-600' : 
                                  'text-blue-600'
                                }`}>
                                  {rule.id === 'completeness' && 'Missing required fields or attributes in critical data elements.'}
                                  {rule.id === 'accuracy' && 'Data validation rules insufficient for ensuring data accuracy.'}
                                  {rule.id === 'consistency' && 'Inconsistent naming conventions or data formats detected.'}
                                  {rule.id === 'security' && 'Security classifications or access controls not properly defined.'}
                                  {rule.id === 'validity' && 'Data format or domain constraints not properly enforced.'}
                                  {rule.id === 'referentialIntegrity' && 'References between data elements lack proper integrity rules.'}
                                  {rule.id === 'modelAdherence' && 'Model does not follow organizational or industry standards.'}
                                  {rule.id === 'complianceMarkersPresence' && 'Compliance markers missing for regulated data.'}
                                  {rule.id === 'privacyMarkersPresence' && 'Privacy classifications missing for sensitive data.'}
                                  {rule.id === 'dataLineageMarkers' && 'Data lineage information incomplete or missing.'}
                                  {rule.id === 'noOrphans' && 'Orphaned references or entities detected in the model.'}
                                  {rule.id === 'dataDeduplication' && 'Duplicate or redundant data definitions present.'}
                                  {rule.id === 'businessAttributeNaming' && 'Business attribute names not following standard conventions.'}
                                  {rule.id === 'businessTermDescriptions' && 'Business term descriptions missing or incomplete.'}
                                  {rule.id === 'ownershipInformation' && 'Data stewardship or ownership metadata missing.'}
                                  {rule.id === 'boundContextAndDomain' && 'Domain boundaries or context definitions unclear.'}
                                  {rule.id === 'namingAdherence' && 'Element naming violates organizational standards.'}
                                  {rule.id === 'referenceDataAsEnums' && 'Reference data not properly modeled with enumerations.'}
                                  {rule.id === 'criticalDataElementsAdherence' && 'Critical data elements lack special handling rules.'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="recommendations">
                <Card className="border-gray-200">
                  <CardHeader className="border-b">
                    <CardTitle>Quality Improvement Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="p-4 border rounded-md bg-teal-50 border-teal-200">
                        <div className="flex items-center gap-2 mb-3">
                          <BarChart className="w-6 h-6 text-teal-600" />
                          <h3 className="text-lg font-medium text-teal-700">Overall Quality Assessment</h3>
                        </div>
                        <p className="text-teal-700 mb-4">
                          Based on our assessment, your data model has an overall quality score of <strong>{metrics.overall}/100</strong> ({getGrade(metrics.overall)}).
                          {metrics.overall >= 90 
                            ? ' This is excellent and indicates a high-quality data model that adheres to best practices.'
                            : metrics.overall >= 80 
                              ? ' This is good, but there are some areas that could be improved.'
                              : metrics.overall >= 70 
                                ? ' This indicates moderate quality with several areas requiring improvement.'
                                : ' This indicates significant quality issues that need to be addressed.'}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-4">Priority Recommendations</h3>
                        <div className="space-y-4">
                          {getFailingRules().map((rule, index) => (
                            <div key={rule.id} className="p-4 border rounded-md">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium">
                                  {index + 1}
                                </div>
                                <h4 className="font-medium text-gray-800">{rule.name}</h4>
                              </div>
                              <p className="text-gray-600 mb-3">{rule.description}</p>
                              <div className="bg-gray-50 p-3 rounded-md">
                                <div className="font-medium text-gray-700 mb-2">Improvement Actions:</div>
                                <ul className="space-y-2 text-gray-600">
                                  {rule.id === 'completeness' && (
                                    <>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Ensure all data elements have proper descriptions
                                      </li>
                                    </>
                                  )}
                                  {rule.id === 'accuracy' && (
                                    <>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Add proper validation patterns for string data
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Define acceptable value ranges for numeric data
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Add format specifications for dates, identifiers, and other formatted data
                                      </li>
                                    </>
                                  )}
                                  {rule.id === 'consistency' && (
                                    <>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Standardize naming conventions across all properties
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Ensure consistent data formats for similar data types
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Align attribute definitions with organizational glossary
                                      </li>
                                    </>
                                  )}
                                  {rule.id === 'security' && (
                                    <>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Add security classification tags to sensitive data elements
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Define access control requirements for protected data
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Document encryption requirements for data at rest and in transit
                                      </li>
                                    </>
                                  )}
                                  {rule.id === 'validity' && (
                                    <>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Define domain constraints for all categorical data
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Add regex patterns for formatted identifiers and codes
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Ensure date formats are consistently defined
                                      </li>
                                    </>
                                  )}
                                  {rule.id === 'referentialIntegrity' && (
                                    <>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Define proper foreign key references between related entities
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Document referential constraints and cascade behaviors
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Ensure all references point to valid target entities
                                      </li>
                                    </>
                                  )}
                                  {rule.id === 'modelAdherence' && (
                                    <>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Align model structure with organizational data standards
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Ensure compliance with industry standard models where applicable
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Document any intentional deviations from standard models
                                      </li>
                                    </>
                                  )}
                                  {rule.id === 'complianceMarkersPresence' && (
                                    <>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Add compliance markers for regulated data elements
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Document regulatory requirements applicable to each data element
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Ensure data retention policies are defined for regulated data
                                      </li>
                                    </>
                                  )}
                                  {rule.id === 'privacyMarkersPresence' && (
                                    <>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Add privacy classification tags to all personal data
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Document purpose limitation and consent requirements
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Identify data subject to special privacy regulations
                                      </li>
                                    </>
                                  )}
                                  {rule.id === 'dataLineageMarkers' && (
                                    <>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Add source system identifiers to imported data elements
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Document transformation rules for derived data
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Ensure lineage can be traced through all data flows
                                      </li>
                                    </>
                                  )}
                                  {rule.id === 'noOrphans' && (
                                    <>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Identify and remove orphaned data elements
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Ensure all entities are properly connected to the data model
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Verify all references resolve to existing entities
                                      </li>
                                    </>
                                  )}
                                  {rule.id === 'dataDeduplication' && (
                                    <>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Identify and consolidate redundant data definitions
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Establish single sources of truth for key data elements
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Use references instead of duplicating data structures
                                      </li>
                                    </>
                                  )}
                                  {rule.id === 'businessAttributeNaming' && (
                                    <>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Align attribute names with business terminology
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Follow consistent naming patterns for all attributes
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Avoid technical jargon in business-facing attributes
                                      </li>
                                    </>
                                  )}
                                  {rule.id === 'businessTermDescriptions' && (
                                    <>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Add clear business descriptions to all key data elements
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Link terms to organizational glossary where applicable
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Include business context and usage examples in descriptions
                                      </li>
                                    </>
                                  )}
                                  {rule.id === 'ownershipInformation' && (
                                    <>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Define data owners for all major entities and attributes
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Document data stewardship responsibilities
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Clarify support and governance processes for the data model
                                      </li>
                                    </>
                                  )}
                                  {rule.id === 'boundContextAndDomain' && (
                                    <>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Define clear domain boundaries for the data model
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Document context relationships with other domains
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Ensure entities belong to appropriate bounded contexts
                                      </li>
                                    </>
                                  )}
                                  {rule.id === 'namingAdherence' && (
                                    <>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Apply organizational naming conventions consistently
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Use consistent casing and word separation patterns
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Document any exceptions to naming standards
                                      </li>
                                    </>
                                  )}
                                  {rule.id === 'referenceDataAsEnums' && (
                                    <>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Model reference data as proper enumerations
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Document allowed values and their business meanings
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Ensure extensibility for reference data that may change
                                      </li>
                                    </>
                                  )}
                                  {rule.id === 'criticalDataElementsAdherence' && (
                                    <>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Identify and tag critical data elements
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Define special handling rules for critical data
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        Document impact assessment processes for critical data changes
                                      </li>
                                    </>
                                  )}
                                </ul>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-md bg-blue-50 border-blue-200">
                        <div className="flex items-center gap-2 mb-3">
                          <ExternalLink className="w-6 h-6 text-blue-600" />
                          <h3 className="text-lg font-medium text-blue-700">Next Steps</h3>
                        </div>
                        <p className="text-blue-700 mb-4">
                          We recommend addressing the identified quality issues in order of priority.
                          Focus first on critical issues that impact data integrity, then move on to
                          governance and semantic improvements.
                        </p>
                        <div className="flex gap-4">
                          <Button variant="outline" onClick={downloadReport} className="flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            <span>Download Full Report</span>
                          </Button>
                          <Button variant="outline" className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span>Schedule Review Session</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};



export default DataQualityDashboard;