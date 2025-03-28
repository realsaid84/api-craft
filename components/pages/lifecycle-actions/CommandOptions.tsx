import React from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Folder, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CommandDefinition } from './LifecycleActionsPage';

interface CommandOptionsProps {
  commandDefinition: CommandDefinition | null;
  options: Record<string, any>;
  onChange: (name: string, value: any) => void;
  onFileSelect: (option: string, e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CommandOptions: React.FC<CommandOptionsProps> = ({
  commandDefinition,
  options,
  onChange,
  onFileSelect
}) => {
  if (!commandDefinition) {
    return (
      <div className="p-4 bg-gray-50 rounded-md mb-6">
        <p className="text-gray-500">Select a command to see available options.</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-500 mb-2">Command Options</h3>
      <div className="p-4 bg-gray-50 rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {commandDefinition.options.map((option) => (
            <div key={option.name} className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor={option.name} className="text-sm font-medium">
                  {option.name}
                  {option.shortName && <span className="text-gray-400 ml-1">(-{option.shortName})</span>}
                  {option.required && <span className="text-red-500">*</span>}
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{option.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {option.type === 'boolean' ? (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={option.name}
                    checked={options[option.name] || false}
                    onCheckedChange={(checked) => onChange(option.name, checked)}
                  />
                  <Label htmlFor={option.name} className="text-sm">
                    Enable
                  </Label>
                </div>
              ) : option.type === 'file' ? (
                <div className="flex items-center gap-2">
                  <Input
                    id={option.name}
                    value={options[option.name] || ''}
                    onChange={(e) => onChange(option.name, e.target.value)}
                    placeholder={`Path to ${option.name}`}
                    className="flex-1"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 w-full cursor-pointer"
                      onChange={(e) => onFileSelect(option.name, e)}
                    />
                    <Button variant="outline" type="button" size="icon">
                      <Folder className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Input
                  id={option.name}
                  value={options[option.name] || ''}
                  onChange={(e) => onChange(option.name, e.target.value)}
                  placeholder={option.description}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommandOptions;