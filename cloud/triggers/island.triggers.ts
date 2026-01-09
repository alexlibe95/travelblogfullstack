import Parse from 'parse/node.js';
import { ISLAND_CLASS_NAME, ISLAND_FIELDS } from '../../constants/islands.js';
import { buildThumbName, createThumbnail } from '../utils/image.js';
import { MAX_IMAGE_SIZE_BYTES, MAX_IMAGE_SIZE_MB } from '../../constants/index.js';
import { logger } from '../../src/utils/logger.js';
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
 * Process thumbnail generation asynchronously
 * This function runs in the background and doesn't block the afterSave trigger
 */
async function processThumbnail(island: Parse.Object, photo: Parse.File): Promise<void> {
  try {
    const originalName = photo.name() ?? 'photo.jpg';
    const thumbName = buildThumbName(originalName);

    // Fetch the original image
    const response = await fetch(photo.url());
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // Generate thumbnail
    const thumbBuffer = await createThumbnail(buffer);

    // Save thumbnail file
    const thumbFile = new Parse.File(thumbName, {
      base64: thumbBuffer.toString('base64'),
    });

    await thumbFile.save({ useMasterKey: true });

    // Update island with thumbnail
    island.set(ISLAND_FIELDS.PHOTO_THUMB, thumbFile);
    await island.save(null, { useMasterKey: true });
  } catch (error) {
    // Log error but don't throw - thumbnail generation failure shouldn't break the save
    logger.error(
      { error, islandId: island.id, photoUrl: photo.url() },
      'Thumbnail generation failed'
    );
    // Optionally, you could set a flag on the island to indicate thumbnail generation failed
  }
}

/**
 * AFTER SAVE
 * - Automatically generate thumbnail (THUMB_WIDTHxTHUMB_HEIGHT)
 * - Thumbnail generation happens asynchronously to avoid blocking the request
 */
Parse.Cloud.afterSave(ISLAND_CLASS_NAME, async (request) => {
  const island = request.object;
  const original = request.original;

  if (!original) return;

  const oldPhoto = original.get(ISLAND_FIELDS.PHOTO);
  const newPhoto = island.get(ISLAND_FIELDS.PHOTO);

  // Skip if no new photo or photo hasn't changed
  if (!newPhoto || oldPhoto?.url() === newPhoto?.url()) {
    return;
  }

  // Process thumbnail generation asynchronously (fire-and-forget)
  // This allows the afterSave trigger to complete immediately
  // The thumbnail will be generated in the background
  setImmediate(() => {
    processThumbnail(island, newPhoto).catch((error) => {
      logger.error({ error, islandId: island.id }, 'Async thumbnail processing error');
    });
  });
});
