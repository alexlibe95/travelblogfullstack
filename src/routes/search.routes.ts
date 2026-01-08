import { Router } from 'express';
import { searchIslands } from '../controllers/search.controller.js';
import { ROUTES } from '../../constants/index.js';

export const searchRoutes = Router();

searchRoutes.get(`${ROUTES.SEARCH}`, searchIslands);
