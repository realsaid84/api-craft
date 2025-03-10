'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { convertToGherkin, convertToArazzo } from './Generator';
import { Download, FileBadge, FileText, Folder, Archive } from 'lucide-react';

interface ExportOptionsProps {
  features: any[];
  format: string;
  onClose: () => void;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ features, format, onClose }) => {
  const [exportType, setExportType] = useState<'single' | 'multiple' | 'zip'>('multiple');
  const [includeExamples, setIncludeExamples] = useState(true);
  const [includeDocs, setIncludeDocs] = useState(true);
  const [exportName, setExportName] = useState('api-tests');
  const [exporting, setExporting] = useState(false);
  
  // Function to download a text file
  const downloadTextFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Function to handle export
  const handleExport = () => {
    setExporting(true);
    
    try {
      // Handle different export types
      if (exportType === 'single') {
        // Export all features to a single file
        let content = '';
        
        if (format === 'gherkin') {
          // Combine all features in Gherkin format
          features.forEach(feature => {
            content += convertToGherkin(feature) + '\n\n';
          });
          
          downloadTextFile(content, `${exportName}.feature`);
        } else {
          // Combine all features in Arazzo format
          content = '// Generated Arazzo Tests\n\n';
          features.forEach(feature => {
            content += convertToArazzo(feature) + '\n\n';
          });
          
          downloadTextFile(content, `${exportName}.js`);
        }
      } else if (exportType === 'multiple') {
        // Export each feature to a separate file
        features.forEach((feature, index) => {
          const featureName = feature.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
          
          if (format === 'gherkin') {
            const content = convertToGherkin(feature);
            downloadTextFile(content, `${featureName}.feature`);
          } else {
            const content = convertToArazzo(feature);
            downloadTextFile(content, `${featureName}.js`);
          }
          
          // Add a small delay between downloads
          setTimeout(() => {}, 200 * index);
        });
      } else if (exportType === 'zip') {
        // For simplicity, we'll simulate a zip download in this example
        // In a real implementation, you would use a library like JSZip
        
        alert('In a real implementation, this would create a ZIP file with all test files.');
        
        // Simulate downloading a zip file
        setTimeout(() => {
          const a = document.createElement('a');
          a.href = '#';
          a.download = `${exportName}.zip`;
          a.textContent = 'Download ZIP';
          a.addEventListener('click', (e) => {
            e.preventDefault();
            alert('This is a placeholder for ZIP download functionality.');
          });
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }, 500);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error}`);
    } finally {
      // Reset export state after a delay
      setTimeout(() => {
        setExporting(false);
        onClose();
      }, 1000);
    }
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export BDD Tests</DialogTitle>
          <DialogDescription>
            Choose how you want to export the generated tests
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div className="space-y-4">
            <Label className="text-base">Export Format</Label>
            <div className="p-3 border rounded-md bg-gray-50">
              <div className="flex items-center">
                <FileBadge className="h-10 w-10 text-teal-600 mr-3" />
                <div>
                  <h4 className="font-medium">
                    {format === 'gherkin' ? 'Gherkin Feature Files' : 'Arazzo Test Scripts'}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {format === 'gherkin' ? 
                      'Compatible with Cucumber, Behave, and other BDD frameworks' : 
                      'Optimized for Arazzo contract testing framework'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label className="text-base">Export Options</Label>
            <RadioGroup 
              value={exportType}
              onValueChange={(value) => setExportType(value as 'single' | 'multiple' | 'zip')}
              className="space-y-3"
            >
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="multiple" id="multiple" className="mt-1" />
                <div className="grid gap-1.5">
                  <Label htmlFor="multiple" className="font-medium">Multiple Files</Label>
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-gray-500" />
                    <p className="text-sm text-gray-500">Export each feature as a separate file</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="single" id="single" className="mt-1" />
                <div className="grid gap-1.5">
                  <Label htmlFor="single" className="font-medium">Single File</Label>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <p className="text-sm text-gray-500">Combine all features into one file</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="zip" id="zip" className="mt-1" />
                <div className="grid gap-1.5">
                  <Label htmlFor="zip" className="font-medium">ZIP Archive</Label>
                  <div className="flex items-center gap-2">
                    <Archive className="h-4 w-4 text-gray-500" />
                    <p className="text-sm text-gray-500">Create a ZIP file with all tests</p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="export-name" className="text-base">File Name</Label>
            <Input 
              id="export-name"
              value={exportName}
              onChange={(e) => setExportName(e.target.value)}
              placeholder="Enter export file name"
            />
          </div>
          
          <div className="space-y-3">
            <Label className="text-base">Include</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="examples"
                  checked={includeExamples}
                  onCheckedChange={(checked) => setIncludeExamples(!!checked)}
                />
                <Label htmlFor="examples" className="text-sm">Include example data</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="docs"
                  checked={includeDocs}
                  onCheckedChange={(checked) => setIncludeDocs(!!checked)}
                />
                <Label htmlFor="docs" className="text-sm">Include documentation</Label>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={exporting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleExport}
            disabled={exporting}
            className="bg-teal-600 hover:bg-teal-700 flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            <span>{exporting ? 'Exporting...' : 'Export'}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { ExportOptions };