import { isAllowedOrigin, originOf } from './origin';

const ALLOWED = ['https://app.shlanu.app', 'http://localhost:5173'];

describe('originOf', () => {
  it('reduces a URL to its origin', () => {
    expect(originOf('https://app.shlanu.app/app/tasks?filter=open')).toBe('https://app.shlanu.app');
  });

  it('keeps a non-default port', () => {
    expect(originOf('http://localhost:5173')).toBe('http://localhost:5173');
    expect(originOf('http://localhost:3001')).toBe('http://localhost:3001');
  });

  it('returns null for the literal "null" origin a sandboxed frame sends', () => {
    expect(originOf('null')).toBeNull();
  });

  it('returns null for an empty or malformed value', () => {
    expect(originOf(undefined)).toBeNull();
    expect(originOf('')).toBeNull();
    expect(originOf('not a url')).toBeNull();
  });
});

describe('isAllowedOrigin', () => {
  it('accepts an exact allowed origin', () => {
    expect(isAllowedOrigin('https://app.shlanu.app', ALLOWED)).toBe(true);
  });

  it('reduces a referer with a path to its origin', () => {
    expect(isAllowedOrigin('https://app.shlanu.app/app/baby?tab=logs', ALLOWED)).toBe(true);
  });

  it('rejects a look-alike domain that merely starts with an allowed origin', () => {
    expect(isAllowedOrigin('https://app.shlanu.app.evil.com', ALLOWED)).toBe(false);
  });

  it('rejects a suffix or a subdomain of an allowed origin', () => {
    expect(isAllowedOrigin('https://evilapp.shlanu.app', ALLOWED)).toBe(false);
    expect(isAllowedOrigin('https://shlanu.app', ALLOWED)).toBe(false);
  });

  it('rejects the same host on another scheme or port', () => {
    expect(isAllowedOrigin('http://app.shlanu.app', ALLOWED)).toBe(false);
    expect(isAllowedOrigin('https://app.shlanu.app:8443', ALLOWED)).toBe(false);
  });

  it('rejects the null origin and missing headers', () => {
    expect(isAllowedOrigin('null', ALLOWED)).toBe(false);
    expect(isAllowedOrigin(undefined, ALLOWED)).toBe(false);
  });

  it('ignores an allowlist entry that is not a URL', () => {
    expect(isAllowedOrigin('https://app.shlanu.app', ['app.shlanu.app'])).toBe(false);
  });
});
