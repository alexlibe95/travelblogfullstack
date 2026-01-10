import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import openapiTS from 'openapi-typescript';

const openApiSpecUrl = process.env.API_DOCS_URL || 'http://localhost:5000/api-docs.json';
const outputPath = join(process.cwd(), 'src/lib/api');
const typesPath = join(outputPath, 'types.ts');
const clientPath = join(outputPath, 'client.ts');

console.log(`📦 Generating API types from: ${openApiSpecUrl}`);
console.log(`📁 Output directory: ${outputPath}`);

// Ensure output directory exists
mkdirSync(outputPath, { recursive: true });

// Use the URL directly (openapi-typescript supports HTTP URLs)
openapiTS(openApiSpecUrl, {
  exportType: true,
})
  .then((types) => {
    // Write types file
    writeFileSync(typesPath, types.join('\n\n'), 'utf-8');
    console.log(`✅ Types generated: ${typesPath}`);

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
  })
  .catch((error) => {
    console.error('❌ Failed to generate API client:', error);
    console.log('💡 Make sure the backend server is running and accessible');
    process.exit(1);
  });
