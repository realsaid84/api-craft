import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Type definitions
interface Entity {
  id: string;
  name: string;
  description: string;
}

interface EntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newEntityName: string;
  setNewEntityName: (name: string) => void;
  newEntityDescription: string;
  setNewEntityDescription: (description: string) => void;
  onAddEntity: () => void;
}

interface RelationshipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entities: Entity[];
  relationshipSource: string;
  setRelationshipSource: (source: string) => void;
  relationshipTarget: string;
  setRelationshipTarget: (target: string) => void;
  relationshipCardinality: string;
  setRelationshipCardinality: (cardinality: string) => void;
  relationshipLabel: string;
  setRelationshipLabel: (label: string) => void;
  onAddRelationship: () => void;
}

interface AttributeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEntity: string;
  newAttributeName: string;
  setNewAttributeName: (name: string) => void;
  newAttributeType: string;
  setNewAttributeType: (type: string) => void;
  onAddAttribute: () => void;
}

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exportFormat: string;
  setExportFormat: (format: string) => void;
}

interface BootstrapAPIDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiSpec: string;
  setApiSpec: (format: string) => void;
}

interface ForwardEngineerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: string;
  setTarget: (format: string) => void;
}

/**
 * Dialog for adding a new entity
 */
export const EntityDialog: React.FC<EntityDialogProps> = ({
  open,
  onOpenChange,
  newEntityName,
  setNewEntityName,
  newEntityDescription,
  setNewEntityDescription,
  onAddEntity
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Entity</DialogTitle>
          <DialogDescription>
            Enter the details for the new entity.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="entity-name" className="text-right">
              Name
            </Label>
            <Input
              id="entity-name"
              value={newEntityName}
              onChange={(e) => setNewEntityName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="entity-description" className="text-right">
              Description
            </Label>
            <Input
              id="entity-description"
              value={newEntityDescription}
              onChange={(e) => setNewEntityDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={onAddEntity}>
            Add Entity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Dialog for adding a new relationship
 */
export const RelationshipDialog: React.FC<RelationshipDialogProps> = ({
  open,
  onOpenChange,
  entities,
  relationshipSource,
  setRelationshipSource,
  relationshipTarget,
  setRelationshipTarget,
  relationshipCardinality,
  setRelationshipCardinality,
  relationshipLabel,
  setRelationshipLabel,
  onAddRelationship
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Relationship</DialogTitle>
          <DialogDescription>
            Define a relationship between entities.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="relationship-source" className="text-right">
              Source Entity
            </Label>
            <Select 
              value={relationshipSource} 
              onValueChange={setRelationshipSource}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select source entity" />
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
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="relationship-target" className="text-right">
              Target Entity
            </Label>
            <Select 
              value={relationshipTarget} 
              onValueChange={setRelationshipTarget}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select target entity" />
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
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="relationship-cardinality" className="text-right">
              Cardinality
            </Label>
            <Select 
              value={relationshipCardinality} 
              onValueChange={setRelationshipCardinality}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select cardinality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="||--||">One to One (||--||)</SelectItem>
                <SelectItem value="||--o|">One to Zero or One (||--o|)</SelectItem>
                <SelectItem value="||--|{">One to Many (||--|&rbrace;)</SelectItem>
                <SelectItem value="||--o{">One to Zero or Many (||--o&rbrace;)</SelectItem>
                <SelectItem value="}|--||">Many to One (&rbrace;|--||)</SelectItem>
                <SelectItem value="}o--||">Zero or Many to One (&rbrace;o--||)</SelectItem>
                <SelectItem value="}|--|{">Many to Many (&rbrace;|--|&rbrace;)</SelectItem>
                <SelectItem value="&rbrace;o--o{">Zero or Many to Zero or Many (&rbrace;o--o&rbrace;)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="relationship-label" className="text-right">
              Label
            </Label>
            <Input
              id="relationship-label"
              value={relationshipLabel}
              onChange={(e) => setRelationshipLabel(e.target.value)}
              placeholder="e.g., has, belongs_to, contains"
              className="col-span-3"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={onAddRelationship}>
            Add Relationship
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Dialog for adding a new attribute to an entity
 */
export const AttributeDialog: React.FC<AttributeDialogProps> = ({
  open,
  onOpenChange,
  currentEntity,
  newAttributeName,
  setNewAttributeName,
  newAttributeType,
  setNewAttributeType,
  onAddAttribute
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Attribute to {currentEntity}</DialogTitle>
          <DialogDescription>
            Define a new attribute for this entity.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="attribute-name" className="text-right">
              Name
            </Label>
            <Input
              id="attribute-name"
              value={newAttributeName}
              onChange={(e) => setNewAttributeName(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="attribute-type" className="text-right">
              Type
            </Label>
            <Select 
              value={newAttributeType} 
              onValueChange={setNewAttributeType}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select attribute type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="string">String</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="object">Object</SelectItem>
                <SelectItem value="array">Array</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={onAddAttribute}>
            Add Attribute
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Dialog for exporting the model
 */
export const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onOpenChange,
  exportFormat,
  setExportFormat
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Model</DialogTitle>
          <DialogDescription>
            Choose format to export your data model.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="export-format" className="text-right">
              Format
            </Label>
            <Select 
              value={exportFormat} 
              onValueChange={setExportFormat}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select export format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="markdown">Markdown</SelectItem>
                <SelectItem value="svg">SVG</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-500">
              {exportFormat === 'markdown' && "Exports as a Markdown document with embedded Mermaid diagram"}
              {exportFormat === 'svg' && "Exports the diagram as an SVG image"}
              {exportFormat === 'png' && "Exports the diagram as a PNG image"}
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit">
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Dialog for exporting the model
 */
export const BootstrapAPIDialog: React.FC<BootstrapAPIDialogProps> = ({
  open,
  onOpenChange,
  apiSpec,
  setApiSpec
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bootstrap API</DialogTitle>
          <DialogDescription>
            Choose an API specification standard to bootstrap your data model to.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="export-format" className="text-right">
              Specification Standard
            </Label>
            <Select 
              value={apiSpec} 
              onValueChange={setApiSpec}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Specification Standard" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openapi3">OpenAPI 3.0</SelectItem>
                <SelectItem value="openapi3.1">OpenAPI 3.1</SelectItem>
                <SelectItem value="asyncAPI">AsyncAPI</SelectItem>
                <SelectItem value="graphql">GraphQL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-500">
              {apiSpec === 'openapi3' && "Bootstraps an OpenAPI 3.0 specification based on a governed template"}
              {apiSpec === 'openapi3.1' && "Bootstraps an OpenAPI 3.1 specification based on a governed template"}
              {apiSpec === 'asyncAPI' && "Bootstraps an AsyncAPI specification based on a governed template"}
              {apiSpec === 'graphql' && "Bootstraps a graphQL definition based on a governed template"}
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit">
            Bootstrap
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


/**
 * Dialog for Forward engineering the model
 */
export const ForwardEngineerDialog: React.FC<ForwardEngineerDialogProps> = ({
  open,
  onOpenChange,
  target,
  setTarget
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Forward Engineer Model</DialogTitle>
          <DialogDescription>
            Choose data model forward engineering target
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="target" className="text-right">
              Target
            </Label>
            <Select 
              value={target} 
              onValueChange={setTarget}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Forward Enginnering target" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON Schema</SelectItem>
                <SelectItem value="avro">Avro Schema</SelectItem>
                <SelectItem value="java">Java Models</SelectItem>
                <SelectItem value="protobuf">Protobuf</SelectItem>
                <SelectItem value="typescript">Typescript Interfaces</SelectItem>
                <SelectItem value="python">Python DataClasses</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-500">
              {target === 'json' && "Forward engineer a data model to a JSON Schema definition"}
              {target === 'avro' && "Forward engineer a data model to an Avro Schema"}
              {target === 'java' && "Forward engineer a data model to a Java models(JAR)"}
              {target === 'protobuf' && "Forward engineer a data model to Protobuf"}
              {target === 'typescript' && "Forward engineer a data model to TypeScript interfaces"}
              {target === 'python' && "Forward engineer a data model to Python Data classes"}
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit">
            Forward Engineer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};