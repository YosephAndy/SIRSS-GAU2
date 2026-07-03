/**
 * Unified type representing the standard response of any Server Action in SIRS-SGAU.
 * Includes status, typed data, generic error messages, and validation details.
 */
export type ActionResponse<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, string>;
};
