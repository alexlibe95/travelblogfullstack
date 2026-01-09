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

export async function getIslands(_req: Request, res: Response, next: NextFunction) {
  try {
    const query = new Parse.Query(ISLAND_CLASS_NAME);
    query.ascending(ISLAND_FIELDS.ORDER);
    query.select(...ISLAND_LIST_FIELDS);

    const islands = await query.find({ useMasterKey: true });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: islands.map((i) => i.toJSON()),
    });
  } catch {
    next(new ApplicationError('Failed to fetch islands', 500));
  }
}

export async function getIslandById(req: Request, res: Response, next: NextFunction) {
  try {
    const query = new Parse.Query(ISLAND_CLASS_NAME);
    query.select(...ISLAND_DETAIL_FIELDS);

    const island = await query.get(req.params.id, { useMasterKey: true });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: island.toJSON(),
    });
  } catch {
    next(new ApplicationError('Island not found', 404));
  }
}

export async function updateIsland(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

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

    await island.save(null, { useMasterKey: true });

    res.status(HTTP_STATUS.OK).json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
}

export async function uploadIslandPhoto(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    if (!req.file) {
      throw new ApplicationError('Photo file is required', HTTP_STATUS.BAD_REQUEST);
    }

    const islandQuery = new Parse.Query(ISLAND_CLASS_NAME);
    const island = await islandQuery.get(id, { useMasterKey: true });

    // Create Parse File
    const parseFile = new Parse.File(req.file.originalname, {
      base64: req.file.buffer.toString('base64'),
    });

    await parseFile.save({ useMasterKey: true });

    // Set photo (thumbnail will be created by afterSave trigger)
    island.set(ISLAND_FIELDS.PHOTO, parseFile);

    // Clear old thumbnail
    island.unset(ISLAND_FIELDS.PHOTO_THUMB);

    await island.save(null, { useMasterKey: true });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      photoUrl: parseFile.url(),
    });
  } catch (error) {
    next(
      error instanceof ApplicationError
        ? error
        : new ApplicationError('Failed to upload photo', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
}
