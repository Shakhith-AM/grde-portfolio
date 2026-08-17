export const CURRENCIES = {
  INR: { symbol: "₹",  code: "INR", flag: "🇮🇳", locale: "en-IN", rate: 1,    units: [[1e7, "Cr"], [1e5, "L"]] },
  USD: { symbol: "$",  code: "USD", flag: "🇺🇸", locale: "en-US", rate: 83,   units: [[1e9, "B"], [1e6, "M"], [1e3, "K"]] },
  EUR: { symbol: "€",  code: "EUR", flag: "🇪🇺", locale: "en-IE", rate: 90,   units: [[1e9, "B"], [1e6, "M"], [1e3, "K"]] },
  GBP: { symbol: "£",  code: "GBP", flag: "🇬🇧", locale: "en-GB", rate: 105,  units: [[1e9, "B"], [1e6, "M"], [1e3, "K"]] },
  AED: { symbol: "د.إ", code: "AED", flag: "🇦🇪", locale: "en-AE", rate: 22.6,units: [[1e9, "B"], [1e6, "M"], [1e3, "K"]] },
};

export const CCY_KEY = "grde_ccy_v1";

export function formatCurrency(val, ccy = "INR", compact = true) {
  if (val == null || isNaN(val)) return "—";
  const c = CURRENCIES[ccy] || CURRENCIES.INR;
  const conv = Number(val) / c.rate;
  const n = Math.abs(conv);
  const sign = conv < 0 ? "-" : "";
  
  if (compact) {
    for (const [thresh, suffix] of c.units) {
      if (n >= thresh) return `${sign}${c.symbol}${(n / thresh).toFixed(2)} ${suffix}`;
    }
  }
  
  return `${sign}${c.symbol}${n.toLocaleString(c.locale, {
    maximumFractionDigits: n < 100 ? 2 : 0,
    minimumFractionDigits: 0
  })}`;
}

export function inrToActiveCcy(inrVal, ccy = "INR") {
  if (inrVal === "" || inrVal == null || isNaN(Number(inrVal))) return "";
  const rate = CURRENCIES[ccy]?.rate || 1;
  const v = Number(inrVal) / rate;
  return Math.round(v * 100) / 100;
}

export function activeCcyToInr(ccyVal, ccy = "INR") {
  if (ccyVal === "" || ccyVal == null) return "";
  const n = Number(ccyVal);
  if (isNaN(n)) return "";
  const rate = CURRENCIES[ccy]?.rate || 1;
  return n * rate;
}
