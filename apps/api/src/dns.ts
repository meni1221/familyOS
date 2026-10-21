import { setServers } from 'node:dns';
import { isIP } from 'node:net';

type SetDnsServers = (servers: string[]) => void;

/**
 * Points Node's resolver at explicit DNS servers, when `DNS_SERVERS` is set.
 *
 * A `mongodb+srv` connection string is resolved by c-ares, not by the
 * operating system. c-ares uses the resolver list the process sees, which can
 * be empty or point at a local stub that is not listening — in containers, on
 * VPNs, and on some development machines. SRV lookups then fail with
 * `querySrv ECONNREFUSED` while the same name resolves through the OS.
 *
 * `DNS_SERVERS` is the deliberate escape hatch: a comma-separated list of IP
 * addresses for this process only. Unset or empty leaves Node untouched, which
 * is what a healthy host wants — nothing is overridden by default.
 */
export const applyDnsServers = (
  value: string | undefined,
  set: SetDnsServers = setServers
): string[] => {
  const servers = (value ?? '')
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  const invalid = servers.filter((server) => isIP(server) === 0);
  if (invalid.length > 0) {
    throw new Error(`DNS_SERVERS contains invalid IP addresses: ${invalid.join(', ')}`);
  }

  if (servers.length > 0) {
    set(servers);
  }

  return servers;
};
