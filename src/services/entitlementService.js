/**
 * GRDE Subscriber Entitlement Architecture & Public Client Boundary
 *
 * Architectural Separation (October 2026 Release):
 * 1. Owner / Admin Console (`CodesView.jsx` + `accessTokens.js`):
 *    - Loaded ONLY in local development (`import.meta.env.DEV`).
 *    - Excluded from the public GitHub Pages production bundle.
 *    - Generates subscriber codes, assigns tiers/activation/expiry dates, revokes/renews/replaces codes,
 *      maintains an auditable register, and exports SHA-256 hashed code registers for backend seeding.
 *
 * 2. Secure Entitlement Backend (External HTTPS Service Specification):
 *    - GitHub Pages is static hosting; client-side JavaScript alone cannot securely validate secrets.
 *    - When monetisation is enabled (`VITE_GRDE_ENTITLEMENT_API_URL`), subscriber codes are sent via HTTPS POST
 *      to the backend service, which compares the code's cryptographic hash (SHA-256 / Argon2id) against the
 *      server-side subscriber register, verifies activation/expiry/revocation state, and returns a signed
 *      entitlement session.
 *
 * 3. Public Subscriber Interface (`LockOverlay.jsx`):
 *    - Provides a clean subscriber code-entry & entitlement status modal.
 *    - Never contains master owner codes, bank credentials, signing secrets, or lists of valid subscriber codes.
 */

export const PUBLIC_GITHUB_PAGES_TABS = Object.freeze([
  "dashboard",
  "allocator",
  "blueprint",
  "tracker",
  "sip",
  "isr",
  "pulse"
]);

export const LOCAL_PRIVATE_DEV_TABS = Object.freeze([
  "tactical",   // TATASILV Recovery & Exit
  "journal",    // Podcast Journal & Idea Observatory
  "codes",      // Owner/Admin Codes Console
  "research",   // Research Console (Thursday Trials & Data Truth)
  "growth",     // Internal A1 Growth Engine
  "factors"     // Internal A2 Factor Engine
]);

export const SUBSCRIPTION_TIERS = Object.freeze({
  monthly: {
    id: "monthly",
    label: "Monthly Subscriber",
    defaultDurationDays: 31,
    entitlements: PUBLIC_GITHUB_PAGES_TABS
  },
  annual: {
    id: "annual",
    label: "Annual Pro Subscriber",
    defaultDurationDays: 366,
    entitlements: PUBLIC_GITHUB_PAGES_TABS
  },
  institutional: {
    id: "institutional",
    label: "Institutional / Family Office",
    defaultDurationDays: 366,
    entitlements: PUBLIC_GITHUB_PAGES_TABS
  },
  trial: {
    id: "trial",
    label: "Review / Trial Access",
    defaultDurationDays: 14,
    entitlements: PUBLIC_GITHUB_PAGES_TABS
  }
});

// Pre-monetisation October 2026 release flag:
// Public tabs are accessible without a fake client-side lock wall until a backend endpoint is configured.
export const ENTITLEMENT_CONFIG = Object.freeze({
  architectureVersion: "GRDE-ENTITLEMENT-ARCH-V1",
  monetisationEnforced: Boolean(import.meta.env?.VITE_GRDE_ENFORCE_MONETISATION === "true"),
  entitlementApiUrl: import.meta.env?.VITE_GRDE_ENTITLEMENT_API_URL || null,
  staticHostingNotice: "GitHub Pages is static hosting. Secure subscriber code validation requires an external HTTPS entitlement backend storing hashed access codes."
});

/**
 * Validates a subscriber code against the configured external entitlement backend.
 * Never performs fake client-side secret validation or embeds valid code lists in the public bundle.
 */
export async function verifySubscriberCodeWithBackend(rawCode) {
  const cleaned = String(rawCode || "").trim().toUpperCase();
  if (!cleaned) {
    return {
      ok: false,
      error: "Please enter a subscriber access code."
    };
  }

  if (!ENTITLEMENT_CONFIG.entitlementApiUrl) {
    return {
      ok: false,
      status: "BACKEND_NOT_CONNECTED",
      error: "Subscriber backend verification service is not yet active on this static preview. All public GRDE modules are currently unlocked for the October 2026 release."
    };
  }

  try {
    const response = await fetch(ENTITLEMENT_CONFIG.entitlementApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: cleaned })
    });
    if (!response.ok) {
      return { ok: false, error: "Invalid, expired, or revoked subscriber code." };
    }
    const payload = await response.json();
    return {
      ok: Boolean(payload.ok),
      tier: payload.tier || "monthly",
      expiresAt: payload.expiresAt || null,
      entitlements: payload.entitlements || PUBLIC_GITHUB_PAGES_TABS,
      sessionToken: payload.sessionToken || null,
      error: payload.error || null
    };
  } catch (err) {
    return {
      ok: false,
      error: "Unable to reach the subscriber entitlement service. Please check your connection."
    };
  }
}
