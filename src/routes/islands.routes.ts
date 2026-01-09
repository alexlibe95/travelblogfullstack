import { Router } from 'express';
import {
  getIslands,
  getIslandById,
  updateIsland,
  uploadIslandPhoto,
} from '../controllers/islands.controller.js';
import { ROUTES } from '../../constants/index.js';
import { requireAdmin } from '../middleware/auth.middleware.js';
import { uploadImage } from '../middleware/upload.middleware.js';

export const islandRoutes = Router();

islandRoutes.get(ROUTES.API.ISLANDS, getIslands);
islandRoutes.get(`${ROUTES.API.ISLANDS}/:id`, getIslandById);

islandRoutes.put(`${ROUTES.API.ISLANDS}/:id`, requireAdmin, updateIsland);

islandRoutes.post(
  `${ROUTES.API.ISLANDS}/:id/photo`,
  requireAdmin,
  uploadImage.single('photo'),
  uploadIslandPhoto
);
