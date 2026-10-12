import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react';
import { Chore, Label } from '../types';

interface CalendarViewProps {
  chores: Chore[];
  labels: Label[];
  onCompleteChore: (id: string) => void;
  onEditChore: (chore: Chore) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ chores, labels, onCompleteChore, onEditChore }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Map chores by date key 'YYYY-MM-DD'
  const choresByDate: Record<string, Chore[]> = {};
  chores.forEach((c) => {
    if (!choresByDate[c.dueDate]) {
      choresByDate[c.dueDate] = [];
    }
    choresByDate[c.dueDate].push(c);
  });

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between bg-slate-800/40 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">
            {monthNames[month]} {year}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Days of week header */}
        <div className="grid grid-cols-7 bg-slate-800/80 text-center py-2.5 text-xs font-bold text-slate-400 border-b border-slate-800">
          {daysOfWeek.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 auto-rows-fr gap-px bg-slate-800">
          {/* Blank spaces for offset */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`blank-${i}`} className="bg-slate-950/60 min-h-[110px] p-2" />
          ))}

          {/* Days in month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const dayChores = choresByDate[dateStr] || [];

            return (
              <div
                key={dayNum}
                className={`bg-slate-900 min-h-[110px] p-2 flex flex-col justify-between transition hover:bg-slate-850 ${
                  isToday ? 'ring-2 ring-emerald-500/60 bg-emerald-950/10' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday ? 'bg-emerald-500 text-slate-950 font-extrabold' : 'text-slate-400'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayChores.length > 0 && (
                    <span className="text-[10px] text-slate-500 font-semibold">{dayChores.length} task(s)</span>
                  )}
                </div>

                <div className="space-y-1.5 overflow-y-auto max-h-[80px]">
                  {dayChores.map((chore) => {
                    const primaryLabel = labels.find((l) => chore.labelIds.includes(l.id));
                    return (
                      <div
                        key={chore.id}
                        onClick={() => onEditChore(chore)}
                        className={`p-1.5 rounded-lg text-[11px] cursor-pointer transition flex items-center justify-between gap-1 border ${
                          chore.status === 'completed'
                            ? 'bg-slate-800/40 border-slate-800 opacity-50 line-through text-slate-400'
                            : 'bg-slate-800 border-slate-700/80 text-slate-200 hover:border-emerald-500/50'
                        }`}
                      >
                        <div className="flex items-center gap-1 truncate">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: primaryLabel?.color || '#3b82f6' }}
                          />
                          <span className="truncate font-medium">{chore.title}</span>
                        </div>
                        {chore.status === 'completed' && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
