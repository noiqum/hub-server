// src/middleware/validationMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sendError } from '../utils/responseUtils';

export const validate = (schema: AnyZodObject) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessage = error.errors.map(err =>
                    `${err.path.join('.')}: ${err.message}`
                ).join(', ');

                return sendError(res, `Validation error: ${errorMessage}`, 400);
            }

            return sendError(res, 'Invalid request data', 400);
        }
    };
};