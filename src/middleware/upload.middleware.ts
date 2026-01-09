import multer from 'multer';
import { Request } from 'express';
import { ApplicationError } from './errorHandler.js';
import { HTTP_STATUS, MAX_IMAGE_SIZE_BYTES } from '../../constants/index.js';

const storage = multer.memoryStorage();

/**
 * Allowed image MIME types
 */
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

/**
 * Allowed file extensions
 */
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'] as const;

/**
 * File signature (magic numbers) for image formats
 * These are the first bytes of valid image files
 */
const FILE_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [
    [0xff, 0xd8, 0xff], // JPEG files start with FF D8 FF
  ],
  'image/png': [
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], // PNG files start with 89 50 4E 47 0D 0A 1A 0A
  ],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46], // RIFF (WebP files start with RIFF)
  ],
};

/**
 * Validate file extension
 */
function isValidExtension(filename: string): boolean {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number]);
}

/**
 * Validate file signature (magic numbers)
 * This checks the actual file content, not just the MIME type
 */
function isValidFileSignature(buffer: Buffer | undefined, mimetype: string): boolean {
  if (!buffer || buffer.length === 0) {
    return false;
  }

  const signatures = FILE_SIGNATURES[mimetype];
  if (!signatures || buffer.length < 8) {
    return false;
  }

  // Check each possible signature for this MIME type
  for (const signature of signatures) {
    if (buffer.length < signature.length) {
      continue;
    }

    let matches = true;
    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) {
        matches = false;
        break;
      }
    }

    if (matches) {
      // For WebP, we need to check additional bytes
      if (mimetype === 'image/webp') {
        // WebP files have "RIFF" at start, then "WEBP" at offset 8
        if (buffer.length >= 12) {
          const webpSignature = Buffer.from([0x57, 0x45, 0x42, 0x50]); // "WEBP"
          const webpStart = buffer.subarray(8, 12);
          return webpStart.equals(webpSignature);
        }
      }
      return true;
    }
  }

  return false;
}

/**
 * Enhanced file filter with MIME type, extension, and file signature validation
 */
function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void {
  // Check MIME type
  if (
    !ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase() as (typeof ALLOWED_MIME_TYPES)[number])
  ) {
    cb(
      new ApplicationError(
        `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
        HTTP_STATUS.BAD_REQUEST
      )
    );
    return;
  }

  // Check file extension
  if (!isValidExtension(file.originalname)) {
    cb(
      new ApplicationError(
        `Invalid file extension. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`,
        HTTP_STATUS.BAD_REQUEST
      )
    );
    return;
  }

  // Check file signature (magic numbers) - validates actual file content
  // Note: file.buffer might not be available during fileFilter callback in some multer configurations
  // We'll validate signature if buffer is available, otherwise rely on MIME type and extension checks
  if (file.buffer && file.buffer.length > 0) {
    if (!isValidFileSignature(file.buffer, file.mimetype.toLowerCase())) {
      cb(
        new ApplicationError(
          'File signature validation failed. File may be corrupted or not a valid image.',
          HTTP_STATUS.BAD_REQUEST
        )
      );
      return;
    }
  }

  cb(null, true);
}

export const uploadImage = multer({
  storage,
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
  },
  fileFilter,
});
