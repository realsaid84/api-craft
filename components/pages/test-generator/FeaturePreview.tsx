import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { xonokai } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { convertToGherkin, convertToArazzo } from './Generator';
import { Clipboard, CheckCheck, FileCode, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import yaml from 'js-yaml';

interface FeaturePreviewProps {
  features: any[];
  format: string;
}

const FeaturePreview: React.FC<FeaturePreviewProps> = ({ features, format }) => {
  const [selectedFeature, setSelectedFeature] = useState<string>(features[0]?.name || '');
  const [copied, setCopied] = useState<boolean>(false);
  const [displayFormat, setDisplayFormat] = useState<'json' | 'yaml'>('yaml');

  // Get the selected feature object
  const getSelectedFeature = () => {
    return features.find(f => f.name === selectedFeature) || features[0];
  };

  // Generate Gherkin or Arazzo formatted content
  const generateFormattedContent = () => {
    const feature = getSelectedFeature();
    if (!feature) return '';

    if (format === 'gherkin') {
      return convertToGherkin(feature);
    } else if (format === 'arazzo') {
      return convertToArazzo(feature);
    }
    
    // Fallback to JSON representation
    return JSON.stringify(feature, null, 2);
  };

  const handleCopy = () => {
    const content = generateFormattedContent();
    navigator.clipboard.writeText(content)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  // Function to convert JSON to YAML
  const jsonToYaml = (jsonContent: string) => {
    try {
      const jsonObj = JSON.parse(jsonContent);
      return yaml.dump(jsonObj);
    } catch (e) {
      return jsonContent; // Return original if not valid JSON
    }
  };

  // No features
  if (features.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        No BDD features have been generated. Generate features first.
      </div>
    );
  }

  const formattedContent = generateFormattedContent();
  const codeLanguage = format === 'gherkin' ? 'gherkin' : 'javascript';

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="w-64">
          <Select value={selectedFeature} onValueChange={setSelectedFeature}>
            <SelectTrigger>
              <SelectValue placeholder="Select a feature" />
            </SelectTrigger>
            <SelectContent>
              {features.map((feature, index) => (
                <SelectItem key={index} value={feature.name}>
                  {feature.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDisplayFormat(displayFormat === 'json' ? 'yaml' : 'json')}
            className="gap-1"
          >
            <FileCode className="h-4 w-4" />
            <span>{displayFormat === 'json' ? 'YAML' : 'JSON'}</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-1"
          >
            {copied ? (
              <>
                <CheckCheck className="h-4 w-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Clipboard className="h-4 w-4" />
                <span>Copy</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <Card className="border rounded-md overflow-hidden">
        <CardContent className="p-0">
          <Tabs defaultValue="postman" className="w-full">
            <div className="border-b">
              <TabsList className="bg-transparent px-4 pt-2">
                <TabsTrigger value="postman">API Client View</TabsTrigger>
                <TabsTrigger value="code">Raw Code</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="code" className="p-0 m-0">
              <SyntaxHighlighter
                language={codeLanguage}
                style={xonokai}
                showLineNumbers={true}
                customStyle={{
                  margin: 0,
                  borderRadius: '0',
                  height: '550px',
                  fontSize: '0.9rem'
                }}
              >
                {formattedContent}
              </SyntaxHighlighter>
            </TabsContent>

            <TabsContent value="postman" className="m-0 p-0">
              <PostmanStyleView 
                feature={getSelectedFeature()} 
                displayFormat={displayFormat}
                jsonToYaml={jsonToYaml}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="text-sm text-gray-500">
        Format: <span className="font-semibold">{format === 'gherkin' ? 'Gherkin (Cucumber)' : 'Arazzo Test'}</span> • 
        Scenarios: <span className="font-semibold">{getSelectedFeature()?.scenarios?.length || 0}</span>
      </div>
    </div>
  );
};

// Component to display feature in Postman-like style
const PostmanStyleView: React.FC<{ 
  feature: any; 
  displayFormat: 'json' | 'yaml';
  jsonToYaml: (json: string) => string;
}> = ({ feature, displayFormat, jsonToYaml }) => {
  if (!feature) return null;
  
  // Class map for HTTP method colors
  const methodColors: Record<string, string> = {
    get: "bg-blue-500 text-white",
    post: "bg-orange-500 text-white",
    put: "bg-green-600 text-white",
    delete: "bg-red-500 text-white",
    patch: "bg-purple-500 text-white",
    options: "bg-gray-500 text-white",
    head: "bg-gray-700 text-white"
  };

  // Extract scenarios grouped by HTTP method
  const scenariosByMethod = feature.scenarios.reduce((acc: any, scenario: any) => {
    // Find the step with the HTTP method
    const methodStep = scenario.steps.find((step: any) => 
      step.text.includes('send a') && step.text.includes('request to')
    );
    
    if (methodStep) {
      const methodMatch = methodStep.text.match(/send a ([A-Z]+) request/);
      if (methodMatch && methodMatch[1]) {
        const method = methodMatch[1].toLowerCase();
        if (!acc[method]) acc[method] = [];
        acc[method].push({...scenario, method, methodStep});
      }
    }
    
    return acc;
  }, {});

  // Get the first scenario for the currently selected tab
  const [selectedMethod, setSelectedMethod] = useState<string>(
    Object.keys(scenariosByMethod)[0] || 'get'
  );
  
  // Get the path for display in URL bar
  const getPathForCurrentScenario = () => {
    if (scenariosByMethod[selectedMethod]?.[0]) {
      const methodStep = scenariosByMethod[selectedMethod][0].methodStep;
      const pathMatch = methodStep.text.match(/request to \"([^\"]+)\"/);
      return pathMatch?.[1] || '/';
    }
    return '/';
  };

  // Extract parameters from a step's text
  const extractParams = (stepText: string) => {
    if (stepText.includes('parameters:')) {
      const paramsText = stepText.split('parameters:')[1].trim();
      const params: { name: string, value: string }[] = [];
      
      // Split by commas, but respect quotes
      let inQuote = false;
      let currentParam = '';
      let paramBuffer = '';
      
      for (let i = 0; i < paramsText.length; i++) {
        const char = paramsText[i];
        
        if (char === '"' || char === "'") {
          inQuote = !inQuote;
          paramBuffer += char;
        } else if (char === '=' && !inQuote && currentParam === '') {
          currentParam = paramBuffer.trim();
          paramBuffer = '';
        } else if (char === ',' && !inQuote) {
          // Complete this param
          if (currentParam) {
            params.push({ name: currentParam, value: paramBuffer.trim() });
            currentParam = '';
            paramBuffer = '';
          }
        } else {
          paramBuffer += char;
        }
      }
      
      // Add the last param
      if (currentParam) {
        params.push({ name: currentParam, value: paramBuffer.trim() });
      }
      
      return params;
    }
    return [];
  };

  // Extract request body from a scenario
  const extractRequestBody = (scenario: any) => {
    const requestBodyStep = scenario.steps.find((step: any) => 
      step.text.includes('request body')
    );
    
    if (requestBodyStep?.codeBlock) {
      try {
        if (displayFormat === 'yaml') {
          return jsonToYaml(requestBodyStep.codeBlock.content);
        } else {
          return JSON.stringify(JSON.parse(requestBodyStep.codeBlock.content), null, 2);
        }
      } catch (e) {
        return requestBodyStep.codeBlock.content;
      }
    }
    
    return null;
  };

  // Current scenario we're viewing
  const currentScenario = scenariosByMethod[selectedMethod]?.[0];

  return (
    <div className="h-[550px] overflow-auto bg-white">
      {/* Left sidebar with HTTP methods */}
      <div className="flex h-full">
        <div className="w-[400px] border-r bg-gray-50 overflow-y-auto">
          {/* List of scenarios by HTTP method */}
          {Object.entries(scenariosByMethod).map(([method, scenarios]) => (
            <div key={method}>
              {(scenarios as any[]).map((scenario: any, idx: number) => (
                <div 
                  key={`${method}-${idx}`}
                  className={`p-3 border-b hover:bg-gray-100 cursor-pointer ${selectedMethod === method ? 'bg-gray-200' : ''}`}
                  onClick={() => setSelectedMethod(method)}
                >
                  <div className="flex items-center gap-2">
                    <Badge className={`font-mono text-xs px-2 ${methodColors[method]}`}>
                      {method.toUpperCase()}
                    </Badge>
                    <div className="font-medium truncate">{scenario.name}</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 ml-12 truncate">
                    {getPathForCurrentScenario()}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        
        {/* Main content area */}
        <div className="flex-1 overflow-y-auto">
          {currentScenario ? (
            <>
              {/* URL bar */}
              <div className="p-4 border-b flex items-center gap-2">
                <Badge className={`font-mono text-xs px-2 ${methodColors[selectedMethod]}`}>
                  {selectedMethod.toUpperCase()}
                </Badge>
                <div className="bg-gray-100 flex-1 px-3 py-2 rounded text-gray-800 font-mono text-sm">
                  https://api.example.com{getPathForCurrentScenario()}
                </div>
              </div>

              {/* Parameters and body tabs */}
              <div className="border-b">
                <Tabs defaultValue="params">
                  <TabsList className="px-4 pt-2">
                    <TabsTrigger value="params">Params</TabsTrigger>
                    <TabsTrigger value="body">Body</TabsTrigger>
                    <TabsTrigger value="response">Response</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="params" className="p-0 m-0">
                    <div className="p-4">
                      {/* Extract query and path parameters */}
                      {currentScenario.steps.some((step: any) => step.text.includes('parameters')) ? (
                        <div>
                          <table className="w-full">
                            <thead className="bg-gray-50 text-left">
                              <tr>
                                <th className="p-2 border-y w-8"></th>
                                <th className="p-2 border-y">Name</th>
                                <th className="p-2 border-y">Value</th>
                                <th className="p-2 border-y">Type</th>
                                <th className="p-2 border-y">Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentScenario.steps
                                .filter((step: any) => step.text.includes('parameters'))
                                .flatMap((step: any) => {
                                  const params = extractParams(step.text);
                                  const paramType = step.text.includes('path parameters') ? 'path' : 'query';
                                  
                                  return params.map((param, idx) => (
                                    <tr key={`${paramType}-${param.name}-${idx}`} className="border-b">
                                      <td className="p-2">
                                        <div className="flex justify-center">
                                          <Check className="h-4 w-4 text-green-500" />
                                        </div>
                                      </td>
                                      <td className="p-2 font-medium">{param.name}</td>
                                      <td className="p-2">{param.value.replace(/"/g, '')}</td>
                                      <td className="p-2 text-sm">
                                        <Badge variant="outline" className="bg-green-50 text-green-700 font-normal">
                                          string
                                        </Badge>
                                      </td>
                                      <td className="p-2 text-gray-500 text-sm">
                                        {paramType === 'path' ? 'Path Parameter' : 'Query Parameter'}
                                      </td>
                                    </tr>
                                  ));
                                })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-center py-4">
                          No parameters defined for this request
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="body" className="p-0 m-0">
                    <div className="p-4">
                      {/* Display request body if present */}
                      {extractRequestBody(currentScenario) ? (
                        <div>
                          <div className="flex gap-4 mb-4">
                            {['none', 'form-data', 'x-www-form-urlencoded', 'json', 'xml', 'raw', 'binary'].map(format => (
                              <div 
                                key={format}
                                className={`px-3 py-1 text-sm rounded cursor-pointer
                                  ${format === 'json' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                              >
                                {format}
                              </div>
                            ))}
                          </div>
                          
                          <div className="border rounded-md bg-gray-50 p-4 font-mono text-sm whitespace-pre">
                            {extractRequestBody(currentScenario)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-center py-4">
                          No request body defined
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="response" className="p-0 m-0">
                    <div className="p-4">
                      {/* Display expected response */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="text-gray-700 font-medium">Expected Status:</div>
                          <Badge className="bg-green-100 text-green-800 font-medium">
                            {currentScenario.steps.find((step: any) => step.text.includes('status should be'))?.text.match(/should be (\d+)/)?.[1] || '200'}
                          </Badge>
                        </div>
                        
                        <div className="mb-2 text-gray-700 font-medium">Expected Response:</div>
                        
                        {currentScenario.steps.some((step: any) => 
                          step.text.includes('response should') && !step.text.includes('status should')
                        ) ? (
                          <div className="border rounded-md bg-gray-50 p-4 font-mono text-sm">
                            {/* Simplified for illustration; more complex logic would be needed for real response structure */}
                            {displayFormat === 'yaml' ? (
                              jsonToYaml(JSON.stringify({
                                result: "success",
                                status: "created", 
                                data: { id: 123, name: "Example" }
                              }))
                            ) : (
                              JSON.stringify({
                                result: "success",
                                status: "created", 
                                data: { id: 123, name: "Example" }
                              }, null, 2)
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-500">
                            No specific response structure defined
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No scenarios available for this feature
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { FeaturePreview };