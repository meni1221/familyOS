import { DEFAULT_PAGE_SIZE, resolvePage, toPage } from './pagination';

describe('resolvePage', () => {
  it('defaults to the first page of the default size', () => {
    expect(resolvePage({})).toEqual({ limit: DEFAULT_PAGE_SIZE, offset: 0 });
  });

  it('takes what the caller asked for', () => {
    expect(resolvePage({ limit: 10, offset: 20 })).toEqual({ limit: 10, offset: 20 });
  });
});

describe('toPage', () => {
  it('uses the extra record only to report that another page exists', () => {
    const page = toPage([1, 2, 3], 2);

    expect(page.data).toEqual([1, 2]);
    expect(page.hasMore).toBe(true);
  });

  it('reports the end when exactly one page came back', () => {
    expect(toPage([1, 2], 2)).toEqual({ data: [1, 2], hasMore: false });
  });

  it('reports the end when the last page is short', () => {
    expect(toPage([1], 2)).toEqual({ data: [1], hasMore: false });
  });

  it('handles an empty list', () => {
    expect(toPage([], 2)).toEqual({ data: [], hasMore: false });
  });
});
