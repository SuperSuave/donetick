import React, { useState } from 'react';
import { X, Settings, Database, HardDrive, Shield, Lock, Save, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [singleCircle, setSingleCircle] = useState(false);
  const [disablePasswordAuth, setDisablePasswordAuth] = useState(false);
  const [storageType, setStorageType] = useState('local');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Donetick Instance Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Single Circle Instance */}
          <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-2xl flex items-center justify-between">
            <div className="space-y-1 pr-4">
              <h4 className="text-xs font-bold text-white">Single-Household Instance Mode</h4>
              <p className="text-[11px] text-slate-400">
                Hides circle selector UI and automatically assigns new users to household Circle ID #1.
              </p>
            </div>
            <input
              type="checkbox"
              checked={singleCircle}
              onChange={(e) => setSingleCircle(e.target.checked)}
              className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
            />
          </div>

          {/* Disable Password Auth */}
          <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-2xl flex items-center justify-between">
            <div className="space-y-1 pr-4">
              <h4 className="text-xs font-bold text-white">SSO-Only Mode</h4>
              <p className="text-[11px] text-slate-400">
                Disables local password auth and enforces OIDC / OAuth2 identity provider sign-ins.
              </p>
            </div>
            <input
              type="checkbox"
              checked={disablePasswordAuth}
              onChange={(e) => setDisablePasswordAuth(e.target.checked)}
              className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
            />
          </div>

          {/* Storage Driver */}
          <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              Attachment Storage Backend
            </h4>
            <select
              value={storageType}
              onChange={(e) => setStorageType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="local">Local Filesystem Storage (/donetick-data)</option>
              <option value="s3">AWS S3 / Cloudflare R2 / MinIO S3-Compatible</option>
            </select>
          </div>

          {/* Database Info */}
          <div className="p-4 bg-slate-800/30 border border-slate-800 rounded-2xl text-xs space-y-1 text-slate-400">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Database Engine</span>
            </div>
            <p className="text-[11px]">SQLite (Internal In-Memory / Persistent Sync Active)</p>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
