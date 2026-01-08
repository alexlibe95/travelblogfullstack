/**
 * Island schema definition
 * Controlled via code (Schema from code – Mode A)
 */
import { ISLAND_CLASS_NAME, ISLAND_FIELDS } from '../constants/islands.js';

export const schemaDefinitions = [
  {
    className: ISLAND_CLASS_NAME,
    fields: {
      [ISLAND_FIELDS.TITLE]: {
        type: 'String',
        required: true,
      },
      [ISLAND_FIELDS.SHORT_INFO]: {
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
      [ISLAND_FIELDS.URL]: {
        type: 'String',
        required: false,
      },
      [ISLAND_FIELDS.PHOTO]: {
        type: 'String',
        required: false,
      },
      [ISLAND_FIELDS.PHOTO_THUMB]: {
        type: 'String',
        required: false,
      },
      [ISLAND_FIELDS.LOCATION]: {
        type: 'GeoPoint',
        required: false,
      },
      [ISLAND_FIELDS.SITE]: {
        type: 'String',
        required: false,
      },
      [ISLAND_FIELDS.NAME]: {
        type: 'String',
        required: false,
      },
      [ISLAND_FIELDS.SHORT_DESCRIPTION]: {
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
