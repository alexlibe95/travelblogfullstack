import Parse from 'parse/node.js';
import { ISLAND_CLASS_NAME, ISLAND_FIELDS } from '../../constants/islands.js';
import { buildThumbName, createThumbnail } from '../utils/image.js';
import { MAX_IMAGE_SIZE_BYTES, MAX_IMAGE_SIZE_MB } from '../../constants/index.js';
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

  if (photo.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(`Photo must be smaller than ${MAX_IMAGE_SIZE_MB}MB`);
  }
});

/**
 * AFTER SAVE
 * - Automatically generate thumbnail (THUMB_WIDTHxTHUMB_HEIGHT)
 */
Parse.Cloud.afterSave(ISLAND_CLASS_NAME, async (request) => {
  const island = request.object;
  const original = request.original;

  if (!original) return;

  const oldPhoto = original.get(ISLAND_FIELDS.PHOTO);
  const newPhoto = island.get(ISLAND_FIELDS.PHOTO);

  if (!newPhoto || oldPhoto?.url() === newPhoto?.url()) {
    return;
  }

  const originalName = newPhoto.name() ?? 'photo.jpg';
  const thumbName = buildThumbName(originalName);

  const response = await fetch(newPhoto.url());
  const buffer = Buffer.from(await response.arrayBuffer());

  const thumbBuffer = await createThumbnail(buffer);

  const thumbFile = new Parse.File(thumbName, { base64: thumbBuffer.toString('base64') });

  await thumbFile.save({ useMasterKey: true });

  island.set(ISLAND_FIELDS.PHOTO_THUMB, thumbFile);
  await island.save(null, { useMasterKey: true });
});
