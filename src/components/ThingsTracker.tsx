import React, { useState } from 'react';
import { Sliders, Plus, CheckCircle2, RefreshCw, Zap, Trash2 } from 'lucide-react';
import { Thing, Chore } from '../types';

interface ThingsTrackerProps {
  things: Thing[];
  chores: Chore[];
  onUpdateThing: (thing: Thing) => void;
  onCreateThing: (thing: Partial<Thing>) => void;
}

export const ThingsTracker: React.FC<ThingsTrackerProps> = ({
  things,
  chores,
  onUpdateThing,
  onCreateThing,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newThingName, setNewThingName] = useState('');
  const [newThingType, setNewThingType] = useState<'boolean' | 'number' | 'text'>('number');
  const [newThingUnit, setNewThingUnit] = useState('');
  const [newThingValue, setNewThingValue] = useState<any>(0);
  const [linkedChoreId, setLinkedChoreId] = useState<string>('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateThing({
      name: newThingName,
      type: newThingType,
      unit: newThingUnit,
      value: newThingValue,
      autoCompleteChoreId: linkedChoreId || undefined,
    });
    setShowAddModal(false);
    setNewThingName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-800/40 border border-slate-800 p-4 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Things Tracker</h2>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded">
              Donetick Specialty
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Track household data (filter levels, supplies, sensor states). Automatically mark tasks as done when a value changes!
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Thing</span>
        </button>
      </div>

      {/* Grid of Things */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {things.map((thing) => {
          const linkedChore = chores.find((c) => c.id === thing.autoCompleteChoreId);

          return (
            <div
              key={thing.id}
              className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4 hover:border-slate-600 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{thing.name}</h3>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Type: {thing.type}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-slate-700/60 flex items-center justify-center text-emerald-400">
                  <Zap className="w-4 h-4" />
                </div>
              </div>

              {/* Value Input Control */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase text-slate-400 font-bold">Current State / Value</span>
                {thing.type === 'number' && (
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={thing.value}
                      onChange={(e) => onUpdateThing({ ...thing, value: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                    />
                    {thing.unit && <span className="text-xs text-slate-400 shrink-0">{thing.unit}</span>}
                  </div>
                )}

                {thing.type === 'boolean' && (
                  <button
                    onClick={() => onUpdateThing({ ...thing, value: !thing.value })}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                      thing.value
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    <span>{thing.value ? 'TRUE / YES / ACTIVE' : 'FALSE / NO / INACTIVE'}</span>
                  </button>
                )}

                {thing.type === 'text' && (
                  <input
                    type="text"
                    value={thing.value}
                    onChange={(e) => onUpdateThing({ ...thing, value: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                )}
              </div>

              {/* Auto Complete Trigger Info */}
              {linkedChore ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Auto-Triggers Task Completion</span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate">"{linkedChore.title}"</p>
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 italic">No automated chore linked</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Add New "Thing"</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Thing Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lawn Irrigation Water Usage"
                  value={newThingName}
                  onChange={(e) => setNewThingName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Data Type</label>
                  <select
                    value={newThingType}
                    onChange={(e) => setNewThingType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="number">Number</option>
                    <option value="boolean">Boolean (True/False)</option>
                    <option value="text">Text</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Unit (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Gallons, Days"
                    value={newThingUnit}
                    onChange={(e) => setNewThingUnit(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Link to Task Auto-Complete</label>
                <select
                  value={linkedChoreId}
                  onChange={(e) => setLinkedChoreId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="">None (Standalone metric)</option>
                  {chores.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition"
                >
                  Create Thing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
