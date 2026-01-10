import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const openApiSpecPath = join(process.cwd(), '../backend/openapi.json');
const outputPath = join(process.cwd(), 'src/lib/api');
const typesPath = join(outputPath, 'types.ts');
const clientPath = join(outputPath, 'client.ts');

// Check if OpenAPI spec exists
if (!existsSync(openApiSpecPath)) {
  console.error(`❌ OpenAPI spec not found at: ${openApiSpecPath}`);
  console.log('💡 Run "npm run export:openapi" in the backend directory first');
  process.exit(1);
}

console.log(`📦 Generating API types from: ${openApiSpecPath}`);
console.log(`📁 Output directory: ${outputPath}`);

// Ensure output directory exists
mkdirSync(outputPath, { recursive: true });

// Read and validate the OpenAPI spec
interface OpenApiSpec {
  openapi: string;
  paths?: Record<string, unknown>;
}
let openApiSpec: OpenApiSpec;
try {
  const specContent = readFileSync(openApiSpecPath, 'utf-8');
  openApiSpec = JSON.parse(specContent);
  
  // Validate openapi version
  if (!openApiSpec.openapi || !openApiSpec.openapi.startsWith('3.')) {
    console.error(`❌ Invalid OpenAPI version: ${openApiSpec.openapi}`);
    console.log('💡 Expected OpenAPI 3.x format');
    process.exit(1);
  }
  
  // Ensure paths exist (required by OpenAPI)
  if (!openApiSpec.paths || Object.keys(openApiSpec.paths).length === 0) {
    console.warn('⚠️  Warning: No paths found in OpenAPI spec');
  }
  
  console.log(`✅ OpenAPI spec validated (version: ${openApiSpec.openapi}, ${Object.keys(openApiSpec.paths || {}).length} paths)`);
} catch (error) {
  console.error('❌ Failed to read or parse OpenAPI spec:', error);
  process.exit(1);
}

// Use CLI approach to get source code instead of AST
// This ensures we get actual TypeScript source code
try {
  console.log('📦 Running openapi-typescript CLI...');
  
  // Use npx to run openapi-typescript CLI
  const execResult = execSync(
    `npx --yes openapi-typescript "${openApiSpecPath}" --export-type`,
    { encoding: 'utf-8', cwd: process.cwd(), stdio: 'pipe' }
  );
  
  // Ensure we have a string (execSync with encoding: 'utf-8' should return string, but handle edge cases)
  let typesContent: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = execResult;
  if (typeof result === 'string') {
    typesContent = result;
  } else if (Array.isArray(result)) {
    // If it's an array, convert each element to string and join
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typesContent = (result as any[]).map((item: any) => String(item)).join('');
  } else if (Buffer.isBuffer(result)) {
    // If it's a buffer, convert to string
    typesContent = result.toString('utf-8');
  } else {
    // Fallback: convert to string
    typesContent = String(result);
  }
  
  // Trim any extra whitespace
  typesContent = typesContent.trim();
  
  if (!typesContent || typesContent.length === 0) {
    throw new Error('openapi-typescript CLI returned empty output');
  }
  
  // Post-process the generated types to fix linting issues
  console.log('🔧 Post-processing generated types...');
  
  // Add eslint-disable comment at the top for generated file rules
  // These rules don't work well with auto-generated code
  const eslintDisable = `/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
`;
  
  // Replace index signatures with Record types for better linting
  // Pattern: headers: { [name: string]: unknown; } -> headers: Record<string, unknown>
  // Match the pattern where it's inside an object property
  typesContent = typesContent.replace(
    /(\w+):\s*\{\s*\[name: string\]: unknown;\s*\}/g,
    '$1: Record<string, unknown>'
  );
  
  // Prepend eslint-disable comments (but preserve the original comment if it exists)
  if (!typesContent.includes('eslint-disable')) {
    typesContent = eslintDisable + typesContent;
  }
  
  // Write types file
  writeFileSync(typesPath, typesContent, 'utf-8');
  console.log(`✅ Types generated: ${typesPath} (${typesContent.length} characters)`);

  // Generate a simple client wrapper
  const clientCode = `import type { paths } from './types';
import createClient from 'openapi-fetch';
import { environment } from '../../environments/environment';

export type ApiPaths = paths;

const baseUrl = environment.apiBaseUrl;

export const apiClient = createClient<ApiPaths>({
  baseUrl,
});

// Helper to create a client with auth token
export function createAuthenticatedClient(token: string) {
  return createClient<ApiPaths>({
    baseUrl,
    headers: {
      'x-parse-session-token': token,
    },
  });
}

export default apiClient;
`;

  writeFileSync(clientPath, clientCode, 'utf-8');
  console.log(`✅ Client generated: ${clientPath}`);
  console.log('✅ API client generation completed!');
  
  // Note: Run "npm run generate:services" separately to generate service classes
} catch (error) {
  console.error('❌ Failed to generate API client:', error);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = error as any;
  if (err.message) {
    console.error('Error details:', err.message);
  }
  if (err.stdout) {
    console.error('STDOUT:', err.stdout);
  }
  if (err.stderr) {
    console.error('STDERR:', err.stderr);
  }
  process.exit(1);
}
