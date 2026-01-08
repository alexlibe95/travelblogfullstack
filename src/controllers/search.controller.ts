import Parse from 'parse/node.js';
import { NextFunction, Request, Response } from 'express';
import {
  ISLAND_CLASS_NAME,
  ISLAND_FIELDS,
  HTTP_STATUS,
} from '../../constants/index.js';
import { ApplicationError } from '../middleware/errorHandler.js';

export async function searchIslands(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query.q as string;

    if (!q || q.trim().length === 0) {
      throw new ApplicationError('Search query is required', HTTP_STATUS.BAD_REQUEST);
    }

    // Search across multiple fields using OR query
    // fullText() only works on one field, so we use contains() for multi-field search
    const searchTerm = q.trim();

    const q1 = new Parse.Query(ISLAND_CLASS_NAME);
    q1.contains(ISLAND_FIELDS.NAME, searchTerm);

    const q2 = new Parse.Query(ISLAND_CLASS_NAME);
    q2.contains(ISLAND_FIELDS.SHORT_DESCRIPTION, searchTerm);

    const q3 = new Parse.Query(ISLAND_CLASS_NAME);
    q3.contains(ISLAND_FIELDS.DESCRIPTION, searchTerm);

    const query = Parse.Query.or(q1, q2, q3);

    // Only fields needed for dropdown
    query.select(
      ISLAND_FIELDS.OBJECT_ID,
      ISLAND_FIELDS.NAME
    );

    const results = await query.find({ useMasterKey: true });

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
    next(
      error instanceof ApplicationError
        ? error
        : new ApplicationError('Search failed', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
}
