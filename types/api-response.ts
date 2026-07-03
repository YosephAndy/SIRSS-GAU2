/**
 * Unified type representing standard responses for API endpoints and external integrations in SIRS-SGAU.
 */
export type ApiResponse<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
};
