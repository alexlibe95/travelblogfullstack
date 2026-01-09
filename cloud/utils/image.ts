import sharp from 'sharp';
import { env } from '../../src/utils/env.js';

/**
 * Create a THUMB_WIDTHxTHUMB_HEIGHT thumbnail
 */
export async function createThumbnail(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(Number(env.THUMB_WIDTH), Number(env.THUMB_HEIGHT), {
      fit: 'cover',
    })
    .jpeg({ quality: 80 })
    .toBuffer();
}

export function buildThumbName(originalName: string) {
  const dotIndex = originalName.lastIndexOf('.');
  if (dotIndex === -1) {
    return `${originalName}_thumb`;
  }

  const base = originalName.substring(0, dotIndex);
  const ext = originalName.substring(dotIndex);

  return `${base}_thumb${ext}`;
}
