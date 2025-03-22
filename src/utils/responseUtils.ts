// src/utils/responseUtils.ts

import { Response } from 'express';
import { ApiResponse, PaginatedApiResponse } from '../types/types';

export const sendSuccess = <T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode = 200
): Response => {
    const response: ApiResponse<T> = {
        status: 'success',
        data,
        message
    };

    return res.status(statusCode).json(response);
};

export const sendError = (
    res: Response,
    message: string,
    statusCode = 500
): Response => {
    const response: ApiResponse<null> = {
        status: 'error',
        message
    };

    return res.status(statusCode).json(response);
};

export const sendPaginatedSuccess = <T>(
    res: Response,
    data: T,
    total: number,
    page: number,
    limit: number,
    message?: string
): Response => {
    const totalPages = Math.ceil(total / limit);

    const response: PaginatedApiResponse<T> = {
        status: 'success',
        data,
        message,
        pagination: {
            total,
            page,
            limit,
            totalPages
        }
    };

    return res.status(200).json(response);
};