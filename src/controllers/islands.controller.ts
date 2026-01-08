import Parse from 'parse/node.js';
import { NextFunction, Request, Response } from 'express';
import {
  ISLAND_CLASS_NAME,
  ISLAND_FIELDS,
  ISLAND_LIST_FIELDS,
  ISLAND_DETAIL_FIELDS,
  HTTP_STATUS,
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
