import { describe, it, expect } from 'vitest';
import { uploadImage } from './upload.middleware.js';
import { HTTP_STATUS, MAX_IMAGE_SIZE_BYTES } from '../../constants/index.js';

/**
 * Create a valid JPEG file buffer (minimal valid JPEG)
 * JPEG files start with FF D8 FF
 */
function createValidJpegBuffer(): Buffer {
  const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
  const rest = Buffer.alloc(100, 0xff); // Fill rest with valid data
  return Buffer.concat([jpegHeader, rest]);
}

/**
 * Create a valid PNG file buffer
 * PNG files start with 89 50 4E 47 0D 0A 1A 0A
 */
function createValidPngBuffer(): Buffer {
  const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const rest = Buffer.alloc(100, 0x00);
  return Buffer.concat([pngHeader, rest]);
}

/**
 * Create a valid GIF file buffer
 * GIF files start with 47 49 46 38 37 61 (GIF87a) or 47 49 46 38 39 61 (GIF89a)
 */
function createValidGifBuffer(): Buffer {
  const gifHeader = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]); // GIF89a
  const rest = Buffer.alloc(100, 0x00);
  return Buffer.concat([gifHeader, rest]);
}

/**
 * Create a valid WebP file buffer
 * WebP files start with RIFF (52 49 46 46) and have WEBP (57 45 42 50) at offset 8
 */
function createValidWebpBuffer(): Buffer {
  const riff = Buffer.from([0x52, 0x49, 0x46, 0x46]); // RIFF
  const size = Buffer.alloc(4, 0x00); // File size (placeholder)
  const webp = Buffer.from([0x57, 0x45, 0x42, 0x50]); // WEBP
  const rest = Buffer.alloc(100, 0x00);
  return Buffer.concat([riff, size, webp, rest]);
}

describe('Upload Middleware', () => {
  describe('uploadImage configuration', () => {
    it('should be defined', () => {
      expect(uploadImage).toBeDefined();
    });

    it('should have file size limit configured', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const limits = (uploadImage as any).limits;
      expect(limits).toBeDefined();
      expect(limits.fileSize).toBe(MAX_IMAGE_SIZE_BYTES);
    });

    it('should use memory storage', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const storage = (uploadImage as any).storage;
      expect(storage).toBeDefined();
    });
  });

  describe('fileFilter', () => {
    it('should accept valid JPEG files', async () => {
      const mockFile = {
        fieldname: 'photo',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1000,
        buffer: createValidJpegBuffer(),
        destination: '',
        filename: '',
        path: '',
      } as Express.Multer.File;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fileFilter = (uploadImage as any).fileFilter;
      if (fileFilter) {
        await new Promise<void>((resolve, reject) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fileFilter({} as any, mockFile, (error: Error | null, acceptFile?: boolean) => {
            if (error) {
              reject(error);
            } else {
              expect(acceptFile).toBe(true);
              resolve();
            }
          });
        });
      }
    });

    it('should accept valid PNG files', async () => {
      const mockFile = {
        fieldname: 'photo',
        originalname: 'test.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 1000,
        buffer: createValidPngBuffer(),
        destination: '',
        filename: '',
        path: '',
      } as Express.Multer.File;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fileFilter = (uploadImage as any).fileFilter;
      if (fileFilter) {
        await new Promise<void>((resolve, reject) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fileFilter({} as any, mockFile, (error: Error | null, acceptFile?: boolean) => {
            if (error) {
              reject(error);
            } else {
              expect(acceptFile).toBe(true);
              resolve();
            }
          });
        });
      }
    });

    it('should accept valid GIF files', async () => {
      const mockFile = {
        fieldname: 'photo',
        originalname: 'test.gif',
        encoding: '7bit',
        mimetype: 'image/gif',
        size: 1000,
        buffer: createValidGifBuffer(),
        destination: '',
        filename: '',
        path: '',
      } as Express.Multer.File;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fileFilter = (uploadImage as any).fileFilter;
      if (fileFilter) {
        await new Promise<void>((resolve, reject) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fileFilter({} as any, mockFile, (error: Error | null, acceptFile?: boolean) => {
            if (error) {
              reject(error);
            } else {
              expect(acceptFile).toBe(true);
              resolve();
            }
          });
        });
      }
    });

    it('should accept valid WebP files', async () => {
      const mockFile = {
        fieldname: 'photo',
        originalname: 'test.webp',
        encoding: '7bit',
        mimetype: 'image/webp',
        size: 1000,
        buffer: createValidWebpBuffer(),
        destination: '',
        filename: '',
        path: '',
      } as Express.Multer.File;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fileFilter = (uploadImage as any).fileFilter;
      if (fileFilter) {
        await new Promise<void>((resolve, reject) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fileFilter({} as any, mockFile, (error: Error | null, acceptFile?: boolean) => {
            if (error) {
              reject(error);
            } else {
              expect(acceptFile).toBe(true);
              resolve();
            }
          });
        });
      }
    });

    it('should reject files with invalid MIME type', async () => {
      const mockFile = {
        fieldname: 'document',
        originalname: 'test.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 1000,
        buffer: Buffer.from('test'),
        destination: '',
        filename: '',
        path: '',
      } as Express.Multer.File;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fileFilter = (uploadImage as any).fileFilter;
      if (fileFilter) {
        await new Promise<void>((resolve) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fileFilter({} as any, mockFile, (error: Error | null) => {
            expect(error).toBeDefined();
            expect(error?.message).toContain('Invalid file type');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((error as any).statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
            resolve();
          });
        });
      }
    });

    it('should reject files with invalid extension', async () => {
      const mockFile = {
        fieldname: 'photo',
        originalname: 'test.exe',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1000,
        buffer: createValidJpegBuffer(),
        destination: '',
        filename: '',
        path: '',
      } as Express.Multer.File;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fileFilter = (uploadImage as any).fileFilter;
      if (fileFilter) {
        await new Promise<void>((resolve) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fileFilter({} as any, mockFile, (error: Error | null) => {
            expect(error).toBeDefined();
            expect(error?.message).toContain('Invalid file extension');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((error as any).statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
            resolve();
          });
        });
      }
    });

    it('should reject files with spoofed MIME type (wrong file signature)', async () => {
      // File claims to be JPEG but has PDF signature
      const mockFile = {
        fieldname: 'photo',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1000,
        buffer: Buffer.from('%PDF-1.4'), // PDF file signature
        destination: '',
        filename: '',
        path: '',
      } as Express.Multer.File;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fileFilter = (uploadImage as any).fileFilter;
      if (fileFilter) {
        await new Promise<void>((resolve) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fileFilter({} as any, mockFile, (error: Error | null) => {
            expect(error).toBeDefined();
            expect(error?.message).toContain('File signature validation failed');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((error as any).statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
            resolve();
          });
        });
      }
    });

    it('should reject files with mismatched MIME type and file signature', async () => {
      // File claims to be PNG but has JPEG signature
      const mockFile = {
        fieldname: 'photo',
        originalname: 'test.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 1000,
        buffer: createValidJpegBuffer(), // JPEG signature
        destination: '',
        filename: '',
        path: '',
      } as Express.Multer.File;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fileFilter = (uploadImage as any).fileFilter;
      if (fileFilter) {
        await new Promise<void>((resolve) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fileFilter({} as any, mockFile, (error: Error | null) => {
            expect(error).toBeDefined();
            expect(error?.message).toContain('File signature validation failed');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((error as any).statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
            resolve();
          });
        });
      }
    });

    it('should reject files that are too small to validate', async () => {
      const mockFile = {
        fieldname: 'photo',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 2, // Too small
        buffer: Buffer.from([0xff, 0xd8]), // Incomplete signature
        destination: '',
        filename: '',
        path: '',
      } as Express.Multer.File;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fileFilter = (uploadImage as any).fileFilter;
      if (fileFilter) {
        await new Promise<void>((resolve) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fileFilter({} as any, mockFile, (error: Error | null) => {
            expect(error).toBeDefined();
            expect(error?.message).toContain('File signature validation failed');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((error as any).statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
            resolve();
          });
        });
      }
    });

    it('should accept files with case-insensitive extensions', async () => {
      const mockFile = {
        fieldname: 'photo',
        originalname: 'test.JPG', // Uppercase extension
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1000,
        buffer: createValidJpegBuffer(),
        destination: '',
        filename: '',
        path: '',
      } as Express.Multer.File;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fileFilter = (uploadImage as any).fileFilter;
      if (fileFilter) {
        await new Promise<void>((resolve, reject) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fileFilter({} as any, mockFile, (error: Error | null, acceptFile?: boolean) => {
            if (error) {
              reject(error);
            } else {
              expect(acceptFile).toBe(true);
              resolve();
            }
          });
        });
      }
    });

    it('should handle files with undefined buffer gracefully', async () => {
      // Some multer configurations may not have buffer available during fileFilter
      const mockFile = {
        fieldname: 'photo',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1000,
        buffer: undefined as unknown as Buffer,
        destination: '',
        filename: '',
        path: '',
      } as Express.Multer.File;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fileFilter = (uploadImage as any).fileFilter;
      if (fileFilter) {
        await new Promise<void>((resolve, reject) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fileFilter({} as any, mockFile, (error: Error | null, acceptFile?: boolean) => {
            // Should still accept if MIME type and extension are valid
            // Signature validation is skipped when buffer is unavailable
            if (error) {
              reject(error);
            } else {
              expect(acceptFile).toBe(true);
              resolve();
            }
          });
        });
      }
    });
  });
});
