/**
 * API Client Utility
 * Provides consistent error handling and response parsing for API requests
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public endpoint: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiClientOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * Makes a typed API request with consistent error handling
 */
export async function apiRequest<TResponse>(endpoint: string, options: ApiClientOptions = {}): Promise<TResponse> {
  const { method = "GET", body, headers = {} } = options;

  try {
    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;

      // Try to extract error message from response
      try {
        const errorBody = await response.json();
        if (errorBody.error && typeof errorBody.error === "string") {
          errorMessage = errorBody.error;
        }
      } catch {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || errorMessage;
      }

      throw new ApiError(errorMessage, response.status, endpoint);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network errors or other unexpected errors
    throw new ApiError(error instanceof Error ? error.message : "An unexpected error occurred", 0, endpoint);
  }
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: <TResponse>(endpoint: string, headers?: Record<string, string>) =>
    apiRequest<TResponse>(endpoint, { method: "GET", headers }),

  post: <TResponse>(endpoint: string, body: unknown, headers?: Record<string, string>) =>
    apiRequest<TResponse>(endpoint, { method: "POST", body, headers }),

  put: <TResponse>(endpoint: string, body: unknown, headers?: Record<string, string>) =>
    apiRequest<TResponse>(endpoint, { method: "PUT", body, headers }),

  delete: <TResponse>(endpoint: string, headers?: Record<string, string>) =>
    apiRequest<TResponse>(endpoint, { method: "DELETE", headers }),
};
