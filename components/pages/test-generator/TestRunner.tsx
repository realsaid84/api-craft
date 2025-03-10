
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Play, Loader2, Clock, FileCheck, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  errors?: string[];
}

interface TestRunnerProps {
  features: any[];
  testResults: {
    total: number;
    passed: number;
    failed: number;
    details: TestResult[];
  } | null;
  onRun: () => void;
  isRunning: boolean;
}

const TestRunner: React.FC<TestRunnerProps> = ({ features, testResults, onRun, isRunning }) => {
  const [activeTab, setActiveTab] = useState('summary');
  
  const getPassRate = () => {
    if (!testResults || testResults.total === 0) return 0;
    return Math.round((testResults.passed / testResults.total) * 100);
  };
  
  const passRate = getPassRate();
  
  return (
    <Card className="border rounded-md overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Test Runner</CardTitle>
            <CardDescription>Execute and monitor BDD tests</CardDescription>
          </div>
          
          <Button
            onClick={onRun}
            disabled={isRunning || features.length === 0}
            className="bg-teal-600 hover:bg-teal-700 flex items-center gap-1"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>Run Tests</span>
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {!testResults && !isRunning ? (
          <div className="text-center p-8">
            <FileCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Tests Run Yet</h3>
            <p className="text-gray-500 mb-6">
              Click the "Run Tests" button to execute your BDD tests
            </p>
            {features.length === 0 && (
              <div className="bg-amber-50 text-amber-800 p-4 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <p>No features have been generated yet. Generate BDD features first.</p>
              </div>
            )}
          </div>
        ) : isRunning ? (
          <div className="space-y-6 p-4">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-teal-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Running Tests</h3>
              <p className="text-gray-500 mb-4">Please wait while the tests are being executed...</p>
            </div>
            <Progress value={45} className="w-full h-2" />
            <div className="flex justify-between text-sm text-gray-500">
              <span>Tests in progress...</span>
              <span>45%</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="errors">Errors</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="m-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg">
                    <div className="mb-4 flex items-center justify-center w-24 h-24 rounded-full bg-gray-100">
                      <span className="text-3xl font-bold">{passRate}%</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Pass Rate</h3>
                    <p className="text-gray-500 text-sm">Overall test success rate</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                  {testResults ? 
                    <div className="p-4 rounded-lg bg-green-50 flex flex-col items-center">
                      <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                     
                      <span className="text-2xl font-semibold">{testResults.passed}</span>
                      <span className="text-sm text-gray-600">Passed</span>   
                    </div>
                    : <div></div>   
                    }
                    {testResults ? 
                    <div className="p-4 rounded-lg bg-red-50 flex flex-col items-center">
                      <XCircle className="h-8 w-8 text-red-500 mb-2" />
                      <span className="text-2xl font-semibold">{testResults.failed}</span>
                      <span className="text-sm text-gray-600">Failed</span>
                    </div>
                    : <div></div>   
                      }
                    <div className="p-4 rounded-lg bg-blue-50 flex flex-col items-center">
                      <FileCheck className="h-8 w-8 text-blue-500 mb-2" />
                      <span className="text-2xl font-semibold">{features.length}</span>
                      <span className="text-sm text-gray-600">Features</span>
                    </div>
                    {testResults ? 
                    <div className="p-4 rounded-lg bg-purple-50 flex flex-col items-center">
                      <Clock className="h-8 w-8 text-purple-500 mb-2" />
                      <span className="text-2xl font-semibold">
                        {Math.round(testResults.details.reduce((acc, curr) => acc + curr.duration, 0) / 1000)}s
                      </span>
                      <span className="text-sm text-gray-600">Duration</span>
                    </div>: <div></div>   
                      }
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Test Status by Feature</h3>
                  <div className="space-y-2">
                    {features.map((feature, index) => {
                      const featureResults = testResults && testResults.details.filter(d => d.name === feature.name);
                      const featurePassCount = featureResults ? featureResults.filter(r => r.passed).length : 0;
                      const featureProgress = featureResults && featureResults.length > 0 
                        ? Math.round((featurePassCount / featureResults.length) * 100) 
                        : 0;
                      
                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{feature.name}</span>
                            <span className="text-sm text-gray-500">
                              {featurePassCount}/{featureResults ? featureResults.length : 0} passed
                            </span>
                          </div>
                          <Progress value={featureProgress} className="w-full h-2" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="m-0">
                <div className="space-y-4">
                  <Accordion type="single" collapsible className="w-full">
                    {features.map((feature, featureIndex) => {
                      const featureResults = testResults &&  testResults.details.filter(d => d.name === feature.name);
                      
                      return (
                        <AccordionItem key={featureIndex} value={`feature-${featureIndex}`}>
                          <AccordionTrigger className="hover:bg-gray-50 px-4 py-2 rounded-md">
                            <div className="flex items-center w-full">
                              <span className="flex-1 text-left">{feature.name}</span>
                              <div className="flex items-center gap-2">
                                {featureResults && featureResults.some(r => r.passed) && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    {featureResults.filter(r => r.passed).length} passed
                                  </Badge>
                                )}
                                {featureResults && featureResults.some(r => !r.passed) && (
                                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                    {featureResults.filter(r => !r.passed).length} failed
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </AccordionTrigger>
                          
                          <AccordionContent className="px-4 pb-2">
                            <div className="space-y-2 mt-2">
                              {feature.scenarios.map((scenario: any, scenarioIndex: number) => {
                                const scenarioResult = featureResults && featureResults.find(r => r.name.includes(scenario.name));
                                const isPassed = scenarioResult?.passed ?? false;
                                
                                return (
                                  <div 
                                    key={scenarioIndex} 
                                    className={`p-2 rounded-md border ${
                                      isPassed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                                    }`}
                                  >
                                    <div className="flex items-start">
                                      {isPassed ? (
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                      ) : (
                                        <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                                      )}
                                      <div className="flex-1">
                                        <h4 className="font-medium">{scenario.name}</h4>
                                        <div className="flex gap-4 mt-1 text-sm">
                                          <span className="flex items-center gap-1 text-gray-600">
                                            <Clock className="h-3 w-3" />
                                            {scenarioResult?.duration ? `${scenarioResult.duration}ms` : 'N/A'}
                                          </span>
                                          <span className={`${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                                            {isPassed ? 'Passed' : 'Failed'}
                                          </span>
                                        </div>
                                        
                                        {!isPassed && scenarioResult?.errors && scenarioResult.errors.length > 0 && (
                                          <div className="mt-2 text-sm text-red-600">
                                            {scenarioResult.errors.map((error, errorIndex) => (
                                              <div key={errorIndex} className="p-2 bg-red-100 rounded">
                                                {error}
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </div>
              </TabsContent>
              
              <TabsContent value="errors" className="m-0">
                {testResults && testResults.failed === 0 ? (
                  <div className="text-center p-8">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">All Tests Passed!</h3>
                    <p className="text-gray-500">
                      No errors were found during test execution
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Failed Tests ({testResults && testResults.failed})</h3>
                    <div className="space-y-4">
                      {testResults && testResults.details
                        .filter(result => !result.passed)
                        .map((result, index) => (
                          <div key={index} className="p-4 border border-red-200 bg-red-50 rounded-md">
                            <div className="flex items-start">
                              <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <h4 className="font-medium">{result.name}</h4>
                                <div className="mt-2">
                                  {result.errors && result.errors.map((error, errorIndex) => (
                                    <div key={errorIndex} className="p-2 bg-red-100 rounded mb-2 text-sm">
                                      <div className="font-semibold mb-1">Error:</div>
                                      <div className="font-mono text-xs whitespace-pre-wrap">{error}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { TestRunner };