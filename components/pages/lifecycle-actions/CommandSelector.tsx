import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CommandOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CommandSelectorProps {
  availableCommands: CommandOption[];
  selectedCommand: string;
  onSelect: (value: string) => void;
}

const CommandSelector: React.FC<CommandSelectorProps> = ({
  availableCommands,
  selectedCommand,
  onSelect
}) => {
  // Group commands by category
  const groupedCommands = availableCommands.reduce<Record<string, CommandOption[]>>((acc, command) => {
    const [category] = command.value.split(':');
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(command);
    return acc;
  }, {});

  return (
    <Select value={selectedCommand} onValueChange={onSelect}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a command" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(groupedCommands).map(([category, commands]) => (
          <SelectGroup key={category}>
            <SelectLabel className="capitalize">{category}</SelectLabel>
            {commands.map((command) => (
              <SelectItem key={command.value} value={command.value} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  {command.icon}
                  <span>{command.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CommandSelector;