import { OWNER_CODE } from '../constants/masterData';

const ACCESS_SECRET = "GRDE-V4-PORTABLE-2026";
const MONTHLY_DAYS = 31;
const ANNUAL_DAYS = 366;

export const SUBSCRIBER_CODES = [
  "GRDE-WELCOME-001",
  "GRDE-FOUNDER-2026",
];

export const REVIEW_CODES = [
  { code: "GRDE-REVIEW-2026", expires: "2026-12-31" },
];

function simpleHash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function randomToken(n = 4) {
  const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: n }, () => A[Math.floor(Math.random() * A.length)]).join("");
}

export function generatePortableCode(plan = "monthly") {
  const days = plan === "annual" ? ANNUAL_DAYS : MONTHLY_DAYS;
  const expiryDay = Math.floor((Date.now() + days * 86400000) / 86400000);
  const day36 = expiryDay.toString(36).toUpperCase().padStart(6, "0");
  const kind = plan === "annual" ? "A" : "M";
  const rnd = randomToken(4);
  const body = `${kind}${day36}${rnd}`;
  const sig = simpleHash(body + ACCESS_SECRET).toString(36).toUpperCase().padStart(6, "0").slice(-6);
  return `GRDE-${kind}-${day36}-${rnd}-${sig}`;
}

export function parsePortableCode(code) {
  const m = /^GRDE-([MA])-([0-9A-Z]{6})-([A-Z0-9]{4})-([A-Z0-9]{6})$/.exec(code.trim().toUpperCase());
  if (!m) return null;
  const [, kind, day36, rnd, sig] = m;
  const body = `${kind}${day36}${rnd}`;
  const expected = simpleHash(body + ACCESS_SECRET).toString(36).toUpperCase().padStart(6, "0").slice(-6);
  if (sig !== expected) return null;
  const expiryDay = parseInt(day36, 36);
  if (!Number.isFinite(expiryDay)) return null;
  const expiresAt = expiryDay * 86400000 + 86399999;
  return { plan: kind === "A" ? "annual" : "monthly", expiresAt };
}

export function validateAccessCode(rawCode) {
  const code = rawCode.trim().toUpperCase();
  if (code === OWNER_CODE.toUpperCase()) {
    return { ok: true, role: "owner" };
  }

  const reviewMatch = REVIEW_CODES.find(r => r.code.toUpperCase() === code);
  if (reviewMatch) {
    if (new Date() > new Date(reviewMatch.expires + "T23:59:59")) {
      return { ok: false, error: "This review access code has expired." };
    }
    return { ok: true, role: `reviewer:${reviewMatch.expires}` };
  }

  const portable = parsePortableCode(code);
  if (portable) {
    if (Date.now() > portable.expiresAt) {
      return { ok: false, error: "This subscription code has expired. Please renew your GRDE access." };
    }
    return { ok: true, role: `subscriber:${portable.expiresAt}`, plan: portable.plan };
  }

  if (SUBSCRIBER_CODES.map(s => s.toUpperCase()).includes(code)) {
    return { ok: true, role: "subscriber" };
  }

  return { ok: false, error: "Invalid access code. Please verify and try again." };
}
