import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { TaskBoard } from './components/TaskBoard';
import { CalendarView } from './components/CalendarView';
import { ThingsTracker } from './components/ThingsTracker';
import { AnalyticsView } from './components/AnalyticsView';
import { CirclesView } from './components/CirclesView';
import { MountDashboard } from './components/MountDashboard';
import { McpIntegrationView } from './components/McpIntegrationView';
import { TaskModal } from './components/TaskModal';
import { NLTaskModal } from './components/NLTaskModal';
import { SettingsModal } from './components/SettingsModal';
import { Chore, User, Thing, Circle, Label, ActivityLog } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'tasks' | 'calendar' | 'things' | 'analytics' | 'circles' | 'kiosk' | 'mcp'>('tasks');
  const [chores, setChores] = useState<Chore[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeUserId, setActiveUserId] = useState<string>('u1');
  const [things, setThings] = useState<Thing[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const [selectedCircleId, setSelectedCircleId] = useState<string>('all');
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);
  const [isNLModalOpen, setIsNLModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load Data from Backend REST API
  const fetchData = async () => {
    try {
      const [choresRes, usersRes, thingsRes, circlesRes, labelsRes, actRes] = await Promise.all([
        fetch('/api/v1/chores'),
        fetch('/api/v1/users'),
        fetch('/api/v1/things'),
        fetch('/api/v1/circles'),
        fetch('/api/v1/labels'),
        fetch('/api/v1/activity'),
      ]);

      if (choresRes.ok) setChores(await choresRes.json());
      if (usersRes.ok) {
        const uData = await usersRes.json();
        setUsers(uData.users);
        setActiveUserId(uData.activeUserId);
      }
      if (thingsRes.ok) setThings(await thingsRes.json());
      if (circlesRes.ok) setCircles(await circlesRes.json());
      if (labelsRes.ok) setLabels(await labelsRes.json());
      if (actRes.ok) setActivityLogs(await actRes.json());
    } catch (err) {
      console.error('Failed to fetch data from Donetick backend:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSwitchUser = async (userId: string) => {
    setActiveUserId(userId);
    try {
      await fetch('/api/v1/users/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
    } catch (err) {
      console.error('Failed to switch user:', err);
    }
  };

  const handleCompleteChore = async (choreId: string) => {
    try {
      const res = await fetch(`/api/v1/chores/${choreId}/complete`, { method: 'POST' });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to complete chore:', err);
    }
  };

  const handleSaveChore = async (choreData: Partial<Chore>) => {
    try {
      if (choreData.id) {
        // Update existing
        await fetch(`/api/v1/chores/${choreData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(choreData),
        });
      } else {
        // Create new
        await fetch('/api/v1/chores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(choreData),
        });
      }
      fetchData();
    } catch (err) {
      console.error('Failed to save chore:', err);
    }
  };

  const handleDeleteChore = async (choreId: string) => {
    try {
      await fetch(`/api/v1/chores/${choreId}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error('Failed to delete chore:', err);
    }
  };

  const handleUpdateSubtask = async (choreId: string, subtaskId: string, completed: boolean) => {
    const chore = chores.find((c) => c.id === choreId);
    if (!chore) return;

    const updatedSubtasks = chore.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed } : st
    );

    handleSaveChore({ id: choreId, subtasks: updatedSubtasks });
  };

  const handleUpdateThing = async (thing: Thing) => {
    try {
      await fetch(`/api/v1/things/${thing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(thing),
      });
      fetchData();
    } catch (err) {
      console.error('Failed to update thing:', err);
    }
  };

  const handleCreateThing = async (thingData: Partial<Thing>) => {
    try {
      await fetch('/api/v1/things', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(thingData),
      });
      fetchData();
    } catch (err) {
      console.error('Failed to create thing:', err);
    }
  };

  const handleCreateCircle = (name: string, description: string) => {
    const newCircle: Circle = {
      id: `c_${Date.now()}`,
      name,
      description,
      memberIds: [activeUserId],
    };
    setCircles((prev) => [...prev, newCircle]);
  };

  const handleNLParsed = (parsed: Partial<Chore>) => {
    setEditingChore(parsed as Chore);
    setIsTaskModalOpen(true);
  };

  // Filter chores for circle & label
  let displayChores = [...chores];
  if (selectedCircleId !== 'all') {
    displayChores = displayChores.filter((c) => c.circleId === selectedCircleId);
  }
  if (selectedLabelId) {
    displayChores = displayChores.filter((c) => c.labelIds.includes(selectedLabelId));
  }

  const pendingCount = displayChores.filter((c) => c.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        users={users}
        activeUserId={activeUserId}
        onSwitchUser={handleSwitchUser}
        circles={circles}
        selectedCircleId={selectedCircleId}
        onSelectCircle={setSelectedCircleId}
        onOpenNewTask={() => {
          setEditingChore(null);
          setIsTaskModalOpen(true);
        }}
        onOpenNLTask={() => setIsNLModalOpen(true)}
        onToggleMountMode={() => setCurrentTab('kiosk')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenMcp={() => setCurrentTab('mcp')}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          labels={labels}
          selectedLabelId={selectedLabelId}
          onSelectLabel={setSelectedLabelId}
          pendingCount={pendingCount}
        />

        {/* Main Workspace Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {currentTab === 'tasks' && (
            <TaskBoard
              chores={displayChores}
              labels={labels}
              users={users}
              activeUserId={activeUserId}
              onCompleteChore={handleCompleteChore}
              onEditChore={(chore) => {
                setEditingChore(chore);
                setIsTaskModalOpen(true);
              }}
              onDeleteChore={handleDeleteChore}
              onUpdateSubtask={handleUpdateSubtask}
              onOpenNewTask={() => {
                setEditingChore(null);
                setIsTaskModalOpen(true);
              }}
              searchQuery={searchQuery}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarView
              chores={displayChores}
              labels={labels}
              onCompleteChore={handleCompleteChore}
              onEditChore={(chore) => {
                setEditingChore(chore);
                setIsTaskModalOpen(true);
              }}
            />
          )}

          {currentTab === 'things' && (
            <ThingsTracker
              things={things}
              chores={chores}
              onUpdateThing={handleUpdateThing}
              onCreateThing={handleCreateThing}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView users={users} labels={labels} chores={chores} />
          )}

          {currentTab === 'circles' && (
            <CirclesView circles={circles} users={users} onCreateCircle={handleCreateCircle} />
          )}

          {currentTab === 'mcp' && (
            <McpIntegrationView onRefreshData={fetchData} />
          )}

          {currentTab === 'kiosk' && (
            <MountDashboard
              chores={chores}
              users={users}
              activeUserId={activeUserId}
              onSwitchUser={handleSwitchUser}
              onCompleteChore={handleCompleteChore}
              activityLogs={activityLogs}
              onExitMountMode={() => setCurrentTab('tasks')}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingChore(null);
        }}
        onSave={handleSaveChore}
        initialChore={editingChore}
        labels={labels}
        users={users}
        circles={circles}
        activeUserId={activeUserId}
      />

      <NLTaskModal
        isOpen={isNLModalOpen}
        onClose={() => setIsNLModalOpen(false)}
        onParsed={handleNLParsed}
      />

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
