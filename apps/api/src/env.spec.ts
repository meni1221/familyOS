import { loggerLevels, validateEnv } from './env';

const MINIMAL: Record<string, unknown> = { DATABASE_URL: 'mongodb://localhost:27017/shlanu_test' };

const envWith = (overrides: Record<string, unknown> = {}) => validateEnv({ ...MINIMAL, ...overrides });

describe('validateEnv', () => {
  it('fills every optional key so the app never reads undefined', () => {
    const env = envWith();

    expect(env.NODE_ENV).toBe('development');
    expect(env.PORT).toBe(3001);
    expect(env.DATABASE_NAME).toBe('Shlanu');
    expect(env.FRONTEND_URL).toBe('http://localhost:5173');
    expect(env.API_URL).toBe('http://localhost:3001');
    expect(env.LOG_LEVEL).toBe('info');
  });

  it('refuses to start without a database URL, naming the key', () => {
    expect(() => validateEnv({})).toThrow(/DATABASE_URL/);
  });

  it('coerces the numeric knobs .env and docker hand over as strings', () => {
    const env = envWith({
      PORT: '8080',
      RATE_LIMIT_MAX_REQUESTS: '42',
      AUTH_RATE_LIMIT_MAX_REQUESTS: '7',
      RATE_LIMIT_WINDOW_MS: '60000',
    });

    expect(env.PORT).toBe(8080);
    expect(env.RATE_LIMIT_MAX_REQUESTS).toBe(42);
    expect(env.AUTH_RATE_LIMIT_MAX_REQUESTS).toBe(7);
    expect(env.RATE_LIMIT_WINDOW_MS).toBe(60000);
  });

  it('rejects values a deployment can plausibly get wrong', () => {
    expect(() => envWith({ FRONTEND_URL: 'app.shlanu.app' })).toThrow(/FRONTEND_URL/);
    expect(() => envWith({ PORT: 'abc' })).toThrow(/PORT/);
    expect(() => envWith({ PORT: '' })).toThrow(/PORT/);
    expect(() => envWith({ LOG_LEVEL: 'chatty' })).toThrow(/LOG_LEVEL/);
    expect(() => envWith({ NODE_ENV: 'staging' })).toThrow(/NODE_ENV/);
  });

  it('leaves the variables the schema does not own alone', () => {
    const env = validateEnv({ ...MINIMAL, PATH: '/usr/bin', HOSTNAME: 'api-1' });

    expect(env.PATH).toBe('/usr/bin');
    expect(env.HOSTNAME).toBe('api-1');
  });

  it('accepts a complete SMTP block and defaults the rest', () => {
    const env = envWith({
      SMTP_HOST: 'smtp.example.com',
      SMTP_USER: 'mailer',
      SMTP_PASS: 'secret',
    });

    expect(env.SMTP_HOST).toBe('smtp.example.com');
    expect(env.SMTP_PORT).toBe(587);
    expect(env.SMTP_SECURE).toBe('false');
    expect(env.SMTP_FROM).toContain('no-reply@shlanu.app');
  });

  it('refuses half an SMTP credential pair instead of failing on the first reset', () => {
    expect(() => envWith({ SMTP_HOST: 'smtp.example.com', SMTP_USER: 'mailer' })).toThrow(
      /SMTP_USER/
    );
    expect(() => envWith({ SMTP_HOST: 'smtp.example.com', SMTP_PASS: 'secret' })).toThrow(
      /SMTP_USER/
    );
  });
});

describe('loggerLevels', () => {
  const original = process.env.LOG_LEVEL;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.LOG_LEVEL;
    } else {
      process.env.LOG_LEVEL = original;
    }
  });

  it('prints info and above by default', () => {
    delete process.env.LOG_LEVEL;

    expect(loggerLevels()).toEqual(['fatal', 'error', 'warn', 'log']);
  });

  it('quietens to warnings and errors when asked', () => {
    process.env.LOG_LEVEL = 'warn';

    expect(loggerLevels()).toContain('error');
    expect(loggerLevels()).not.toContain('log');
  });

  it('opens up to debug and verbose on request', () => {
    process.env.LOG_LEVEL = 'verbose';

    expect(loggerLevels()).toContain('debug');
    expect(loggerLevels()).toContain('verbose');
  });
});
