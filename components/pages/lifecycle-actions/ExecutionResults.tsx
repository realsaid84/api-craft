import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Check } from 'lucide-react';

interface ExecutionResultsProps {
  output: string | null;
  error: string | null;
  isLoading: boolean;
}

const ExecutionResults: React.FC<ExecutionResultsProps> = ({
  output,
  error,
  isLoading
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-4" />
          <p className="text-gray-600">Executing command...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!output) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="bg-gray-50 p-4 rounded-md text-gray-500 min-h-[150px] flex items-center justify-center">
            <p>Run a command to see execution results here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Process output to highlight success messages
  const processedOutput = output.split('\n').map((line, index) => {
    if (line.startsWith('✓') || line.includes('successfully')) {
      return (
        <div key={index} className="text-green-600 flex items-start">
          {!line.startsWith('✓') && <Check className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />}
          <span>{line}</span>
        </div>
      );
    } else if (line.startsWith('-') || line.toLowerCase().includes('warning')) {
      return <div key={index} className="text-amber-600">{line}</div>;
    } else if (line.toLowerCase().includes('error') || line.toLowerCase().includes('failed')) {
      return <div key={index} className="text-red-600">{line}</div>;
    }
    return <div key={index}>{line}</div>;
  });

  return (
    <Card>
      <CardContent className="p-6">
        <div className="bg-gray-50 p-4 rounded-md font-mono text-sm whitespace-pre-wrap">
          {processedOutput}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExecutionResults;