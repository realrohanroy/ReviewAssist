/**
 * Validates that a review URL uses HTTPS and belongs to authorized Google review domains
 * (e.g., g.page, search.google.com/local/writereview, maps.google.com, goo.gl).
 */
export function isValidGoogleReviewUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;

  const trimmed = urlStr.trim();
  if (!trimmed.startsWith('https://')) return false;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();

    // Whitelisted Google domains for review links
    const allowedDomains = [
      'g.page',
      'share.google',
      'search.google.com',
      'maps.google.com',
      'maps.app.goo.gl',
      'goo.gl',
      'google.com',
      'www.google.com'
    ];

    const isMatch = allowedDomains.some((d) => host === d || host.endsWith('.' + d)) || host === 'google' || host.endsWith('.google');
    return isMatch;
  } catch {
    return false;
  }
}
