/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SettingsPanelProps {
  settings: {
    includeBackgroundSection: boolean;
    includeExamples: boolean;
    generateAssertions: boolean;
    testDepth: string;
    outputFormat: string;
    includeValidation: boolean;
    targetEnvironment: string;
  };
  onChange: (settings: any) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onChange }) => {
  const handleChange = (key: string, value: any) => {
    onChange({
      ...settings,
      [key]: value
    });
  };

  const renderTooltip = (text: string) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-gray-400 ml-1 cursor-help" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-sm">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Generation Settings</CardTitle>
        <CardDescription>
          Configure how BDD tests are generated from your OpenAPI specification
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="format">Output Format</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <div className="flex items-center">
                    <Label className="text-base font-medium">Include Background Section</Label>
                    {renderTooltip('Add a Background section to features with common setup steps')}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Adds common setup steps across all scenarios
                  </p>
                </div>
                <Switch
                  checked={settings.includeBackgroundSection}
                  onCheckedChange={(value) => handleChange('includeBackgroundSection', value)}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <div className="flex items-center">
                    <Label className="text-base font-medium">Include Examples</Label>
                    {renderTooltip('Include example data from the OpenAPI spec in test cases')}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Generate examples from schema definitions
                  </p>
                </div>
                <Switch
                  checked={settings.includeExamples}
                  onCheckedChange={(value) => handleChange('includeExamples', value)}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <div className="flex items-center">
                    <Label className="text-base font-medium">Generate Assertions</Label>
                    {renderTooltip('Add assertions to validate responses')}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Create assertions based on response schemas
                  </p>
                </div>
                <Switch
                  checked={settings.generateAssertions}
                  onCheckedChange={(value) => handleChange('generateAssertions', value)}
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Label className="text-base font-medium">Test Depth</Label>
                  {renderTooltip('Controls how comprehensive the generated tests are')}
                </div>
                
                <RadioGroup 
                  value={settings.testDepth} 
                  onValueChange={(value) => handleChange('testDepth', value)}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="basic" id="basic" />
                    <Label htmlFor="basic">Basic - Happy path only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium">Medium - Happy path + basic validation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="comprehensive" id="comprehensive" />
                    <Label htmlFor="comprehensive">Comprehensive - All paths with detailed validation</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Label className="text-base font-medium">Target Environment</Label>
                  {renderTooltip('Select which environment to target in generated tests')}
                </div>
                
                <Select
                  value={settings.targetEnvironment}
                  onValueChange={(value) => handleChange('targetEnvironment', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dev">Development</SelectItem>
                    <SelectItem value="test">Testing</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="prod">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="format" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center">
                  <Label className="text-base font-medium">Output Format</Label>
                  {renderTooltip('Select the format for generated test files')}
                </div>
                
                <RadioGroup 
                  value={settings.outputFormat} 
                  onValueChange={(value) => handleChange('outputFormat', value)}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="gherkin" id="gherkin" />
                    <Label htmlFor="gherkin">Gherkin (.feature)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="arazzo" id="arazzo" />
                    <Label htmlFor="arazzo">Arazzo Test (.js)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="karate" id="karate" />
                    <Label htmlFor="karate">Karate (.feature)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-md border">
                <h3 className="font-medium mb-2">Format Preview</h3>
                <div className="text-sm">
                  {settings.outputFormat === 'gherkin' ? (
                    <div className="space-y-2 text-gray-700">
                      <p><span className="text-purple-600 font-medium">Feature:</span> User Management</p>
                      <p className="ml-2"><span className="text-purple-600 font-medium">Scenario:</span> Create a new user</p>
                      <p className="ml-4"><span className="text-blue-600 font-medium">Given</span> I am authenticated</p>
                      <p className="ml-4"><span className="text-amber-600 font-medium">When</span> I send a POST request to "/users"</p>
                      <p className="ml-4"><span className="text-green-600 font-medium">Then</span> the response status should be 201</p>
                    </div>
                  ) : settings.outputFormat === 'karate' ? (
                    <div className="space-y-2 text-gray-700 font-mono text-xs">
                      <p><span className="text-purple-600 font-medium">Feature:</span> User Management</p>
                      <p><span className="text-blue-600 font-medium">Background:</span></p>
                      <p className="ml-4"><span className="text-gray-600">*</span> url 'https://api.example.com/v1'</p>
                      <p className="ml-4"><span className="text-gray-600">*</span> def authToken = 'dummy-token-for-testing'</p>
                      <p className="ml-4"><span className="text-gray-600">*</span> header Authorization = 'Bearer ' + authToken</p>
                      <p><span className="text-purple-600 font-medium">Scenario:</span> Create a new user</p>
                      <p className="ml-4"><span className="text-gray-600">*</span> path '/users'</p>
                      <p className="ml-4"><span className="text-gray-600">*</span> request '{' "name": "John Doe" '}'</p>
                      <p className="ml-4"><span className="text-gray-600">*</span> method post</p>
                      <p className="ml-4"><span className="text-gray-600">*</span> status 201</p>
                      <p className="ml-4"><span className="text-gray-600">*</span> match response == {'{'}"id": "#number", "name": "John Doe"{'}'}</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-gray-700 font-mono text-xs">
                      <p><span className="text-amber-600">test</span>(<span className="text-green-600">'Create a new user'</span>, <span className="text-blue-600">async</span> {'({'} request {'}) => {'}</p>
                      <p className="ml-4"><span className="text-purple-600">const</span> response = <span className="text-blue-600">await</span> request.post(<span className="text-green-600">'/users'</span>, {'{'}</p>
                      <p className="ml-6">data: {'{'} name: <span className="text-green-600">'John Doe'</span> {'}'}</p>
                      <p className="ml-4">{'}'})</p>
                      <p className="ml-4">expect(response.status()).toBe(<span className="text-amber-600">201</span>)</p>
                      <p>{'}'});</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <div className="flex items-center">
                    <Label className="text-base font-medium">Include Schema Validation</Label>
                    {renderTooltip('Add schema validation assertions to tests')}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Validate responses against OpenAPI schema
                  </p>
                </div>
                <Switch
                  checked={settings.includeValidation}
                  onValueChange={(value) => handleChange('includeValidation', value)}
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Test Coverage</Label>
                    {renderTooltip('Controls the percentage of operations to cover')}
                  </div>
                  <span className="text-sm font-semibold">
                    {settings.testDepth === 'basic' ? '60%' : 
                     settings.testDepth === 'medium' ? '80%' : '100%'}
                  </span>
                </div>
                
                <Slider
                  disabled
                  value={[settings.testDepth === 'basic' ? 60 : 
                          settings.testDepth === 'medium' ? 80 : 100]}
                  max={100}
                  step={20}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Test coverage is automatically determined by the Test Depth setting
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Label className="text-base font-medium">Custom Test Tags</Label>
                  {renderTooltip('Add custom tags to generated scenarios')}
                </div>
                
                <Input 
                  placeholder="e.g., @smoke, @regression, @api"
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Comma-separated list of tags to add to generated scenarios
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export { SettingsPanel };