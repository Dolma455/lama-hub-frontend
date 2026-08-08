/**
 * Utility function to extract the exact error message from backend API responses.
 */
export function getApiErrorMessage(error: any, fallbackMessage: string = 'An unexpected error occurred.'): string {
  if (!error) return fallbackMessage;

  // Axios or HTTP Response Error
  if (error.response?.data) {
    const data = error.response.data;

    // 1. Direct string response
    if (typeof data === 'string' && data.trim().length > 0) {
      return data;
    }

    // 2. Object with 'message' or 'error' string property
    if (typeof data.message === 'string' && data.message.trim().length > 0) {
      return data.message;
    }

    if (typeof data.error === 'string' && data.error.trim().length > 0) {
      return data.error;
    }

    // 3. Array of string error messages (e.g. Identity error descriptions)
    if (Array.isArray(data) && data.length > 0) {
      return data
        .map((item) => (typeof item === 'string' ? item : item.description || item.message || JSON.stringify(item)))
        .filter(Boolean)
        .join(' ');
    }

    // 4. ASP.NET Core Validation ProblemDetails (data.errors object)
    if (data.errors && typeof data.errors === 'object') {
      const messages: string[] = [];
      for (const key of Object.keys(data.errors)) {
        const fieldErrors = data.errors[key];
        if (Array.isArray(fieldErrors)) {
          messages.push(...fieldErrors);
        } else if (typeof fieldErrors === 'string') {
          messages.push(fieldErrors);
        }
      }
      if (messages.length > 0) {
        return messages.join(' ');
      }
    }

    // 5. Title fallback for ProblemDetails
    if (typeof data.title === 'string' && data.title.trim().length > 0) {
      return data.title;
    }
  }

  // HTTP status text or standard Error.message
  if (error.message && typeof error.message === 'string') {
    if (error.message.includes('Network Error')) {
      return 'Network error: Unable to connect to the backend server. Please check your network connection.';
    }
    return error.message;
  }

  return fallbackMessage;
}
