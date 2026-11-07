import React from 'react';
import { 
  LayoutDashboard, 
  Sliders, 
  BookOpen, 
  Activity, 
  Briefcase, 
  ShieldCheck, 
  Calendar
} from 'lucide-react';

export function Navigation({ active, onChange }) {
  // Public GitHub Pages navigation tabs ONLY (Section E):
  // Dashboard, Allocator, Blueprint, Portfolio Engine, SIP Planner, ISR & Drift, GRDE Pulse.
  // Local/private modules (TATASILV Recovery, Podcast Journal, Owner/Admin Codes Console,
  // Research Console, and Internal Engines) are separated into the Local Development bar.
  const tabs = [
    { id: "dashboard", label: "Dashboard",           icon: LayoutDashboard },
    { id: "allocator", label: "Allocator",           icon: Sliders },
    { id: "blueprint", label: "Blueprint (G·R·D·E)", icon: BookOpen },
    { id: "tracker",   label: "Portfolio Engine",    icon: Briefcase },
    { id: "sip",       label: "SIP Planner",         icon: Calendar },
    { id: "isr",       label: "ISR & Drift",         icon: ShieldCheck },
    { id: "pulse",     label: "GRDE Pulse",          icon: Activity }
  ];

  return (
    <div className="grde-tabs-container" style={{
      display: "inline-flex",
      gap: 4,
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 999,
      padding: 4,
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      flexWrap: "wrap"
    }}>
      {tabs.map(t => {
        const isActive = active === t.id;
        const Icon = t.icon;
        
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`grde-nav-pill ${isActive ? 'active' : 'inactive'}`}
            role="tab"
            aria-selected={isActive}
          >
            <Icon size={13} style={{ opacity: isActive ? 1 : 0.7 }} />
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
