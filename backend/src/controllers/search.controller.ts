import Parse from 'parse/node.js';
import { NextFunction, Request, Response } from 'express';
import { ISLAND_CLASS_NAME, ISLAND_FIELDS, HTTP_STATUS } from '../../constants/index.js';
import { ApplicationError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export async function searchIslands(req: Request, res: Response, next: NextFunction) {
  const q = req.query.q as string;
  try {
    if (!q || q.trim().length === 0) {
      throw new ApplicationError('Search query is required', HTTP_STATUS.BAD_REQUEST);
    }

    // Search across multiple fields using OR query with case-insensitive matching
    // Use matches() with regex for case-insensitive search
    const searchTerm = q.trim();
    // Escape special regex characters and create case-insensitive pattern
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const caseInsensitivePattern = new RegExp(escapedTerm, 'i');

    const q1 = new Parse.Query(ISLAND_CLASS_NAME);
    q1.matches(ISLAND_FIELDS.NAME, caseInsensitivePattern);

    const q2 = new Parse.Query(ISLAND_CLASS_NAME);
    q2.matches(ISLAND_FIELDS.SHORT_DESCRIPTION, caseInsensitivePattern);

    const q3 = new Parse.Query(ISLAND_CLASS_NAME);
    q3.matches(ISLAND_FIELDS.DESCRIPTION, caseInsensitivePattern);

    const query = Parse.Query.or(q1, q2, q3);

    // Only fields needed for dropdown
    query.select(ISLAND_FIELDS.OBJECT_ID, ISLAND_FIELDS.NAME);

    // Public read - no master key needed (schema allows find: { '*': true })
    const results = await query.find();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: results.length,
      data: results.map((island) => ({
        id: island.id,
        name: island.get(ISLAND_FIELDS.NAME),
      })),
      ...(results.length === 0 && {
        message: 'No islands found',
      }),
    });
  } catch (error) {
    // If it's already an ApplicationError, pass it through
    if (error instanceof ApplicationError) {
      next(error);
      return;
    }
    // Log unexpected errors for debugging
    logger.error({ error, query: q }, 'Search failed');
    next(new ApplicationError('Search failed', HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
}
