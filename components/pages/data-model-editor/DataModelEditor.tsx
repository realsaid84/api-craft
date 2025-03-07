'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Code, 
  AlertTriangle, 
  Plus, 
  Workflow, 
  GitCompare, 
  FileJson,
  Copy,
  Eye,
  Activity,
  Save,
  FormInput,
  FileCode
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EntityDialog, RelationshipDialog, AttributeDialog, ExportDialog, BootstrapAPIDialog, ForwardEngineerDialog } from './DataDesignDialogs';
import { MermaidDiagram } from './MarkdownRenderer';
import { useRouter } from 'next/navigation';


interface Entity {
  id: string;
  name: string;
  description: string;
}

interface Relationship {
  id: string;
  source: string;
  target: string;
  cardinality: string;
  label: string;
}

interface Attribute {
  id: string;
  name: string;
  type: string;
}

// Define a type for the attributes record
interface AttributesRecord {
  [entityName: string]: Attribute[];
}

const DataDesignEditor: React.FC = () => {
  const [viewTab, setViewTab] = useState<'code' | 'form' | 'preview'>('code');
  const [designTab, setDesignTab] = useState<'entities' | 'relationships' | 'attributes'>('entities');
  const [isInternal, setIsInternal] = useState<boolean>(false);
  const [modelName, setModelName] = useState<string>('Payment Instruction Domain Model');
  const [warningCount] = useState<number>(2);
  const [showExportDialog, setShowExportDialog] = useState<boolean>(false);
  const [showBootstrapAPIDialog, setShowBootstrapAPIDialog] = useState<boolean>(false);
  const [showFEDialog, setShowFEDialog] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<string>('markdown');
  const [apiSpec, setAPISpec] = useState<string>('openapi3');
  const [target, setTarget] = useState<string>('json');
  const router = useRouter();
  // Code editor state
  const [mermaidCode, setMermaidCode] = useState<string>(`erDiagram
    Payment ||--o| PaymentIdentifiers : has
    Payment ||--o| Value : has
    Payment ||--o| PaymentTypeInformation : contains
    Payment ||--o| Debtor : from
    Payment ||--o| DebtorAgent : processed_by
    Payment ||--o| Creditor : towards
    Payment ||--o| CreditorAgent : processed_by
    
    PaymentIdentifiers {
        string endToEndId
        object otherPaymentReferences
    }

    Value {
        string currency
        string amount
    }

    PaymentTypeInformation {
        string serviceLevelCode
        object localInstrumentCode
        string paymentContext
    }

    Debtor {
        object account
        string name
        object postalAddress
        object contactDetails
    }

    DebtorAgent {
        string name
        array financialInstitutionIds
        object postalAddress
    }

    Creditor {
        object account
        string name
        object postalAddress
    }

    CreditorAgent {
        string name
        array financialInstitutionIds
        object postalAddress
    }
`);

  // Form editor state
  const [entities, setEntities] = useState<Entity[]>([
    { id: '1', name: 'Payment', description: 'Core payment entity' },
    { id: '2', name: 'PaymentIdentifiers', description: 'Identifiers for payment' },
    { id: '3', name: 'Value', description: 'Payment value details' },
    { id: '4', name: 'PaymentTypeInformation', description: 'Payment type details' },
    { id: '5', name: 'Debtor', description: 'Sending party' },
    { id: '6', name: 'DebtorAgent', description: 'Sending party\'s bank' },
    { id: '7', name: 'Creditor', description: 'Receiving party' },
    { id: '8', name: 'CreditorAgent', description: 'Receiving party\'s bank' }
  ]);
  
  const [relationships, setRelationships] = useState<Relationship[]>([
    { id: '1', source: 'Payment', target: 'PaymentIdentifiers', cardinality: '||--o|', label: 'has' },
    { id: '2', source: 'Payment', target: 'Value', cardinality: '||--o|', label: 'has' },
    { id: '3', source: 'Payment', target: 'PaymentTypeInformation', cardinality: '||--o|', label: 'contains' },
    { id: '4', source: 'Payment', target: 'Debtor', cardinality: '||--o|', label: 'from' },
    { id: '5', source: 'Payment', target: 'DebtorAgent', cardinality: '||--o|', label: 'processed_by' },
    { id: '6', source: 'Payment', target: 'Creditor', cardinality: '||--o|', label: 'towards' },
    { id: '7', source: 'Payment', target: 'CreditorAgent', cardinality: '||--o|', label: 'processed_by' },
  ]);
  
  const [attributes, setAttributes] = useState<AttributesRecord>({
    'Payment': [
      { id: '1', name: 'requestedExecutionDate', type: 'string' },
      { id: '2', name: 'transferType', type: 'string' },
      { id: '3', name: 'paymentType', type: 'string' },
      { id: '4', name: 'paymentExpiresAt', type: 'string' }
    ],
    'PaymentIdentifiers': [
      { id: '1', name: 'endToEndId', type: 'string' },
      { id: '2', name: 'otherPaymentReferences', type: 'object' }
    ],
    'Value': [
      { id: '1', name: 'currency', type: 'string' },
      { id: '2', name: 'amount', type: 'string' }
    ],
    'PaymentTypeInformation': [
      { id: '1', name: 'serviceLevelCode', type: 'string' },
      { id: '2', name: 'localInstrumentCode', type: 'object' },
      { id: '3', name: 'paymentContext', type: 'string' }
    ],
    'Debtor': [
      { id: '1', name: 'account', type: 'object' },
      { id: '2', name: 'name', type: 'string' },
      { id: '3', name: 'postalAddress', type: 'object' },
      { id: '4', name: 'contactDetails', type: 'object' }
    ],
    'DebtorAgent': [
      { id: '1', name: 'name', type: 'string' },
      { id: '2', name: 'financialInstitutionIds', type: 'array' },
      { id: '3', name: 'postalAddress', type: 'object' }
    ],
    'Creditor': [
      { id: '1', name: 'account', type: 'object' },
      { id: '2', name: 'name', type: 'string' },
      { id: '3', name: 'postalAddress', type: 'object' }
    ],
    'CreditorAgent': [
      { id: '1', name: 'name', type: 'string' },
      { id: '2', name: 'financialInstitutionIds', type: 'array' },
      { id: '3', name: 'postalAddress', type: 'object' }
    ]
  });
  
  const [currentEntity, setCurrentEntity] = useState<string>('');
  const [showEntityDialog, setShowEntityDialog] = useState<boolean>(false);
  const [showRelationshipDialog, setShowRelationshipDialog] = useState<boolean>(false);
  const [showAttributeDialog, setShowAttributeDialog] = useState<boolean>(false);
  
  // Dialog state
  const [newEntityName, setNewEntityName] = useState<string>('');
  const [newEntityDescription, setNewEntityDescription] = useState<string>('');
  const [newAttributeName, setNewAttributeName] = useState<string>('');
  const [newAttributeType, setNewAttributeType] = useState<string>('string');
  const [relationshipSource, setRelationshipSource] = useState<string>('');
  const [relationshipTarget, setRelationshipTarget] = useState<string>('');
  const [relationshipCardinality, setRelationshipCardinality] = useState<string>('||--o|');
  const [relationshipLabel, setRelationshipLabel] = useState<string>('');
  
  // Color map for data types
  const typeColorMap: Record<string, string> = {
    'string': 'text-green-600',
    'number': 'text-blue-600',
    'boolean': 'text-amber-600',
    'object': 'text-pink-600',
    'array': 'text-purple-600',
    'date': 'text-indigo-600'
  };
  
  // Generate Mermaid code from form data
  const generateMermaidCode = (): string => {
    let code = "erDiagram\n";
    
    // Add relationships
    relationships.forEach(rel => {
      code += `    ${rel.source} ${rel.cardinality} ${rel.target} : ${rel.label}\n`;
    });
    
    code += "\n";
    
    // Add entities with attributes
    entities.forEach(entity => {
      const entityAttributes = attributes[entity.name];
      if (entityAttributes && entityAttributes.length > 0) {
        code += `    ${entity.name} {\n`;
        entityAttributes.forEach(attr => {
          code += `        ${attr.type} ${attr.name}\n`;
        });
        code += "    }\n\n";
      }
    });
    
    return code;
  };
  
  // Update Mermaid code when form data changes
  useEffect(() => {
    if (viewTab === 'form') {
      setMermaidCode(generateMermaidCode());
    }
  }, [entities, relationships, attributes, viewTab]);
  
  // Dialog handlers
  const handleAddEntity = (): void => {
    if (newEntityName.trim()) {
      const newId = (entities.length + 1).toString();
      setEntities([...entities, { 
        id: newId, 
        name: newEntityName, 
        description: newEntityDescription 
      }]);
      setAttributes({
        ...attributes,
        [newEntityName]: []
      });
      setNewEntityName('');
      setNewEntityDescription('');
      setShowEntityDialog(false);
    }
  };
  
  const handleAddRelationship = (): void => {
    if (relationshipSource && relationshipTarget) {
      const newId = (relationships.length + 1).toString();
      setRelationships([...relationships, {
        id: newId,
        source: relationshipSource,
        target: relationshipTarget,
        cardinality: relationshipCardinality,
        label: relationshipLabel || 'relates_to'
      }]);
      
      setRelationshipSource('');
      setRelationshipTarget('');
      setRelationshipCardinality('||--o|');
      setRelationshipLabel('');
      setShowRelationshipDialog(false);
    }
  };
  
  const handleAddAttribute = (): void => {
    if (currentEntity && newAttributeName.trim()) {
      const entityAttributes = attributes[currentEntity] || [];
      const newId = (entityAttributes.length + 1).toString();
      
      setAttributes({
        ...attributes,
        [currentEntity]: [
          ...entityAttributes,
          {
            id: newId,
            name: newAttributeName,
            type: newAttributeType
          }
        ]
      });
      
      setNewAttributeName('');
      setNewAttributeType('string');
      setShowAttributeDialog(false);
    }
  };
  
  const handleOpenAttributeDialog = (entityName: string): void => {
    setCurrentEntity(entityName);
    setShowAttributeDialog(true);
  };

   // Handle Quality Metrics button click
   const handleQualityMetricsClick = () => {
    try {
      console.log('Stored API spec for quality analysis in session storage');
      // Navigate to the quality page without the large query parameter
      router.push(`/pages/observe/data-quality?schemaUrl=/data/account-domain-model.json`);
    } catch (error) {
      console.error('Error fushing API spec url:', error);
    }
  };

  return (
    <div className="flex-1 overflow-auto p-2 md:p-8 lg:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-teal-600">
              {modelName}
            </h1>
          </div>
          <div className="flex gap-2">
            <div className="border rounded-md overflow-hidden flex">
              <Button 
                variant={viewTab === 'code' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setViewTab('code')}
                className="gap-2 rounded-none"
              >
                <Code className="h-4 w-4" />
                <span>Code</span>
              </Button>
              <Button 
                variant={viewTab === 'form' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setViewTab('form')}
                className="gap-2 rounded-none"
              >
                <FormInput className="h-4 w-4" />
                <span>Form</span>
              </Button>
              <Button 
                variant={viewTab === 'preview' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setViewTab('preview')}
                className="gap-2 rounded-none"
              >
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
            >
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>{warningCount} Warnings</span>
            </Button>
            
            
            <Button variant="outline" size="sm" className="gap-2 text-gray-700"
              onClick={handleQualityMetricsClick}>
                <Activity className="h-4 w-4" />
                <span>Quality Metrics</span>
              </Button>
          </div>
        </div>

        {/* Model title and controls */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 mr-4">
              <Label htmlFor="internal-toggle" className="text-sm font-medium">INTERNAL</Label>
              <Switch 
                id="internal-toggle" 
                checked={isInternal} 
                onCheckedChange={setIsInternal} 
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 text-gray-700"
              onClick={() => setShowExportDialog(true)}
            >
              <Save className="h-4 w-4" />
              <span>Export Model</span>
            </Button>
            <Button variant="outline" 
                    size="sm" 
                    className="gap-2 text-gray-700"
                    onClick={() => setShowBootstrapAPIDialog(true)}
            >
              <Code className="h-4 w-4" />
              <span>Bootstrap API</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2 text-gray-700">
              <Workflow className="h-4 w-4" />
              <span>Reverse Engineer</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2 text-gray-700"
                    onClick={() => setShowFEDialog(true)}
            >
              <Workflow className="h-4 w-4" />
              <span>Forward Engineer</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2 text-teal-600">
              <FileJson className="h-4 w-4" />
              <span>Generate JSON Schema</span>
            </Button>
          </div>
        </div>
        <div className="mb-8 flex items-center justify-between">
          <Input
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="max-w-xs"
              placeholder="Model Name"
            />
        </div>
        {/* Design visualization */}
        <Card className="border rounded-md shadow-sm">
          <CardContent className="p-0">
            {viewTab === 'code' && (
              
              <div className="h-full">
                {/* Increased height by 40% from h-96 (384px) to h-[540px] */}
                <Textarea
                  value={mermaidCode}
                  onChange={(e) => setMermaidCode(e.target.value)}
                  placeholder="Enter Mermaid ER diagram code here..."
                  className="w-full h-[600px] font-mono text-sm p-4 border-0 resize-none focus:outline-none focus:ring-0 bg-gray-50"
                  style={{ 
                    color: 'Indigo',
                    lineHeight: 1.6
                  }}
                />
              </div>
            )}
            
            {viewTab === 'form' && (
              <Tabs value={designTab} onValueChange={(value) => setDesignTab(value as 'entities' | 'relationships' | 'attributes')} className="w-full">
                <div className="border-b">
                  <div className="flex justify-between items-center p-2">
                    <TabsList className="bg-transparent border-b-0">
                      <TabsTrigger 
                        value="entities" 
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none"
                      >
                        Entities
                      </TabsTrigger>
                      <TabsTrigger 
                        value="relationships" 
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none"
                      >
                        Relationships
                      </TabsTrigger>
                      <TabsTrigger 
                        value="attributes" 
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none"
                      >
                        Attributes
                      </TabsTrigger>
                    </TabsList>
                    <div className="flex items-center ml-auto">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-2 text-teal-600"
                      >
                        <GitCompare className="h-4 w-4" />
                        <span>Compare Versions</span>
                      </Button>
                    </div>
                  </div>
                </div>
                
                <TabsContent value="entities" className="m-0 p-4">
                  <div className="flex justify-between mb-4">
                    <h3 className="text-lg font-medium text-teal-700">Entities</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-teal-600 border-teal-600 hover:bg-teal-50"
                      onClick={() => setShowEntityDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Entity
                    </Button>
                  </div>
                  
                  <div className="border rounded-md overflow-hidden shadow-sm">
                    <table className="w-full">
                      <thead className="bg-teal-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Description</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Attributes</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-teal-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {entities.map((entity) => (
                          <tr key={entity.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-teal-800">{entity.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{entity.description}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className="bg-teal-100 text-teal-800 py-1 px-2 rounded-full text-xs font-medium">
                                {attributes[entity.name] ? attributes[entity.name].length : 0} attributes
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              <Button
                                variant="ghost" 
                                size="sm"
                                className="text-teal-600 hover:bg-teal-50"
                                onClick={() => handleOpenAttributeDialog(entity.name)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Attribute
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
                
                <TabsContent value="relationships" className="m-0 p-4">
                  <div className="flex justify-between mb-4">
                    <h3 className="text-lg font-medium text-indigo-700">Relationships</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-indigo-600 border-indigo-600 hover:bg-indigo-50"
                      onClick={() => setShowRelationshipDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Relationship
                    </Button>
                  </div>
                  
                  <div className="border rounded-md overflow-hidden shadow-sm">
                    <table className="w-full">
                      <thead className="bg-indigo-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">Source</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">Relationship</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">Target</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">Cardinality</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-indigo-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {relationships.map((rel) => (
                          <tr key={rel.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-indigo-800">{rel.source}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className="bg-indigo-100 text-indigo-800 py-1 px-2 rounded-full text-xs font-medium">
                                {rel.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-indigo-800">{rel.target}</td>
                            <td className="px-4 py-3 text-sm font-mono text-gray-600">{rel.cardinality}</td>
                            <td className="px-4 py-3 text-sm text-right">
                              <Button
                                variant="ghost" 
                                size="sm"
                                className="text-indigo-600 hover:bg-indigo-50"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
                
                <TabsContent value="attributes" className="m-0 p-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-purple-700 mb-2">Entity Attributes</h3>
                    <Select onValueChange={setCurrentEntity} value={currentEntity}>
                      <SelectTrigger className="w-full border-purple-200 focus:ring-purple-400">
                        <SelectValue placeholder="Select an entity to view its attributes" />
                      </SelectTrigger>
                      <SelectContent>
                        {entities.map((entity) => (
                          <SelectItem key={entity.id} value={entity.name}>
                            {entity.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {currentEntity && (
                    <>
                      <div className="flex justify-between mb-4">
                        <h4 className="text-md font-medium text-purple-700">
                          Attributes for <span className="text-purple-900 font-bold">{currentEntity}</span>
                        </h4>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-purple-600 border-purple-600 hover:bg-purple-50"
                          onClick={() => setShowAttributeDialog(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Attribute
                        </Button>
                      </div>
                      
                      <div className="border rounded-md overflow-hidden shadow-sm">
                        <table className="w-full">
                          <thead className="bg-purple-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Name</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Type</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-purple-700 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {attributes[currentEntity] && attributes[currentEntity].map((attr: Attribute) => (
                              <tr key={attr.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-800">{attr.name}</td>
                                <td className="px-4 py-3 text-sm">
                                  <span className={`${typeColorMap[attr.type] || 'text-gray-600'} py-1 px-2 rounded-full text-xs font-medium bg-opacity-20 bg-${attr.type === 'string' ? 'green' : attr.type === 'object' ? 'pink' : attr.type === 'array' ? 'purple' : 'blue'}-100`}>
                                    {attr.type}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-right">
                                  <Button
                                    variant="ghost" 
                                    size="sm"
                                    className="text-purple-600 hover:bg-purple-50"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            )}
            
            {viewTab === 'preview' && (
              <div className="p-6 min-h-96 bg-white">
                <div className="p-4 bg-gray-50 rounded-md">
                  <h2 className="text-lg font-medium mb-4 text-teal-700">Preview: {modelName}</h2>
                  <div className="border p-4 bg-white rounded-md shadow-inner">
                    <MermaidDiagram content={mermaidCode} />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Dialogs */}
      <EntityDialog
        open={showEntityDialog}
        onOpenChange={setShowEntityDialog}
        newEntityName={newEntityName}
        setNewEntityName={setNewEntityName}
        newEntityDescription={newEntityDescription}
        setNewEntityDescription={setNewEntityDescription}
        onAddEntity={handleAddEntity}
      />
      
      <RelationshipDialog
        open={showRelationshipDialog}
        onOpenChange={setShowRelationshipDialog}
        entities={entities}
        relationshipSource={relationshipSource}
        setRelationshipSource={setRelationshipSource}
        relationshipTarget={relationshipTarget}
        setRelationshipTarget={setRelationshipTarget}
        relationshipCardinality={relationshipCardinality}
        setRelationshipCardinality={setRelationshipCardinality}
        relationshipLabel={relationshipLabel}
        setRelationshipLabel={setRelationshipLabel}
        onAddRelationship={handleAddRelationship}
      />
      
      <AttributeDialog
        open={showAttributeDialog}
        onOpenChange={setShowAttributeDialog}
        currentEntity={currentEntity}
        newAttributeName={newAttributeName}
        setNewAttributeName={setNewAttributeName}
        newAttributeType={newAttributeType}
        setNewAttributeType={setNewAttributeType}
        onAddAttribute={handleAddAttribute}
      />
      
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        exportFormat={exportFormat}
        setExportFormat={setExportFormat}
      />

      <BootstrapAPIDialog
        open={showBootstrapAPIDialog}
        onOpenChange={setShowBootstrapAPIDialog}
        apiSpec={apiSpec}
        setApiSpec={setAPISpec}
      />

      <ForwardEngineerDialog
        open={showFEDialog}
        onOpenChange={setShowFEDialog}
        target={target}
        setTarget={setTarget}
      />
      </div>
  );
};

export default DataDesignEditor;