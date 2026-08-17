export const STORAGE_KEYS = {
  TRACKER: "grde_tracker_v3",
  UNLOCK: "grde_unlocked_v4",
  LEGACY_UNLOCK: "grde_unlocked_v3",
  ISSUED_CODES: "grde_issued_codes_v1",
  FIRE_GOALS: "grde_fire_goals_v1",
  ONBOARDED: "grde_onboarded_v1",
  CCY: "grde_ccy_v1",
};

export const GRDE_STORAGE = {
  get(key, fallback = null) {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? item : fallback;
    } catch (e) {
      console.warn(`[GRDE Storage] Failed to read ${key}:`, e);
      return fallback;
    }
  },
  
  getJSON(key, fallback = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      console.warn(`[GRDE Storage] Failed to parse JSON for ${key}:`, e);
      return fallback;
    }
  },
  
  set(key, value) {
    try {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn(`[GRDE Storage] Failed to set ${key}:`, e);
      return false;
    }
  },
  
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn(`[GRDE Storage] Failed to remove ${key}:`, e);
      return false;
    }
  }
};
