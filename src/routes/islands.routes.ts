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

/**
 * @swagger
 * /api/islands:
 *   get:
 *     summary: Get all islands (list view)
 *     tags: [Islands]
 *     description: Returns a list of all islands with basic information
 *     responses:
 *       200:
 *         description: List of islands
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IslandListResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
islandRoutes.get(ROUTES.API.ISLANDS, getIslands);

/**
 * @swagger
 * /api/islands/{id}:
 *   get:
 *     summary: Get island by ID (detail view)
 *     tags: [Islands]
 *     description: Returns detailed information about a specific island
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Island ID
 *     responses:
 *       200:
 *         description: Island details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IslandDetailResponse'
 *       404:
 *         description: Island not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
islandRoutes.get(`${ROUTES.API.ISLANDS}/:id`, getIslandById);

/**
 * @swagger
 * /api/islands/{id}:
 *   put:
 *     summary: Update island
 *     tags: [Islands]
 *     description: Update island information (admin only)
 *     security:
 *       - sessionToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Island ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateIslandRequest'
 *     responses:
 *       200:
 *         description: Island updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request - no valid fields provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - missing or invalid session token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - user is not admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Island not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
islandRoutes.put(`${ROUTES.API.ISLANDS}/:id`, requireAdmin, updateIsland);

/**
 * @swagger
 * /api/islands/{id}/photo:
 *   post:
 *     summary: Upload island photo
 *     tags: [Islands]
 *     description: Upload a photo for an island. Thumbnail is automatically generated (admin only)
 *     security:
 *       - sessionToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Island ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Image file (max 5MB, JPEG, PNG, GIF, WebP)
 *     responses:
 *       200:
 *         description: Photo uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadPhotoResponse'
 *       400:
 *         description: Bad request - photo file is required or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - missing or invalid session token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - user is not admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Island not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
islandRoutes.post(
  `${ROUTES.API.ISLANDS}/:id/photo`,
  requireAdmin,
  uploadImage.single('photo'),
  uploadIslandPhoto
);
