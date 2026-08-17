import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { Footer } from './components/layout/Footer';
import { LockOverlay } from './components/modals/LockOverlay';
import { OnboardingModal } from './components/modals/OnboardingModal';
import { ExcelImportModal } from './components/modals/ExcelImportModal';

import { DashboardView } from './views/DashboardView';
import { AllocatorView } from './views/AllocatorView';
import { BlueprintView } from './views/BlueprintView';
import { TrackerView } from './views/TrackerView';
import { ISRView } from './views/ISRView';
import { PulseView } from './views/PulseView';
import { CodesView } from './views/CodesView';

import { computePortfolioState } from './utils/calculations';
import { GRDE_STORAGE, STORAGE_KEYS } from './utils/storage';
import { CCY_KEY } from './constants/currencies';
import { ALERTS_URL } from './constants/masterData';

export function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currency, setCurrency] = useState(() => GRDE_STORAGE.get(CCY_KEY, "INR"));
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return GRDE_STORAGE.get(STORAGE_KEYS.ONBOARDED) !== "1";
  });

  const [unlock, setUnlock] = useState(() => {
    return GRDE_STORAGE.get(STORAGE_KEYS.UNLOCK) || GRDE_STORAGE.get(STORAGE_KEYS.LEGACY_UNLOCK) || "";
  });

  const isUnlocked = !!unlock;
  const isOwner = unlock === "owner";

  // Tracker state loaded from local storage (defaults to July 2026 statement)
  const [trackerData, setTrackerData] = useState(() => {
    const saved = GRDE_STORAGE.getJSON(STORAGE_KEYS.TRACKER, null);
    return saved || {
      holderName: "Shakhith A.M.",
      totalPortfolio: 3872833.00,
      age: 45,
      riskProfile: "balanced",
      reportDate: "2026-07",
      values: {
        "g_gold": 366659.93,
        "g_silver": 34554.72,
        "r_mind": 112862.28,
        "r_krt": 102341.79,
        "r_nexus": 124876.01,
        "r_dc": 2939.30,
        "r_indi": 184478.00,
        "r_irb": 74553.00,
        "d_liq": 63860.00,
        "d_ult": 21440.00,
        "d_fd": 250000.00,
        "d_pomis": 450000.00,
        "d_inc": 173770.00,
        "d_nps": 10500.00,
        "e_mf": 1277399.36,
        "e_etfin": 236044.49,
        "e_etfus": 317554.12,
        "e_hc": 69000.00
      },
      customNames: {
        "g_gold": "GoldBees (IND/ICI) & GLDM (US)",
        "g_silver": "Tata Silver ETF (TATSILV)",
        "r_mind": "Mindspace REIT",
        "r_krt": "KRT REIT",
        "r_nexus": "Nexus Select Trust REIT",
        "r_dc": "Data Centre REITs",
        "r_indi": "IndiGrid InvIT",
        "r_irb": "IRB InvIT",
        "d_liq": "Jio BlackRock Liquid Fund",
        "d_ult": "Nippon Ultra Short Duration",
        "d_fd": "Fixed Deposit (FD.1)",
        "d_pomis": "Post Office MIS (POMIS)",
        "d_inc": "Wint Bonds & Fixed Income",
        "d_nps": "NPS Tier I",
        "e_mf": "Active MFs (PPFAS / ICICI / Franklin / MO / HDFC)",
        "e_etfin": "Indian ETFs (NiftyBees & JuniorBees)",
        "e_etfus": "US ETFs (VOO / MON100 / SCHD)",
        "e_hc": "Mirae Asset Healthcare Fund"
      }
    };
  });

  const [age, setAge] = useState(trackerData.age || 35);
  const [riskProfile, setRiskProfile] = useState(trackerData.riskProfile || "balanced");

  // Keep age & riskProfile synced to tracker
  const handleAgeChange = (newAge) => {
    setAge(newAge);
    const next = { ...trackerData, age: newAge };
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
    if (nextTracker.age) setAge(nextTracker.age);
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

  // Expiry checks for review / subscriber codes
  useEffect(() => {
    if (unlock && unlock.startsWith("reviewer:")) {
      const expiry = unlock.split("reviewer:")[1];
      if (new Date() > new Date(expiry + "T23:59:59")) {
        setUnlock("");
        GRDE_STORAGE.remove(STORAGE_KEYS.UNLOCK);
      }
    }
    if (unlock && unlock.startsWith("subscriber:")) {
      const expiry = Number(unlock.split("subscriber:")[1]);
      if (!Number.isFinite(expiry) || Date.now() > expiry) {
        setUnlock("");
        GRDE_STORAGE.remove(STORAGE_KEYS.UNLOCK);
      }
    }
  }, [unlock]);

  const handleUnlock = (role) => {
    setUnlock(role);
    GRDE_STORAGE.set(STORAGE_KEYS.UNLOCK, role);
  };

  const handleLock = () => {
    if (window.confirm("Lock this session? You will need your access code to re-open protected views.")) {
      setUnlock("");
      GRDE_STORAGE.remove(STORAGE_KEYS.UNLOCK);
    }
  };

  const handleCurrencyChange = (c) => {
    setCurrency(c);
    GRDE_STORAGE.set(CCY_KEY, c);
  };

  // Compute live portfolio state
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
        unlocked={isUnlocked}
        onLock={handleLock}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        onOpenExcelModal={() => setIsExcelModalOpen(true)}
      />

      <main className="grde-main" style={{ maxWidth: 1040, margin: "0 auto", padding: "28px 24px 60px" }}>
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
            · The Beaver Dam Method
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

        {/* Tab Navigation */}
        <Navigation
          active={activeTab}
          onChange={setActiveTab}
          isUnlocked={isUnlocked}
          isOwner={isOwner}
        />

        {/* View Router */}
        <div style={{ marginTop: 28, position: "relative" }}>
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div style={{ position: "relative", minHeight: 480 }}>
              <div style={{ filter: isUnlocked ? "none" : "blur(8px)", pointerEvents: isUnlocked ? "auto" : "none", transition: "filter 0.3s ease" }}>
                <DashboardView
                  portfolioState={portfolioState}
                  currency={currency}
                  onNavigate={setActiveTab}
                  onOpenExcelModal={() => setIsExcelModalOpen(true)}
                />
              </div>
              {!isUnlocked && <LockOverlay onUnlock={handleUnlock} />}
            </div>
          )}

          {/* Allocator Tab (Public) */}
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

          {/* Blueprint Tab (Public) */}
          {activeTab === "blueprint" && (
            <BlueprintView
              portfolioState={portfolioState}
              currency={currency}
            />
          )}

          {/* Tracker Tab (Protected) */}
          {activeTab === "tracker" && (
            <div style={{ position: "relative", minHeight: 480 }}>
              <div style={{ filter: isUnlocked ? "none" : "blur(8px)", pointerEvents: isUnlocked ? "auto" : "none", transition: "filter 0.3s ease" }}>
                <TrackerView
                  portfolioState={portfolioState}
                  trackerData={trackerData}
                  onUpdateTracker={handleUpdateTracker}
                  currency={currency}
                  onOpenExcelModal={() => setIsExcelModalOpen(true)}
                />
              </div>
              {!isUnlocked && <LockOverlay onUnlock={handleUnlock} />}
            </div>
          )}

          {/* ISR Analysis Tab (Protected) */}
          {activeTab === "isr" && (
            <div style={{ position: "relative", minHeight: 480 }}>
              <div style={{ filter: isUnlocked ? "none" : "blur(8px)", pointerEvents: isUnlocked ? "auto" : "none", transition: "filter 0.3s ease" }}>
                <ISRView
                  portfolioState={portfolioState}
                  currency={currency}
                />
              </div>
              {!isUnlocked && <LockOverlay onUnlock={handleUnlock} />}
            </div>
          )}

          {/* Pulse Tab (Protected) */}
          {activeTab === "pulse" && (
            <div style={{ position: "relative", minHeight: 480 }}>
              <div style={{ filter: isUnlocked ? "none" : "blur(8px)", pointerEvents: isUnlocked ? "auto" : "none", transition: "filter 0.3s ease" }}>
                <PulseView
                  portfolioState={portfolioState}
                  currency={currency}
                />
              </div>
              {!isUnlocked && <LockOverlay onUnlock={handleUnlock} />}
            </div>
          )}

          {/* Owner Codes Tab (Owner bypass only) */}
          {activeTab === "codes" && isOwner && (
            <CodesView />
          )}
        </div>

        <Footer onReplayIntro={() => setShowOnboarding(true)} />
      </main>
    </div>
  );
}
