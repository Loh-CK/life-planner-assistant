// `Date.toISOString()` always renders the UTC moment, so near midnight in any
// timezone ahead of UTC it reports yesterday's date instead of the user's
// actual local day. Every "what's today" comparison must go through this.
export const localDateString = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
};
