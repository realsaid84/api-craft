import React, { useState,useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Info, 
  Terminal, 
  FileText, 
  BarChart3,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play
} from 'lucide-react';

// Define status types for lifecycle checks
type CheckStatus = 'success' | 'warning' | 'error' | 'info' | 'pending';

// Define a lifecycle check item
interface LifecycleCheck {
  id: string;
  name: string;
  category: string;
  status: CheckStatus;
  lastRun: Date | null;
  message: string;
  details?: string;
}

// Mock data for the lifecycle checks
const initialChecks: LifecycleCheck[] = [
  {
    id: '1',
    name: 'OpenAPI Validation',
    category: 'OAS',
    status: 'success',
    lastRun: new Date(Date.now() - 3600000), // 1 hour ago
    message: 'OpenAPI specification is valid.'
  },
  {
    id: '2',
    name: 'Security Definitions',
    category: 'OAS',
    status: 'warning',
    lastRun: new Date(Date.now() - 3600000),
    message: 'Security schemes defined, but missing OAuth scopes.',
    details: 'Add appropriate OAuth scopes to improve security definitions.'
  },
  {
    id: '3',
    name: 'Mock Validation',
    category: 'Mock',
    status: 'error',
    lastRun: new Date(Date.now() - 7200000), // 2 hours ago
    message: 'Mock responses do not match OpenAPI spec.',
    details: 'Response for /users/{id} endpoint is missing required fields.'
  },
  {
    id: '4',
    name: 'Gateway Configuration',
    category: 'Gateway',
    status: 'pending',
    lastRun: null,
    message: 'Gateway configuration not yet validated.'
  },
  {
    id: '5',
    name: 'Backward Compatibility',
    category: 'OAS',
    status: 'success',
    lastRun: new Date(Date.now() - 10800000), // 3 hours ago
    message: 'API is backward compatible with previous version.'
  },
  {
    id: '6',
    name: 'Documentation Completeness',
    category: 'OAS',
    status: 'info',
    lastRun: new Date(Date.now() - 14400000), // 4 hours ago
    message: 'API documentation is 85% complete.',
    details: 'Improve descriptions for /orders endpoints.'
  },
  {
    id: '7',
    name: 'Access Control Policies',
    category: 'Entitlements',
    status: 'warning',
    lastRun: new Date(Date.now() - 18000000), // 5 hours ago
    message: 'Access control policies need review.',
    details: 'Some endpoints may have overly permissive access controls.'
  }
];

const LifecycleStatusDashboard: React.FC = () => {
  const [checks, setChecks] = useState<LifecycleCheck[]>(initialChecks);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [repositoryUrl, setRepositoryUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

// Function to handle file selection
const handleFileSelect = () => {
  if (fileInputRef.current) {
    fileInputRef.current.click();
  }
};

// Function to handle when a file is selected
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const filePath = e.target.value;
  // This will give us something like "C:\fakepath\file.yaml" due to browser security
  // In a real app, you'd handle this server-side or use a file system API
  
  // Extract just the filename from the path for demonstration
  const fileName = filePath.split('\\').pop() || filePath;
  
  if (fileName) {
    setRepositoryUrl(`path/to/selected/${fileName}`);
    
    // In a real application with file system access, you'd set the actual path:
    // setRepositoryUrl(actualPath);
  }
  
  // Reset the input so the same file can be selected again
  e.target.value = '';
};

  // Calculate status counts
  const statusCounts = checks.reduce(
    (acc, check) => {
      acc[check.status]++;
      return acc;
    },
    { success: 0, warning: 0, error: 0, info: 0, pending: 0 } as Record<CheckStatus, number>
  );
  
  // Calculate overall health percentage
  const totalChecks = checks.length;
  const completedChecks = checks.filter(check => check.status !== 'pending').length;
  const successChecks = statusCounts.success;
  const healthPercentage = totalChecks > 0 
    ? Math.round((successChecks / totalChecks) * 100) 
    : 0;
  
  // Get status color based on health percentage
  const getHealthColor = () => {
    if (healthPercentage >= 80) return 'text-green-600';
    if (healthPercentage >= 60) return 'text-amber-600';
    return 'text-red-600';
  };
  
  // Filter checks based on active tab
  const getFilteredChecks = () => {
    if (activeTab === 'all') return checks;
    if (activeTab === 'issues') {
      return checks.filter(check => ['warning', 'error'].includes(check.status));
    }
    return checks.filter(check => check.category.toLowerCase() === activeTab.toLowerCase());
  };
  
  // Get icon for status
  const getStatusIcon = (status: CheckStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };
  
  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleString();
  };
  
  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
      // Randomly update a couple of statuses to simulate changes
      setChecks(prev => {
        const newChecks = [...prev];
        const randomIndex1 = Math.floor(Math.random() * newChecks.length);
        const randomIndex2 = Math.floor(Math.random() * newChecks.length);
        
        const possibleStatuses: CheckStatus[] = ['success', 'warning', 'error', 'info'];
        newChecks[randomIndex1] = {
          ...newChecks[randomIndex1],
          status: possibleStatuses[Math.floor(Math.random() * possibleStatuses.length)],
          lastRun: new Date()
        };
        
        newChecks[randomIndex2] = {
          ...newChecks[randomIndex2],
          status: possibleStatuses[Math.floor(Math.random() * possibleStatuses.length)],
          lastRun: new Date()
        };
        
        return newChecks;
      });
    }, 1500);
  };
  
  // Handle run action for a check
  const handleRunCheck = (id: string) => {
    setChecks(prev => 
      prev.map(check => 
        check.id === id 
          ? { ...check, status: 'pending', message: 'Check in progress...', lastRun: null } 
          : check
      )
    );
    
    // Simulate check execution
    setTimeout(() => {
      setChecks(prev => 
        prev.map(check => {
          if (check.id === id) {
            const possibleStatuses: CheckStatus[] = ['success', 'warning', 'error', 'info'];
            const newStatus = possibleStatuses[Math.floor(Math.random() * possibleStatuses.length)];
            let message = '';
            
            switch (newStatus) {
              case 'success':
                message = `${check.name} completed successfully.`;
                break;
              case 'warning':
                message = `${check.name} completed with warnings.`;
                break;
              case 'error':
                message = `${check.name} failed.`;
                break;
              case 'info':
                message = `${check.name} completed with information.`;
                break;
            }
            
            return {
              ...check,
              status: newStatus,
              message,
              lastRun: new Date()
            };
          }
          return check;
        })
      );
    }, 2000);
  };

const [projectType, setProjectType] = useState('api-project');
const [branchName, setBranchName] = useState('develop');
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-teal-600 mb-6">API Lifecycle Action Grid</h1>
      {/* Project Selection */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-1/4">
        <label className="text-sm font-medium text-gray-500 mb-1 block">Project Type</label>
        <Select value={projectType} onValueChange={setProjectType}>
          <SelectTrigger>
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="api-project">API Project</SelectItem>
            <SelectItem value="git-project">Git Project</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full md:w-3/4">
        <label className="text-sm font-medium text-gray-500 mb-1 block">
          {projectType === 'git-project' ? 'Repository URL' : 'Project Location'}
        </label>
        <div className="flex gap-2">
          <div className="w-full relative flex items-center">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {projectType === 'git-project' ? 
                <Terminal className="h-4 w-4" /> : 
                <FileText className="h-4 w-4" />
              }
            </div>
            <Input 
              className="pl-10" 
              placeholder={projectType === 'git-project' ? 
                "ssh://bitbucketdc.demodns.net:3000/projects/APIDEM" : 
                "l:\\workspace\\api\\projects\\demo\\v1\\specs\\demo-oas.yaml"
              }
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
            />
          </div>
          
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept=".yaml,.yml,.json"
          />
          
          <Button 
            variant="secondary" 
            disabled={projectType === 'git-project'}
            onClick={handleFileSelect}
          >
            Browse
          </Button>
        </div>
        
        {projectType === 'git-project' && (
          <div className="mt-2">
            <label className="text-sm font-medium text-gray-500 mb-1 block">Branch</label>
            <Input 
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              placeholder="develop"
            />
          </div>
        )}
      </div>
    </div>

          

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Overall Health Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Overall Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className={`text-5xl font-bold mb-2 ${getHealthColor()}`}>
                {healthPercentage}%
              </div>
              <div className="w-full mb-2">
                <Progress 
                  value={healthPercentage} 
                  className="h-2" 
                />
              </div>
              <div className="text-sm text-gray-500">
                {completedChecks} of {totalChecks} checks completed
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Status Summary Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Status Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Success: {statusCounts.success}</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span>Warnings: {statusCounts.warning}</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span>Errors: {statusCounts.error}</span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                <span>Info: {statusCounts.info}</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <span>Pending: {statusCounts.pending}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Actions Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span>Refresh All Checks</span>
              </Button>
              <Button 
                className="w-full flex items-center justify-center gap-2"
                variant="outline"
              >
                <BarChart3 className="h-4 w-4" />
                <span>View Detailed Report</span>
              </Button>
              <Button 
                className="w-full flex items-center justify-center gap-2"
                variant="outline"
              >
                <AlertCircle className="h-4 w-4" />
                <span>Fix Issues ({statusCounts.error + statusCounts.warning})</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Checks List */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Lifecycle Checks</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Last Refreshed: {new Date().toLocaleTimeString()}</span>
              <Button 
                size="sm" 
                variant="ghost" 
                className="p-2 h-8 w-8"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="issues">Issues</TabsTrigger>
              <TabsTrigger value="oas">OAS</TabsTrigger>
              <TabsTrigger value="mock">Mock</TabsTrigger>
              <TabsTrigger value="gateway">Gateway</TabsTrigger>
              <TabsTrigger value="entitlements">Entitlements</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-0">
              <div className="space-y-4">
                {getFilteredChecks().map((check) => (
                  <div key={check.id} className="p-4 border rounded-md hover:bg-gray-50">
                    <div className="flex justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getStatusIcon(check.status)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{check.name}</span>
                            <Badge variant="outline">{check.category}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{check.message}</p>
                          {check.details && (
                            <p className="text-xs text-gray-500 mt-1">{check.details}</p>
                          )}
                          <div className="text-xs text-gray-400 mt-2">
                            Last Run: {formatDate(check.lastRun)}
                          </div>
                        </div>
                      </div>
                      <div>
                        <Button 
                          size="sm" 
                          className="flex items-center gap-1"
                          disabled={check.status === 'pending'}
                          onClick={() => handleRunCheck(check.id)}
                        >
                          {check.status === 'pending' ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                          <span>{check.status === 'pending' ? 'Running...' : 'Run'}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {getFilteredChecks().length === 0 && (
                  <div className="text-center p-6 text-gray-500">
                    No checks found for the selected filter.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LifecycleStatusDashboard;