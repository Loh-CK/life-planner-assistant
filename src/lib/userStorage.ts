/**
 * Purely client-side features (Notes, Pomodoro history, Settings/preferences)
 * persist to localStorage rather than Supabase. Namespacing every key by the
 * signed-in user's id keeps those from leaking between different accounts
 * that sign in on the same browser - the same isolation Supabase RLS gives
 * the database-backed tables.
 */
export const userScopedKey = (base: string, userId: string | null | undefined): string =>
  userId ? `${base}:${userId}` : base;
