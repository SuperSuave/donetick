import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  RotateCw,
  Award,
  ChevronDown,
  ChevronUp,
  Play,
  Square,
  Trash2,
  Edit2,
  AlertCircle,
  Calendar as CalendarIcon,
  Tag,
  User as UserIcon,
  Check,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Chore, Label, User } from '../types';

interface TaskBoardProps {
  chores: Chore[];
  labels: Label[];
  users: User[];
  activeUserId: string;
  onCompleteChore: (choreId: string) => void;
  onEditChore: (chore: Chore) => void;
  onDeleteChore: (choreId: string) => void;
  onUpdateSubtask: (choreId: string, subtaskId: string, completed: boolean) => void;
  onOpenNewTask: () => void;
  searchQuery: string;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  chores,
  labels,
  users,
  activeUserId,
  onCompleteChore,
  onEditChore,
  onDeleteChore,
  onUpdateSubtask,
  onOpenNewTask,
  searchQuery,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'completed'>('today');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [expandedChoreIds, setExpandedChoreIds] = useState<Record<string, boolean>>({});
  const [activeTimers, setActiveTimers] = useState<Record<string, boolean>>({});

  const todayStr = new Date().toISOString().split('T')[0];

  const handleToggleExpand = (id: string) => {
    setExpandedChoreIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCompleteWithEffect = (chore: Chore, e: React.MouseEvent) => {
    e.stopPropagation();

    // Trigger confetti at click position
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { x, y },
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
    });

    onCompleteChore(chore.id);
  };

  const toggleTimer = (choreId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTimers((prev) => ({ ...prev, [choreId]: !prev[choreId] }));
  };

  // Filter Logic
  const filteredChores = chores.filter((chore) => {
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = chore.title.toLowerCase().includes(q);
      const matchDesc = chore.description.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    // Priority filter
    if (filterPriority !== 'all' && chore.priority !== filterPriority) {
      return false;
    }

    // Status filter
    if (filterStatus === 'today') {
      return chore.status === 'pending' && chore.dueDate === todayStr;
    }
    if (filterStatus === 'overdue') {
      return chore.status === 'pending' && chore.dueDate < todayStr;
    }
    if (filterStatus === 'upcoming') {
      return chore.status === 'pending' && chore.dueDate > todayStr;
    }
    if (filterStatus === 'completed') {
      return chore.status === 'completed';
    }

    return true;
  });

  const getPriorityBadge = (p: Chore['priority']) => {
    switch (p) {
      case 'P1':
        return <span className="bg-red-500/20 text-red-400 border border-red-500/30 font-bold px-2 py-0.5 rounded text-[10px]">P1 High</span>;
      case 'P2':
        return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold px-2 py-0.5 rounded text-[10px]">P2 Medium</span>;
      case 'P3':
        return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold px-2 py-0.5 rounded text-[10px]">P3 Normal</span>;
      default:
        return <span className="bg-slate-700/60 text-slate-400 font-bold px-2 py-0.5 rounded text-[10px]">Low</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/40 border border-slate-800 p-3 rounded-2xl">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'today', label: 'Due Today' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'completed', label: 'Completed' },
            { id: 'all', label: 'All Tasks' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                filterStatus === tab.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Priority:</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="P1">P1 Urgent</option>
            <option value="P2">P2 Medium</option>
            <option value="P3">P3 Normal</option>
            <option value="P4">P4 Low</option>
          </select>
        </div>
      </div>

      {/* Task List Grid */}
      {filteredChores.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-300">No chores found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No tasks match the active filters or search criteria. Click "+ New Chore" to add one!
          </p>
          <button
            onClick={onOpenNewTask}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Chore</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredChores.map((chore) => {
            const assignee = users.find((u) => u.id === chore.assigneeId);
            const isOverdue = chore.status === 'pending' && chore.dueDate < todayStr;
            const isExpanded = !!expandedChoreIds[chore.id];
            const isTimerRunning = !!activeTimers[chore.id];

            const completedSubtasks = chore.subtasks.filter((s) => s.completed).length;
            const totalSubtasks = chore.subtasks.length;

            return (
              <div
                key={chore.id}
                className={`group bg-slate-800/60 border rounded-2xl p-4 transition duration-200 hover:border-slate-600 ${
                  chore.status === 'completed'
                    ? 'border-slate-800 opacity-60'
                    : isOverdue
                    ? 'border-red-500/40 bg-red-950/10'
                    : 'border-slate-700/80'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Complete Button & Info */}
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={(e) => handleCompleteWithEffect(chore, e)}
                      disabled={chore.status === 'completed'}
                      className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border transition ${
                        chore.status === 'completed'
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                          : 'border-slate-600 hover:border-emerald-400 hover:bg-emerald-500/20 text-transparent hover:text-emerald-400'
                      }`}
                      title={chore.status === 'completed' ? 'Completed' : 'Mark as done'}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          onClick={() => handleToggleExpand(chore.id)}
                          className={`text-sm font-bold cursor-pointer hover:text-emerald-400 transition ${
                            chore.status === 'completed' ? 'line-through text-slate-400' : 'text-white'
                          }`}
                        >
                          {chore.title}
                        </h3>

                        {getPriorityBadge(chore.priority)}

                        {chore.recurrence !== 'none' && (
                          <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                            <RotateCw className="w-3 h-3" />
                            {chore.recurrence}
                          </span>
                        )}

                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <Award className="w-3 h-3 text-amber-400" />
                          +{chore.points} pts
                        </span>
                      </div>

                      {chore.description && (
                        <p className="text-xs text-slate-400 line-clamp-2">{chore.description}</p>
                      )}

                      {/* Metadata Row */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                        {/* Due Date */}
                        <div
                          className={`flex items-center gap-1.5 font-medium ${
                            isOverdue ? 'text-red-400 font-bold' : ''
                          }`}
                        >
                          <CalendarIcon className="w-3.5 h-3.5" />
                          <span>{chore.dueDate} {chore.dueTime && `@ ${chore.dueTime}`}</span>
                          {isOverdue && <span className="text-[10px] uppercase bg-red-500/20 px-1.5 rounded">Overdue</span>}
                        </div>

                        {/* Assignee */}
                        {assignee && (
                          <div className="flex items-center gap-1.5">
                            <img src={assignee.avatar} alt={assignee.name} className="w-4 h-4 rounded-full object-cover" />
                            <span>{assignee.name}</span>
                          </div>
                        )}

                        {/* Labels */}
                        {chore.labelIds.map((lid) => {
                          const l = labels.find((lbl) => lbl.id === lid);
                          if (!l) return null;
                          return (
                            <span key={l.id} className="flex items-center gap-1 text-[11px] font-medium" style={{ color: l.color }}>
                              <Tag className="w-3 h-3" />
                              {l.name}
                            </span>
                          );
                        })}

                        {/* Subtasks Count */}
                        {totalSubtasks > 0 && (
                          <button
                            onClick={() => handleToggleExpand(chore.id)}
                            className="text-emerald-400 font-medium hover:underline flex items-center gap-1"
                          >
                            <span>{completedSubtasks}/{totalSubtasks} subtasks</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center gap-2">
                    {/* Time Tracker button */}
                    <button
                      onClick={(e) => toggleTimer(chore.id, e)}
                      className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                        isTimerRunning
                          ? 'bg-emerald-500 text-slate-950 animate-pulse'
                          : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                      }`}
                      title={isTimerRunning ? 'Stop session timer' : 'Start session timer'}
                    >
                      {isTimerRunning ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{chore.timeSpentMinutes}m</span>
                    </button>

                    {/* Expand Subtasks Toggle */}
                    <button
                      onClick={() => handleToggleExpand(chore.id)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {/* Edit & Delete */}
                    <button
                      onClick={() => onEditChore(chore)}
                      className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-700 transition"
                      title="Edit Chore"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteChore(chore.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-700 transition"
                      title="Delete Chore"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subtask Expansion View */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-700/60 space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span>Subtask Checklist</span>
                      {totalSubtasks > 0 && (
                        <span className="text-slate-400">
                          {Math.round((completedSubtasks / totalSubtasks) * 100)}% Completed
                        </span>
                      )}
                    </div>

                    {totalSubtasks > 0 && (
                      <div className="w-full bg-slate-700/60 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full transition-all duration-300"
                          style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      {chore.subtasks.map((st) => (
                        <label
                          key={st.id}
                          className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white p-1.5 rounded-lg hover:bg-slate-700/40"
                        >
                          <input
                            type="checkbox"
                            checked={st.completed}
                            onChange={(e) => onUpdateSubtask(chore.id, st.id, e.target.checked)}
                            className="rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                          />
                          <span className={st.completed ? 'line-through text-slate-500' : ''}>{st.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
