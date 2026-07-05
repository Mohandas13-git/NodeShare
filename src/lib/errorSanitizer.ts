/**
 * Sanitizes database and API errors to prevent exposing sensitive information
 * Maps specific error codes to user-friendly messages
 */

const ERROR_MESSAGES: Record<string, string> = {
  // PostgreSQL error codes
  '23505': 'This item already exists',
  '23503': 'Cannot complete this action due to related data',
  '23502': 'Required information is missing',
  '42501': 'You do not have permission to perform this action',
  '42P01': 'The requested resource was not found',
  'PGRST116': 'Access denied',
  'PGRST301': 'Request failed. Please try again.',
  
  // Auth error patterns
  'invalid_credentials': 'Invalid email or password',
  'user_not_found': 'Account not found',
  'email_taken': 'This email is already registered',
  'weak_password': 'Password is too weak. Please use a stronger password.',
  'invalid_email': 'Please enter a valid email address',
};

/**
 * Sanitizes an error for safe display to users
 * Logs the full error for debugging while returning a safe message
 */
export function sanitizeError(error: unknown, fallbackMessage = 'An error occurred. Please try again.'): string {
  if (!error) return fallbackMessage;
  
  const errorObj = error as Record<string, unknown>;
  const code = errorObj?.code as string;
  const message = (errorObj?.message as string || '').toLowerCase();
  
  // Log full error for debugging (will appear in console)
  console.error('Operation error:', error);
  
  // Check for specific error codes
  if (code && ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code];
  }
  
  // Check for common auth error patterns
  if (message.includes('invalid login credentials') || message.includes('invalid_credentials')) {
    return 'Invalid email or password';
  }
  
  if (message.includes('user already registered') || message.includes('email already')) {
    return 'This email is already registered. Try signing in instead.';
  }
  
  if (message.includes('database error saving new user') || message.includes('duplicate key')) {
    return 'That username is already taken. Please choose another.';
  }
  
  if (message.includes('password') && message.includes('weak')) {
    return 'Password is too weak. Please use a stronger password.';
  }
  
  if (message.includes('not authenticated') || message.includes('jwt')) {
    return 'Your session has expired. Please sign in again.';
  }
  
  if (message.includes('network') || message.includes('fetch')) {
    return 'Unable to connect. Please check your internet connection.';
  }
  
  if (message.includes('rate limit') || message.includes('too many')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  
  if (message.includes('permission') || message.includes('denied')) {
    return 'You do not have permission to perform this action.';
  }
  
  if (message.includes('not found')) {
    return 'The requested item was not found.';
  }
  
  // Return fallback for unknown errors - never expose raw message
  return fallbackMessage;
}
