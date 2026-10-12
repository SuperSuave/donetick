import React, { useState } from 'react';
import { Sparkles, X, Loader2, ArrowRight } from 'lucide-react';
import { Chore } from '../types';

interface NLTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParsed: (parsed: Partial<Chore>) => void;
}

export const NLTaskModal: React.FC<NLTaskModalProps> = ({ isOpen, onClose, onParsed }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/chores/parse-nl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error('Failed to parse task');
      const data = await res.json();
      onParsed(data);
      onClose();
      setPrompt('');
    } catch (err: any) {
      setError(err.message || 'Error processing description');
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'Change water filter in refrigerator every 6 months',
    'Take trash and recycling to curb every Monday at 7:00 PM',
    'Vacuum living room rug every Friday and dust TV stand',
    'Mow lawn and trim garden hedges every 2 weeks',
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Natural Language AI Task Creator</h2>
              <p className="text-xs text-slate-400">Describe what needs to be done in plain English</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              required
              rows={3}
              placeholder="e.g. Clean air conditioner coils every 3 months and replace filter..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 resize-none font-medium leading-relaxed"
            />
          </div>

          {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}

          <div className="space-y-2">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">
              Try clicking an example:
            </span>
            <div className="space-y-1.5">
              {samplePrompts.map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPrompt(sample)}
                  className="w-full text-left p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition flex items-center justify-between group"
                >
                  <span className="truncate">{sample}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Parsing AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Chore</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
