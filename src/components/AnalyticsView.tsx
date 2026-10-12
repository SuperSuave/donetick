import React from 'react';
import { Award, BarChart3, TrendingUp, Trophy, CheckCircle2, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { User, Label, Chore } from '../types';

interface AnalyticsViewProps {
  users: User[];
  labels: Label[];
  chores: Chore[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ users, labels, chores }) => {
  const sortedUsers = [...users].sort((a, b) => b.points - a.points);

  const completedCount = chores.filter((c) => c.status === 'completed').length;
  const pendingCount = chores.filter((c) => c.status === 'pending').length;

  const pieData = [
    { name: 'Completed', value: completedCount, color: '#10b981' },
    { name: 'Pending', value: pendingCount, color: '#3b82f6' },
  ];

  const labelData = labels.map((l) => ({
    name: l.name,
    tasks: chores.filter((c) => c.labelIds.includes(l.id)).length,
    color: l.color,
  }));

  return (
    <div className="space-y-6">
      {/* Top Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold">Total Completed</p>
            <h3 className="text-2xl font-bold text-white mt-1">{completedCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold">Household Points Earned</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">
              {users.reduce((acc, u) => acc + u.points, 0)} pts
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold">On-Time Completion Rate</p>
            <h3 className="text-2xl font-bold text-teal-300 mt-1">
              {completedCount + pendingCount > 0
                ? `${Math.round((completedCount / (completedCount + pendingCount)) * 100)}%`
                : '100%'}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Leaderboard & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Household Points Leaderboard</h3>
          </div>

          <div className="space-y-3">
            {sortedUsers.map((u, index) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl transition hover:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0
                        ? 'bg-amber-400 text-slate-950'
                        : index === 1
                        ? 'bg-slate-300 text-slate-950'
                        : index === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-700" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{u.name}</h4>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">{u.role}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-400">{u.points} pts</span>
                  <p className="text-[10px] text-slate-500">Chore rewards</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Chores Distribution by Label</h3>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={labelData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Bar dataKey="tasks" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
