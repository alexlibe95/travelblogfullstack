/**
 * Island schema definition
 * Schema from code (Mode A)
 */

import { ISLAND_CLASS_NAME, ISLAND_FIELDS } from '../constants/islands.js';

export const schemaDefinitions = [
  {
    className: ISLAND_CLASS_NAME,
    fields: {
      [ISLAND_FIELDS.NAME]: {
        type: 'String',
        required: true,
      },

      [ISLAND_FIELDS.SHORT_DESCRIPTION]: {
        type: 'String',
        required: true,
      },

      [ISLAND_FIELDS.DESCRIPTION]: {
        type: 'String',
        required: true,
      },

      [ISLAND_FIELDS.ORDER]: {
        type: 'Number',
        required: true,
      },

      [ISLAND_FIELDS.SITE]: {
        type: 'String',
        required: false,
      },

      [ISLAND_FIELDS.PHOTO]: {
        type: 'File',
        required: false,
      },

      [ISLAND_FIELDS.PHOTO_THUMB]: {
        type: 'File',
        required: false,
      },

      [ISLAND_FIELDS.LOCATION]: {
        type: 'GeoPoint',
        required: false,
      },
    },

    classLevelPermissions: {
      // Public access
      find: { '*': true },
      get: { '*': true },

      // Admin only
      create: { 'role:Admin': true },
      update: { 'role:Admin': true },
      delete: { 'role:Admin': true },

      // Lock schema modifications
      addField: {},
    },
  },
];
