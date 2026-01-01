/**
 * Island schema definition
 * Controlled via code (Schema from code – Mode A)
 */
export const schemaDefinitions = [
  {
    className: 'Island',
    fields: {
      name: {
        type: 'String',
        required: true,
      },
      short_description: {
        type: 'String',
        required: true,
      },
      description: {
        type: 'String',
        required: true,
      },
      order: {
        type: 'Number',
        required: true,
      },
      site: {
        type: 'String',
        required: false,
      },
      photo: {
        type: 'File',
        required: false,
      },
      photo_thumb: {
        type: 'File',
        required: false,
      },
      location: {
        type: 'GeoPoint',
        required: false,
      },
    },
    classLevelPermissions: {
      find: { '*': true },
      get: { '*': true },
      create: { 'role:Admin': true },
      update: { 'role:Admin': true },
      delete: { 'role:Admin': true },
      addField: {},
    },
  },
];
