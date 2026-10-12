import React, { useState } from 'react';
import { CheckSquare, Plus, Sparkles, Monitor, Settings, Search, Users, ShieldAlert, Cpu } from 'lucide-react';
import { User, Circle } from '../types';

interface NavbarProps {
  users: User[];
  activeUserId: string;
  onSwitchUser: (userId: string) => void;
  circles: Circle[];
  selectedCircleId: string;
  onSelectCircle: (circleId: string) => void;
  onOpenNewTask: () => void;
  onOpenNLTask: () => void;
  onToggleMountMode: () => void;
  onOpenSettings: () => void;
  onOpenMcp: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  users,
  activeUserId,
  onSwitchUser,
  circles,
  selectedCircleId,
  onSelectCircle,
  onOpenNewTask,
  onOpenNLTask,
  onToggleMountMode,
  onOpenSettings,
  onOpenMcp,
  searchQuery,
  onSearchChange,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const activeUser = users.find((u) => u.id === activeUserId);

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 px-4 py-3 flex items-center justify-between gap-4">
      {/* Brand & Circle Picker */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-2 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
            <CheckSquare className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
              DoneTick
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Selfhosted
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">Tasks & Chores, Together</p>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800 hidden md:block" />

        {/* Circle Selector */}
        <div className="hidden md:flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedCircleId}
            onChange={(e) => onSelectCircle(e.target.value)}
            className="bg-transparent border-none text-white focus:outline-none cursor-pointer text-xs"
          >
            <option value="all" className="bg-slate-900 text-white">All Household Circles</option>
            {circles.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex items-center gap-3 flex-1 justify-end max-w-2xl">
        {/* Search Input */}
        <div className="relative flex-1 max-w-xs hidden lg:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks, labels..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 text-slate-200 placeholder-slate-400 text-xs rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* AI Natural Language Task Creator */}
        <button
          onClick={onOpenNLTask}
          className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-sm"
          title="Create task with Natural Language AI"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">AI Task</span>
        </button>

        {/* New Task Button */}
        <button
          onClick={onOpenNewTask}
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold px-3.5 py-1.5 rounded-lg transition shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">New Chore</span>
        </button>

        {/* Kiosk / Mount Mode */}
        <button
          onClick={onToggleMountMode}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          title="Wall-Mount Dashboard Mode"
        >
          <Monitor className="w-4 h-4" />
        </button>

        {/* MCP & Gemini Spark Tools */}
        <button
          onClick={onOpenMcp}
          className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition flex items-center gap-1"
          title="Gemini Spark MCP Tools"
        >
          <Cpu className="w-4 h-4" />
          <span className="hidden xl:inline text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">MCP</span>
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-slate-800" />

        {/* User Profile Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 p-1 hover:bg-slate-800 rounded-lg transition"
          >
            <img
              src={activeUser?.avatar}
              alt={activeUser?.name}
              className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500/40"
            />
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-white leading-tight">{activeUser?.name}</p>
              <p className="text-[10px] text-emerald-400 font-bold">{activeUser?.points} pts</p>
            </div>
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-700/60 mb-1">
                <p className="text-xs text-slate-400">Switch Account / Character</p>
              </div>
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    onSwitchUser(u.id);
                    setShowUserDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition ${
                    u.id === activeUserId ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'hover:bg-slate-700/50 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                    <span>{u.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400">{u.points} pts</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
