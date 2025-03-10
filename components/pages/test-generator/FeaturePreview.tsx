import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { xonokai } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { convertToGherkin, convertToArazzo } from './Generator';
import { Clipboard, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeaturePreviewProps {
  features: any[];
  format: string;
}

const FeaturePreview: React.FC<FeaturePreviewProps> = ({ features, format }) => {
  const [selectedFeature, setSelectedFeature] = useState<string>(features[0]?.name || '');
  const [copied, setCopied] = useState<boolean>(false);

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

      <Card className="border rounded-md overflow-hidden">
        <CardContent className="p-0">
          <Tabs defaultValue="code" className="w-full">
            <div className="border-b">
              <TabsList className="bg-transparent px-4 pt-2">
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="structure">Structure</TabsTrigger>
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

            <TabsContent value="structure" className="m-0 p-4">
              <FeatureStructureView feature={getSelectedFeature()} />
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

// Component to display feature structure in a tree-like view
const FeatureStructureView: React.FC<{ feature: any }> = ({ feature }) => {
  if (!feature) return null;

  // Function to try parsing JSON and determine if content is valid JSON
  const parseJsonContent = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      return {
        valid: true,
        parsed
      };
    } catch (e) {
      return {
        valid: false,
        parsed: null
      };
    }
  };

  // Function to render content with proper syntax highlighting based on type
  const renderContent = (content: string, language: string = 'json') => {
    if (language === 'json') {
      const { valid, parsed } = parseJsonContent(content);
      if (valid) {
        return (
          <SyntaxHighlighter
            language="json"
            style={xonokai}
            customStyle={{
              margin: '0.5rem 0',
              borderRadius: '0.25rem',
              fontSize: '0.8rem'
            }}
          >
            {JSON.stringify(parsed, null, 2)}
          </SyntaxHighlighter>
        );
      }
    }
    
    // Default case or non-JSON content
    return (
      <SyntaxHighlighter
        language={language}
        style={xonokai}
        customStyle={{
          margin: '0.5rem 0',
          borderRadius: '0.25rem',
          fontSize: '0.8rem'
        }}
      >
        {content}
      </SyntaxHighlighter>
    );
  };

  return (
    <div className="space-y-4 max-h-[550px] overflow-auto p-2">
      <div className="mb-4">
        <h3 className="text-lg font-bold">{feature.name}</h3>
        {feature.description && (
          <p className="text-gray-600">{feature.description}</p>
        )}
      </div>

      {feature.background && (
        <div className="mb-4 border-l-2 border-blue-400 pl-4">
          <h4 className="font-semibold text-blue-600">Background: {feature.background.title}</h4>
          <ul className="mt-2 space-y-1">
            {feature.background.steps.map((step: any, index: number) => (
              <li key={index} className="text-gray-700">
                <span className="text-blue-500 font-medium">{step.type}</span> {step.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-6">
        {feature.scenarios.map((scenario: any, scenarioIndex: number) => (
          <div key={scenarioIndex} className="border-l-2 border-green-400 pl-4">
            <h4 className="font-semibold text-green-600">{scenario.name}</h4>
            <ul className="mt-2 space-y-2">
              {scenario.steps.map((step: any, stepIndex: number) => (
                <li key={stepIndex} className="text-gray-700">
                  <div className="flex items-start">
                    <span 
                      className={`font-medium mr-2 ${
                        step.type === 'Given' ? 'text-purple-500' : 
                        step.type === 'When' ? 'text-amber-500' : 
                        'text-green-500'
                      }`}
                    >
                      {step.type}
                    </span> 
                    <span className="flex-1">{step.text}</span>
                  </div>
                  
                  {/* Render code blocks with syntax highlighting */}
                  {step.codeBlock && (
                    <div className="ml-6 mt-2">
                      {renderContent(step.codeBlock.content, step.codeBlock.language)}
                    </div>
                  )}
                  
                  {/* Handle special cases for parameters and request body mentions without code blocks */}
                  {!step.codeBlock && step.text.includes('parameters:') && (
                    <div className="ml-6 mt-2 bg-gray-800 text-gray-200 p-2 rounded text-sm">
                      {step.text.split('parameters:')[1].trim()}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export { FeaturePreview };