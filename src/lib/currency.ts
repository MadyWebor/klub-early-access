// src/lib/currency.ts
export function formatMinor(amount?: number | null, currency = "INR") {
  if (amount == null) return "";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency })
    .format(amount / 100);
}