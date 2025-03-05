import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowRight, 
  MoreHorizontal,
  Terminal,
  FileText,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define types for command history entries
interface CommandHistoryEntry {
  id: string;
  command: string;
  subCommand: string;
  timestamp: Date;
  status: 'success' | 'failed' | 'running';
  duration: number; // in seconds
  context: string;
  options: Record<string, any>;
}

interface CommandHistoryProps {
  history: CommandHistoryEntry[];
  onSelect: (entry: CommandHistoryEntry) => void;
  onRerun: (entry: CommandHistoryEntry) => void;
}

const CommandHistory: React.FC<CommandHistoryProps> = ({
  history,
  onSelect,
  onRerun
}) => {
  // Function to render an icon based on command type
  const getCommandIcon = (command: string) => {
    switch (command.toLowerCase()) {
      case 'oas':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'mock':
        return <Database className="h-4 w-4 text-purple-500" />;
      default:
        return <Terminal className="h-4 w-4 text-gray-500" />;
    }
  };

  // Function to format duration
  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No command history available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {history.map((entry) => (
            <div 
              key={entry.id} 
              className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelect(entry)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  {getCommandIcon(entry.command)}
                  <span className="font-medium">{`${entry.command} ${entry.subCommand}`}</span>
                  <Badge variant={
                    entry.status === 'success' ? 'default' : 
                    entry.status === 'failed' ? 'destructive' : 
                    'outline'
                  }>
                    {entry.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">{formatDuration(entry.duration)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span>Context: {entry.context}</span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {Object.entries(entry.options).map(([key, value]) => (
                  <Badge key={key} variant="outline" className="text-xs">
                    {`--${key}: ${value}`}
                  </Badge>
                ))}
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-400">
                  {entry.timestamp.toLocaleString()}
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onRerun(entry);
                    }}
                  >
                    <ArrowRight className="h-4 w-4" />
                    <span className="ml-1">Rerun</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommandHistory;