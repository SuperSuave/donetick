import React, { useState } from 'react';
import { Users, Plus, Shield, UserPlus, Mail, CheckCircle, Home } from 'lucide-react';
import { Circle, User } from '../types';

interface CirclesViewProps {
  circles: Circle[];
  users: User[];
  onCreateCircle: (name: string, description: string) => void;
}

export const CirclesView: React.FC<CirclesViewProps> = ({ circles, users, onCreateCircle }) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateCircle(name, description);
    setName('');
    setDescription('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-800/40 border border-slate-800 p-4 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Household Circles</h2>
          </div>
          <p className="text-xs text-slate-400">
            Collaborate with family members, roommates, or team members by sharing circles and chore assignments.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create Circle</span>
        </button>
      </div>

      {/* Circles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {circles.map((circle) => {
          const members = users.filter((u) => circle.memberIds.includes(u.id));

          return (
            <div
              key={circle.id}
              className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 space-y-4 hover:border-slate-600 transition"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-base font-bold text-white">{circle.name}</h3>
                  </div>
                  <p className="text-xs text-slate-400">{circle.description}</p>
                </div>
                <span className="bg-slate-700/60 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                  {members.length} Members
                </span>
              </div>

              {/* Members List */}
              <div className="space-y-2 pt-2 border-t border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Circle Members
                </span>
                <div className="space-y-2">
                  {members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800"
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full object-cover" />
                        <div>
                          <p className="text-xs font-bold text-white">{m.name}</p>
                          <p className="text-[10px] text-slate-400">{m.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {m.role}
                        </span>
                        <span className="text-xs font-bold text-amber-400">{m.points} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Create Circle</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Circle Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vacation Cabin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Description</label>
                <textarea
                  placeholder="e.g. Shared maintenance tasks for cabin..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 h-20 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
