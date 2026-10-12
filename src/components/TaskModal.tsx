import React, { useState } from 'react';
import { X, Plus, Trash2, Calendar, Clock, RotateCw, Award, Tag, Users } from 'lucide-react';
import { Chore, Label, User, Circle } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (chore: Partial<Chore>) => void;
  initialChore?: Chore | null;
  labels: Label[];
  users: User[];
  circles: Circle[];
  activeUserId: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialChore,
  labels,
  users,
  circles,
  activeUserId,
}) => {
  const [title, setTitle] = useState(initialChore?.title || '');
  const [description, setDescription] = useState(initialChore?.description || '');
  const [priority, setPriority] = useState<Chore['priority']>(initialChore?.priority || 'P3');
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>(initialChore?.labelIds || ['l2']);
  const [assigneeId, setAssigneeId] = useState<string>(initialChore?.assigneeId || activeUserId);
  const [circleId, setCircleId] = useState<string>(initialChore?.circleId || 'c1');
  const [dueDate, setDueDate] = useState<string>(
    initialChore?.dueDate || new Date().toISOString().split('T')[0]
  );
  const [dueTime, setDueTime] = useState<string>(initialChore?.dueTime || '12:00');
  const [recurrence, setRecurrence] = useState<Chore['recurrence']>(initialChore?.recurrence || 'none');
  const [recurrenceInterval, setRecurrenceInterval] = useState<number>(initialChore?.recurrenceInterval || 1);
  const [recurrenceType, setRecurrenceType] = useState<Chore['recurrenceType']>(initialChore?.recurrenceType || 'due_date');
  const [points, setPoints] = useState<number>(initialChore?.points || 20);
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>(
    initialChore?.subtasks || []
  );
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      { id: `st_${Date.now()}`, title: newSubtaskTitle.trim(), completed: false },
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggleLabel = (labelId: string) => {
    setSelectedLabelIds((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: initialChore?.id,
      title,
      description,
      priority,
      labelIds: selectedLabelIds,
      assigneeId,
      circleId,
      dueDate,
      dueTime,
      recurrence,
      recurrenceInterval,
      recurrenceType,
      points,
      subtasks,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-xl space-y-6 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-white">
            {initialChore ? 'Edit Chore & Schedule' : 'Create New Chore'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Chore Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Change water filter in kitchen"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Instructions / Description</label>
            <textarea
              placeholder="e.g. Filter is located under the sink cabinet..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 h-20 resize-none"
            />
          </div>

          {/* Priority & Points Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              >
                <option value="P1">P1 Urgent / High</option>
                <option value="P2">P2 Medium</option>
                <option value="P3">P3 Normal</option>
                <option value="P4">P4 Low</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Reward Points</label>
              <input
                type="number"
                min="5"
                max="500"
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value) || 10)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Due Date</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Due Time</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Recurrence Settings */}
          <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <RotateCw className="w-4 h-4 text-indigo-400" />
              <span>Advanced Recurrence Schedule</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Frequency</label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="none">One-time Task</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              {recurrence !== 'none' && (
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Recurrence Basis</label>
                  <select
                    value={recurrenceType}
                    onChange={(e) => setRecurrenceType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="due_date">From Previous Due Date</option>
                    <option value="completion_date">From Actual Completion Date</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Circle & Assignee */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Household Circle</label>
              <select
                value={circleId}
                onChange={(e) => setCircleId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              >
                {circles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Assignee</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Labels Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Labels</label>
            <div className="flex flex-wrap gap-2">
              {labels.map((l) => {
                const isSelected = selectedLabelIds.includes(l.id);
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => handleToggleLabel(l.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition border ${
                      isSelected
                        ? 'bg-slate-700 text-white border-slate-500'
                        : 'bg-slate-800/60 text-slate-400 border-slate-800'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full inline-block mr-1.5" style={{ backgroundColor: l.color }} />
                    {l.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subtasks Builder */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Subtasks Checklist</label>
            <div className="space-y-2">
              {subtasks.map((st) => (
                <div key={st.id} className="flex items-center justify-between p-2 bg-slate-800 rounded-xl text-xs">
                  <span className="text-slate-200">{st.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="p-1 text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a subtask step..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs rounded-xl"
                >
                  Add Step
                </button>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
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
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
            >
              {initialChore ? 'Save Changes' : 'Create Chore'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
