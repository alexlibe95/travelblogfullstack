import { schemaDefinitions } from './cloud/schema.js';

export const config = {
  databaseURI: process.env.DB_URI!,

  cloud: () => import('./cloud/main.js'),

  appId: process.env.APP_ID!,

  masterKey: process.env.MASTER_KEY!,

  serverURL: process.env.SERVER_URL!,

  schema: {
    definitions: schemaDefinitions,
    lockSchemas: true,
    strict: true,
    recreateModifiedFields: false,
    deleteExtraFields: false,
  },
};
