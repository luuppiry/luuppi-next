const TICKET_COLOR_PALETTE = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#84CC16', // lime
  '#6366F1', // indigo
];

function hashString(string: string) {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function getTicketColor(ticketType: string) {
  const index = hashString(ticketType) % TICKET_COLOR_PALETTE.length;
  return TICKET_COLOR_PALETTE[index] ?? '#000';
}

export function normalizeFilters(filters?: string | string[]): URLSearchParams {
  const raw = Array.isArray(filters) ? filters.join('&') : (filters ?? '');
  return new URLSearchParams(raw);
}

export function buildRegistrationFilter(filters?: string | string[]) {
  const params = normalizeFilters(filters);
  const query: Record<string, boolean | string> = {};

  if (params.has('picked_up')) {
    query.pickedUp = params.get('picked_up') === 'true';
  }

  if (params.has('ticket')) {
    query.strapiTicketUid = params.get('ticket')!;
  }

  return query;
}

export function buildFilterHref(
  current: URLSearchParams,
  overrides: Record<string, string | null>,
): string {
  const next = new URLSearchParams(current);
  for (const [key, value] of Object.entries(overrides)) {
    if (value === null) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
  }

  const params = new URLSearchParams();
  for (const [key, value] of next.entries()) {
    params.append('filters', `${key}=${value}`);
  }

  return params.toString();
}
