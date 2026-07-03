/**
 * Generic API response wrapper used by all API Route handlers.
 * Ensures consistent shape across all endpoints.
 */
export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
  statusCode?: number
}
