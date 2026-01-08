import { Router } from 'express';
import { getIslands, getIslandById } from '../controllers/islands.controller.js';
import { ROUTES } from '../../constants/index.js';

export const islandRoutes = Router();

islandRoutes.get(ROUTES.ISLANDS, getIslands);
islandRoutes.get(`${ROUTES.ISLANDS}/:id`, getIslandById);
