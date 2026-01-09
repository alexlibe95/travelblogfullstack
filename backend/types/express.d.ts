import type Parse from 'parse/node.js';

declare global {
  namespace Express {
    interface Request {
      parseUser?: Parse.User;
    }
  }
}

export {};
