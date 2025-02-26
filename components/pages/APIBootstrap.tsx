import React, { useState } from 'react';
import { Info, Home, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type Domain = 'Payment' | 'Account' | 'Receivables' | 'Risk' | 'Connectivity';

const sampleDataModels = [
  { id: '1', name: 'Payment Instruction', version: '1.1.13', domain: 'Payment' },
  { id: '2', name: 'Bank Account', version: '2.0.1', domain: 'Account' },
  { id: '3', name: 'Posting Entry', version: '3.0.0', domain: 'Payment' },
  { id: '4', name: 'Balance Position', version: '2.1.0', domain: 'Account' },
  { id: '5', name: 'Receivable Invoice', version: '1.0.0', domain: 'Receivables' },
  { id: '6', name: 'Liquidity Forecast', version: '1.2.0', domain: 'Risk' },
  { id: '7', name: 'Payment Schedule', version: '2.0.0', domain: 'Payment' },
  { id: '8', name: 'Statement', version: '3.1.0', domain: 'Account' },
  { id: '9', name: 'Treasury Limits', version: '1.0.0', domain: 'Risk' },
];

const apiTemplates = [
  { id: '1', name: 'REST API Standard Template', type: 'REST' },
  { id: '2', name: 'Event-Driven API Template', type: 'ASYNC' },
  { id: '3', name: 'GraphQL API Template', type: 'GraphQL' },
];

const domains: Domain[] = ['Payment', 'Account', 'Receivables', 'Risk', 'Connectivity'];

const securitySchemes = [
  { id: 'jwt', name: 'JWT Bearer' },
  { id: 'oauth', name: 'OAuth' },
  { id: 'mtls', name: 'MTLS' },
  { id: 'none', name: 'No Auth' },
];

export const APIBootstrap = () => {
  const [enableWebhooks, setEnableWebhooks] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectLocation, setProjectLocation] = useState('/workspace/api/');
  const [selectedModels, setSelectedModels] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [namespace, setNamespace] = useState('');
  const [majorVersion, setMajorVersion] = useState('v1');

  return (
    <div className="flex-1 overflow-auto p-2 md:p-8 lg:p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-teal-600">Design an API</h1>
        <p className="text-xl text-muted-foreground">
          Kickstart your API design using Approved Data Models and standardized API templates
        </p>

        <div className="mt-8">
          <Tabs defaultValue="specification" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="specification">API Specification</TabsTrigger>
              <TabsTrigger value="schema">JSON Schema Component</TabsTrigger>
              <TabsTrigger value="workflow">API Workflow Spec</TabsTrigger>
            </TabsList>

            <TabsContent value="specification">
              <Card>
                <CardContent className="pt-6">
                  <form className="space-y-6">
                    {/* Webhook Enable */}
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="webhooks"
                        checked={enableWebhooks}
                        onCheckedChange={(checked) => setEnableWebhooks(checked as boolean)}
                      />
                      <label
                        htmlFor="webhooks"
                        className="text-sm font-medium leading-none text-teal-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Enable webhooks for this API resources
                      </label>
                    </div>

                    {/* Project Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-teal-600">Project Name</label>
                      <Input 
                      placeholder="The name of the Project"
                      value={projectName}
                      onChange={(e) => {
                        setProjectName(e.target.value);
                      }}
                      onBlur={(e) => {setProjectLocation(`${projectLocation}${e.target.value.toLowerCase().replace(' ', '-')}`);}}
                      />
                    </div>

                    {/* Project Location */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-teal-600">Project Location</label>
                      <div className="flex gap-2">
                        <Input 
                          value={projectLocation}
                          onChange={(e) => setProjectLocation(e.target.value)}
                          className="flex-1"
                        />
                        <Button variant="outline">Browse</Button>
                      </div>
                    </div>

                    {/* Namespace */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-teal-600">Namespace (basePath)</label>
                      <Input 
                        placeholder="payment"
                        value={namespace}
                        onChange={(e) => setNamespace(e.target.value)}
                      />
                       <div className="flex items-center text-sm text-teal-600">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        <a href="https://go/payments-api-env" className="hover:underline">Discover approved namespaces</a>
                      </div>
                    </div>

                    {/* Major Version */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-teal-600">Major Version</label>
                      <Select value={majorVersion} onValueChange={setMajorVersion}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select version" />
                        </SelectTrigger>
                        <SelectContent>
                          {['v1', 'v2', 'v3', 'v4'].map(version => (
                            <SelectItem key={version} value={version}>{version}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Data Models Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-teal-600">Approved Data Models</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select data models..." />
                        </SelectTrigger>
                        <SelectContent>
                          {sampleDataModels.map(model => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.name} (v{model.version}) - {model.domain}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex items-center text-sm text-teal-600">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        <a href="/pages/discover/data-models" className="hover:underline">Browse Data Models</a>
                      </div>
                    </div>

                    {/* API Template Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-teal-600">API Template</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an API template" />
                        </SelectTrigger>
                        <SelectContent>
                          {apiTemplates.map(template => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* API Type */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-teal-600">API Type</label>
                      <Select defaultValue="rest">
                        <SelectTrigger>
                          <SelectValue placeholder="Select API type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rest">REST API</SelectItem>
                          <SelectItem value="graphql">GraphQL</SelectItem>
                          <SelectItem value="grpc">gRPC</SelectItem>
                          <SelectItem value="async">Async API</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Security Scheme */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-teal-600">Security Scheme</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select security scheme" />
                        </SelectTrigger>
                        <SelectContent>
                          {securitySchemes.map(scheme => (
                            <SelectItem key={scheme.id} value={scheme.id}>
                              {scheme.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* API Specification Language */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-teal-600">API Specification Language</label>
                      <Select defaultValue="oas3.0">
                        <SelectTrigger>
                          <SelectValue placeholder="Select specification language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="oas3.0">OAS 3.0 (YAML)</SelectItem>
                          <SelectItem value="oas3.1">OAS 3.1 (YAML)</SelectItem>
                          <SelectItem value="asyncapi">ASYNC API (YAML)</SelectItem>
                          <SelectItem value="protobuf">Protocol Buffers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Domain Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-teal-600">Domain</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select domain" />
                        </SelectTrigger>
                        <SelectContent>
                          {domains.map(domain => (
                            <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                       <div className="flex items-center text-sm text-teal-600">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        <a href="https://go/payments-domain-model" className="hover:underline">Discover domains</a>
                      </div>
                      
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between pt-6">
                      <Button variant="outline" className="text-teal-600 border-teal-600 hover:bg-teal-50">Cancel</Button>
                      <Button className="bg-teal-600 hover:bg-teal-700">Create Project</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schema">
              <Card>
                <CardContent className="pt-6">
                  <p>JSON Schema component editor will be integrated here</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="workflow">
              <Card>
                <CardContent className="pt-6">
                  <p>Arrazzo Workflow editor will be integrated here</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default APIBootstrap;