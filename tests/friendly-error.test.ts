import { describe, it, expect } from 'vitest';
import { friendlyError } from '../src/features/admin/friendlyError';

describe('friendlyError', () => {
  it('never shows staff the raw database wording', () => {
    expect(friendlyError({ message: 'new row violates row-level security policy for table "user_roles"', code: '42501' }))
      .toBe("You don't have permission to do this. If you need to, ask a super admin.");
    expect(friendlyError({ message: 'duplicate key value violates unique constraint "shipments_tracking_number_key"', code: '23505' }))
      .toMatch(/duplicate/); // the bill editor matches /duplicate/ to name the clashing bill number
    expect(friendlyError(new TypeError('Failed to fetch'))).toMatch(/Can't reach the server/);
    expect(friendlyError({ message: 'relation "x" does not exist', code: '42P01' })).toMatch(/Something went wrong/);
    expect(friendlyError(undefined)).toMatch(/Something went wrong/);
  });

  it('keeps messages our own database code writes for people', () => {
    expect(friendlyError({ message: 'At least one active super admin must remain.', code: '23514' })).toBe('At least one active super admin must remain.');
    expect(friendlyError('Photo must be 2 MB or smaller.')).toBe('Photo must be 2 MB or smaller.');
  });
});
