// src/services/api-error-handler.ts
import { logger } from './logger';
import { toast } from 'sonner';

export interface AppError {
  success: false;
  code: string;
  message: string;
}

/**
 * Centralized handler for API errors.
 *
 * @param error The raw error object (expected to be an instance of Error).
 * @param context A string identifying the calling function/service (e.g., 'GeminiCore.generateText').
 * @returns A standardized AppError object.
 */
export const handleApiError = (error: unknown, context: string): AppError => {
  const anError = error instanceof Error ? error : new Error(String(error));

  logger.error(context, anError.message, {
    error: {
        name: anError.name,
        stack: anError.stack,
    }
   });

  // Intelligent notification logic can be expanded here.
  // For now, we'll show a toast for common, user-actionable network errors.
  const userFriendlyMessage = "An unexpected error occurred. Please try again later.";

  if (anError.message.toLowerCase().includes('network') || anError.message.toLowerCase().includes('failed to fetch')) {
      toast.error("Network Error", {
          description: "Could not connect to the service. Please check your connection.",
      });
  } else {
    // For other errors, we log them but don't show a toast by default
    // to avoid bothering the user with non-actionable technical issues.
    // The calling code can still use the returned error to update the UI state.
  }


  return {
    success: false,
    code: anError.name || 'UNKNOWN_ERROR',
    message: userFriendlyMessage,
  };
};
