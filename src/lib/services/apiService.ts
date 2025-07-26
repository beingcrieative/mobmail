// API service for centralized HTTP operations
import type { 
  ApiResponse, 
  ApiError, 
  RequestConfig, 
  HttpMethod, 
  QueryParams, 
  RetryConfig,
  CacheConfig 
} from './types/api';

// Re-export types for external use
export type {
  ApiResponse,
  ApiError,
  RequestConfig,
  HttpMethod,
  QueryParams,
  RetryConfig,
  CacheConfig,
} from './types/api';

/**
 * Centralized API service class
 * Handles all HTTP operations with error handling, retries, and caching
 */
export class ApiService {
  private static baseUrl = '';
  private static defaultTimeout = 10000; // 10 seconds
  private static defaultRetries = 3;
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  /**
   * Configure API service
   */
  static configure(config: {
    baseUrl?: string;
    timeout?: number;
    retries?: number;
  }) {
    if (config.baseUrl) this.baseUrl = config.baseUrl;
    if (config.timeout) this.defaultTimeout = config.timeout;
    if (config.retries) this.defaultRetries = config.retries;
  }

  /**
   * Generic request method
   */
  static async request<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
    const { method, url, headers = {}, body, timeout, retries, cache } = config;
    
    try {
      // Check cache first
      if (method === 'GET' && cache) {
        const cached = this.getFromCache(url);
        if (cached) {
          return {
            success: true,
            data: cached,
            error: null,
          };
        }
      }

      // Prepare request options
      const requestOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        signal: AbortSignal.timeout(timeout || this.defaultTimeout),
      };

      // Add body for non-GET requests
      if (body && method !== 'GET') {
        requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      }

      // Build full URL
      const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;

      // Execute request with retries
      const response = await this.executeWithRetry(
        () => fetch(fullUrl, requestOptions),
        retries || this.defaultRetries
      );

      // Parse response
      const result = await this.parseResponse<T>(response);

      // Cache successful GET requests
      if (method === 'GET' && cache && result.success) {
        this.setCache(url, result.data, 300000); // 5 minutes default
      }

      return result;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Request failed',
      };
    }
  }

  /**
   * GET request
   */
  static async get<T = any>(
    url: string, 
    params?: QueryParams, 
    options?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    const queryString = params ? this.buildQueryString(params) : '';
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    
    return this.request<T>({
      method: 'GET',
      url: fullUrl,
      ...options,
    });
  }

  /**
   * POST request
   */
  static async post<T = any>(
    url: string, 
    data?: any, 
    options?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url,
      body: data,
      ...options,
    });
  }

  /**
   * PUT request
   */
  static async put<T = any>(
    url: string, 
    data?: any, 
    options?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      url,
      body: data,
      ...options,
    });
  }

  /**
   * DELETE request
   */
  static async delete<T = any>(
    url: string, 
    options?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      url,
      ...options,
    });
  }

  /**
   * PATCH request
   */
  static async patch<T = any>(
    url: string, 
    data?: any, 
    options?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PATCH',
      url,
      body: data,
      ...options,
    });
  }

  /**
   * Upload file
   */
  static async uploadFile<T = any>(
    url: string,
    file: File,
    fieldName: string = 'file',
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append(fieldName, file);
      
      // Add additional data
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
        });
      }

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(this.defaultTimeout * 3), // Longer timeout for uploads
      });

      return this.parseResponse<T>(response);
    } catch (error) {
      console.error('File upload failed:', error);
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Execute request with retry logic
   */
  private static async executeWithRetry<T>(
    requestFn: () => Promise<T>,
    maxRetries: number,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Request failed');
        
        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          break;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
    
    throw lastError!;
  }

  /**
   * Parse response and handle errors
   */
  private static async parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          data: undefined,
          error: `HTTP ${response.status}: ${errorText || response.statusText}`,
          code: response.status,
        };
      }

      // Try to parse JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return {
          success: true,
          data,
          error: null,
        };
      }

      // Return text for non-JSON responses
      const text = await response.text();
      return {
        success: true,
        data: text as T,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: undefined,
        error: `Failed to parse response: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Build query string from parameters
   */
  private static buildQueryString(params: QueryParams): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)));
      } else if (value !== null && value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    
    return searchParams.toString();
  }

  /**
   * Cache management
   */
  private static setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  private static getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    // Check if cache is expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Clear cache
   */
  static clearCache(pattern?: string): void {
    if (pattern) {
      // Clear cache entries matching pattern
      const regex = new RegExp(pattern);
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}