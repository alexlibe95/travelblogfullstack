import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createThumbnail, buildThumbName } from './image.js';
import sharp from 'sharp';

// Mock sharp
vi.mock('sharp', () => {
  const mockSharp = vi.fn().mockReturnValue({
    resize: vi.fn().mockReturnThis(),
    jpeg: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from('mock-thumbnail')),
  });

  return {
    default: mockSharp,
  };
});

// Mock env
vi.mock('../../src/utils/env.js', () => ({
  env: {
    THUMB_WIDTH: '300',
    THUMB_HEIGHT: '300',
  },
}));

describe('Image Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('buildThumbName', () => {
    it('should add _thumb before file extension', () => {
      expect(buildThumbName('photo.jpg')).toBe('photo_thumb.jpg');
    });

    it('should handle files with multiple dots', () => {
      expect(buildThumbName('my.photo.image.png')).toBe('my.photo.image_thumb.png');
    });

    it('should handle files without extension', () => {
      expect(buildThumbName('photo')).toBe('photo_thumb');
    });

    it('should handle files with just extension', () => {
      expect(buildThumbName('.jpg')).toBe('_thumb.jpg');
    });

    it('should preserve extension case', () => {
      expect(buildThumbName('photo.JPG')).toBe('photo_thumb.JPG');
      expect(buildThumbName('photo.PnG')).toBe('photo_thumb.PnG');
    });
  });

  describe('createThumbnail', () => {
    it('should create thumbnail using sharp', async () => {
      const mockBuffer = Buffer.from('test-image-data');

      const result = await createThumbnail(mockBuffer);

      expect(sharp).toHaveBeenCalledWith(mockBuffer);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should use correct dimensions from env', async () => {
      const mockBuffer = Buffer.from('test-image-data');

      await createThumbnail(mockBuffer);

      const sharpInstance = sharp(mockBuffer);
      expect(sharpInstance.resize).toHaveBeenCalledWith(300, 300, {
        fit: 'cover',
      });
    });

    it('should use JPEG format with quality 80', async () => {
      const mockBuffer = Buffer.from('test-image-data');

      await createThumbnail(mockBuffer);

      const sharpInstance = sharp(mockBuffer);
      expect(sharpInstance.jpeg).toHaveBeenCalledWith({ quality: 80 });
    });
  });
});
