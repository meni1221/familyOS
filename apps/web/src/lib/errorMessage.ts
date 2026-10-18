/**
 * The message of a failed mutation, ready for a toast or an inline note.
 * The API client already turns error responses into `Error`s carrying the
 * server's Hebrew text, so this mostly guards against a non-Error throw.
 */
export const errorMessage = (error: unknown, fallback = 'הפעולה נכשלה'): string => {
  return error instanceof Error && error.message ? error.message : fallback;
};
