import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator/check";

/**
 * Checks for errors in request parameters, using express-validator https://www.npmjs.com/package/express-validator
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 * @returns Void, calls next() function
 */
export const checkErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        next({status: 400, message: errors.mapped()});
    }
    next();
};
