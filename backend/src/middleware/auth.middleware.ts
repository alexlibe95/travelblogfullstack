import Parse from 'parse/node.js';
import { NextFunction, Request, Response } from 'express';
import { ApplicationError } from './errorHandler.js';
import { HTTP_STATUS } from '../../constants/index.js';

export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    const sessionToken = req.headers['x-parse-session-token'] as string;

    if (!sessionToken) {
      throw new ApplicationError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
    }

    Parse.User.enableUnsafeCurrentUser();

    const user = await Parse.User.become(sessionToken);

    const rolesQuery = new Parse.Query(Parse.Role);
    rolesQuery.equalTo('name', 'administrator');
    rolesQuery.equalTo('users', user);

    const isAdmin = await rolesQuery.first({ useMasterKey: true });

    if (!isAdmin) {
      throw new ApplicationError('Forbidden', HTTP_STATUS.FORBIDDEN);
    }

    // Type assertion needed because Parse.User and Express.User types differ slightly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req.parseUser = user as any;
    next();
  } catch {
    next(new ApplicationError('Unauthorized', HTTP_STATUS.UNAUTHORIZED));
  }
}
