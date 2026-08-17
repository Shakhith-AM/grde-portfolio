import React from 'react';
import { 
  LayoutDashboard, 
  Sliders, 
  BookOpen, 
  Activity, 
  Briefcase, 
  ShieldCheck, 
  KeyRound, 
  Lock 
} from 'lucide-react';

export function Navigation({ active, onChange, isUnlocked, isOwner }) {
  const tabs = [
    { id: "dashboard", label: "Dashboard",        icon: LayoutDashboard, locked: !isUnlocked },
    { id: "allocator", label: "Allocator",        icon: Sliders,         locked: false },
    { id: "blueprint", label: "Blueprint",        icon: BookOpen,        locked: false },
    { id: "tracker",   label: "Portfolio Tracker",icon: Briefcase,       locked: !isUnlocked },
    { id: "isr",       label: "ISR Analysis",     icon: ShieldCheck,     locked: !isUnlocked },
    { id: "pulse",     label: "Pulse & Actions",  icon: Activity,        locked: !isUnlocked },
    ...(isOwner ? [{ id: "codes", label: "Owner Codes", icon: KeyRound, locked: false, owner: true }] : []),
  ];

  return (
    <div className="grde-tabs-container" style={{
      display: "inline-flex",
      gap: 4,
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 999,
      padding: 4,
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
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
            {t.locked && <Lock size={10} style={{ opacity: 0.6, marginLeft: 2 }} />}
            {t.owner && !isActive && <span style={{ color: "var(--gold)", fontSize: 10 }}>★</span>}
          </button>
        );
      })}
    </div>
  );
}
