export function anonymizeIp(ip: string): string {
  // IPv6
  if (ip.includes(':')) {
    const groups = ip.split(':');
    groups[groups.length - 1] = '0';
    return groups.join(':');
  }

  // IPv4
  const parts = ip.split('.');
  parts[3] = '0';
  return parts.join('.');
}
