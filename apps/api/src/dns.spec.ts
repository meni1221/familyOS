import { applyDnsServers } from './dns';

describe('applyDnsServers', () => {
  it('leaves Node alone when DNS_SERVERS is unset or empty', () => {
    const set = vi.fn();

    expect(applyDnsServers(undefined, set)).toEqual([]);
    expect(applyDnsServers('', set)).toEqual([]);
    expect(applyDnsServers('   ', set)).toEqual([]);
    expect(set).not.toHaveBeenCalled();
  });

  it('trims the list and drops empty entries before applying it', () => {
    const set = vi.fn();

    const servers = applyDnsServers(' 1.1.1.1, ,8.8.8.8 ', set);

    expect(servers).toEqual(['1.1.1.1', '8.8.8.8']);
    expect(set).toHaveBeenCalledWith(['1.1.1.1', '8.8.8.8']);
  });

  it('accepts IPv6 resolvers', () => {
    const set = vi.fn();

    applyDnsServers('2001:4860:4860::8888', set);

    expect(set).toHaveBeenCalledWith(['2001:4860:4860::8888']);
  });

  it('refuses hostnames or ports, naming the key and the bad values', () => {
    const set = vi.fn();

    expect(() => applyDnsServers('dns.google,1.1.1.1:53', set)).toThrow(/DNS_SERVERS/);
    expect(() => applyDnsServers('dns.google,1.1.1.1:53', set)).toThrow(/dns\.google/);
    expect(set).not.toHaveBeenCalled();
  });
});
