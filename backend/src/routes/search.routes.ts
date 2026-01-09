import { Router } from 'express';
import { searchIslands } from '../controllers/search.controller.js';
import { ROUTES } from '../../constants/index.js';

export const searchRoutes = Router();

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search islands
 *     tags: [Search]
 *     description: Search islands by name, short description, or full description
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query string
 *         example: santorini
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchResponse'
 *       400:
 *         description: Bad request - search query is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
searchRoutes.get(ROUTES.API.SEARCH, searchIslands);
