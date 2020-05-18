import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

/**
 * Checks for errors in request parameters, using express-validator https://www.npmjs.com/package/express-validator
 */
export const checkErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        next({status: 400, message: "Validation failed", stack_trace: errors.mapped()});
    }
    next();
};
