import sharp from 'sharp';
import { env } from '../../src/utils/env.js';

/**
 * Create a 250x250 thumbnail
 */
export async function createThumbnail(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(Number(env.THUMB_WIDTH), Number(env.THUMB_HEIGHT), {
      fit: 'cover',
    })
    .jpeg({ quality: 80 })
    .toBuffer();
}
