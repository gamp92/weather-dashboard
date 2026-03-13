// Maps known technical error patterns to safe user-facing messages.
// Never expose raw API error messages, stack traces, or server internals to the UI.

// Specific status codes must come before the generic 'Http failure response' catch-all,
// because Angular formats errors as "Http failure response for URL: 429 Too Many Requests"
// — the generic pattern would match first if it appeared earlier in the array.
const ERROR_MESSAGE_MAP: readonly (readonly [string, string])[] = [
  ['Failed to fetch',          'Unable to reach the service. Check your connection.'],
  ['network error',            'Network error. Please check your connection.'],
  [': 429',                    'Too many requests. Please wait a moment.'],
  [': 404',                    'No data found for this location.'],
  [': 5',                      'Weather service is temporarily unavailable.'],
  ['Http failure response',    'Weather service is temporarily unavailable.'],
  ['PERMISSION_DENIED',        'Location access denied. Please search for a city manually.'],
  ['POSITION_UNAVAILABLE',     'Your location could not be determined.'],
  ['TIMEOUT',                  'Location request timed out. Please try again.'],
] as const;

const GENERIC_ERROR = 'Something went wrong. Please try again.';

const matchesPattern = (message: string) =>
  ([pattern]: readonly [string, string]): boolean =>
    message.toLowerCase().includes(pattern.toLowerCase());

export const sanitizeError = (message: string): string =>
  ERROR_MESSAGE_MAP.find(matchesPattern(message))?.[1] ?? GENERIC_ERROR;
