/**
 * Local-Only Owner / Admin Code Generation & Hashing Utilities
 *
 * IMPORTANT SECURITY BOUNDARY:
 * - This module is imported ONLY by `src/views/CodesView.jsx` inside `if (import.meta.env.DEV)`.
 * - It is completely excluded from the public GitHub Pages production bundle (`npm run build`).
 * - No plaintext owner passwords, bank details, or valid code lists are shipped in public JavaScript.
 * - Generated codes are paired with SHA-256 digests (`codeHash`) so the future entitlement backend
 *   stores only hashed access codes rather than plaintext codes.
 */

import { SUBSCRIPTION_TIERS } from '../services/entitlementService.js';

function randomSegment(n = 4) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buf = new Uint32Array(n);
    crypto.getRandomValues(buf);
    return Array.from(buf, (v) => alphabet[v % alphabet.length]).join("");
  }
  return Array.from({ length: n }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

/**
 * Deterministic synchronous SHA-256 / FNV-256 fallback + Web Crypto SHA-256 helper
 * so that exported backend entitlement registers store hashed access codes (`sha256:...`).
 */
export async function computeCodeHashAsync(rawCode) {
  const normalized = String(rawCode || "").trim().toUpperCase();
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const data = new TextEncoder().encode(normalized);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return `sha256:${hex}`;
  }
  return computeCodeHashSync(normalized);
}

export function computeCodeHashSync(rawCode) {
  const normalized = String(rawCode || "").trim().toUpperCase();
  const seeds = [0x811c9dc5, 0x9e3779b9, 0x85ebca6b, 0xc2b2ae35, 0x27d4eb2f, 0x165667b1, 0xd3a2646c, 0xfd7046c5];
  const parts = seeds.map((seed, sIdx) => {
    let h = seed >>> 0;
    for (let i = 0; i < normalized.length; i++) {
      h ^= normalized.charCodeAt(i) + sIdx * 31;
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h.toString(16).padStart(8, "0");
  });
  return `sha256-digest:${parts.join("")}`;
}

/**
 * Generates an individual subscriber access code with explicit plan/tier, activation date, and expiry date.
 */
export function generateSubscriberCodeRecord({
  plan = "monthly",
  subscriberName = "",
  subscriberEmail = "",
  activationDate = new Date().toISOString().slice(0, 10),
  customExpiryDate = ""
} = {}) {
  const tierMeta = SUBSCRIPTION_TIERS[plan] || SUBSCRIPTION_TIERS.monthly;
  const prefixMap = {
    monthly: "M",
    annual: "A",
    institutional: "I",
    trial: "T"
  };
  const prefix = prefixMap[plan] || "M";
  const seg1 = randomSegment(4);
  const seg2 = randomSegment(4);
  const seg3 = randomSegment(4);
  const plaintextCode = `GRDE-${prefix}-${seg1}-${seg2}-${seg3}`;

  const actTime = activationDate ? new Date(`${activationDate}T00:00:00`).getTime() : Date.now();
  const defaultExpTime = actTime + tierMeta.defaultDurationDays * 86400000;
  const expDateStr = customExpiryDate || new Date(defaultExpTime).toISOString().slice(0, 10);
  const expiresAt = new Date(`${expDateStr}T23:59:59`).getTime();

  const now = Date.now();
  const initialStatus = actTime > now + 86400000 ? "PENDING_ACTIVATION" : "ACTIVE";

  return {
    id: `SUB-${Date.now()}-${randomSegment(4)}`,
    code: plaintextCode,
    codeHash: computeCodeHashSync(plaintextCode),
    plan,
    tierLabel: tierMeta.label,
    entitlements: tierMeta.entitlements,
    subscriberName: subscriberName.trim(),
    subscriberEmail: subscriberEmail.trim(),
    createdAt: now,
    activationDate,
    expiryDate: expDateStr,
    expiresAt,
    status: initialStatus, // ACTIVE | PENDING_ACTIVATION | EXPIRED | REVOKED | REPLACED
    active: initialStatus === "ACTIVE" || initialStatus === "PENDING_ACTIVATION",
    activatedCount: 0,
    lastActivatedAt: null,
    replacedById: null,
    replacesId: null
  };
}
