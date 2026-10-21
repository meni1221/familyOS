/**
 * Thin, typed wrapper around `fetch` for the Shlanu API.
 *
 * Every call goes through here so that credentials, error handling and
 * payload shapes stay consistent across pages. The API is same-origin (Vite
 * proxies `/api` in development), so relative paths are always used.
 */

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

interface RequestOptions {
  body?: unknown;
  signal?: AbortSignal;
}

const extractMessage = (payload: unknown, status: number): string => {
  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const data = payload as {
      error?: { message?: string | string[] };
      message?: string | string[];
    };

    const raw = data.error?.message ?? data.message;
    if (Array.isArray(raw) && raw.length > 0) return String(raw[0]);
    if (typeof raw === 'string' && raw) return raw;
  }

  if (status === 401) return 'נדרשת התחברות';
  if (status === 403) return 'אין לך הרשאה לבצע פעולה זו';
  if (status === 404) return 'הפריט המבוקש לא נמצא';
  if (status >= 500) return 'אירעה שגיאה בשרת. נסו שוב מאוחר יותר.';
  return 'אירעה שגיאה. נסו שוב.';
};

const extractCode = (payload: unknown): string | undefined => {
  if (payload && typeof payload === 'object') {
    const code = (payload as { error?: { code?: unknown } }).error?.code;
    if (typeof code === 'string') return code;
  }
  return undefined;
};

/** The server names the file it sends; fall back to a name that still makes sense. */
const filenameFrom = (response: Response): string => {
  const disposition = response.headers.get('Content-Disposition') ?? '';
  const match = disposition.match(/filename="([^"]+)"/);
  return match ? match[1] : 'shlanu-export.json';
};

const request = async <T>(
  method: string,
  path: string,
  options: RequestOptions = {}
): Promise<T> => {
  const headers: Record<string, string> = {};
  let body: BodyInit | undefined;

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  let response: Response;
  try {
    response = await fetch(path, {
      method,
      headers,
      body,
      credentials: 'include',
      signal: options.signal,
    });
  } catch {
    throw new ApiError('לא ניתן להתחבר לשרת. בדקו את החיבור ונסו שוב.', 0);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let payload: unknown = undefined;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      extractMessage(payload, response.status),
      response.status,
      extractCode(payload)
    );
  }

  return payload as T;
};

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>('GET', path, { signal }),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body }),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, { body }),
  del: <T>(path: string, body?: unknown) => request<T>('DELETE', path, { body }),

  /**
   * A GET whose answer is a file. Kept here so credentials and the error
   * message stay the same as every other call — a bare `fetch` elsewhere would
   * be the one place where a 401 looks like an empty download.
   */
  download: async (path: string): Promise<{ blob: Blob; filename: string }> => {
    let response: Response;
    try {
      response = await fetch(path, { credentials: 'include' });
    } catch {
      throw new ApiError('לא ניתן להתחבר לשרת. בדקו את החיבור ונסו שוב.', 0);
    }

    if (!response.ok) {
      const text = await response.text();
      let payload: unknown;
      try {
        payload = JSON.parse(text);
      } catch {
        payload = text;
      }
      throw new ApiError(
        extractMessage(payload, response.status),
        response.status,
        extractCode(payload)
      );
    }

    return { blob: await response.blob(), filename: filenameFrom(response) };
  },
};
