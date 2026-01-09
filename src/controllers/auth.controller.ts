import Parse from 'parse/node.js';
import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS, SECURITY_HEADERS } from '../../constants/index.js';
import { ApplicationError } from '../middleware/errorHandler.js';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new ApplicationError('Username and password are required', HTTP_STATUS.BAD_REQUEST);
    }

    const user = await Parse.User.logIn(username, password);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      sessionToken: user.getSessionToken(),
      user: {
        id: user.id,
        username: user.getUsername(),
      },
    });
  } catch (error) {
    // If it's already an ApplicationError, pass it through
    if (error instanceof ApplicationError) {
      next(error);
      return;
    }
    next(new ApplicationError('Invalid username or password', HTTP_STATUS.UNAUTHORIZED));
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionToken = req.headers[SECURITY_HEADERS.X_PARSE_SESSION_TOKEN] as string;

    if (!sessionToken) {
      throw new ApplicationError('Missing session token', HTTP_STATUS.UNAUTHORIZED);
    }

    // Delete the session to logout the user
    // Parse Server stores sessions in the _Session class
    // We query by sessionToken and delete it directly (no need to use become() in server environment)
    const Session = Parse.Object.extend('_Session');
    const sessionQuery = new Parse.Query(Session);
    sessionQuery.equalTo('sessionToken', sessionToken);
    const session = await sessionQuery.first({ useMasterKey: true });

    if (session) {
      await session.destroy({ useMasterKey: true });
      res.status(HTTP_STATUS.OK).json({ success: true });
    } else {
      // Session not found - might already be deleted, but we'll return success anyway
      res.status(HTTP_STATUS.OK).json({ success: true });
    }
  } catch (error) {
    // If it's already an ApplicationError, pass it through
    if (error instanceof ApplicationError) {
      next(error);
      return;
    }
    // Log the actual error for debugging
    console.error('Logout error:', error);
    next(new ApplicationError('Logout failed', HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
}
