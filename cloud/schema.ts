/**
 * Island schema definition
 * Controlled via code (Schema from code – Mode A)
 */
export const schemaDefinitions = [
  {
    className: 'Islands',
    fields: {
      title: {
        type: 'String',
        required: true,
      },
      short_info: {
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
      url: {
        type: 'String',
        required: false,
      },
      photo: {
        type: 'String',
        required: false,
      },
      photo_thumb: {
        type: 'String',
        required: false,
      },
      location: {
        type: 'GeoPoint',
        required: false,
      },
      site: {
        type: 'String',
        required: false,
      },
      name: {
        type: 'String',
        required: false,
      },
      short_description: {
        type: 'String',
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
