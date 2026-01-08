/**
 * Island field constants
 * Centralized field names for Islands class to avoid hardcoding
 */

export const ISLAND_FIELDS = {
  // Core fields
  NAME: 'name',
  SHORT_DESCRIPTION: 'short_description',
  DESCRIPTION: 'description',
  ORDER: 'order',
  SITE: 'site',
  PHOTO: 'photo',
  PHOTO_THUMB: 'photo_thumb',
  LOCATION: 'location',
  // Parse system fields
  OBJECT_ID: 'objectId',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
} as const;

/**
 * Fields returned in list view (basic info)
 */
export const ISLAND_LIST_FIELDS = [
  ISLAND_FIELDS.NAME,
  ISLAND_FIELDS.SHORT_DESCRIPTION,
  ISLAND_FIELDS.PHOTO_THUMB,
  ISLAND_FIELDS.ORDER,
] as const;

/**
 * Fields returned in detail view (full info)
 */
export const ISLAND_DETAIL_FIELDS = [
  ISLAND_FIELDS.NAME,
  ISLAND_FIELDS.SHORT_DESCRIPTION,
  ISLAND_FIELDS.DESCRIPTION,
  ISLAND_FIELDS.ORDER,
  ISLAND_FIELDS.SITE,
  ISLAND_FIELDS.PHOTO,
  ISLAND_FIELDS.PHOTO_THUMB,
  ISLAND_FIELDS.LOCATION,
] as const;

/**
 * Class name constant
 */
export const ISLAND_CLASS_NAME = 'Islands' as const;
