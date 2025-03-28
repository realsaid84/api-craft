// bdd-generator/validator.js
'use client';

// Import OpenAPI validator from Swagger
import SwaggerParser from '@apidevtools/swagger-parser';
import { OpenAPIV3 } from 'openapi-types';

// Define interfaces for the validator
interface ValidationError {
  path: string;
  message: string;
  severity?: 'error' | 'warning';
  params?: Record<string, any>;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  recommendations?: ValidationError[];
}

interface PathItemObject {
  [method: string]: any;
  get?: any;
  post?: any;
  put?: any;
  delete?: any;
  patch?: any;
  options?: any;
  head?: any;
  parameters?: any[];
}

interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  paths?: Record<string, PathItemObject>;
  components?: {
    schemas?: Record<string, any>;
    securitySchemes?: Record<string, any>;
  };
  security?: Record<string, string[]>[];
  tags?: any[];
  [key: string]: unknown; // Add index signature for flexibility
}

/**
 * Validates an OpenAPI specification using swagger-parser and returns validation errors
 * @param {OpenAPISpec} spec - The OpenAPI specification object
 * @returns {ValidationResult} - Validation result with errors array
 */
export const validateOpenApiSpec = async (spec: OpenAPISpec): Promise<ValidationResult> => {
  const result: ValidationResult = {
    valid: true,
    errors: []
  };

  try {
    // Validate the spec for syntax errors, references, etc.
    await SwaggerParser.validate(spec as OpenAPIV3.Document);
    
    // If we reach here, the basic validation passed
    // Now do semantic validation
    const semanticErrors = validateSemantics(spec);
    
    if (semanticErrors.length > 0) {
      result.valid = result.valid && !semanticErrors.some(e => e.severity !== 'warning');
      result.errors = [...result.errors, ...semanticErrors];
    }
    
    // Add best practice recommendations
    const recommendations = getBestPracticeRecommendations(spec);
    if (recommendations.length > 0) {
      result.recommendations = recommendations;
    }
    
    return result;
  } catch (error) {
    // If SwaggerParser throws an error, it means validation failed
    let errorMessage = 'Unknown validation error';
    let errorPath = '';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Try to extract path information from the error message
      const pathMatch = errorMessage.match(/at\s+(.+)$/);
      if (pathMatch && pathMatch[1]) {
        errorPath = pathMatch[1].replace(/\//g, '.');
      }
    }
    
    return {
      valid: false,
      errors: [{
        path: errorPath,
        message: `Validation error: ${errorMessage}`
      }]
    };
  }
};

/**
 * Performs semantic validation on the OpenAPI spec
 * @param {OpenAPISpec} spec - The OpenAPI specification
 * @returns {ValidationError[]} - Array of validation errors
 */
const validateSemantics = (spec: OpenAPISpec): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Check if paths exist
  if (!spec.paths || Object.keys(spec.paths).length === 0) {
    errors.push({
      path: 'paths',
      message: 'OpenAPI specification must contain at least one path'
    });
    return errors;
  }
  
  // Check path parameters
  Object.entries(spec.paths).forEach(([path, pathItem]) => {
    // Check path parameter consistency
    const pathParams = path.match(/\{([^}]+)\}/g) || [];
    const declaredParams: string[] = [];
    
    // Collect parameters from operations
    const operations = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];
    operations.forEach(method => {
      const operation = pathItem[method];
      if (!operation) return;
      
      // Check if operation has required properties
      if (!operation.responses) {
        errors.push({
          path: `paths.${path}.${method}`,
          message: 'Operation must have responses defined'
        });
      }
      
      // Check parameters
      if (operation.parameters) {
        operation.parameters.forEach((param: any) => {
          if (param.$ref) return; // Skip reference params for now
          
          // Check required properties
          if (!param.name) {
            errors.push({
              path: `paths.${path}.${method}.parameters`,
              message: 'Parameter must have a name'
            });
          }
          
          if (!param.in) {
            errors.push({
              path: `paths.${path}.${method}.parameters`,
              message: 'Parameter must have "in" property'
            });
          }
          
          // If path parameter, add to declared
          if (param.in === 'path') {
            if (!param.required) {
              errors.push({
                path: `paths.${path}.${method}.parameters.${param.name}`,
                message: 'Path parameters must be required'
              });
            }
            
            declaredParams.push(param.name);
          }
        });
      }
    });
    
    // Compare path parameters with declared parameters
    pathParams.forEach(param => {
      const paramName = param.substring(1, param.length - 1);
      if (!declaredParams.includes(paramName)) {
        errors.push({
          path: `paths.${path}`,
          message: `Path parameter {${paramName}} is not defined in any operation`
        });
      }
    });
  });
  
  return errors;
};

/**
 * Checks for OpenAPI best practices and returns recommendations
 * @param {OpenAPISpec} spec - The OpenAPI specification
 * @returns {ValidationError[]} - Array of recommendations
 */
const getBestPracticeRecommendations = (spec: OpenAPISpec): ValidationError[] => {
  const recommendations: ValidationError[] = [];
  
  // Check for API description
  if (!spec.info.description) {
    recommendations.push({
      path: 'info.description',
      message: 'Add a description to your API for better documentation'
    });
  }
  
  // Check for operationId which is important for code generation
  if (spec.paths) {
    Object.entries(spec.paths).forEach(([path, pathItem]) => {
      const operations = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];
      
      operations.forEach(method => {
        const operation = pathItem[method];
        if (!operation) return;
        
        if (!operation.operationId) {
          recommendations.push({
            path: `paths.${path}.${method}`,
            message: 'Operation should have an operationId for better code generation'
          });
        }
        
        // Check for examples
        if (operation.requestBody && operation.requestBody.content) {
          Object.entries(operation.requestBody.content).forEach(([contentType, content]: [string, any]) => {
            if (!content.example && !content.examples) {
              recommendations.push({
                path: `paths.${path}.${method}.requestBody.content.${contentType}`,
                message: 'Add examples to request body for better test generation'
              });
            }
          });
        }
        
        // Check response examples
        if (operation.responses) {
          Object.entries(operation.responses).forEach(([code, response]: [string, any]) => {
            if (response.content) {
              Object.entries(response.content).forEach(([contentType, content]: [string, any]) => {
                if (!content.example && !content.examples) {
                  recommendations.push({
                    path: `paths.${path}.${method}.responses.${code}.content.${contentType}`,
                    message: 'Add examples to response for better test generation'
                  });
                }
              });
            }
          });
        }
      });
    });
  }
  
  // Check for tags
  const hasTags = spec.tags && spec.tags.length > 0;
  if (!hasTags) {
    recommendations.push({
      path: 'tags',
      message: 'Define tags to organize your API operations'
    });
  }
  
  return recommendations;
};

export default validateOpenApiSpec;