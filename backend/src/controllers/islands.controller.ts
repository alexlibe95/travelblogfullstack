import Parse from 'parse/node.js';
import { NextFunction, Request, Response } from 'express';
import {
  ISLAND_CLASS_NAME,
  ISLAND_FIELDS,
  ISLAND_LIST_FIELDS,
  ISLAND_DETAIL_FIELDS,
  HTTP_STATUS,
  ISLAND_EDITABLE_FIELDS,
} from '../../constants/index.js';
import { ApplicationError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export async function getIslands(_req: Request, res: Response, next: NextFunction) {
  try {
    const query = new Parse.Query(ISLAND_CLASS_NAME);
    query.ascending(ISLAND_FIELDS.ORDER);
    query.select(...ISLAND_LIST_FIELDS);

    // Public read - no master key needed (schema allows find: { '*': true })
    const islands = await query.find();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: islands.map((i) => i.toJSON()),
    });
  } catch (error) {
    // If it's already an ApplicationError, pass it through
    if (error instanceof ApplicationError) {
      next(error);
      return;
    }
    // Log unexpected errors for debugging
    logger.error({ error }, 'Failed to fetch islands');
    next(new ApplicationError('Failed to fetch islands', HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
}

export async function getIslandById(req: Request, res: Response, next: NextFunction) {
  try {
    const query = new Parse.Query(ISLAND_CLASS_NAME);
    query.select(...ISLAND_DETAIL_FIELDS);

    // Public read - no master key needed (schema allows get: { '*': true })
    const island = await query.get(req.params.id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: island.toJSON(),
    });
  } catch (error) {
    // If it's already an ApplicationError, pass it through
    if (error instanceof ApplicationError) {
      next(error);
      return;
    }
    // Parse errors for "not found" typically have code 101
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.code === 101) {
      next(new ApplicationError('Island not found', HTTP_STATUS.NOT_FOUND));
      return;
    }
    // Log unexpected errors for debugging
    logger.error({ error, islandId: req.params.id }, 'Failed to fetch island');
    next(new ApplicationError('Island not found', HTTP_STATUS.NOT_FOUND));
  }
}

export async function updateIsland(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;
  try {
    // requireAdmin middleware ensures req.parseUser is set and user is admin
    // Note: Server-side Parse operations require useMasterKey even for authenticated users
    // The admin status is already verified by requireAdmin middleware
    const query = new Parse.Query(ISLAND_CLASS_NAME);
    const island = await query.get(id, { useMasterKey: true });

    let updated = false;

    for (const field of ISLAND_EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) {
        island.set(field, req.body[field]);
        updated = true;
      }
    }

    if (!updated) {
      throw new ApplicationError('No valid fields provided for update', HTTP_STATUS.BAD_REQUEST);
    }

    // Save with master key - admin status verified by requireAdmin middleware
    // Schema ACL: update: { 'role:Admin': true } - enforced by middleware, not Parse ACL in server-side code
    await island.save(null, { useMasterKey: true });

    res.status(HTTP_STATUS.OK).json({
      success: true,
    });
  } catch (error) {
    // If it's already an ApplicationError, pass it through
    if (error instanceof ApplicationError) {
      next(error);
      return;
    }
    // Parse errors for "not found" typically have code 101
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.code === 101) {
      next(new ApplicationError('Island not found', HTTP_STATUS.NOT_FOUND));
      return;
    }
    // Log unexpected errors for debugging
    logger.error({ error, islandId: id }, 'Failed to update island');
    next(new ApplicationError('Failed to update island', HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
}

export async function uploadIslandPhoto(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;
  try {
    if (!req.file) {
      throw new ApplicationError('Photo file is required', HTTP_STATUS.BAD_REQUEST);
    }

    // requireAdmin middleware ensures req.parseUser is set and user is admin
    // Note: Server-side Parse operations require useMasterKey even for authenticated users
    const islandQuery = new Parse.Query(ISLAND_CLASS_NAME);
    const island = await islandQuery.get(id, { useMasterKey: true });

    // Create Parse File
    const parseFile = new Parse.File(req.file.originalname, {
      base64: req.file.buffer.toString('base64'),
    });

    // File operations require master key in server-side code
    await parseFile.save({ useMasterKey: true });

    // Set photo (thumbnail will be created by afterSave trigger)
    island.set(ISLAND_FIELDS.PHOTO, parseFile);

    // Clear old thumbnail
    island.unset(ISLAND_FIELDS.PHOTO_THUMB);

    // Save with master key - admin status verified by requireAdmin middleware
    await island.save(null, { useMasterKey: true });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      photoUrl: parseFile.url(),
    });
  } catch (error) {
    // If it's already an ApplicationError, pass it through
    if (error instanceof ApplicationError) {
      next(error);
      return;
    }
    // Parse errors for "not found" typically have code 101
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.code === 101) {
      next(new ApplicationError('Island not found', HTTP_STATUS.NOT_FOUND));
      return;
    }
    // Log unexpected errors for debugging
    logger.error({ error, islandId: id }, 'Failed to upload photo');
    next(new ApplicationError('Failed to upload photo', HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
}
