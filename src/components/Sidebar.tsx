import React from 'react';
import { CheckSquare, Calendar, Sliders, BarChart3, Users, Monitor, ShieldCheck, Flame, Tag, Cpu } from 'lucide-react';
import { Label } from '../types';

interface SidebarProps {
  currentTab: 'tasks' | 'calendar' | 'things' | 'analytics' | 'circles' | 'kiosk' | 'mcp';
  onSelectTab: (tab: 'tasks' | 'calendar' | 'things' | 'analytics' | 'circles' | 'kiosk' | 'mcp') => void;
  labels: Label[];
  selectedLabelId: string | null;
  onSelectLabel: (labelId: string | null) => void;
  pendingCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  labels,
  selectedLabelId,
  onSelectLabel,
  pendingCount,
}) => {
  interface NavItem {
    id: 'tasks' | 'calendar' | 'things' | 'analytics' | 'circles' | 'kiosk' | 'mcp';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
  }

  const navItems: NavItem[] = [
    { id: 'tasks', label: 'Tasks & Chores', icon: CheckSquare, badge: pendingCount },
    { id: 'calendar', label: 'Calendar Schedule', icon: Calendar },
    { id: 'things', label: 'Things Tracker', icon: Sliders },
    { id: 'analytics', label: 'Analytics & Points', icon: BarChart3 },
    { id: 'circles', label: 'Household Circles', icon: Users },
    { id: 'kiosk', label: 'Mount Dashboard', icon: Monitor },
    { id: 'mcp', label: 'Gemini Spark MCP', icon: Cpu, badge: 'New' },
  ];

  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0 hidden md:flex">
      <div className="space-y-6">
        {/* Primary Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {Boolean(item.badge) && (
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Labels Filter Section */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            <span>Filter by Label</span>
            <Tag className="w-3.5 h-3.5" />
          </div>
          <div className="space-y-1">
            <button
              onClick={() => onSelectLabel(null)}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition ${
                selectedLabelId === null ? 'text-emerald-400 font-semibold bg-slate-800/80' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <span>All Labels</span>
            </button>
            {labels.map((label) => (
              <button
                key={label.id}
                onClick={() => onSelectLabel(label.id === selectedLabelId ? null : label.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition ${
                  selectedLabelId === label.id ? 'text-white font-semibold bg-slate-800' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: label.color }} />
                <span>{label.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info Card */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 space-y-1">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Donetick Engine</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Selfhosted single-household instance active. Realtime sync enabled.
        </p>
      </div>
    </aside>
  );
};
