
export interface ApiResponse<T> {
    status: 'success' | 'error';
    data?: T;
    message?: string;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T> {
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}