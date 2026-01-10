import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface OpenApiParameter {
  in: 'path' | 'query' | 'header' | 'cookie';
  name: string;
  required?: boolean;
  description?: string;
  schema?: {
    type?: string;
  };
}

interface OpenApiPathMethod {
  summary?: string;
  tags?: string[];
  parameters?: OpenApiParameter[];
  requestBody?: {
    required?: boolean;
    content?: {
      'application/json'?: {
        schema?: { $ref?: string };
      };
      'multipart/form-data'?: {
        schema?: {
          properties?: Record<string, unknown>;
        };
      };
    };
  };
  security?: Record<string, unknown[]>[];
}

type OpenApiPath = Record<string, OpenApiPathMethod>;

interface OpenApiSpec {
  paths: Record<string, OpenApiPath>;
  components?: {
    schemas?: Record<string, unknown>;
  };
}

interface Endpoint {
  path: string;
  method: string;
  methodName: string;
  summary?: string;
  hasAuth: boolean;
  pathParams: string[];
  queryParams: { name: string; required: boolean; type: string }[];
  bodyType?: string;
  hasBody: boolean;
  isFormData: boolean;
  formDataFieldName?: string;
}

/**
 * Convert path to method name
 * Example: "/api/islands/{id}" -> "getIslandById"
 */
function pathToMethodName(path: string, method: string, summary?: string): string {
  // Handle specific endpoints
  if (path === '/api/auth/login') return 'login';
  if (path === '/api/auth/logout') return 'logout';
  if (path === '/health') return 'checkHealth';
  if (path === '/') return 'getRootInfo';
  if (path === '/api/search') return 'searchIslands';
  
  // Remove leading slash and split by /
  const parts = path.replace(/^\//, '').split('/').filter(p => p);
  
  // Extract resource name
  let resourceName = '';
  let action = '';
  
  // Find resource name (usually the last non-parameter part before {id} or at the end)
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    if (!part.startsWith('{') && part !== 'api' && part !== 'photo') {
      resourceName = part;
      break;
    }
  }
  
  // Determine action based on method and path structure
  if (parts.includes('photo')) {
    action = 'uploadPhoto';
    resourceName = parts.find(p => p !== 'photo' && p !== 'api' && !p.startsWith('{')) || 'island';
  } else if (parts.some(p => p.startsWith('{'))) {
    // Has path parameter (like {id})
    if (method === 'GET') {
      action = 'getById';
    } else if (method === 'PUT') {
      action = 'update';
    } else if (method === 'DELETE') {
      action = 'delete';
    } else {
      action = method.toLowerCase();
    }
  } else {
    // No path parameters
    if (method === 'GET') {
      action = 'getAll';
    } else if (method === 'POST') {
      action = 'create';
    } else {
      action = method.toLowerCase();
    }
  }
  
  // Use summary hints if available
  if (summary) {
    const summaryLower = summary.toLowerCase();
    if (summaryLower.includes('get all') || summaryLower.includes('list')) {
      action = 'getAll';
    } else if (summaryLower.includes('get') && summaryLower.includes('by id')) {
      action = 'getById';
    } else if (summaryLower.includes('update') || summaryLower.includes('edit')) {
      action = 'update';
    } else if (summaryLower.includes('upload')) {
      action = 'uploadPhoto';
    } else if (summaryLower.includes('search')) {
      action = 'search';
    }
  }
  
  // Build method name
  if (resourceName) {
    // Singularize resource name
    const singularResource = resourceName.endsWith('s') ? resourceName.slice(0, -1) : resourceName;
    const capitalizedResource = singularResource.charAt(0).toUpperCase() + singularResource.slice(1);
    return `${action}${capitalizedResource}`;
  }
  
  // Fallback
  return `${method.toLowerCase()}${path.split('/').pop()?.replace(/[{}]/g, '') || 'Endpoint'}`;
}

/**
 * Extract path parameters
 */
function extractPathParams(path: string): string[] {
  const matches = path.match(/\{(\w+)\}/g);
  return matches ? matches.map(m => m.replace(/[{}]/g, '')) : [];
}

/**
 * Generate service class code
 */
function generateServiceClass(
  serviceName: string,
  endpoints: Endpoint[]
): string {
  const className = `${serviceName}Service`;
  const serviceVar = `${serviceName.toLowerCase()}Service`;
  
  // Check if we need to import components (only if any endpoint has a bodyType)
  const needsComponents = endpoints.some(e => e.bodyType);
  
  // Build imports
  let imports = `import { apiClient, createAuthenticatedClient } from '../client';`;
  if (needsComponents) {
    imports += `\nimport type { components } from '../types';`;
  }
  
  let code = `${imports}

/**
 * ${serviceName} Service
 * Auto-generated service class for ${serviceName} endpoints
 */
export class ${className} {
  private client = apiClient;
  private authToken: string | null = null;

  /**
   * Set authentication token for authenticated requests
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    this.authToken = null;
  }

  private getClient() {
    if (this.authToken) {
      return createAuthenticatedClient(this.authToken);
    }
    return this.client;
  }

`;

  // Generate methods for each endpoint
  for (const endpoint of endpoints) {
    const { path, method, methodName, summary, pathParams, queryParams, bodyType, hasBody, isFormData, formDataFieldName } = endpoint;
    
    // Build method signature
    const params: string[] = [];
    
    // Add path parameters
    for (const param of pathParams) {
      params.push(`${param}: string`);
    }
    
    // Add query parameters if needed
    if (queryParams.length > 0) {
      const requiredParams = queryParams.filter(p => p.required);
      const optionalParams = queryParams.filter(p => !p.required);
      
      if (requiredParams.length > 0) {
        // Create inline type for required params
        const requiredType = requiredParams.map(p => `${p.name}: ${p.type}`).join('; ');
        if (optionalParams.length > 0) {
          const optionalType = optionalParams.map(p => `${p.name}?: ${p.type}`).join('; ');
          params.push(`query: { ${requiredType}; ${optionalType} }`);
        } else {
          params.push(`query: { ${requiredType} }`);
        }
      } else {
        // All optional
        const optionalType = optionalParams.map(p => `${p.name}?: ${p.type}`).join('; ');
        params.push(`query?: { ${optionalType} }`);
      }
    }
    
    // Add body parameter if needed
    if (hasBody && !isFormData) {
      const bodyTypeName = bodyType || 'unknown';
      params.push(`body: components['schemas']['${bodyTypeName}']`);
    } else if (isFormData) {
      params.push('file: File');
    }
    
    const paramsStr = params.join(', ');
    
    // Build method body
    let methodBody = '';
    
    if (method === 'GET') {
      methodBody = `    const { data, error } = await this.getClient().GET('${path}'`;
      if (pathParams.length > 0 || queryParams.length > 0) {
        methodBody += ', {\n';
        if (pathParams.length > 0) {
          methodBody += `      params: {\n        path: { ${pathParams.map(p => `${p}`).join(', ')} },\n`;
          if (queryParams.length > 0) {
            methodBody += `        query,\n`;
          }
          methodBody += '      },\n';
        } else if (queryParams.length > 0) {
          methodBody += `      params: {\n        query,\n      },\n`;
        }
        methodBody += '    }';
      }
      methodBody += ');\n';
    } else if (method === 'POST') {
      methodBody = `    const { data, error } = await this.getClient().POST('${path}'`;
      if (pathParams.length > 0 || hasBody || queryParams.length > 0) {
        methodBody += ', {\n';
        if (pathParams.length > 0) {
          methodBody += `      params: {\n        path: { ${pathParams.map(p => `${p}`).join(', ')} },\n`;
          if (queryParams.length > 0) {
            methodBody += `        query,\n`;
          }
          methodBody += '      },\n';
        } else if (queryParams.length > 0) {
          methodBody += `      params: {\n        query,\n      },\n`;
        }
        if (isFormData) {
          // Create FormData for file upload
          // Note: openapi-fetch handles FormData at runtime, but TypeScript needs type assertion
          const fieldName = formDataFieldName || 'photo';
          methodBody += `      body: (() => {\n`;
          methodBody += `        const formData = new FormData();\n`;
          methodBody += `        formData.append('${fieldName}', file);\n`;
          methodBody += `        return formData as unknown as { ${fieldName}: string };\n`;
          methodBody += `      })(),\n`;
        } else if (hasBody) {
          methodBody += `      body,\n`;
        }
        methodBody += '    }';
      }
      methodBody += ');\n';
    } else if (method === 'PUT') {
      methodBody = `    const { data, error } = await this.getClient().PUT('${path}'`;
      if (pathParams.length > 0 || hasBody || queryParams.length > 0) {
        methodBody += ', {\n';
        if (pathParams.length > 0) {
          methodBody += `      params: {\n        path: { ${pathParams.map(p => `${p}`).join(', ')} },\n`;
          if (queryParams.length > 0) {
            methodBody += `        query,\n`;
          }
          methodBody += '      },\n';
        } else if (queryParams.length > 0) {
          methodBody += `      params: {\n        query,\n      },\n`;
        }
        if (hasBody) {
          methodBody += `      body,\n`;
        }
        methodBody += '    }';
      }
      methodBody += ');\n';
    } else if (method === 'DELETE') {
      methodBody = `    const { data, error } = await this.getClient().DELETE('${path}'`;
      if (pathParams.length > 0 || queryParams.length > 0) {
        methodBody += ', {\n';
        if (pathParams.length > 0) {
          methodBody += `      params: {\n        path: { ${pathParams.map(p => `${p}`).join(', ')} },\n`;
          if (queryParams.length > 0) {
            methodBody += `        query,\n`;
          }
          methodBody += '      },\n';
        } else if (queryParams.length > 0) {
          methodBody += `      params: {\n        query,\n      },\n`;
        }
        methodBody += '    }';
      }
      methodBody += ');\n';
    }
    
    methodBody += `    
    if (error) {
      throw new Error(\`${methodName} failed: \${JSON.stringify(error)}\`);
    }
    
    return { data, error: null };
  }`;

    // Add JSDoc comment
    const jsdoc = summary ? `  /**\n   * ${summary}\n   */\n` : '';
    
    code += `${jsdoc}  async ${methodName}(${paramsStr}): Promise<{ data: unknown; error: null } | { data: null; error: Error }> {\n${methodBody}\n\n`;
  }
  
  code += `}\n\n`;
  code += `// Export singleton instance\n`;
  code += `export const ${serviceVar} = new ${className}();\n`;
  
  return code;
}

// Main generation function
function generateServices() {
  const openApiSpecPath = join(process.cwd(), '../backend/openapi.json');
  const outputPath = join(process.cwd(), 'src/lib/api/services');

  // Check if OpenAPI spec exists
  if (!existsSync(openApiSpecPath)) {
    console.error(`❌ OpenAPI spec not found at: ${openApiSpecPath}`);
    console.log('💡 Run "npm run export:openapi" in the backend directory first');
    process.exit(1);
  }

  console.log(`📦 Generating API services from: ${openApiSpecPath}`);
  console.log(`📁 Output directory: ${outputPath}`);

  // Ensure output directory exists
  mkdirSync(outputPath, { recursive: true });

  // Read OpenAPI spec
  const specContent = readFileSync(openApiSpecPath, 'utf-8');
  const spec: OpenApiSpec = JSON.parse(specContent);

  if (!spec.paths) {
    console.error('❌ No paths found in OpenAPI spec');
    process.exit(1);
  }

  // Group endpoints by tag
  const endpointsByTag: Record<string, Endpoint[]> = {};

  // Process each path
  for (const [path, pathObj] of Object.entries(spec.paths)) {
    for (const [method, methodObj] of Object.entries(pathObj)) {
      if (!['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
        continue;
      }

      const tags = methodObj.tags || ['Default'];
      const tag = tags[0];
      const summary = methodObj.summary;
      const methodName = pathToMethodName(path, method.toUpperCase(), summary);
      const pathParams = extractPathParams(path);
      
      // Extract query parameters with types
      const queryParams: { name: string; required: boolean; type: string }[] = [];
      if (methodObj.parameters) {
        for (const param of methodObj.parameters) {
          if (param.in === 'query') {
            const paramType = param.schema?.type === 'string' ? 'string' : 
                             param.schema?.type === 'number' ? 'number' :
                             param.schema?.type === 'boolean' ? 'boolean' : 'string';
            queryParams.push({
              name: param.name,
              required: param.required || false,
              type: paramType,
            });
          }
        }
      }
      
      // Extract body type from schema reference
      let bodyType: string | undefined;
      const requestBody = methodObj.requestBody;
      if (requestBody?.content?.['application/json']?.schema?.$ref) {
        const ref = requestBody.content['application/json'].schema.$ref;
        // Extract schema name from #/components/schemas/LoginRequest
        const match = ref.match(/#\/components\/schemas\/(.+)/);
        if (match) {
          bodyType = match[1];
        }
      }
      
      // Check for request body
      const hasBody = !!methodObj.requestBody;
      const multipartContent = methodObj.requestBody?.content?.['multipart/form-data'];
      const isFormData = !!multipartContent;
      
      // Extract form data field name from schema properties
      let formDataFieldName: string | undefined;
      if (isFormData && multipartContent?.schema?.properties) {
        // Get the first property name from the schema
        const properties = multipartContent.schema.properties as Record<string, unknown>;
        formDataFieldName = Object.keys(properties)[0] || 'file';
      }
      
      // Determine if endpoint requires auth (check for security array)
      const hasAuth = !!methodObj.security && methodObj.security.length > 0;

      if (!endpointsByTag[tag]) {
        endpointsByTag[tag] = [];
      }

      endpointsByTag[tag].push({
        path,
        method: method.toUpperCase(),
        methodName,
        summary,
        hasAuth,
        pathParams,
        queryParams,
        bodyType,
        hasBody,
        isFormData,
        formDataFieldName,
      });
    }
  }

  // Generate service files
  const serviceExports: string[] = [];

  for (const [tag, endpoints] of Object.entries(endpointsByTag)) {
    const serviceName = tag === 'Default' ? 'Api' : tag;
    const serviceCode = generateServiceClass(serviceName, endpoints);
    const serviceFileName = `${serviceName.toLowerCase()}.service.ts`;
    const serviceFilePath = join(outputPath, serviceFileName);

    writeFileSync(serviceFilePath, serviceCode, 'utf-8');
    console.log(`✅ Generated ${serviceFileName} (${endpoints.length} methods)`);
    
    serviceExports.push(`export * from './${serviceName.toLowerCase()}.service';`);
  }

  // Generate index file
  const indexContent = `/**
 * Auto-generated API Services
 * Import services from here
 */

${serviceExports.join('\n')}
`;

  const indexPath = join(outputPath, 'index.ts');
  writeFileSync(indexPath, indexContent, 'utf-8');
  console.log(`✅ Generated index.ts`);
  console.log(`✅ Generated ${Object.keys(endpointsByTag).length} service class(es) with ${Object.values(endpointsByTag).reduce((sum, arr) => sum + arr.length, 0)} total methods`);
}

// Run generation
try {
  generateServices();
} catch (error) {
  console.error('❌ Failed to generate services:', error);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = error as any;
  if (err.message) {
    console.error('Error details:', err.message);
  }
  process.exit(1);
}
