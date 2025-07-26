// API service types
import { z } from 'zod';

// Generic API response schema
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().nullable(),
  message: z.string().optional(),
  code: z.number().optional(),
});

// API error schema
export const ApiErrorSchema = z.object({
  message: z.string(),
  code: z.number(),
  details: z.any().optional(),
  timestamp: z.string(),
});

// HTTP method types
export const HttpMethodSchema = z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);

// Request configuration schema
export const RequestConfigSchema = z.object({
  method: HttpMethodSchema,
  url: z.string(),
  headers: z.record(z.string()).optional(),
  body: z.any().optional(),
  timeout: z.number().optional(),
  retries: z.number().optional(),
  cache: z.boolean().optional(),
});

// Pagination schema
export const PaginationSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
  offset: z.number().min(0),
  total: z.number().min(0),
  hasMore: z.boolean(),
});

// Query parameters schema
export const QueryParamsSchema = z.record(z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
]));

// File upload schema
export const FileUploadSchema = z.object({
  file: z.any(), // File object
  fieldName: z.string(),
  fileName: z.string().optional(),
  contentType: z.string().optional(),
});

// Export types
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error: string | null;
  message?: string;
  code?: number;
};

export type ApiError = z.infer<typeof ApiErrorSchema>;
export type HttpMethod = z.infer<typeof HttpMethodSchema>;
export type RequestConfig = z.infer<typeof RequestConfigSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type QueryParams = z.infer<typeof QueryParamsSchema>;
export type FileUpload = z.infer<typeof FileUploadSchema>;

// API endpoint types
export interface ApiEndpoint {
  path: string;
  method: HttpMethod;
  requireAuth: boolean;
  rateLimit?: {
    requests: number;
    window: number; // in seconds
  };
}

// API client configuration
export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
  interceptors: {
    request?: (config: RequestConfig) => RequestConfig;
    response?: (response: ApiResponse) => ApiResponse;
    error?: (error: ApiError) => ApiError;
  };
}

// Request retry configuration
export interface RetryConfig {
  attempts: number;
  delay: number;
  backoff: 'linear' | 'exponential';
  retryOn: number[]; // HTTP status codes to retry on
}

// Cache configuration
export interface CacheConfig {
  enabled: boolean;
  ttl: number; // time to live in seconds
  key: string;
  invalidateOn: string[]; // events that invalidate cache
}