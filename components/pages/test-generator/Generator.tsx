// bdd-generator/generator.js
'use client';

// Define interfaces for our data structures
interface OpenAPISpec {
  openapi?: string;
  paths?: Record<string, PathItemObject>;
  tags?: Tag[];
  security?: Record<string, string[]>[];
  servers?: Server[];
  components?: {
    schemas?: Record<string, SchemaObject>;
  };
}

interface PathItemObject {
  [key: string]: any;
  parameters?: ParameterObject[];
}

interface OperationObject {
  tags?: string[];
  summary?: string;
  operationId?: string;
  parameters?: ParameterObject[];
  requestBody?: RequestBodyObject;
  responses?: Record<string, ResponseObject>;
  security?: Record<string, string[]>[];
}

interface ParameterObject {
  name?: string;
  in?: string;
  description?: string;
  required?: boolean;
  schema?: SchemaObject;
  example?: any;
  $ref?: string;
}

interface SchemaObject {
  type?: string;
  format?: string;
  properties?: Record<string, SchemaObject>;
  items?: SchemaObject;
  required?: string[];
  enum?: any[];
  example?: any;
  examples?: any[];
  default?: any;
  $ref?: string;
  allOf?: SchemaObject[];
  oneOf?: SchemaObject[];
  anyOf?: SchemaObject[];
}

interface RequestBodyObject {
  content: Record<string, ContentObject>;
  required?: boolean;
}

interface ContentObject {
  schema?: SchemaObject;
  example?: any;
  examples?: Record<string, any>;
}

interface ResponseObject {
  description?: string;
  content?: Record<string, ContentObject>;
}

interface Tag {
  name: string;
  description?: string;
}

interface Server {
  url: string;
  description?: string;
}

interface Step {
  type: string;
  text: string;
  codeBlock?: {
    language: string;
    content: string;
  };
}

interface Scenario {
  name: string;
  steps: Step[];
}

interface Background {
  title: string;
  steps: Step[];
}

interface Feature {
  name: string;
  description: string;
  background: Background | null;
  scenarios: Scenario[];
}

interface GenerationSettings {
  includeBackgroundSection: boolean;
  includeExamples: boolean;
  generateAssertions: boolean;
  testDepth: 'basic' | 'medium' | 'comprehensive';
  outputFormat: 'gherkin' | 'arazzo' | 'karate';
  includeValidation: boolean;
  targetEnvironment: string;
}

/**
 * Generates BDD feature files from an OpenAPI specification
 * @param {OpenAPISpec} spec - The parsed OpenAPI specification
 * @param {GenerationSettings} settings - Generation settings
 * @returns {Promise<Feature[]>} - Array of generated feature objects
 */
export const generateBddFeatures = async (spec: OpenAPISpec, settings: GenerationSettings): Promise<Feature[]> => {
    try {
      // Basic validation
      if (!spec || !spec.paths) {
        throw new Error('Invalid OpenAPI specification: missing paths');
      }
      
      const features: Feature[] = [];
      const paths = Object.keys(spec.paths);
      
      // Skip if no paths to process
      if (paths.length === 0) {
        return features;
      }
      
      // Group paths by tags to organize features
      const pathsByTag = groupPathsByTag(spec);
      
      // Process each tag group as a feature
      for (const [tag, tagPathsRaw] of Object.entries(pathsByTag)) {
        const tagPaths = tagPathsRaw as string[];
        const feature: Feature = {
          name: formatFeatureName(tag),
          description: getTagDescription(spec, tag),
          background: settings.includeBackgroundSection ? 
            (settings.outputFormat === 'karate' ? 
              generateKarateBackground(spec, settings) : 
              generateBackground(spec, settings)) : 
            null,
          scenarios: []
        };
        
        // Generate scenarios for each path in this tag
        for (const path of tagPaths) {
          const pathObj = spec.paths?.[path];
          if (!pathObj) continue;
          
          const operations = Object.keys(pathObj).filter(key => !key.startsWith('x-') && key !== 'parameters');
          
          for (const method of operations) {
            const operation = pathObj[method] as OperationObject;
            
            // Skip if operation has different tag
            if (operation.tags && !operation.tags.includes(tag)) {
              continue;
            }
            
            // Generate scenarios based on the output format
            let scenarios;
            if (settings.outputFormat === 'karate') {
              scenarios = generateKarateScenariosForOperation(path, method, operation, spec, settings);
            } else {
              scenarios = generateScenariosForOperation(path, method, operation, spec, settings);
            }
            
            feature.scenarios.push(...scenarios);
          }
        }
        
        // Only add feature if it has scenarios
        if (feature.scenarios.length > 0) {
          features.push(feature);
        }
      }
      
      return features;
    } catch (error) {
      console.error('Error generating BDD features:', error);
      throw new Error(`Failed to generate BDD features: ${(error as Error).message}`);
    }
  };
  
  /**
   * Groups API paths by their tags
   * @param {OpenAPISpec} spec - The OpenAPI specification
   * @returns {Record<string, string[]>} - Paths grouped by tag
   */
  const groupPathsByTag = (spec: OpenAPISpec): Record<string, string[]> => {
    const pathsByTag: Record<string, string[]> = {};
    
    // Initialize with defined tags
    if (spec.tags) {
      spec.tags.forEach(tag => {
        pathsByTag[tag.name] = [];
      });
    }
    
    // Group paths by their tags
    if (spec.paths) {
      for (const [path, pathItemRaw] of Object.entries(spec.paths)) {
        const pathItem = pathItemRaw as PathItemObject;
        const operations = Object.keys(pathItem).filter(key => !key.startsWith('x-') && key !== 'parameters');
        
        for (const method of operations) {
          const operation = pathItem[method] as OperationObject;
          
          if (operation.tags && operation.tags.length > 0) {
            // Add path to each tag it belongs to
            operation.tags.forEach(tag => {
              if (!pathsByTag[tag]) {
                pathsByTag[tag] = [];
              }
              if (!pathsByTag[tag].includes(path)) {
                pathsByTag[tag].push(path);
              }
            });
          } else {
            // No tags, add to "General" category
            if (!pathsByTag['General']) {
              pathsByTag['General'] = [];
            }
            if (!pathsByTag['General'].includes(path)) {
              pathsByTag['General'].push(path);
            }
          }
        }
      }
    }
    
    return pathsByTag;
  };
  
  /**
   * Formats a tag name into a feature name
   * @param {string} tag - The tag name
   * @returns {string} - Formatted feature name
   */
  const formatFeatureName = (tag: string): string => {
    // Convert to title case and add appropriate prefix
    const formattedTag = tag
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
    
    return `${formattedTag} API Test`;
  };
  
  /**
   * Gets the description for a tag from the specification
   * @param {OpenAPISpec} spec - The OpenAPI specification
   * @param {string} tagName - The tag name
   * @returns {string} - Tag description or default description
   */
  const getTagDescription = (spec: OpenAPISpec, tagName: string): string => {
    if (spec.tags) {
      const tag = spec.tags.find(t => t.name === tagName);
      if (tag && tag.description) {
        return tag.description;
      }
    }
    
    return `Test suite for ${tagName} API endpoints`;
  };
  
  /**
   * Generates background steps common to all scenarios in a feature
   * @param {OpenAPISpec} spec - The OpenAPI specification
   * @param {GenerationSettings} settings - Generation settings
   * @returns {Background | null} - Background section with steps
   */
  const generateBackground = (spec: OpenAPISpec, settings: GenerationSettings): Background | null => {
    const steps: Step[] = [];
    
    // Add authentication step if security is defined
    if (spec.security && spec.security.length > 0) {
      const securityNames: string[] = [];
      
      spec.security.forEach(securityReq => {
        Object.keys(securityReq).forEach(secName => {
          if (!securityNames.includes(secName)) {
            securityNames.push(secName);
          }
        });
      });
      
      if (securityNames.length > 0) {
        steps.push({
          type: 'Given',
          text: `I am authenticated with ${securityNames.join(', ')}`
        });
      }
    }
    
    // Add base URL step
    if (spec.servers && spec.servers.length > 0) {
      const server = spec.servers[0];
      
      // Map environment to server if possible
      let selectedServer = server;
      if (settings.targetEnvironment && spec.servers.length > 1) {
        const envServer = spec.servers.find(s => 
          s.description && s.description.toLowerCase().includes(settings.targetEnvironment.toLowerCase())
        );
        if (envServer) {
          selectedServer = envServer;
        }
      }
      
      steps.push({
        type: 'Given',
        text: `the API base URL is "${selectedServer.url}"`
      });
    }
    
    if (steps.length > 0) {
      return {
        title: 'Common Setup',
        steps
      };
    }
    
    return null;
  };

  /**
   * Generates Karate-specific background steps
   * @param {OpenAPISpec} spec - The OpenAPI specification
   * @param {GenerationSettings} settings - Generation settings
   * @returns {Background | null} - Background section with steps
   */
  const generateKarateBackground = (spec: OpenAPISpec, settings: GenerationSettings): Background | null => {
    const steps: Step[] = [];
    
    // Add base URL step using Karate syntax
    if (spec.servers && spec.servers.length > 0) {
      const server = spec.servers[0];
      
      // Map environment to server if possible
      let selectedServer = server;
      if (settings.targetEnvironment && spec.servers.length > 1) {
        const envServer = spec.servers.find(s => 
          s.description && s.description.toLowerCase().includes(settings.targetEnvironment.toLowerCase())
        );
        if (envServer) {
          selectedServer = envServer;
        }
      }
      
      // Use the Karate-specific 'url' keyword
      steps.push({
        type: '*',
        text: `url '${selectedServer.url}'`
      });
    }
    
    // Add authentication step if security is defined
    if (spec.security && spec.security.length > 0) {
      const securityNames: string[] = [];
      
      spec.security.forEach(securityReq => {
        Object.keys(securityReq).forEach(secName => {
          if (!securityNames.includes(secName)) {
            securityNames.push(secName);
          }
        });
      });
      
      if (securityNames.length > 0) {
        // For OAuth or Bearer token
        if (securityNames.includes('bearerAuth') || securityNames.includes('oauth2')) {
          steps.push({
            type: '*',
            text: `def authToken = 'dummy-token-for-testing'`
          });
          steps.push({
            type: '*',
            text: `header Authorization = 'Bearer ' + authToken`
          });
        }
        // For basic auth
        else if (securityNames.includes('basicAuth')) {
          steps.push({
            type: '*',
            text: `header Authorization = 'Basic ' + karate.base64('username:password')`
          });
        }
        // For API key
        else if (securityNames.includes('apiKey')) {
          steps.push({
            type: '*',
            text: `header x-api-key = 'dummy-api-key'`
          });
        }
      }
    }
    
    if (steps.length > 0) {
      return {
        title: '',  // Karate doesn't typically have titles for Background sections
        steps
      };
    }
    
    return null;
  };
  
  /**
   * Generates Karate scenarios for an API operation
   * @param {string} path - The API path
   * @param {string} method - The HTTP method
   * @param {OperationObject} operation - The operation object
   * @param {OpenAPISpec} spec - The complete OpenAPI spec
   * @param {GenerationSettings} settings - Generation settings
   * @returns {Scenario[]} - Generated scenarios
   */
  const generateKarateScenariosForOperation = (
    path: string, 
    method: string, 
    operation: OperationObject, 
    spec: OpenAPISpec, 
    settings: GenerationSettings
  ): Scenario[] => {
    const scenarios: Scenario[] = [];
    const operationId = operation.operationId || `${method.toUpperCase()} ${path}`;
    
    // Happy path scenario
    const happyPathScenario: Scenario = {
      name: `${getOperationDisplayName(operation, method, path)}`,
      steps: []
    };
    
    // Add path parameters step using Karate syntax
    const pathParams = getParametersByLocation(operation, spec, 'path');
    if (pathParams.length > 0) {
      // For each path parameter, set a variable
      pathParams.forEach(param => {
        const paramValue = generateExampleValue(param);
        happyPathScenario.steps.push({
          type: '*',
          text: `def ${param.name} = '${paramValue}'`
        });
      });
    }
    
    // Add path with parameters
    const pathWithParams = path.replace(/{([^}]+)}/g, (_, name) => `\${${name}}`);
    happyPathScenario.steps.push({
      type: '*',
      text: `path '${pathWithParams}'`
    });
    
    // Add query parameters step using Karate syntax
    const queryParams = getParametersByLocation(operation, spec, 'query');
    if (queryParams.length > 0) {
      queryParams.forEach(param => {
        const paramValue = generateExampleValue(param);
        happyPathScenario.steps.push({
          type: '*',
          text: `param ${param.name} = '${paramValue}'`
        });
      });
    }
    
    // Add request body step using Karate syntax
    if (operation.requestBody) {
      const contentType = operation.requestBody.content && Object.keys(operation.requestBody.content).length > 0
        ? Object.keys(operation.requestBody.content)[0]
        : 'application/json';
        
      const schema = operation.requestBody.content?.[contentType]?.schema;
      
      if (schema && settings.includeExamples) {
        const example = generateExampleForSchema(schema, spec);
        
        // If it's a form content type
        if (contentType === 'application/x-www-form-urlencoded') {
          for (const [key, value] of Object.entries(example)) {
            happyPathScenario.steps.push({
              type: '*',
              text: `form field ${key} = '${value}'`
            });
          }
        } else {
          // For JSON content
          happyPathScenario.steps.push({
            type: '*',
            text: `request ${JSON.stringify(example, null, 2)}`
          });
        }
      }
    }
    
    // Add method step using Karate syntax
    happyPathScenario.steps.push({
      type: '*',
      text: `method ${method.toLowerCase()}`
    });
    
    // Add status assertion using Karate syntax
    const successResponseCode = getSuccessResponseCode(operation);
    happyPathScenario.steps.push({
      type: '*',
      text: `status ${successResponseCode}`
    });
    
    // Add response validation steps using Karate syntax
    if (settings.generateAssertions) {
      const responseContent = getResponseContent(operation, successResponseCode);
      if (responseContent && responseContent.schema) {
        // Add assertions based on schema properties
        addKarateAssertionsForResponse(happyPathScenario.steps, responseContent.schema, spec, settings);
      }
    }
    
    scenarios.push(happyPathScenario);
    
    // If comprehensive tests are requested, add error case scenarios
    if (settings.testDepth === 'comprehensive') {
      // Add validation error scenario for required fields (Karate style)
      addKarateValidationErrorScenarios(scenarios, operation, method, path, spec);
      
      // Add not found scenario for GET operations (Karate style)
      if (method.toLowerCase() === 'get' && path.includes('{')) {
        addKarateNotFoundScenario(scenarios, method, path);
      }
      
      // Add unauthorized scenario if security is required (Karate style)
      if (operation.security || spec.security) {
        addKarateUnauthorizedScenario(scenarios, method, path);
      }
    }
    
    return scenarios;
  };
  
  /**
   * Adds Karate-style assertions for a response based on its schema
   * @param {Step[]} steps - The array of steps to add assertions to
   * @param {SchemaObject} schema - The response schema
   * @param {OpenAPISpec} spec - The complete OpenAPI spec
   */
  const addKarateAssertionsForResponse = (steps: Step[], schema: SchemaObject, spec: OpenAPISpec, settings: GenerationSettings): void => {
    // Resolve reference if needed
    if (schema.$ref) {
      schema = resolveReference(schema.$ref, spec);
    }
    
    // If schema is an array, add assertions for array response
    if (schema.type === 'array') {
      steps.push({
        type: '*',
        text: `match response == '#[]'`
      });
      
      // If we have item schema, add example assertion
      if (schema.items) {
        steps.push({
          type: '*',
          text: `match each response == '#object'`
        });
      }
      
      return;
    }
    
    // Object assertions
    if (schema.type === 'object' || schema.properties) {
      // Add schema shape match
      steps.push({
        type: '*',
        text: `match response == '#object'`
      });
      
      // Add assertions for required properties
      if (schema.required && schema.required.length > 0) {
        schema.required.forEach(field => {
          const fieldSchema = schema.properties?.[field];
          const fieldType = getKarateMatchType(fieldSchema);
          
          steps.push({
            type: '*',
            text: `match response.${field} == '${fieldType}'`
          });
        });
      }
      
      // Generate a sample JSON matcher if appropriate
      if (schema.properties && Object.keys(schema.properties).length > 0 && settings.includeExamples) {
        const exampleObj: Record<string, string> = {};
        
        Object.entries(schema.properties).slice(0, 3).forEach(([propName, propSchema]) => {
          exampleObj[propName] = getKarateMatchType(propSchema);
        });
        
        steps.push({
          type: '*',
          text: `match response contains ${JSON.stringify(exampleObj)}`
        });
      }
    }
  };
  
  /**
   * Gets the Karate match type for a schema
   * @param {SchemaObject} schema - The schema object
   * @returns {string} - Karate match type pattern
   */
  const getKarateMatchType = (schema?: SchemaObject): string => {
    if (!schema) return '#notnull';
    
    switch (schema.type) {
      case 'string':
        return '#string';
      case 'number':
      case 'integer':
        return '#number';
      case 'boolean':
        return '#boolean';
      case 'array':
        return '#array';
      case 'object':
        return '#object';
      default:
        return '#notnull';
    }
  };
  
  /**
   * Adds Karate validation error scenarios for required fields
   * @param {Scenario[]} scenarios - The array of scenarios
   * @param {OperationObject} operation - The operation object
   * @param {string} method - The HTTP method
   * @param {string} path - The API path
   * @param {OpenAPISpec} spec - The complete OpenAPI spec
   */
  const addKarateValidationErrorScenarios = (
    scenarios: Scenario[], 
    operation: OperationObject, 
    method: string, 
    path: string, 
    spec: OpenAPISpec
  ): void => {
    // Only add validation scenarios for POST, PUT, and PATCH
    if (!['post', 'put', 'patch'].includes(method.toLowerCase())) {
      return;
    }
    
    // Check if there's a request body with required fields
    if (!operation.requestBody || !operation.requestBody.content) {
      return;
    }
    
    const contentType = Object.keys(operation.requestBody.content)[0];
    if (!contentType) {
      return;
    }
    
    let schema = operation.requestBody.content[contentType].schema;
    
    // Resolve reference if needed
    if (schema && schema.$ref) {
      schema = resolveReference(schema.$ref, spec);
    }
    
    // Check if schema has required properties
    if (!schema || !schema.required || schema.required.length === 0) {
      return;
    }
    
    // Create a validation error scenario for the first required property
    const requiredField = schema.required[0];
    
    const validationScenario: Scenario = {
      name: `Validation error for ${method.toUpperCase()} ${path} with missing ${requiredField}`,
      steps: []
    };
    
    // Add path with parameters
    const pathWithParams = path.replace(/{([^}]+)}/g, (_, name) => `\${${name}}`);
    validationScenario.steps.push({
      type: '*',
      text: `path '${pathWithParams}'`
    });
    
    // Add path parameters step using Karate syntax
    const pathParams = getParametersByLocation(operation, spec, 'path');
    if (pathParams.length > 0) {
      // For each path parameter, set a variable
      pathParams.forEach(param => {
        const paramValue = generateExampleValue(param);
        validationScenario.steps.push({
          type: '*',
          text: `def ${param.name} = '${paramValue}'`
        });
      });
    }
    
    // Create an invalid request body (missing required field)
    if (schema && schema.properties) {
      const validExample = generateExampleForSchema(schema, spec);
      // Create a new object without the required field
      const { [requiredField]: _, ...invalidExample } = validExample;
      
      validationScenario.steps.push({
        type: '*',
        text: `request ${JSON.stringify(invalidExample, null, 2)}`
      });
    }
    
    // Add method step using Karate syntax
    validationScenario.steps.push({
      type: '*',
      text: `method ${method.toLowerCase()}`
    });
    
    // Add status assertion using Karate syntax
    validationScenario.steps.push({
      type: '*',
      text: `status 400`
    });
    
    // Add validation error assertion
    validationScenario.steps.push({
      type: '*',
      text: `match response contains { message: '#notnull' }`
    });
    
    scenarios.push(validationScenario);
  };
  
  /**
   * Adds a Karate not found error scenario
   * @param {Scenario[]} scenarios - The array of scenarios
   * @param {string} method - The HTTP method
   * @param {string} path - The API path
   */
  const addKarateNotFoundScenario = (scenarios: Scenario[], method: string, path: string): void => {
    // Extract the parameter names from the path
    const paramNames = (path.match(/{([^}]+)}/g) || [])
      .map(param => param.substring(1, param.length - 1));
    
    if (paramNames.length === 0) return;
    
    const notFoundScenario: Scenario = {
      name: `Resource not found for ${method.toUpperCase()} ${path}`,
      steps: []
    };
    
    // Set a non-existent ID
    notFoundScenario.steps.push({
      type: '*',
      text: `def ${paramNames[0]} = '999999'`
    });
    
    // Add path with parameters
    const pathWithParams = path.replace(/{([^}]+)}/g, (_, name) => `\${${name}}`);
    notFoundScenario.steps.push({
      type: '*',
      text: `path '${pathWithParams}'`
    });
    
    // Add method step
    notFoundScenario.steps.push({
      type: '*',
      text: `method ${method.toLowerCase()}`
    });
    
    // Add assertions
    notFoundScenario.steps.push({
      type: '*',
      text: `status 404`
    });
    
    scenarios.push(notFoundScenario);
  };
  
  /**
   * Adds a Karate unauthorized error scenario
   * @param {Scenario[]} scenarios - The array of scenarios
   * @param {string} method - The HTTP method
   * @param {string} path - The API path
   */
  const addKarateUnauthorizedScenario = (scenarios: Scenario[], method: string, path: string): void => {
    const unauthorizedScenario: Scenario = {
      name: `Unauthorized error for ${method.toUpperCase()} ${path}`,
      steps: []
    };
    
    // Remove Authorization header or configure without auth
    unauthorizedScenario.steps.push({
      type: '*',
      text: `configure headers = null`
    });
    
    // Add path with parameters
    const pathWithParams = path.replace(/{([^}]+)}/g, '1'); // Use a dummy value for path params
    unauthorizedScenario.steps.push({
      type: '*',
      text: `path '${pathWithParams}'`
    });
    
    // Add method step
    unauthorizedScenario.steps.push({
      type: '*',
      text: `method ${method.toLowerCase()}`
    });
    
    // Add assertions
    unauthorizedScenario.steps.push({
      type: '*',
      text: `status 401`
    });
    
    scenarios.push(unauthorizedScenario);
  };

  /**
   * Generates scenarios for an API operation
   * @param {string} path - The API path
   * @param {string} method - The HTTP method
   * @param {OperationObject} operation - The operation object
   * @param {OpenAPISpec} spec - The complete OpenAPI spec
   * @param {GenerationSettings} settings - Generation settings
   * @returns {Scenario[]} - Generated scenarios
   */
  const generateScenariosForOperation = (
    path: string, 
    method: string, 
    operation: OperationObject, 
    spec: OpenAPISpec, 
    settings: GenerationSettings
  ): Scenario[] => {
    const scenarios: Scenario[] = [];
    const operationId = operation.operationId || `${method.toUpperCase()} ${path}`;
    
    // Happy path scenario
    const happyPathScenario: Scenario = {
      name: `Successfully ${getOperationDisplayName(operation, method, path)}`,
      steps: []
    };
    
    // Add path parameters step if needed
    const pathParams = getParametersByLocation(operation, spec, 'path');
    if (pathParams.length > 0) {
      const paramText = pathParams
        .map(param => `${param.name} = "${generateExampleValue(param)}"`)
        .join(', ');
        
      happyPathScenario.steps.push({
        type: 'Given',
        text: `path parameters: ${paramText}`
      });
    }
    
    // Add query parameters step if needed
    const queryParams = getParametersByLocation(operation, spec, 'query');
    if (queryParams.length > 0) {
      const paramText = queryParams
        .map(param => `${param.name} = "${generateExampleValue(param)}"`)
        .join(', ');
        
      happyPathScenario.steps.push({
        type: 'And',
        text: `query parameters: ${paramText}`
      });
    }
    
    // Add request body step if needed
    if (operation.requestBody) {
      // Check if content exists before trying to get its keys
      const contentType = operation.requestBody.content && Object.keys(operation.requestBody.content).length > 0
        ? Object.keys(operation.requestBody.content)[0]
        : 'application/json';
        
      // Also check contentType exists in content before accessing
      const schema = operation.requestBody.content?.[contentType]?.schema;
          
      if (schema) {
        if (settings.includeExamples) {
          const example = generateExampleForSchema(schema, spec);
          happyPathScenario.steps.push({
            type: 'And',
            text: `request body:`,
            codeBlock: {
              language: contentType.includes('json') ? 'json' : 'text',
              content: JSON.stringify(example, null, 2)
            }
          });
        } else {
          happyPathScenario.steps.push({
            type: 'And',
            text: `a valid request body`
          });
        }
      }
    }
    
    // Add main action step (making the request)
    happyPathScenario.steps.push({
      type: 'When',
      text: `I send a ${method.toUpperCase()} request to "${path}"`
    });
    
    // Add status code assertion
    const successResponseCode = getSuccessResponseCode(operation);
    happyPathScenario.steps.push({
      type: 'Then',
      text: `the response status should be ${successResponseCode}`
    });
    
    // Add response validation steps if needed
    if (settings.generateAssertions) {
      const responseContent = getResponseContent(operation, successResponseCode);
      if (responseContent && responseContent.schema) {
        // Generate assertions based on schema properties
        addAssertionsForResponse(happyPathScenario.steps, responseContent.schema, spec);
      }
    }
    
    scenarios.push(happyPathScenario);
    
    // If comprehensive tests are requested, add error case scenarios
    if (settings.testDepth === 'comprehensive') {
      // Add validation error scenario for required fields
      addValidationErrorScenarios(scenarios, operation, method, path, spec);
      
      // Add not found scenario for GET operations
      if (method.toLowerCase() === 'get' && path.includes('{')) {
        addNotFoundScenario(scenarios, method, path);
      }
      
      // Add unauthorized scenario if security is required
      if (operation.security || spec.security) {
        addUnauthorizedScenario(scenarios, method, path);
      }
    }
    
    return scenarios;
  };
  
  /**
   * Gets a user-friendly display name for an operation
   * @param {OperationObject} operation - The operation object
   * @param {string} method - The HTTP method
   * @param {string} path - The API path
   * @returns {string} - Operation display name
   */
  const getOperationDisplayName = (operation: OperationObject, method: string, path: string): string => {
    if (operation.summary) {
      return operation.summary;
    }
    
    // Format based on method
    switch (method.toLowerCase()) {
      case 'get':
        return path.includes('{') ? 'retrieve resource by ID' : 'list resources';
      case 'post':
        return 'create a new resource';
      case 'put':
        return 'update a resource';
      case 'patch':
        return 'partially update a resource';
      case 'delete':
        return 'delete a resource';
      default:
        return `${method} resource`;
    }
  };
  
  /**
   * Gets parameters for an operation by location (path, query, header, cookie)
   * @param {OperationObject} operation - The operation object
   * @param {OpenAPISpec} spec - The complete OpenAPI spec
   * @param {string} location - The parameter location
   * @returns {ParameterObject[]} - Parameters for the specified location
   */
  const getParametersByLocation = (
    operation: OperationObject, 
    spec: OpenAPISpec, 
    location: string
  ): ParameterObject[] => {
    const params: ParameterObject[] = [];
    
    // Check operation parameters
    if (operation.parameters) {
      const locationParams = operation.parameters.filter(p => (p as ParameterObject).in === location);
      params.push(...locationParams as ParameterObject[]);
    }
    
    // Check path item parameters
    const pathItems = spec.paths ? Object.values(spec.paths) : [];
    const pathItem = pathItems.find(p => p.parameters) as PathItemObject | undefined;
    
    if (pathItem?.parameters) {
      const locationParams = pathItem.parameters.filter(p => p.in === location);
      params.push(...locationParams);
    }
    
    // Resolve any $ref parameters
    return params.map(param => {
      if (param.$ref) {
        return resolveReference(param.$ref, spec);
      }
      return param;
    });
  };
  
  /**
   * Resolves a JSON reference to its actual object
   * @param {string} ref - The JSON reference string
   * @param {OpenAPISpec} spec - The OpenAPI specification
   * @returns {any} - The resolved object
   */
  const resolveReference = (ref: string, spec: OpenAPISpec): any => {
    if (!ref.startsWith('#/')) {
      // External references not supported in this simplified implementation
      return { type: 'object' };
    }
    
    const parts = ref.substring(2).split('/');
    let current: any = spec;
    
    for (const part of parts) {
      if (!current[part]) {
        throw new Error(`Invalid reference: ${ref}, part ${part} not found`);
      }
      current = current[part];
    }
    
    return current;
  };
  
  /**
   * Generates an example value for a parameter based on its type and format
   * @param {ParameterObject} param - The parameter object
   * @returns {string} - An example value
   */
  const generateExampleValue = (param: ParameterObject): string => {
    // Use example or default if available
    if (param.example !== undefined) {
      return String(param.example);
    }
    
    if (param.schema) {
      if (param.schema.example !== undefined) {
        return String(param.schema.example);
      }
      
      if (param.schema.default !== undefined) {
        return String(param.schema.default);
      }
      
      // Generate based on type and format
      if (param.schema.enum && param.schema.enum.length > 0) {
        return String(param.schema.enum[0]);
      }
      
      const type = param.schema.type;
      const format = param.schema.format;
      
      switch (type) {
        case 'string':
          if (format === 'date') return '2023-01-01';
          if (format === 'date-time') return '2023-01-01T00:00:00Z';
          if (format === 'email') return 'user@example.com';
          if (format === 'uuid') return '12345678-1234-1234-1234-123456789012';
          if (format === 'uri') return 'https://example.com';
          return `example-${param.name}`;
        case 'integer':
        case 'number':
          return '42';
        case 'boolean':
          return 'true';
        case 'array':
          return '[...]';
        case 'object':
          return '{...}';
        default:
          return 'example';
      }
    }
    
    return 'example';
  };
  
  /**
   * Generates an example object from a schema
   * @param {SchemaObject} schema - The JSON Schema object
   * @param {OpenAPISpec} spec - The complete OpenAPI spec
   * @returns {any} - An example object
   */
  const generateExampleForSchema = (schema: SchemaObject, spec: OpenAPISpec): any => {
    // Resolve reference if needed
    if (schema.$ref) {
      schema = resolveReference(schema.$ref, spec);
    }
    
    // Use example if available
    if (schema.example) {
      return schema.example;
    }
    
    // Use first example from examples if available
    if (schema.examples && schema.examples.length > 0) {
      return schema.examples[0];
    }
  
    const type = schema.type || 'object';
    
    switch (type) {
      case 'object': {
        const result: Record<string, any> = {};
        if (schema.properties) {
          for (const [propName, propSchema] of Object.entries(schema.properties)) {
            result[propName] = generateExampleForSchema(propSchema, spec);
          }
        }
        return result;
      }
      case 'array': {
        if (schema.items) {
          return [generateExampleForSchema(schema.items, spec)];
        }
        return [];
      }
      case 'string': {
        if (schema.enum && schema.enum.length > 0) {
          return schema.enum[0];
        }
        
        const format = schema.format;
        if (format === 'date') return '2023-01-01';
        if (format === 'date-time') return '2023-01-01T00:00:00Z';
        if (format === 'email') return 'user@example.com';
        if (format === 'uuid') return '12345678-1234-1234-1234-123456789012';
        if (format === 'uri') return 'https://example.com';
        return 'example-string';
      }
      case 'number':
      case 'integer':
        return 42;
      case 'boolean':
        return true;
      default:
        return null;
    }
  };
  
  /**
   * Gets the success response code for an operation
   * @param {OperationObject} operation - The operation object
   * @returns {string} - Success response code
   */
  const getSuccessResponseCode = (operation: OperationObject): string => {
    if (!operation.responses) {
      return '200';
    }
    
    // Common success response codes
    const successCodes = ['200', '201', '202', '203', '204', '205', '206', '207', '208', '226'];
    
    // Find the first success code used in responses
    for (const code of successCodes) {
      if (operation.responses[code]) {
        return code;
      }
    }
    
    // Default to 200 if no success code found
    return '200';
  };
  
  /**
   * Gets the response content for a specific status code
   * @param {OperationObject} operation - The operation object
   * @param {string} statusCode - The HTTP status code
   * @returns {any} - The response content
   */
  const getResponseContent = (operation: OperationObject, statusCode: string): { contentType: string, schema: SchemaObject } | null => {
    if (!operation.responses || !operation.responses[statusCode]) {
      return null;
    }
    
    const response = operation.responses[statusCode];
    
    if (!response.content) {
      return null;
    }
    
    // Prefer JSON content
    const contentType = Object.keys(response.content).find(type => type.includes('json')) || Object.keys(response.content)[0];
    
    if (!contentType) {
      return null;
    }
    
    return {
      contentType,
      schema: response.content[contentType].schema as SchemaObject
    };
  };
  
  /**
   * Adds assertions for a response based on its schema
   * @param {Step[]} steps - The array of steps to add assertions to
   * @param {SchemaObject} schema - The response schema
   * @param {OpenAPISpec} spec - The complete OpenAPI spec
   */
  const addAssertionsForResponse = (steps: Step[], schema: SchemaObject, spec: OpenAPISpec): void => {
    // Resolve reference if needed
    if (schema.$ref) {
      schema = resolveReference(schema.$ref, spec);
    }
    
    // If schema is an array, add assertions for array response
    if (schema.type === 'array') {
      steps.push({
        type: 'And',
        text: 'the response should be a valid array'
      });
      
      // If we have item schema, add example assertion
      if (schema.items) {
        // Only add this for medium or comprehensive test depth
        steps.push({
          type: 'And',
          text: 'each array item should match the expected structure'
        });
      }
      
      return;
    }
    
    // Object assertions
    if (schema.type === 'object' || schema.properties) {
      steps.push({
        type: 'And',
        text: 'the response should be a valid JSON object'
      });
      
      // Add assertions for required properties
      if (schema.required && schema.required.length > 0) {
        const requiredFields = schema.required.slice(0, 3).join(', '); // Limit to 3 for brevity
        
        steps.push({
          type: 'And',
          text: `the response should contain required fields: ${requiredFields}${schema.required.length > 3 ? ', ...' : ''}`
        });
      }
      
      // Add assertions for important properties
      if (schema.properties) {
        // Get a small sample of properties (up to 3) for assertions
        const propertyNames = Object.keys(schema.properties).slice(0, 3);
        
        propertyNames.forEach(propName => {
          const propSchema = schema.properties?.[propName];
          steps.push({
            type: 'And',
            text: `the response field "${propName}" should be a valid ${propSchema?.type || 'value'}`
          });
        });
      }
    }
  };
  
  /**
   * Adds validation error scenarios for required fields
   * @param {Scenario[]} scenarios - The array of scenarios
   * @param {OperationObject} operation - The operation object
   * @param {string} method - The HTTP method
   * @param {string} path - The API path
   * @param {OpenAPISpec} spec - The complete OpenAPI spec
   */
  const addValidationErrorScenarios = (
    scenarios: Scenario[], 
    operation: OperationObject, 
    method: string, 
    path: string, 
    spec: OpenAPISpec
  ): void => {
    // Only add validation scenarios for POST, PUT, and PATCH
    if (!['post', 'put', 'patch'].includes(method.toLowerCase())) {
      return;
    }
    
    // Check if there's a request body with required fields
    if (!operation.requestBody || !operation.requestBody.content) {
      return;
    }
    
    const contentType = Object.keys(operation.requestBody.content)[0];
    if (!contentType) {
      return;
    }
    
    let schema = operation.requestBody.content[contentType].schema;
    
    // Resolve reference if needed
    if (schema && schema.$ref) {
      schema = resolveReference(schema.$ref, spec);
    }
    
    // Check if schema has required properties
    if (!schema || !schema.required || schema.required.length === 0) {
      return;
    }
    
    // Create a validation error scenario for the first required property
    const requiredField = schema.required[0];
    
    const validationScenario: Scenario = {
      name: `Validation error when missing required field`,
      steps: []
    };
    
    // Add path parameters step if needed
    const pathParams = getParametersByLocation(operation, spec, 'path');
    if (pathParams.length > 0) {
      const paramText = pathParams
        .map(param => `${param.name} = "${generateExampleValue(param)}"`)
        .join(', ');
        
      validationScenario.steps.push({
        type: 'Given',
        text: `path parameters: ${paramText}`
      });
    }
    
    // Add invalid request body step
    validationScenario.steps.push({
      type: 'And',
      text: `request body missing required field "${requiredField}"`
    });
    
    // Add main action step
    validationScenario.steps.push({
      type: 'When',
      text: `I send a ${method.toUpperCase()} request to "${path}"`
    });
    
    // Add validation error assertions
    validationScenario.steps.push({
      type: 'Then',
      text: `the response status should be 400`
    });
    
    validationScenario.steps.push({
      type: 'And',
      text: `the response should contain validation errors`
    });
    
    scenarios.push(validationScenario);
  };
  
  /**
   * Adds a not found error scenario
   * @param {Scenario[]} scenarios - The array of scenarios
   * @param {string} method - The HTTP method
   * @param {string} path - The API path
   */
  const addNotFoundScenario = (scenarios: Scenario[], method: string, path: string): void => {
    const notFoundScenario: Scenario = {
      name: `Resource not found error`,
      steps: [
        {
          type: 'Given',
          text: `a non-existent resource ID`
        },
        {
          type: 'When',
          text: `I send a ${method.toUpperCase()} request to "${path}"`
        },
        {
          type: 'Then',
          text: `the response status should be 404`
        },
        {
          type: 'And',
          text: `the response should contain an error message`
        }
      ]
    };
    
    scenarios.push(notFoundScenario);
  };
  
  /**
   * Adds an unauthorized error scenario
   * @param {Scenario[]} scenarios - The array of scenarios
   * @param {string} method - The HTTP method
   * @param {string} path - The API path
   */
  const addUnauthorizedScenario = (scenarios: Scenario[], method: string, path: string): void => {
    const unauthorizedScenario: Scenario = {
      name: `Unauthorized error`,
      steps: [
        {
          type: 'Given',
          text: `I am not authenticated`
        },
        {
          type: 'When',
          text: `I send a ${method.toUpperCase()} request to "${path}"`
        },
        {
          type: 'Then',
          text: `the response status should be 401`
        },
        {
          type: 'And',
          text: `the response should contain an authentication error message`
        }
      ]
    };
    
    scenarios.push(unauthorizedScenario);
  };
  
  /**
   * Converts the internal feature representation to Gherkin format
   * @param {Feature} feature - The feature object
   * @returns {string} - The feature in Gherkin format
   */
  export const convertToGherkin = (feature: Feature): string => {
    let gherkin = `Feature: ${feature.name}\n`;
    
    if (feature.description) {
      gherkin += `  ${feature.description}\n`;
    }
    
    gherkin += '\n';
    
    // Add Background if present
    if (feature.background) {
      gherkin += `  Background: ${feature.background.title}\n`;
      
      feature.background.steps.forEach(step => {
        gherkin += `    ${step.type} ${step.text}\n`;
      });
      
      gherkin += '\n';
    }
    
    // Add Scenarios
    feature.scenarios.forEach(scenario => {
      gherkin += `  Scenario: ${scenario.name}\n`;
      
      scenario.steps.forEach(step => {
        gherkin += `    ${step.type} ${step.text}\n`;
        
        // Add code block if present
        if (step.codeBlock) {
          gherkin += '    """\n';
          gherkin += `    ${step.codeBlock.content}\n`;
          gherkin += '    """\n';
        }
      });
      
      gherkin += '\n';
    });
    
    return gherkin;
  };
  
  /**
   * Converts the internal feature representation to Arazzo format
   * @param {Feature} feature - The feature object
   * @returns {string} - The feature in Arazzo format
   */
  export const convertToArazzo = (feature: Feature): string => {
    let arazzo = `// Arazzo Contract Test for ${feature.name}\n`;
    arazzo += `// Generated from OpenAPI Specification\n\n`;
    
    arazzo += `import { test, expect } from '@playwright/test';\n`;
    arazzo += `import { APIRequestContext } from '@playwright/test';\n\n`;
    
    // Extract base URL from background if available
    let baseUrl = 'http://localhost:3000';
    if (feature.background) {
      const baseUrlStep = feature.background.steps.find(step => 
        step.text.includes('API base URL')
      );
      if (baseUrlStep) {
        const match = /\"(.+?)\"/.exec(baseUrlStep.text);
        if (match && match[1]) {
          baseUrl = match[1];
        }
      }
    }
    
    arazzo += `const BASE_URL = '${baseUrl}';\n\n`;
    
    // Generate setup function
    arazzo += `async function setup(request: APIRequestContext) {\n`;
    arazzo += `  // Common setup operations\n`;
    
    if (feature.background) {
      feature.background.steps.forEach(step => {
        arazzo += `  // ${step.type} ${step.text}\n`;
      });
    }
    
    arazzo += `  return {};\n`;
    arazzo += `}\n\n`;
    
    // Generate test for each scenario
    feature.scenarios.forEach(scenario => {
      // Convert scenario name to valid JavaScript function name
      const testName = scenario.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .replace(/\s+/g, '_');
      
      arazzo += `test('${scenario.name}', async ({ request }) => {\n`;
      arazzo += `  const context = await setup(request);\n\n`;
      
      // Process each step
      let method = 'GET';
      let path = '/';
      let requestBody = null;
      
      scenario.steps.forEach(step => {
        arazzo += `  // ${step.type} ${step.text}\n`;
        
        // Extract method and path
        if (step.text.includes('send a ') && step.text.includes('request to ')) {
          const methodMatch = /send a ([A-Z]+) request/.exec(step.text);
          if (methodMatch && methodMatch[1]) {
            method = methodMatch[1];
          }
          
          const pathMatch = /request to "([^"]+)"/.exec(step.text);
          if (pathMatch && pathMatch[1]) {
            path = pathMatch[1];
          }
        }
        
        // Extract request body
        if (step.text.includes('request body')) {
          if (step.codeBlock) {
            try {
              requestBody = JSON.parse(step.codeBlock.content);
              arazzo += `  const requestBody = ${step.codeBlock.content};\n`;
            } catch (e) {
              arazzo += `  const requestBody = {};\n`;
            }
          }
        }
        
        // Handle assertions
        if (step.text.includes('response status should be ')) {
          const statusMatch = /status should be ([0-9]+)/.exec(step.text);
          if (statusMatch && statusMatch[1]) {
            const status = parseInt(statusMatch[1], 10);
            arazzo += `  expect(response.status()).toBe(${status});\n`;
          }
        }
        
        if (step.text.includes('response should be a valid JSON object')) {
          arazzo += `  const responseBody = await response.json();\n`;
          arazzo += `  expect(responseBody).toBeDefined();\n`;
        }
        
        if (step.text.includes('response should be a valid array')) {
          arazzo += `  const responseBody = await response.json();\n`;
          arazzo += `  expect(Array.isArray(responseBody)).toBe(true);\n`;
        }
        
        if (step.text.includes('response should contain required fields')) {
          const fieldsMatch = /fields: ([^}]+)/.exec(step.text);
          if (fieldsMatch && fieldsMatch[1]) {
            const fields = fieldsMatch[1].split(',').map(f => f.trim()).filter(f => f !== '...');
            fields.forEach(field => {
              arazzo += `  expect(responseBody).toHaveProperty('${field}');\n`;
            });
          }
        }
      });
      
      // Make the API request
      arazzo += `\n  // Make API request\n`;
      
      // Replace path parameters with actual values
      let processedPath = path;
      const pathParams = path.match(/{([^}]+)}/g);
      if (pathParams) {
        arazzo += `  // Replace path parameters\n`;
        pathParams.forEach(param => {
          const paramName = param.substring(1, param.length - 1);
          arazzo += `  const ${paramName} = 'example-${paramName}';\n`;
          processedPath = processedPath.replace(param, `\${${paramName}}`);
        });
      }
      
      arazzo += `  const response = await request.${method.toLowerCase()}(\`\${BASE_URL}${processedPath}\``;
      
      if (requestBody) {
        arazzo += `, {\n    data: requestBody,\n    headers: {\n      'Content-Type': 'application/json'\n    }\n  }`;
      }
      
      arazzo += `);\n\n`;
      
      arazzo += `});\n\n`;
    });
    
    return arazzo;
  };

  /**
   * Converts the internal feature representation to Karate format
   * @param {Feature} feature - The feature object
   * @returns {string} - The feature in Karate format
   */
  export const convertToKarate = (feature: Feature): string => {
    let karate = `Feature: ${feature.name}\n\n`;
    
    // Add Background for setup
    karate += `Background:\n`;
    
    if (feature.background && feature.background.steps.length > 0) {
      feature.background.steps.forEach(step => {
        karate += `${step.text}\n`;
      });
    } else {
      // Add a placeholder URL if no background was generated
      karate += `* url baseUrl\n`;
    }
    
    karate += '\n';
    
    // Add Scenarios
    feature.scenarios.forEach(scenario => {
      karate += `Scenario: ${scenario.name}\n`;
      
      // Group steps by type for better readability
      // Path steps first
      const pathSteps = scenario.steps.filter(step => 
        step.text.startsWith('path ') || 
        (step.type === '*' && step.text.startsWith('def '))
      );
      
      // Then parameters
      const paramSteps = scenario.steps.filter(step => 
        step.text.startsWith('param ') || 
        step.text.startsWith('params ')
      );
      
      // Then request body
      const requestSteps = scenario.steps.filter(step => 
        step.text.startsWith('request ') || 
        step.text.startsWith('form field ')
      );
      
      // Then method
      const methodSteps = scenario.steps.filter(step => 
        step.text.startsWith('method ')
      );
      
      // Then assertions
      const assertionSteps = scenario.steps.filter(step => 
        step.text.startsWith('status ') || 
        step.text.startsWith('match ')
      );
      
      // Other steps
      const otherSteps = scenario.steps.filter(step => 
        !pathSteps.includes(step) && 
        !paramSteps.includes(step) && 
        !requestSteps.includes(step) && 
        !methodSteps.includes(step) && 
        !assertionSteps.includes(step)
      );
      
      // Combine all steps in logical order
      [...pathSteps, ...paramSteps, ...requestSteps, ...methodSteps, ...assertionSteps, ...otherSteps]
        .forEach(step => {
          // For Karate, use the text directly (skip the step.type)
          karate += `    ${step.text}\n`;
        });
      
      karate += '\n';
    });
    
    return karate;
  };