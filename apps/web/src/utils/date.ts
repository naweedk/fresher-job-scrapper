/**
 * Canonical date formatting utilities for Fresher Jobs India.
 *
 * Ensures 100% consistent date presentation across listing cards and detail pages.
 * Never fabricates dates or replaces missing dates with "Today".
 */

export interface DateRelativeOptions {
  includePrefix?: boolean; // e.g. "Posted 2d ago" vs "2d ago"
}

/**
 * Format relative posting date with Indian Standard Time context.
 * Returns null if dateStr is null, undefined, or invalid (NEVER falls back to current date).
 */
export function formatRelativePostingDate(
  dateStr?: string | null,
  options: DateRelativeOptions = { includePrefix: false }
): string | null {
  if (!dateStr) return null;

  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  
  // Future dates protection (allow up to 1 hr skew for client clock differences)
  if (diffMs < -3600_000) {
    return 'Recently verified';
  }

  const prefix = options.includePrefix ? 'Posted ' : '';
  const diffDays = Math.floor(Math.max(0, diffMs) / 86_400_000);

  if (diffDays <= 0) {
    return options.includePrefix ? 'Posted today' : 'Today';
  }
  if (diffDays === 1) {
    return options.includePrefix ? 'Posted yesterday' : 'Yesterday';
  }
  if (diffDays < 7) {
    return `${prefix}${diffDays}d ago`;
  }
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${prefix}${weeks}w ago`;
  }

  // Format as localized date string e.g., "12 Oct 2026"
  const formatted = d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });

  return `${prefix}${formatted}`;
}

/**
 * Format full canonical calendar date for detail pages or tooltips.
 * e.g. "17 Nov 2026" or "Posting date unavailable"
 */
export function formatFullDate(dateStr?: string | null, fallback = 'Posting date unavailable'): string {
  if (!dateStr) return fallback;

  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return fallback;

  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
