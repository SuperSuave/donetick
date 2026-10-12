import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Award, Calendar, ChevronRight, User as UserIcon, Check, MonitorX } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Chore, User, ActivityLog } from '../types';

interface MountDashboardProps {
  chores: Chore[];
  users: User[];
  activeUserId: string;
  onSwitchUser: (userId: string) => void;
  onCompleteChore: (choreId: string) => void;
  activityLogs: ActivityLog[];
  onExitMountMode: () => void;
}

export const MountDashboard: React.FC<MountDashboardProps> = ({
  chores,
  users,
  activeUserId,
  onSwitchUser,
  onCompleteChore,
  activityLogs,
  onExitMountMode,
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const pendingToday = chores.filter((c) => c.status === 'pending' && c.dueDate <= todayStr);
  const activeUser = users.find((u) => u.id === activeUserId);

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const handleComplete = (chore: Chore, e: React.MouseEvent) => {
    e.stopPropagation();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });
    onCompleteChore(chore.id);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 text-slate-100 z-50 p-6 flex flex-col justify-between overflow-y-auto font-sans">
      {/* Top Banner: Ambient Clock & Weather/Info */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-5xl font-black tracking-tight text-white font-mono">{formattedTime}</h1>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-xl">
              MOUNT MODE ACTIVE
            </span>
          </div>
          <p className="text-sm font-medium text-slate-400 mt-1">{formattedDate}</p>
        </div>

        {/* User Switcher Cards for Kiosk */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
            <span className="text-xs font-bold text-slate-400 px-2 hidden lg:inline">Active Profile:</span>
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => onSwitchUser(u.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition ${
                  u.id === activeUserId
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                <span className="text-xs">{u.name}</span>
                <span className="text-[10px] opacity-80">({u.points}p)</span>
              </button>
            ))}
          </div>

          <button
            onClick={onExitMountMode}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition"
            title="Exit Mount Mode"
          >
            <MonitorX className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Kiosk Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6 flex-1">
        {/* Left Column: Big Task Checklist */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Household Chores Due Today</h2>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 font-extrabold text-sm px-3.5 py-1 rounded-full">
              {pendingToday.length} Pending
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto flex-1 max-h-[520px] pr-2">
            {pendingToday.length === 0 ? (
              <div className="text-center py-20 space-y-2">
                <p className="text-lg font-bold text-emerald-400">🎉 All Chores Completed for Today!</p>
                <p className="text-xs text-slate-500">Great job household team!</p>
              </div>
            ) : (
              pendingToday.map((chore) => (
                <div
                  key={chore.id}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between gap-4 transition hover:border-emerald-500/50"
                >
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">{chore.title}</h3>
                    {chore.description && <p className="text-xs text-slate-400">{chore.description}</p>}
                    <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> +{chore.points} pts
                      </span>
                      <span>Due: {chore.dueDate}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleComplete(chore, e)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm px-5 py-3 rounded-2xl transition shadow-lg shadow-emerald-500/30 flex items-center gap-2 shrink-0"
                  >
                    <Check className="w-5 h-5 stroke-[3]" />
                    <span>Done ({activeUser?.name.split(' ')[0]})</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Recent Activity Feed */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 flex flex-col">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Household Activity Stream</h2>
          <div className="space-y-3 overflow-y-auto flex-1 max-h-[520px]">
            {activityLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-800/50 border border-slate-800 rounded-2xl text-xs space-y-1">
                <p className="text-slate-200 font-medium">{log.message}</p>
                <span className="text-[10px] text-slate-500 block">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
