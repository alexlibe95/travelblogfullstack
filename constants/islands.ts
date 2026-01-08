/**
 * Island field constants
 * Centralized field names for Islands class to avoid hardcoding
 */

export const ISLAND_FIELDS = {
  // Core fields
  TITLE: 'title',
  SHORT_INFO: 'short_info',
  DESCRIPTION: 'description',
  ORDER: 'order',
  URL: 'url',
  PHOTO: 'photo',
  PHOTO_THUMB: 'photo_thumb',
  LOCATION: 'location',
  // Legacy/optional fields
  SITE: 'site',
  NAME: 'name',
  SHORT_DESCRIPTION: 'short_description',
  // Parse system fields
  OBJECT_ID: 'objectId',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
} as const;

/**
 * Fields returned in list view (basic info)
 */
export const ISLAND_LIST_FIELDS = [
  ISLAND_FIELDS.TITLE,
  ISLAND_FIELDS.SHORT_INFO,
  ISLAND_FIELDS.PHOTO,
  ISLAND_FIELDS.PHOTO_THUMB,
  ISLAND_FIELDS.ORDER,
] as const;

/**
 * Fields returned in detail view (full info)
 */
export const ISLAND_DETAIL_FIELDS = [
  ISLAND_FIELDS.TITLE,
  ISLAND_FIELDS.SHORT_INFO,
  ISLAND_FIELDS.DESCRIPTION,
  ISLAND_FIELDS.ORDER,
  ISLAND_FIELDS.URL,
  ISLAND_FIELDS.PHOTO,
  ISLAND_FIELDS.PHOTO_THUMB,
  ISLAND_FIELDS.LOCATION,
] as const;

/**
 * Class name constant
 */
export const ISLAND_CLASS_NAME = 'Islands' as const;
