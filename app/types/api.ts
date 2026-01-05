/**
 * API response wrapper
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

/**
 * API error response
 */
export interface ApiError {
    success: false;
    error: string;
    statusCode?: number;
}

/**
 * Generic API request with pagination
 */
export interface ApiRequest {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}
