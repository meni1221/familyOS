import { resolveRequestId } from './request-id.middleware';

describe('resolveRequestId', () => {
  it('keeps an id a caller supplied, so a trace survives the hop', () => {
    expect(resolveRequestId('8f1c2a34-59bd-4e2c-9a11-07d2ccb1f2a3')).toBe(
      '8f1c2a34-59bd-4e2c-9a11-07d2ccb1f2a3'
    );
    expect(resolveRequestId('gateway.request_42')).toBe('gateway.request_42');
  });

  it('replaces an id that could forge or break a log line', () => {
    const generated = resolveRequestId('id\nINFO forged line');

    expect(generated).not.toContain('forged');
    expect(generated).not.toContain('\n');
    expect(generated).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('replaces an id that is too short or too long to be one', () => {
    expect(resolveRequestId('abc')).not.toBe('abc');
    expect(resolveRequestId('a'.repeat(65))).not.toBe('a'.repeat(65));
  });

  it('generates a distinct id each time there is nothing to keep', () => {
    const first = resolveRequestId(undefined);
    const second = resolveRequestId(undefined);

    expect(first).toMatch(/^[0-9a-f-]{36}$/);
    expect(first).not.toBe(second);
  });
});
