import React, { useState, useMemo, Suspense } from 'react';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { Footer } from './components/layout/Footer';
import { OnboardingModal } from './components/modals/OnboardingModal';
import { ExcelImportModal } from './components/modals/ExcelImportModal';

// 7 Public GitHub Pages Views (Section 1)
import { DashboardView } from './views/DashboardView';
import { AllocatorView } from './views/AllocatorView';
import { BlueprintView } from './views/BlueprintView';
import { TrackerView } from './views/TrackerView';
import { SipPlannerView } from './views/SipPlannerView';
import { ISRView } from './views/ISRView';
import { PulseView } from './views/PulseView';

import { computePortfolioState } from './utils/calculations';
import { GRDE_STORAGE, STORAGE_KEYS, migrateTrackerToOct2026 } from './utils/storage';
import { CCY_KEY } from './constants/currencies';
import { DEFAULT_OCT_2026_TRACKER } from './constants/masterData';
import { PUBLIC_GITHUB_PAGES_TABS, LOCAL_PRIVATE_DEV_TABS } from './services/entitlementService';

// Local / Private Development Modules (Section 2):
// Strictly gated behind `import.meta.env.DEV` so Vite/Rollup dead-code-eliminates all 6
// from the public GitHub Pages production bundle (`npm run build`), while keeping 100%
// of their functionality and data accessible locally via `?localDev=1` or `?devResearch=1`.
const LocalTataSilvView = import.meta.env.DEV
  ? React.lazy(() => import('./views/TataSilvView').then(m => ({ default: m.TataSilvView })))
  : null;
const LocalPodcastJournalView = import.meta.env.DEV
  ? React.lazy(() => import('./views/PodcastJournalView').then(m => ({ default: m.PodcastJournalView })))
  : null;
const LocalOwnerCodesView = import.meta.env.DEV
  ? React.lazy(() => import('./views/CodesView').then(m => ({ default: m.CodesView })))
  : null;
const LocalResearchLabView = import.meta.env.DEV
  ? React.lazy(() => import('./views/ResearchLabView').then(m => ({ default: m.ResearchLabView })))
  : null;
const LocalGrowthEngineView = import.meta.env.DEV
  ? React.lazy(() => import('./views/GrowthEngineView').then(m => ({ default: m.GrowthEngineView })))
  : null;
const LocalFactorEngineView = import.meta.env.DEV
  ? React.lazy(() => import('./views/FactorEngineView').then(m => ({ default: m.FactorEngineView })))
  : null;

const PUBLIC_ALLOWED_TABS = new Set(PUBLIC_GITHUB_PAGES_TABS);
const LOCAL_DEV_ALLOWED_TABS = new Set(LOCAL_PRIVATE_DEV_TABS);

export function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currency, setCurrency] = useState(() => GRDE_STORAGE.get(CCY_KEY, "INR"));
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return GRDE_STORAGE.get(STORAGE_KEYS.ONBOARDED) !== "1";
  });

  // Explicit Local/Private Development Route Check:
  // Public interface (`http://localhost:5173/` and GitHub Pages) never shows the private bar.
  // Local private workspace is accessed explicitly via `?localDev=1` or `?devResearch=1` in DEV mode.
  const isLocalPrivateRoute = useMemo(() => {
    if (!import.meta.env.DEV) return false;
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("localDev") === "1" || params.get("devResearch") === "1";
    } catch (e) {
      return false;
    }
  }, []);

  // Tracker state loaded from local storage with non-destructive October 2026 migration
  const [trackerData, setTrackerData] = useState(() => {
    const saved = GRDE_STORAGE.getJSON(STORAGE_KEYS.TRACKER, null);
    if (!saved) {
      return DEFAULT_OCT_2026_TRACKER;
    }
    const migrated = migrateTrackerToOct2026(saved);
    GRDE_STORAGE.set(STORAGE_KEYS.TRACKER, migrated);
    return migrated;
  });

  // Single authoritative selected age state (initial default: 52)
  const [age, setAge] = useState(() => Number(trackerData.age) || 52);
  const [riskProfile, setRiskProfile] = useState(trackerData.riskProfile || "balanced");

  // Safe tab change guard: blocks local/private routes in public mode
  const handleTabChange = (nextTab) => {
    if (PUBLIC_ALLOWED_TABS.has(nextTab)) {
      setActiveTab(nextTab);
      return;
    }
    if (import.meta.env.DEV && isLocalPrivateRoute && LOCAL_DEV_ALLOWED_TABS.has(nextTab)) {
      setActiveTab(nextTab);
      return;
    }
    setActiveTab("dashboard");
  };

  // Keep age & riskProfile synced to tracker across all views
  const handleAgeChange = (newAge) => {
    const validAge = Math.max(18, Math.min(100, Number(newAge) || 52));
    setAge(validAge);
    const next = { ...trackerData, age: validAge };
    setTrackerData(next);
    GRDE_STORAGE.set(STORAGE_KEYS.TRACKER, next);
  };

  const handleRiskProfileChange = (newRisk) => {
    setRiskProfile(newRisk);
    const next = { ...trackerData, riskProfile: newRisk };
    setTrackerData(next);
    GRDE_STORAGE.set(STORAGE_KEYS.TRACKER, next);
  };

  const handleUpdateTracker = (nextTracker) => {
    setTrackerData(nextTracker);
    if (nextTracker.age) setAge(Number(nextTracker.age) || 52);
    if (nextTracker.riskProfile) setRiskProfile(nextTracker.riskProfile);
    GRDE_STORAGE.set(STORAGE_KEYS.TRACKER, nextTracker);
  };

  // Apply imported Excel values
  const handleApplyHoldings = (newValues, newCustomNames) => {
    const mergedValues = { ...trackerData.values, ...newValues };
    const mergedNames = { ...trackerData.customNames, ...newCustomNames };
    handleUpdateTracker({
      ...trackerData,
      values: mergedValues,
      customNames: mergedNames
    });
  };

  const handleCurrencyChange = (c) => {
    setCurrency(c);
    GRDE_STORAGE.set(CCY_KEY, c);
  };

  // Compute live portfolio state from the single synchronized `age` state
  const portfolioState = useMemo(() => {
    return computePortfolioState(trackerData, age, riskProfile);
  }, [trackerData, age, riskProfile]);

  return (
    <div>
      {showOnboarding && (
        <OnboardingModal onComplete={() => setShowOnboarding(false)} />
      )}

      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onApplyHoldings={handleApplyHoldings}
        currency={currency}
      />

      <Header
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        onOpenExcelModal={() => setIsExcelModalOpen(true)}
      />

      <main className="grde-main" style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 24px 60px" }}>
        {/* Architectural Hero Banner */}
        <section className="grde-hero" style={{ padding: "10px 0 24px", textAlign: "left" }}>
          <div className="mono" style={{
            display: "inline-block",
            fontSize: 10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--gold-pale)",
            background: "rgba(212, 168, 67, 0.08)",
            border: "1px solid var(--gold-dim)",
            borderRadius: 999,
            padding: "4px 14px"
          }}>
            · The Beaver Dam Method · October 2026 Consolidated Architecture
          </div>

          <h1 className="serif" style={{
            fontSize: "clamp(30px, 4.5vw, 46px)",
            lineHeight: 1.1,
            marginTop: 12,
            color: "var(--white)",
            fontWeight: 500,
            letterSpacing: "0.01em"
          }}>
            GRDE Portfolio <span style={{ color: "var(--gold)", fontStyle: "italic", fontWeight: 600 }}>Engine</span>
          </h1>

          <div style={{
            marginTop: 8,
            color: "var(--text-dim)",
            fontSize: 15,
            fontFamily: "'Cinzel', serif",
            letterSpacing: "0.02em"
          }}>
            An Architect's Blueprint to <span style={{ color: "var(--gold-pale)", fontStyle: "italic" }}>Wealth Creation</span>
          </div>
          
          <div style={{
            marginTop: 4,
            fontStyle: "italic",
            color: "var(--text-dim)",
            fontSize: 12.5,
            fontFamily: "'Cinzel', serif",
            letterSpacing: "0.02em",
            opacity: 0.8
          }}>
            "Don't hoard like a squirrel. Build like a beaver."
          </div>
        </section>

        {/* Final Public GitHub Pages Navigation (Strictly 7 Tabs) */}
        <Navigation
          active={activeTab}
          onChange={handleTabChange}
        />

        {/* Local / Private Development Navigation (Strictly gated behind DEV + ?localDev=1 or ?devResearch=1) */}
        {import.meta.env.DEV && isLocalPrivateRoute && (
          <div className="mono" style={{
            marginTop: 10,
            padding: "8px 14px",
            background: "rgba(15, 22, 32, 0.85)",
            border: "1px dashed var(--gold-dim)",
            borderRadius: 10,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
            fontSize: 9.5,
            color: "var(--gold-pale)"
          }}>
            <span style={{ color: "var(--gold)", fontWeight: 700, marginRight: 4 }}>
              LOCAL / PRIVATE WORKSPACE (?localDev=1):
            </span>
            {[
              { id: "tactical", label: "TATASILV Recovery" },
              { id: "journal",  label: "Podcast Journal" },
              { id: "codes",    label: "Owner Codes Console" },
              { id: "research", label: "Research Console" },
              { id: "growth",   label: "A1 Growth Engine" },
              { id: "factors",  label: "A2 Factor Engine" }
            ].map(devItem => (
              <button
                key={devItem.id}
                onClick={() => handleTabChange(devItem.id)}
                className="mono"
                style={{
                  background: activeTab === devItem.id ? "linear-gradient(180deg, #d4a843, #8a7029)" : "transparent",
                  color: activeTab === devItem.id ? "#0a1628" : "var(--text)",
                  border: `1px solid ${activeTab === devItem.id ? "var(--gold)" : "var(--border-2)"}`,
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: 9.5,
                  fontWeight: activeTab === devItem.id ? 700 : 500,
                  cursor: "pointer"
                }}
              >
                {devItem.label}
              </button>
            ))}
          </div>
        )}

        {/* View Router */}
        <div style={{ marginTop: 28, position: "relative" }}>
          {/* 1. Dashboard (Public) */}
          {activeTab === "dashboard" && (
            <DashboardView
              portfolioState={portfolioState}
              currency={currency}
              age={age}
              onNavigate={handleTabChange}
              onOpenExcelModal={() => setIsExcelModalOpen(true)}
            />
          )}

          {/* 2. Allocator (Public) */}
          {activeTab === "allocator" && (
            <AllocatorView
              age={age}
              onAgeChange={handleAgeChange}
              riskProfile={riskProfile}
              onRiskProfileChange={handleRiskProfileChange}
              portfolioValue={portfolioState.effectiveTotal}
              currency={currency}
            />
          )}

          {/* 3. Blueprint (Public) */}
          {activeTab === "blueprint" && (
            <BlueprintView
              portfolioState={portfolioState}
              currency={currency}
            />
          )}

          {/* 4. Portfolio Engine / Tracker (Public) */}
          {activeTab === "tracker" && (
            <TrackerView
              portfolioState={portfolioState}
              trackerData={trackerData}
              onUpdateTracker={handleUpdateTracker}
              currency={currency}
              onOpenExcelModal={() => setIsExcelModalOpen(true)}
            />
          )}

          {/* 5. SIP Planner (Public) */}
          {activeTab === "sip" && (
            <SipPlannerView
              portfolioState={portfolioState}
              currency={currency}
              onNavigate={handleTabChange}
            />
          )}

          {/* 6. ISR & Drift (Public) */}
          {activeTab === "isr" && (
            <ISRView
              portfolioState={portfolioState}
              currency={currency}
            />
          )}

          {/* 7. GRDE Pulse (Public) */}
          {activeTab === "pulse" && (
            <PulseView
              portfolioState={portfolioState}
              currency={currency}
              onNavigate={handleTabChange}
            />
          )}

          {/* Local / Private Modules (Strictly DEV + ?localDev=1; stripped from production build) */}
          {import.meta.env.DEV && isLocalPrivateRoute && activeTab === "tactical" && LocalTataSilvView && (
            <Suspense fallback={<div className="mono">Loading Local TATASILV Recovery Module...</div>}>
              <LocalTataSilvView currency={currency} onNavigate={handleTabChange} />
            </Suspense>
          )}
          {import.meta.env.DEV && isLocalPrivateRoute && activeTab === "journal" && LocalPodcastJournalView && (
            <Suspense fallback={<div className="mono">Loading Local Podcast Journal...</div>}>
              <LocalPodcastJournalView />
            </Suspense>
          )}
          {import.meta.env.DEV && isLocalPrivateRoute && activeTab === "codes" && LocalOwnerCodesView && (
            <Suspense fallback={<div className="mono">Loading Local Owner Codes Console...</div>}>
              <LocalOwnerCodesView />
            </Suspense>
          )}
          {import.meta.env.DEV && isLocalPrivateRoute && activeTab === "research" && LocalResearchLabView && (
            <Suspense fallback={<div className="mono">Loading Local Research Console...</div>}>
              <LocalResearchLabView portfolioState={portfolioState} currency={currency} />
            </Suspense>
          )}
          {import.meta.env.DEV && isLocalPrivateRoute && activeTab === "growth" && LocalGrowthEngineView && (
            <Suspense fallback={<div className="mono">Loading Local Growth Engine...</div>}>
              <LocalGrowthEngineView currency={currency} />
            </Suspense>
          )}
          {import.meta.env.DEV && isLocalPrivateRoute && activeTab === "factors" && LocalFactorEngineView && (
            <Suspense fallback={<div className="mono">Loading Local Factor Engine...</div>}>
              <LocalFactorEngineView />
            </Suspense>
          )}
        </div>
      </main>

      <Footer onReplayIntro={() => setShowOnboarding(true)} />
    </div>
  );
}
