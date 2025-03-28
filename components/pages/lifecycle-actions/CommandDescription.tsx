import React from 'react';
import { CommandDefinition } from './LifecycleActionsPage';
import { Card, CardContent } from '@/components/ui/card';
import { Maximize2 } from 'lucide-react';

interface CommandDescriptionProps {
  commandDefinition: CommandDefinition | null;
}

const CommandDescription: React.FC<CommandDescriptionProps> = ({ commandDefinition }) => {
  if (!commandDefinition) {
    return (
      <Card>
        <CardContent className="p-4 text-gray-500">
          Select a command to see its description.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative">
      <CardContent className="p-4">
        <div className="prose max-w-none">
          <p>{commandDefinition.description}</p>
          
          {commandDefinition.examples.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold">Examples:</h4>
              <div className="bg-gray-100 p-2 rounded-md mt-2 font-mono text-xs overflow-x-auto">
                {commandDefinition.examples.map((example, index) => (
                  <div key={index} className="mb-1">{example}</div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
          <Maximize2 className="h-4 w-4" />
        </button>
      </CardContent>
    </Card>
  );
};

export default CommandDescription;