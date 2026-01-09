import multer from 'multer';
import { Request } from 'express';
import { ApplicationError } from './errorHandler.js';
import { HTTP_STATUS, MAX_IMAGE_SIZE_BYTES } from '../../constants/index.js';

const storage = multer.memoryStorage();

export const uploadImage = multer({
  storage,
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new ApplicationError('Only image files are allowed', HTTP_STATUS.BAD_REQUEST));
      return;
    }
    cb(null, true);
  },
});
