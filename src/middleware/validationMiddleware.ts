// src/middleware/validationMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError, Schema } from 'zod';
import { sendError } from '../utils/responseUtils';

export const validate = (schema: AnyZodObject) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const schema: AnyZodObject = req.body;
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                sendError(res, error.message, 400);
            } else {
                sendError(res, 'Invalid request body', 400);
            }
        }
    }
};