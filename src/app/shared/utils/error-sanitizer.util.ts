// Maps known technical error patterns to safe user-facing messages.
// Never expose raw API error messages, stack traces, or server internals to the UI.

const ERROR_MESSAGE_MAP: ReadonlyArray<readonly [string, string]> = [
  ['Failed to fetch',          'Unable to reach the service. Check your connection.'],
  ['Http failure response',    'Weather service is temporarily unavailable.'],
  ['network error',            'Network error. Please check your connection.'],
  ['status 404',               'No data found for this location.'],
  ['status 429',               'Too many requests. Please wait a moment.'],
  ['status 5',                 'Weather service is temporarily unavailable.'],
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
