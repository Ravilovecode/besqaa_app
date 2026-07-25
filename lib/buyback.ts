import type { BuybackEntry, User } from './types';

export const MAX_BUYBACKS = 15;

// All saved buybacks, falling back to the legacy single-entry fields for
// accounts saved before multi-buyback support.
export function allBuybacks(user: User | null): BuybackEntry[] {
  if (!user) return [];
  if (user.buybacks?.length) return user.buybacks;
  if (user.buybackDate) return [{ date: user.buybackDate, amount: user.buybackAmount || 0 }];
  return [];
}

// The next upcoming buyback (soonest future date), or the most recent one
// when every saved date is already in the past.
export function nextBuyback(user: User | null): BuybackEntry | null {
  const entries = allBuybacks(user);
  if (entries.length === 0) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  return sorted.find((e) => new Date(e.date) >= today) || sorted[sorted.length - 1];
}
