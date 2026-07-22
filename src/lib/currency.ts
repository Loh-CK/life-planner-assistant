import { userScopedKey } from "@/lib/userStorage";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  MYR: "RM",
  SGD: "S$",
  EUR: "€",
  GBP: "£",
};

export const getStoredCurrency = (userId: string | null): string => {
  try {
    const stored = JSON.parse(localStorage.getItem(userScopedKey("lifePlannerSettings", userId)) ?? "{}");
    return stored?.preferences?.currency ?? "USD";
  } catch {
    return "USD";
  }
};

export const getCurrencySymbol = (code: string): string => CURRENCY_SYMBOLS[code] ?? code;
