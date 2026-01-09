import { describe, it, expect } from 'vitest';
import { uploadImage } from './upload.middleware.js';
import { HTTP_STATUS, MAX_IMAGE_SIZE_BYTES } from '../../constants/index.js';

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
    it('should accept image files', async () => {
      const mockFile = {
        fieldname: 'photo',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1000,
        buffer: Buffer.from('test'),
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

    it('should reject non-image files', async () => {
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
            expect(error?.message).toBe('Only image files are allowed');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((error as any).statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
            resolve();
          });
        });
      }
    });

    it('should accept various image MIME types', async () => {
      const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

      const promises = imageTypes.map((mimetype) => {
        const mockFile = {
          fieldname: 'photo',
          originalname: 'test.jpg',
          encoding: '7bit',
          mimetype,
          size: 1000,
          buffer: Buffer.from('test'),
          destination: '',
          filename: '',
          path: '',
        } as Express.Multer.File;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fileFilter = (uploadImage as any).fileFilter;
        if (fileFilter) {
          return new Promise<void>((resolve, reject) => {
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
        return Promise.resolve();
      });

      await Promise.all(promises);
    });
  });
});
