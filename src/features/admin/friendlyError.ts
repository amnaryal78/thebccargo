/**
 * Turns a database or network error into a sentence staff can act on.
 * Messages our own database code raises on purpose (already written for people) pass through unchanged.
 */
export function friendlyError(raw: unknown): string {
  const e = raw as { message?: string; code?: string } | null;
  const msg = String(e?.message ?? raw ?? '');
  const code = e?.code ?? '';

  if (code === '42501' || /row-level security|permission denied|not authorized/i.test(msg))
    return "You don't have permission to do this. If you need to, ask a super admin.";
  if (code === '23505' || /duplicate key|unique constraint/i.test(msg))
    return 'This already exists (duplicate). Change the number or name and try again.';
  if (code === '23503' || /foreign key/i.test(msg))
    return 'Something else still uses this record, so it cannot be removed.';
  if (code === '23502' || /null value in column/i.test(msg))
    return 'A required field is empty. Fill it in and try again.';
  if (/jwt expired|invalid jwt|refresh token/i.test(msg)) return 'Your session has expired. Sign in again.';
  if (/failed to fetch|networkerror|network request failed|load failed|timeout|aborted/i.test(msg))
    return "Can't reach the server. Check your internet connection and try again.";
  // Raised deliberately by our triggers and services, already in plain language.
  if (/^(At least one active super admin|Too many submissions|Photo must|Database is not configured)/.test(msg)) return msg;
  if (!msg || /^[a-z_]+:|violates|syntax error|relation .* does not exist|PGRST/i.test(msg))
    return 'Something went wrong. Try again, and if it keeps happening tell the office.';
  return msg;
}
