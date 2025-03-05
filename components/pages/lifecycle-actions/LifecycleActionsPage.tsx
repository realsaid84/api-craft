import React, { useState, useEffect } from 'react';
import { 
  Check, ChevronDown, Info, AlertCircle, Command, 
  Terminal, Play, FileText, FileCode, Database, Shield,
  Server, BarChart, GitMerge, ArrowRight, Book, RefreshCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from "@/components/ui/alert";
import CommandSelector from './CommandSelector';
import CommandOptions from './CommandOptions';
import ExecutionResults from './ExecutionResults';
import CommandDescription from './CommandDescription';

// Type definitions
export type CommandType = 'oas' | 'mock' | 'gateway' | 'test' | 'project' | 'entitlements-acm';
export type SubCommandType = 
  'bundle' | 'check' | 'preview' | 'proxy' | 'strip' | 
  'mock-check' | 'mock-proxy' | 
  'force-update' | 'project-new' | 'test' |
  'gateway-configure' | 'gateway-configure-apply' |
  'entitlements-acm-policy';

export type CommandOption = {
  name: string;
  shortName?: string;
  description: string;
  required: boolean;
  type: 'string' | 'boolean' | 'file';
  defaultValue?: string | boolean;
};

export type CommandDefinition = {
  name: string;
  description: string;
  options: CommandOption[];
  examples: string[];
};

// Initialize commands map
const commandsMap: Record<string, Record<string, CommandDefinition>> = {
  oas: {
    bundle: {
      name: 'bundle',
      description: 'Processes an Open API Specification (OAS) file that contains references to other files, merging them into a single consolidated OAS file.',
      options: [
        { name: 'spec', shortName: 's', description: 'Path to the Open API specification file that contains references to external components.', required: true, type: 'file' },
        { name: 'output', shortName: 'o', description: 'Specifies the filename where the consolidated specification will be saved.', required: false, type: 'string' }
      ],
      examples: [
        'api-rtl oas bundle --spec ./path/to/spec.yaml',
        'api-rtl oas bundle --spec ./path/to/spec.yaml --output ./path/to/output_spec.yaml'
      ]
    },
    check: {
      name: 'check',
      description: 'Validates Open API Specifications to ensure they are syntactically correct and conform to standards.',
      options: [
        { name: 'spec', shortName: 's', description: 'Path to the Open API specification file that needs to be validated.', required: true, type: 'file' },
        { name: 'output', shortName: 'o', description: 'Directory where files containing reports about the operation will be saved.', required: false, type: 'string' },
        { name: 'compare-to', shortName: 'c', description: 'Path to a second Open API specification file against which to perform a backward compatibility check.', required: false, type: 'file' },
        { name: 'run-only', shortName: 'r', description: 'Specifies which checks to run. Possible values are corp, spectral, and backcomp.', required: false, type: 'string' }
      ],
      examples: [
        'api-rtl oas check --spec ./path/to/spec.yaml',
        'api-rtl oas check --spec ./path/to/spec.yaml --output ./output',
        'api-rtl oas check --spec ./path/to/spec.yaml --compare-to ./path/to/previous_spec.yaml',
        'api-rtl oas check --spec ./path/to/spec.yaml --run-only spectral'
      ]
    },
    preview: {
      name: 'preview',
      description: 'Launches a browser window showing how the given OpenAPI specification will present in the Developer Portal.',
      options: [
        { name: 'spec', shortName: 's', description: 'Path to the Open API specification file that you want to preview.', required: true, type: 'file' }
      ],
      examples: [
        'api-rtl oas preview --spec ./path/to/spec.yaml'
      ]
    },
    proxy: {
      name: 'proxy',
      description: 'Starts an HTTP proxy process that validates requests and responses comply with the given OpenAPI specification.',
      options: [
        { name: 'spec', shortName: 's', description: 'Path to the Open API specification file.', required: true, type: 'file' },
        { name: 'url', shortName: 'u', description: 'The upstream endpoint that the proxy will forward requests to.', required: true, type: 'string' },
        { name: 'port', shortName: 'p', description: 'A port on which the proxy will listen on.', required: false, type: 'string' }
      ],
      examples: [
        'api-rtl oas proxy --spec ./path/to/spec.yaml --url https://api.example.com --port 8080'
      ]
    },
    strip: {
      name: 'strip',
      description: 'Removes all company-specific constructs from an OpenAPI specification making it suitable for external consumption.',
      options: [
        { name: 'spec', shortName: 's', description: 'Path to the Open API specification to strip non-public references from.', required: true, type: 'file' },
        { name: 'output', shortName: 'o', description: 'Specifies the filename where the cleaned specification will be saved to.', required: false, type: 'string' }
      ],
      examples: [
        'api-rtl oas strip --spec ./path/to/spec.yaml',
        'api-rtl oas strip --spec ./path/to/spec.yaml --output ./path/to/output_spec.yaml'
      ]
    }
  },
  mock: {
    check: {
      name: 'check',
      description: 'Performs quality checks on a Mockoon configuration.',
      options: [
        { name: 'spec', shortName: 's', description: 'The Open API specification file against which the mock file will be checked.', required: true, type: 'file' },
        { name: 'mockoon', shortName: 'm', description: 'The Mockoon file that will be validated.', required: true, type: 'file' },
        { name: 'postman', shortName: 'p', description: 'A Postman test collection that verified the behavior of the Mock.', required: false, type: 'file' },
        { name: 'output', shortName: 'o', description: 'Directory where the results of the validation will be saved.', required: false, type: 'string' }
      ],
      examples: [
        'api-rtl mock check --spec ./path/to/spec.yaml --mockoon ./path/to/mockoon.json',
        'api-rtl mock check --spec ./path/to/spec.yaml --mockoon ./path/to/mockoon.json --output ./path/to/output_directory',
        'api-rtl mock check -s ./path/to/spec.yaml -m ./path/to/mockoon.json -p ./path/to/postman.json'
      ]
    },
    proxy: {
      name: 'proxy',
      description: 'Starts a Mockoon process behind an HTTP proxy process that validates the request & response payloads against the associated OpenAPI specification.',
      options: [
        { name: 'spec', shortName: 's', description: 'Path to Open API Specification that will be used to start a validation proxy.', required: true, type: 'file' },
        { name: 'mockoon', shortName: 'm', description: 'Path to the Mockoon file. It will be used to start a mock.', required: true, type: 'file' },
        { name: 'port', shortName: 'p', description: 'Port to run validation server on.', required: false, type: 'string' }
      ],
      examples: [
        'api-rtl mock proxy -s ./path/to/spec.yaml -m ./path/to/mockoon.json -p 8080'
      ]
    }
  },
  project: {
    new: {
      name: 'new',
      description: 'Generates a new API project from a template.',
      options: [
        { name: 'name', description: 'Name of the project to create.', required: true, type: 'string' },
        { name: 'namespace', description: 'Namespace of the api. Translates technically to the api context-root/base path.', required: true, type: 'string' },
        { name: 'spec-versions', description: 'Comma separated list of complete specification versions. e.g. "v1.0.1,v2.0.2".', required: true, type: 'string' },
        { name: 'visibility', description: 'Visibility of the product on the API Store. Default is external.', required: false, type: 'string', defaultValue: 'external' },
        { name: 'api-store-id', description: 'API Store ID (UUID) for your API from the store.', required: false, type: 'string' },
        { name: 'description', description: 'Description of the project to create.', required: false, type: 'string' },
        { name: 'dev-email', description: "Dev team's email distribution list.", required: false, type: 'string' },
        { name: 'init-file', shortName: 'f', description: 'Location of api.init.yaml file.', required: false, type: 'file' }
      ],
      examples: [
        'api-rtl project new --name rtl-test-1 --namespace /rtltest --spec-versions v1.0.1,v2.2.0',
        'api-rtl project new -f ./path/to/api.init.yaml'
      ]
    }
  },
  gateway: {
    configure: {
      name: 'configure',
      description: 'Facilitates the configuration of a new Gateway.',
      options: [
        { name: 'dry-run', description: 'Write the gateway configuration without configuring it in API Gateway.', required: false, type: 'boolean' },
        { name: 'output', shortName: 'o', description: 'Folder to output the gateway configuration to.', required: false, type: 'string' },
        { name: 'environment', shortName: 'e', description: 'Environment to deploy the Gateway to (e.g. dev, uat, prod).', required: true, type: 'string' },
        { name: 'deployment-target', shortName: 'd', description: 'Allowed values are "api" (default) and "mock".', required: false, type: 'string', defaultValue: 'api' },
        { name: 'gateway-config', shortName: 'g', description: 'Folder in which your gateway configuration files are located.', required: true, type: 'string' },
        { name: 'gateway-env-config', description: 'Location of Env Overrides for Gateway Configuration.', required: false, type: 'string' },
        { name: 'spec', shortName: 's', description: 'Location of OAS Spec to use as a base.', required: true, type: 'file' },
        { name: 'change-id', shortName: 'c', description: 'Change ID to use when configuring gateway.', required: false, type: 'string' },
        { name: 'api-store-id', description: 'API Store UUID to configure.', required: true, type: 'string' },
        { name: 'service-name', description: 'Name of Service to create in Gateway.', required: true, type: 'string' },
        { name: 'version', description: 'Version of specs we are dealing with.', required: true, type: 'string' },
        { name: 'sub-product', description: 'Sub-Product to configure.', required: false, type: 'string', defaultValue: 'Default' },
        { name: 'seal-id', description: 'SEAL ID of the product we are configuring.', required: true, type: 'string' },
        { name: 'api-config', shortName: 'a', description: 'Location of the API config file, relative to current location.', required: false, type: 'file' }
      ],
      examples: [
        'api-rtl gateway configure --environment dev --api-store-id 11d9ae37-b6ad-4c23-88ec-724db99c93cb --service-name test --version v3.0 --gateway-config v3/gateway --spec spec.yaml --output generatedConfig --seal-id 109032',
        'api-rtl gateway configure --api-config test/api.config.yaml --environment dev --version v3.0 --output generatedConfig',
        'api-rtl gateway configure --api-config test/api.config.yaml --environment dev --version v3.0 --output generatedConfig --dry-run'
      ]
    }
  },
  entitlements: {
    policy: {
      name: 'policy',
      description: 'Generates a set of entitlements-acm access policies for an API to support coarse-grained API access control.',
      options: [
        { name: 'spec', shortName: 's', description: 'The Open API Specification to work with.', required: true, type: 'file' },
        { name: 'product_code', shortName: 'p', description: 'The associated Product Code that the policy is associated with.', required: true, type: 'string' },
        { name: 'output', shortName: 'o', description: 'If present, the policy will be written to the named file.', required: false, type: 'string' }
      ],
      examples: [
        'api-rtl entitlements-acm policy --spec v1/specs/oas.yaml --product_code MYPRODUCT',
        'api-rtl entitlements-acm policy -s v1/specs/oas.yml -p MYPRODUCT -o policy.txt'
      ]
    }
  }
};

// List of available commands for dropdown
const availableCommands = [
  { value: 'oas:bundle', label: 'OAS Bundle', icon: <FileCode className="w-4 h-4 mr-2" /> },
  { value: 'oas:check', label: 'OAS Check', icon: <Check className="w-4 h-4 mr-2" /> },
  { value: 'oas:preview', label: 'OAS Preview', icon: <Book className="w-4 h-4 mr-2" /> },
  { value: 'oas:proxy', label: 'OAS Proxy', icon: <Server className="w-4 h-4 mr-2" /> },
  { value: 'oas:strip', label: 'OAS Strip', icon: <FileText className="w-4 h-4 mr-2" /> },
  { value: 'mock:check', label: 'Mock Check', icon: <Database className="w-4 h-4 mr-2" /> },
  { value: 'mock:proxy', label: 'Mock Proxy', icon: <Server className="w-4 h-4 mr-2" /> },
  { value: 'project:new', label: 'Project New', icon: <FileText className="w-4 h-4 mr-2" /> },
  { value: 'gateway:configure', label: 'Gateway Configure', icon: <Shield className="w-4 h-4 mr-2" /> },
  { value: 'entitlements:policy', label: 'Entitlements Policy', icon: <Shield className="w-4 h-4 mr-2" /> }
];

const LifecycleActionsPage: React.FC = () => {
  const [selectedCommand, setSelectedCommand] = useState<string>('oas:check');
  const [commandOptions, setCommandOptions] = useState<Record<string, any>>({});
  const [executionOutput, setExecutionOutput] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<string>('JSON');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('execution');
  const [projectPath, setProjectPath] = useState<string>('');
  // Get command definition based on selected command
  const getCommandDefinition = (): CommandDefinition | null => {
    const [commandType, subCommand] = selectedCommand.split(':');
    return commandsMap[commandType]?.[subCommand] || null;
  };

  // Handle command selection
  const handleCommandSelect = (value: string) => {
    setSelectedCommand(value);
    setCommandOptions({});
    setExecutionOutput(null);
    setError(null);
  };

  // Handle option change
  const handleOptionChange = (name: string, value: any) => {
    setCommandOptions(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle command execution
  const handleExecute = (isDryRun: boolean = false) => {
    setIsLoading(true);
    setError(null);
    setExecutionOutput(null);
    
    // Mock execution for now - in a real implementation, this would call an API
    setTimeout(() => {
      setIsLoading(false);
      const [commandType, subCommand] = selectedCommand.split(':');
      
      try {
        // Simulate command execution
        if (isDryRun) {
          // Show the command that would be executed
          const command = `api-rtl ${commandType} ${subCommand} ${Object.entries(commandOptions)
            .map(([key, value]) => {
              if (value === true) return `--${key}`;
              if (value) return `--${key} "${value}"`;
              return '';
            })
            .filter(Boolean)
            .join(' ')}`;
            
          setExecutionOutput(`Dry run of command:\n${command}`);
        } else {
          // Mock some execution output based on the command
          let output = "Command executed successfully.\n\n";
          
          if (commandType === 'oas' && subCommand === 'check') {
            output += `Validating ${commandOptions.spec || 'specification'}...\n`;
            output += "✓ OAS syntax is valid\n";
            output += "✓ References resolve correctly\n";
            output += "✓ Security definitions are valid\n";
            output += "✓ Required properties are defined\n\n";
            output += "Validation complete with 0 errors and 2 warnings.\n";
            output += "Warnings:\n";
            output += "- Operation IDs should follow camelCase naming convention\n";
            output += "- Consider adding more detailed descriptions to endpoints";
          } else if (commandType === 'mock' && subCommand === 'check') {
            output += `Checking mock configuration ${commandOptions.mockoon || 'file'}...\n`;
            output += "✓ Mock endpoints match OAS definition\n";
            output += "✓ Response examples are valid\n";
            output += "✓ Status codes are appropriate\n\n";
            output += "Mock validation complete with 0 errors.";
          } else {
            output += `Executed ${commandType} ${subCommand} command with options:\n`;
            output += JSON.stringify(commandOptions, null, 2);
          }
          
          setExecutionOutput(output);
        }
      } catch (err) {
        setError(`Error executing command: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }, 1500);
  };

  // Handle file selection
  const handleFileSelect = (option: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleOptionChange(option, file.name);
    }
  };

  return (
    <div className="flex-1 overflow-auto p-2 md:p-8 lg:p-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-teal-600 mb-6">API Lifecycle Actions</h1>
        
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Action parameters</h2>
          
          {/* Command Selection & Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Command Selection */}
            <div>
              <label className="text-sm font-medium text-gray-500 mb-1 block">Command <span className="text-red-500">*</span></label>
              <CommandSelector 
                availableCommands={availableCommands}
                selectedCommand={selectedCommand}
                onSelect={handleCommandSelect}
              />
            </div>
            
            {/* Options */}
            <div>
              <label className="text-sm font-medium text-gray-500 mb-1 block">Options <span className="text-red-500">*</span></label>
              <Select value="bundle" onValueChange={() => {}}>
                <SelectTrigger>
                  <SelectValue placeholder="Select options" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bundle">Bundle</SelectItem>
                  <SelectItem value="no-bundle">No Bundle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Output Format */}
            <div>
              <label className="text-sm font-medium text-gray-500 mb-1 block">Output Format</label>
              <Select value={outputFormat} onValueChange={setOutputFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JSON">JSON</SelectItem>
                  <SelectItem value="YAML">YAML</SelectItem>
                  <SelectItem value="Text">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Tags */}
            <div>
              <label className="text-sm font-medium text-gray-500 mb-1 block">Tags</label>
              <Input placeholder="Find or Enter to add a label" />
            </div>
          </div>
          
          {/* Command Options */}
          <CommandOptions 
            commandDefinition={getCommandDefinition()}
            options={commandOptions}
            onChange={handleOptionChange}
            onFileSelect={handleFileSelect}
          />
          
          {/* Action Description */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Action Description</h3>
            <CommandDescription commandDefinition={getCommandDefinition()} />
          </div>
          
          {/* Execute Actions */}
          <div className="flex justify-end gap-2 mb-8">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => handleExecute(true)}
              disabled={isLoading}
            >
              <Terminal className="h-4 w-4" />
              <span>Dry-Run</span>
            </Button>
            <Button 
              className="bg-teal-600 hover:bg-teal-700 flex items-center gap-2"
              onClick={() => handleExecute(false)}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCcw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span>Run</span>
            </Button>
          </div>
          
          {/* Execution Results */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="execution">Execution</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="documentation">Documentation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="execution">
              <ExecutionResults 
                output={executionOutput}
                error={error}
                isLoading={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="history">
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground">Execution history will be displayed here...</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documentation">
              <Card>
                <CardContent className="p-6">
                  <div className="prose max-w-none">
                    <h3>Command Documentation</h3>
                    <p>The API Lifecycle Actions CLI provides a set of commands to help with the API lifecycle:</p>
                    
                    <h4>OAS Related Commands</h4>
                    <ul>
                      <li><strong>bundle</strong> - Merges API specs with external references into a single file</li>
                      <li><strong>check</strong> - Validates specs for correctness and best practices</li>
                      <li><strong>preview</strong> - Shows how the API will look in the developer portal</li>
                      <li><strong>proxy</strong> - Creates a validation proxy for requests/responses</li>
                      <li><strong>strip</strong> - Removes internal fields for public consumption</li>
                    </ul>
                    
                    <h4>Mock Related Commands</h4>
                    <ul>
                      <li><strong>check</strong> - Validates a Mockoon configuration against the API spec</li>
                      <li><strong>proxy</strong> - Runs a validating proxy with a mock backend</li>
                    </ul>
                    
                    <h4>Gateway Commands</h4>
                    <ul>
                      <li><strong>configure</strong> - Creates and applies gateway configuration</li>
                    </ul>
                    
                    <p>For more details, please refer to the complete <a href="#" className="text-blue-600 hover:underline">documentation</a>.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default LifecycleActionsPage;