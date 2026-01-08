import Parse from 'parse/node.js';
import { ISLAND_CLASS_NAME, ISLAND_FIELDS } from '../../constants/islands.js';
import { createThumbnail } from '../utils/image.js';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/**
 * BEFORE SAVE
 * - Validate photo file size (<= 5MB)
 */
Parse.Cloud.beforeSave(ISLAND_CLASS_NAME, async (request) => {
  const island = request.object;

  if (!island.dirty(ISLAND_FIELDS.PHOTO)) {
    return;
  }

  const photo = island.get(ISLAND_FIELDS.PHOTO);

  if (!photo) return;

  if (photo.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`Photo must be smaller than ${MAX_FILE_SIZE_MB}MB`);
  }
});

/**
 * AFTER SAVE
 * - Automatically generate thumbnail (250x250)
 */
Parse.Cloud.afterSave(ISLAND_CLASS_NAME, async (request) => {
  const island = request.object;

  // Run only when photo changes
  if (!island.dirty(ISLAND_FIELDS.PHOTO)) {
    return;
  }

  const photo = island.get(ISLAND_FIELDS.PHOTO);
  if (!photo) return;

  // Prevent infinite loop
  if (island.get(ISLAND_FIELDS.PHOTO_THUMB)) {
    return;
  }

  // Download original image
  const response = await fetch(photo.url());
  const buffer = Buffer.from(await response.arrayBuffer());

  // Create thumbnail
  const thumbBuffer = await createThumbnail(buffer);

  // Save thumbnail as Parse File
  const thumbFile = new Parse.File('photo_thumb.jpg', { base64: thumbBuffer.toString('base64') });

  await thumbFile.save({ useMasterKey: true });

  // Save thumbnail reference
  island.set(ISLAND_FIELDS.PHOTO_THUMB, thumbFile);
  await island.save(null, { useMasterKey: true });
});
