import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// In-Memory Data Store
export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  points: number;
  avatar: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Chore {
  id: string;
  title: string;
  description: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4' | 'NONE';
  labelIds: string[];
  assigneeId?: string;
  circleId: string;
  dueDate: string; // ISO string
  dueTime?: string;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'adaptive';
  recurrenceInterval?: number;
  recurrenceType?: 'due_date' | 'completion_date';
  assigneeRotation?: 'none' | 'fewest_tasks' | 'round_robin' | 'random';
  points: number;
  subtasks: Subtask[];
  status: 'pending' | 'completed';
  timeSpentMinutes: number;
  completedAt?: string;
  completedBy?: string;
  completionHoursRestriction?: number; // e.g. completable within 12h of due
  thingTriggerId?: string;
}

export interface Thing {
  id: string;
  name: string;
  type: 'boolean' | 'number' | 'text';
  value: any;
  unit?: string;
  targetValue?: any;
  autoCompleteChoreId?: string;
  updatedAt: string;
}

export interface Circle {
  id: string;
  name: string;
  description: string;
  memberIds: string[];
}

// Initial Mock Data
let users: User[] = [
  { id: 'u1', name: 'Alex Rivera', email: 'alex@donetick.local', role: 'admin', points: 340, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { id: 'u2', name: 'Sam Taylor', email: 'sam@donetick.local', role: 'manager', points: 280, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { id: 'u3', name: 'Jordan Lee', email: 'jordan@donetick.local', role: 'member', points: 195, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
];

let activeUserId = 'u1';

let circles: Circle[] = [
  { id: 'c1', name: 'Main Household', description: 'Primary circle for household chores and maintenance', memberIds: ['u1', 'u2', 'u3'] },
  { id: 'c2', name: 'Garden & Outdoors', description: 'Yard work, lawn, and outdoor upkeep', memberIds: ['u1', 'u2'] }
];

let labels: Label[] = [
  { id: 'l1', name: 'Kitchen', color: '#ef4444' },
  { id: 'l2', name: 'Cleaning', color: '#3b82f6' },
  { id: 'l3', name: 'Maintenance', color: '#f59e0b' },
  { id: 'l4', name: 'Pets', color: '#10b981' },
  { id: 'l5', name: 'Outdoors', color: '#8b5cf6' }
];

let todayISO = new Date().toISOString().split('T')[0];
let tomorrowISO = new Date(Date.now() + 86400000).toISOString().split('T')[0];
let yesterdayISO = new Date(Date.now() - 86400000).toISOString().split('T')[0];

let chores: Chore[] = [
  {
    id: 'ch1',
    title: 'Deep Clean Refrigerator & Shelves',
    description: 'Wipe all compartments, discard expired items, and sanitize crisper drawers.',
    priority: 'P1',
    labelIds: ['l1', 'l2'],
    assigneeId: 'u1',
    circleId: 'c1',
    dueDate: todayISO,
    dueTime: '18:00',
    recurrence: 'monthly',
    recurrenceInterval: 1,
    recurrenceType: 'completion_date',
    points: 25,
    subtasks: [
      { id: 's1', title: 'Throw out expired food', completed: true },
      { id: 's2', title: 'Wipe glass shelves with warm soapy water', completed: false },
      { id: 's3', title: 'Restock fresh items', completed: false }
    ],
    status: 'pending',
    timeSpentMinutes: 15,
    completionHoursRestriction: 24
  },
  {
    id: 'ch2',
    title: 'Replace HVAC Air Filter',
    description: 'Use MERV 11 filter (16x25x1) located in hallway supply closet.',
    priority: 'P2',
    labelIds: ['l3'],
    assigneeId: 'u2',
    circleId: 'c1',
    dueDate: todayISO,
    dueTime: '19:30',
    recurrence: 'monthly',
    recurrenceInterval: 3,
    recurrenceType: 'due_date',
    points: 30,
    subtasks: [
      { id: 's4', title: 'Turn off unit thermostat', completed: false },
      { id: 's5', title: 'Insert filter in airflow direction', completed: false }
    ],
    status: 'pending',
    timeSpentMinutes: 0
  },
  {
    id: 'ch3',
    title: 'Take Trash & Recycling to Curb',
    description: 'Blue bin for recycling, green for yard, black for waste.',
    priority: 'P1',
    labelIds: ['l2'],
    assigneeId: 'u3',
    circleId: 'c1',
    dueDate: todayISO,
    dueTime: '20:00',
    recurrence: 'weekly',
    recurrenceInterval: 1,
    points: 15,
    subtasks: [
      { id: 's6', title: 'Empty kitchen bin', completed: true },
      { id: 's7', title: 'Empty bathroom bins', completed: true },
      { id: 's8', title: 'Wheel bins to curb', completed: false }
    ],
    status: 'pending',
    timeSpentMinutes: 10
  },
  {
    id: 'ch4',
    title: 'Refill Dog Water Fountain & Clean Filter',
    description: 'Rinse fountain ceramic bowl, replace carbon filter disk.',
    priority: 'P3',
    labelIds: ['l4'],
    assigneeId: 'u1',
    circleId: 'c1',
    dueDate: tomorrowISO,
    dueTime: '09:00',
    recurrence: 'daily',
    recurrenceInterval: 2,
    points: 10,
    subtasks: [],
    status: 'pending',
    timeSpentMinutes: 0
  },
  {
    id: 'ch5',
    title: 'Lawn Mowing & Edge Trimming',
    description: 'Mow front and back lawn at 2.5 inch height.',
    priority: 'P2',
    labelIds: ['l5'],
    assigneeId: 'u2',
    circleId: 'c2',
    dueDate: yesterdayISO,
    dueTime: '15:00',
    recurrence: 'weekly',
    recurrenceInterval: 2,
    points: 50,
    subtasks: [],
    status: 'completed',
    completedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    completedBy: 'u2',
    timeSpentMinutes: 45
  }
];

let things: Thing[] = [
  {
    id: 'th1',
    name: 'Water Filter Health',
    type: 'number',
    value: 12,
    unit: 'days left',
    targetValue: 0,
    autoCompleteChoreId: 'ch1',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'th2',
    name: 'Robot Vacuum Dustbin Full',
    type: 'boolean',
    value: false,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'th3',
    name: 'Dog Food Supply',
    type: 'text',
    value: 'Sufficient (75%)',
    updatedAt: new Date().toISOString()
  }
];

let activityLogs: { id: string; timestamp: string; message: string; userId: string }[] = [
  { id: 'act1', timestamp: new Date(Date.now() - 3600000 * 18).toISOString(), message: 'Sam Taylor completed "Lawn Mowing & Edge Trimming" (+50 pts)', userId: 'u2' },
  { id: 'act2', timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), message: 'Alex Rivera updated "Water Filter Health" to 12 days left', userId: 'u1' }
];

// Helper Gemini Client
const aiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (aiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey: aiKey });
  } catch (err) {
    console.warn('Gemini client init error:', err);
  }
}

// REST API Routes

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), app: 'DoneTick' });
});

// Users
app.get('/api/v1/users', (req, res) => {
  res.json({ users, activeUserId });
});

app.post('/api/v1/users/active', (req, res) => {
  const { userId } = req.body;
  if (users.some(u => u.id === userId)) {
    activeUserId = userId;
    res.json({ success: true, activeUserId });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Chores
app.get('/api/v1/chores', (req, res) => {
  const { circleId, assigneeId, status, labelId } = req.query;
  let filtered = [...chores];

  if (circleId) {
    filtered = filtered.filter(c => c.circleId === circleId);
  }
  if (assigneeId) {
    filtered = filtered.filter(c => c.assigneeId === assigneeId);
  }
  if (status) {
    filtered = filtered.filter(c => c.status === status);
  }
  if (labelId) {
    filtered = filtered.filter(c => c.labelIds.includes(labelId as string));
  }

  res.json(filtered);
});

app.post('/api/v1/chores', (req, res) => {
  const newChore: Chore = {
    id: `ch_${Date.now()}`,
    title: req.body.title || 'Untitled Chore',
    description: req.body.description || '',
    priority: req.body.priority || 'P3',
    labelIds: req.body.labelIds || ['l2'],
    assigneeId: req.body.assigneeId || activeUserId,
    circleId: req.body.circleId || 'c1',
    dueDate: req.body.dueDate || new Date().toISOString().split('T')[0],
    dueTime: req.body.dueTime || '12:00',
    recurrence: req.body.recurrence || 'none',
    recurrenceInterval: req.body.recurrenceInterval || 1,
    recurrenceType: req.body.recurrenceType || 'due_date',
    points: req.body.points || 20,
    subtasks: req.body.subtasks || [],
    status: 'pending',
    timeSpentMinutes: 0
  };

  chores.unshift(newChore);
  activityLogs.unshift({
    id: `act_${Date.now()}`,
    timestamp: new Date().toISOString(),
    message: `Created task "${newChore.title}"`,
    userId: activeUserId
  });

  res.status(201).json(newChore);
});

app.put('/api/v1/chores/:id', (req, res) => {
  const { id } = req.params;
  const index = chores.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Chore not found' });
  }

  chores[index] = { ...chores[index], ...req.body };
  res.json(chores[index]);
});

app.delete('/api/v1/chores/:id', (req, res) => {
  const { id } = req.params;
  const index = chores.findIndex(c => c.id === id);
  if (index !== -1) {
    const deleted = chores.splice(index, 1)[0];
    res.json({ success: true, deletedId: deleted.id });
  } else {
    res.status(404).json({ error: 'Chore not found' });
  }
});

// Complete Chore
app.post('/api/v1/chores/:id/complete', (req, res) => {
  const { id } = req.params;
  const chore = chores.find(c => c.id === id);
  if (!chore) {
    return res.status(404).json({ error: 'Chore not found' });
  }

  chore.status = 'completed';
  chore.completedAt = new Date().toISOString();
  chore.completedBy = activeUserId;

  // Award Points to User
  const user = users.find(u => u.id === activeUserId);
  if (user) {
    user.points += chore.points;
  }

  activityLogs.unshift({
    id: `act_${Date.now()}`,
    timestamp: new Date().toISOString(),
    message: `${user ? user.name : 'User'} completed "${chore.title}" (+${chore.points} pts)`,
    userId: activeUserId
  });

  // Handle Recurrence & Subtask Reset
  let nextRecurrentChore: Chore | null = null;
  if (chore.recurrence !== 'none') {
    const intervalDays = chore.recurrence === 'daily' ? (chore.recurrenceInterval || 1) :
      chore.recurrence === 'weekly' ? (chore.recurrenceInterval || 1) * 7 :
      chore.recurrence === 'monthly' ? (chore.recurrenceInterval || 1) * 30 : 365;

    const baseDate = chore.recurrenceType === 'completion_date'
      ? new Date()
      : new Date(chore.dueDate);

    const nextDueDateObj = new Date(baseDate.getTime() + intervalDays * 86400000);
    const nextDueDateStr = nextDueDateObj.toISOString().split('T')[0];

    // Reset subtasks for next cycle
    const resetSubtasks = chore.subtasks.map(s => ({ ...s, completed: false }));

    nextRecurrentChore = {
      ...chore,
      id: `ch_${Date.now()}`,
      dueDate: nextDueDateStr,
      status: 'pending',
      subtasks: resetSubtasks,
      completedAt: undefined,
      completedBy: undefined,
      timeSpentMinutes: 0
    };

    chores.unshift(nextRecurrentChore);
  }

  res.json({ chore, user, nextRecurrentChore });
});

// Natural Language Task Creator AI/Parser Endpoint
app.post('/api/v1/chores/parse-nl', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Parse this natural language chore description into JSON: "${prompt}".
JSON structure required:
{
  "title": string,
  "description": string,
  "dueDate": "YYYY-MM-DD" (relative to today ${todayISO}),
  "dueTime": "HH:MM",
  "recurrence": "none" | "daily" | "weekly" | "monthly" | "yearly",
  "recurrenceInterval": number,
  "priority": "P1" | "P2" | "P3" | "P4",
  "points": number,
  "subtasks": [{"title": string, "completed": false}]
}
Output only raw valid JSON without markdown formatting.`
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return res.json(parsed);
    } catch (err) {
      console.warn('Gemini NL parse failed, falling back to heuristic parser:', err);
    }
  }

  // Heuristic Fallback Parser
  const lower = prompt.toLowerCase();
  let recurrence: Chore['recurrence'] = 'none';
  let recurrenceInterval = 1;

  if (lower.includes('every day') || lower.includes('daily')) recurrence = 'daily';
  else if (lower.includes('every week') || lower.includes('weekly')) recurrence = 'weekly';
  else if (lower.includes('every month') || lower.includes('monthly')) recurrence = 'monthly';
  else if (lower.includes('every 6 months')) { recurrence = 'monthly'; recurrenceInterval = 6; }
  else if (lower.includes('every 3 months')) { recurrence = 'monthly'; recurrenceInterval = 3; }

  let priority: Chore['priority'] = 'P3';
  if (lower.includes('urgent') || lower.includes('p1') || lower.includes('high')) priority = 'P1';

  res.json({
    title: prompt.replace(/every \w+/gi, '').trim(),
    description: `Auto-extracted from prompt: "${prompt}"`,
    dueDate: todayISO,
    dueTime: '12:00',
    recurrence,
    recurrenceInterval,
    priority,
    points: 20,
    subtasks: []
  });
});

// Things API
app.get('/api/v1/things', (req, res) => {
  res.json(things);
});

app.post('/api/v1/things', (req, res) => {
  const newThing: Thing = {
    id: `th_${Date.now()}`,
    name: req.body.name || 'New Thing',
    type: req.body.type || 'number',
    value: req.body.value ?? 0,
    unit: req.body.unit || '',
    targetValue: req.body.targetValue,
    updatedAt: new Date().toISOString()
  };
  things.unshift(newThing);
  res.status(201).json(newThing);
});

app.put('/api/v1/things/:id', (req, res) => {
  const { id } = req.params;
  const index = things.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ error: 'Thing not found' });

  things[index] = {
    ...things[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  // Check if thing reached targetValue and auto-complete chore
  if (things[index].autoCompleteChoreId && things[index].value === things[index].targetValue) {
    const linkedChore = chores.find(c => c.id === things[index].autoCompleteChoreId);
    if (linkedChore && linkedChore.status === 'pending') {
      linkedChore.status = 'completed';
      linkedChore.completedAt = new Date().toISOString();
      linkedChore.completedBy = activeUserId;
      activityLogs.unshift({
        id: `act_${Date.now()}`,
        timestamp: new Date().toISOString(),
        message: `Thing "${things[index].name}" triggered completion of "${linkedChore.title}"`,
        userId: activeUserId
      });
    }
  }

  res.json(things[index]);
});

// Circles & Labels & Analytics
app.get('/api/v1/circles', (req, res) => res.json(circles));
app.get('/api/v1/labels', (req, res) => res.json(labels));
app.get('/api/v1/activity', (req, res) => res.json(activityLogs));

app.get('/api/v1/analytics', (req, res) => {
  const totalCompleted = chores.filter(c => c.status === 'completed').length;
  const totalPending = chores.filter(c => c.status === 'pending').length;
  
  const leaderboard = [...users].sort((a, b) => b.points - a.points);

  const labelStats = labels.map(l => ({
    name: l.name,
    count: chores.filter(c => c.labelIds.includes(l.id)).length,
    color: l.color
  }));

  res.json({
    totalCompleted,
    totalPending,
    leaderboard,
    labelStats,
    completionRate: totalCompleted + totalPending > 0 ? Math.round((totalCompleted / (totalCompleted + totalPending)) * 100) : 0
  });
});

// ==========================================
// Model Context Protocol (MCP) Tools & Server
// ==========================================

export const MCP_TOOLS = [
  {
    name: 'list_chores',
    description: 'List household tasks and chores from DoneTick with optional filtering by status (pending/completed/all), priority (P1-P4), or circleId.',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'completed', 'all'],
          description: "Filter by status: 'pending', 'completed', or 'all'. Defaults to 'pending'."
        },
        priority: {
          type: 'string',
          enum: ['P1', 'P2', 'P3', 'P4'],
          description: 'Filter by priority level.'
        },
        circleId: {
          type: 'string',
          description: "Circle ID to filter by, e.g. 'c1'."
        }
      }
    }
  },
  {
    name: 'create_chore',
    description: 'Create a new household chore in DoneTick with scheduling, priority, reward points, and optional subtasks.',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title of the task/chore.'
        },
        description: {
          type: 'string',
          description: 'Detailed instructions or description.'
        },
        priority: {
          type: 'string',
          enum: ['P1', 'P2', 'P3', 'P4'],
          description: 'Priority level (P1 = Urgent, P2 = Medium, P3 = Normal, P4 = Low). Defaults to P3.'
        },
        dueDate: {
          type: 'string',
          description: 'Due date in YYYY-MM-DD format. Defaults to today.'
        },
        dueTime: {
          type: 'string',
          description: 'Due time in HH:MM format (24h). Defaults to 12:00.'
        },
        recurrence: {
          type: 'string',
          enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
          description: "Recurrence frequency: 'none', 'daily', 'weekly', 'monthly', 'yearly'."
        },
        points: {
          type: 'number',
          description: 'Points reward for completion. Defaults to 20.'
        },
        subtasks: {
          type: 'array',
          items: { type: 'string' },
          description: 'Checklist of subtasks.'
        }
      },
      required: ['title']
    }
  },
  {
    name: 'complete_chore',
    description: 'Mark a chore as completed in DoneTick. Awards points to the user, logs completion, and automatically calculates the next due date if the task is recurring.',
    inputSchema: {
      type: 'object',
      properties: {
        choreId: {
          type: 'string',
          description: "Unique ID of the chore to mark complete (e.g. 'ch1')."
        }
      },
      required: ['choreId']
    }
  },
  {
    name: 'get_things',
    description: "Get all household 'Things' tracked in DoneTick (such as water filter life, robot vacuum dustbin state, dog food inventory).",
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'update_thing',
    description: "Update the state or value of a household Thing. Can trigger automatic task completions if the target value is reached.",
    inputSchema: {
      type: 'object',
      properties: {
        thingId: {
          type: 'string',
          description: "Unique ID of the Thing to update (e.g. 'th1')."
        },
        value: {
          description: 'The updated value (number, boolean, or string).'
        }
      },
      required: ['thingId', 'value']
    }
  },
  {
    name: 'get_household_summary',
    description: 'Get an executive summary of household tasks, upcoming chores, overdue items, points leaderboard, and sensor states.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

export function executeMcpTool(name: string, args: any) {
  if (name === 'list_chores') {
    const status = args?.status || 'pending';
    let filtered = [...chores];
    if (status !== 'all') {
      filtered = filtered.filter(c => c.status === status);
    }
    if (args?.priority) {
      filtered = filtered.filter(c => c.priority === args.priority);
    }
    if (args?.circleId) {
      filtered = filtered.filter(c => c.circleId === args.circleId);
    }
    return filtered.map(c => {
      const assignee = users.find(u => u.id === c.assigneeId);
      return {
        id: c.id,
        title: c.title,
        description: c.description,
        priority: c.priority,
        dueDate: c.dueDate,
        dueTime: c.dueTime,
        status: c.status,
        recurrence: c.recurrence,
        points: c.points,
        assignee: assignee ? assignee.name : 'Unassigned',
        subtasks: c.subtasks.map(s => ({ title: s.title, completed: s.completed }))
      };
    });
  }

  if (name === 'create_chore') {
    if (!args?.title) throw new Error('title is required');
    const newChore: Chore = {
      id: `ch_${Date.now()}`,
      title: args.title,
      description: args.description || '',
      priority: args.priority || 'P3',
      labelIds: ['l2'],
      assigneeId: activeUserId,
      circleId: args.circleId || 'c1',
      dueDate: args.dueDate || new Date().toISOString().split('T')[0],
      dueTime: args.dueTime || '12:00',
      recurrence: args.recurrence || 'none',
      recurrenceInterval: 1,
      recurrenceType: 'due_date',
      points: typeof args.points === 'number' ? args.points : 20,
      subtasks: Array.isArray(args.subtasks)
        ? args.subtasks.map((st: string, idx: number) => ({ id: `st_${Date.now()}_${idx}`, title: st, completed: false }))
        : [],
      status: 'pending',
      timeSpentMinutes: 0
    };
    chores.unshift(newChore);
    activityLogs.unshift({
      id: `act_${Date.now()}`,
      timestamp: new Date().toISOString(),
      message: `Gemini Spark MCP created chore "${newChore.title}"`,
      userId: activeUserId
    });
    return { success: true, message: `Created chore "${newChore.title}"`, chore: newChore };
  }

  if (name === 'complete_chore') {
    if (!args?.choreId) throw new Error('choreId is required');
    const chore = chores.find(c => c.id === args.choreId);
    if (!chore) throw new Error(`Chore with ID ${args.choreId} not found`);

    chore.status = 'completed';
    chore.completedAt = new Date().toISOString();
    chore.completedBy = activeUserId;

    const user = users.find(u => u.id === activeUserId);
    if (user) user.points += chore.points;

    activityLogs.unshift({
      id: `act_${Date.now()}`,
      timestamp: new Date().toISOString(),
      message: `Gemini Spark MCP completed chore "${chore.title}" (+${chore.points} pts)`,
      userId: activeUserId
    });

    let nextDue: string | null = null;
    if (chore.recurrence !== 'none') {
      const intervalDays = chore.recurrence === 'daily' ? (chore.recurrenceInterval || 1) :
        chore.recurrence === 'weekly' ? (chore.recurrenceInterval || 1) * 7 :
        chore.recurrence === 'monthly' ? (chore.recurrenceInterval || 1) * 30 : 365;

      const nextDate = new Date(Date.now() + intervalDays * 86400000).toISOString().split('T')[0];
      nextDue = nextDate;
      const nextRecurrent: Chore = {
        ...chore,
        id: `ch_${Date.now()}`,
        dueDate: nextDate,
        status: 'pending',
        subtasks: chore.subtasks.map(s => ({ ...s, completed: false })),
        completedAt: undefined,
        completedBy: undefined,
        timeSpentMinutes: 0
      };
      chores.unshift(nextRecurrent);
    }

    return {
      success: true,
      message: `Marked "${chore.title}" as completed`,
      pointsAwarded: chore.points,
      totalUserPoints: user?.points,
      nextRecurringDueDate: nextDue
    };
  }

  if (name === 'get_things') {
    return things.map(t => {
      const linked = chores.find(c => c.id === t.autoCompleteChoreId);
      return {
        id: t.id,
        name: t.name,
        type: t.type,
        value: t.value,
        unit: t.unit || '',
        autoCompletesChore: linked ? linked.title : null
      };
    });
  }

  if (name === 'update_thing') {
    if (!args?.thingId) throw new Error('thingId is required');
    const index = things.findIndex(t => t.id === args.thingId);
    if (index === -1) throw new Error(`Thing ${args.thingId} not found`);

    things[index].value = args.value;
    things[index].updatedAt = new Date().toISOString();

    let triggeredChore: string | null = null;
    if (things[index].autoCompleteChoreId && things[index].value === things[index].targetValue) {
      const chore = chores.find(c => c.id === things[index].autoCompleteChoreId);
      if (chore && chore.status === 'pending') {
        chore.status = 'completed';
        chore.completedAt = new Date().toISOString();
        triggeredChore = chore.title;
        activityLogs.unshift({
          id: `act_${Date.now()}`,
          timestamp: new Date().toISOString(),
          message: `Thing "${things[index].name}" triggered completion of "${chore.title}"`,
          userId: activeUserId
        });
      }
    }

    return {
      success: true,
      updatedThing: things[index],
      triggeredChoreCompletion: triggeredChore
    };
  }

  if (name === 'get_household_summary') {
    const today = new Date().toISOString().split('T')[0];
    const pending = chores.filter(c => c.status === 'pending');
    const dueToday = pending.filter(c => c.dueDate === today);
    const overdue = pending.filter(c => c.dueDate < today);
    const completed = chores.filter(c => c.status === 'completed');

    return {
      date: today,
      summary: {
        totalPending: pending.length,
        dueTodayCount: dueToday.length,
        overdueCount: overdue.length,
        totalCompleted: completed.length
      },
      choresDueToday: dueToday.map(c => ({ id: c.id, title: c.title, priority: c.priority, dueTime: c.dueTime, points: c.points })),
      overdueChores: overdue.map(c => ({ id: c.id, title: c.title, dueDate: c.dueDate, priority: c.priority })),
      leaderboard: [...users].sort((a, b) => b.points - a.points).map(u => ({ name: u.name, points: u.points, role: u.role })),
      thingsState: things.map(t => `${t.name}: ${t.value} ${t.unit || ''}`.trim())
    };
  }

  throw new Error(`Unknown tool: ${name}`);
}

function createMcpServer() {
  const server = new Server(
    { name: 'donetick-mcp', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: MCP_TOOLS };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
      const result = executeMcpTool(name, args || {});
      return {
        content: [
          {
            type: 'text',
            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (err: any) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Error executing tool '${name}': ${err.message}`
          }
        ]
      };
    }
  });

  return server;
}

const activeMcpSessions = new Map<string, { transport: SSEServerTransport; server: Server }>();

// SSE Endpoint for MCP clients (Gemini Spark, Claude Desktop, Cursor)
app.get('/mcp/sse', async (req, res) => {
  const transport = new SSEServerTransport('/mcp/messages', res);
  const server = createMcpServer();
  activeMcpSessions.set(transport.sessionId, { transport, server });

  res.on('close', () => {
    activeMcpSessions.delete(transport.sessionId);
  });

  await server.connect(transport);
});

// Messages POST endpoint for SSE sessions
app.post('/mcp/messages', async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const session = activeMcpSessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'MCP session not found' });
  }
  await session.transport.handlePostMessage(req, res);
});

// Direct JSON-RPC endpoint for HTTP-based MCP callers / Gemini Spark
app.post(['/mcp', '/api/mcp'], async (req, res) => {
  const { jsonrpc, id, method, params } = req.body || {};
  if (jsonrpc !== '2.0') {
    return res.status(400).json({ jsonrpc: '2.0', id: id || null, error: { code: -32600, message: 'Invalid Request: jsonrpc must be 2.0' } });
  }

  if (method === 'initialize') {
    return res.json({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'donetick-mcp', version: '1.0.0' }
      }
    });
  }

  if (method === 'notifications/initialized') {
    return res.status(204).end();
  }

  if (method === 'tools/list') {
    return res.json({
      jsonrpc: '2.0',
      id,
      result: { tools: MCP_TOOLS }
    });
  }

  if (method === 'tools/call') {
    const { name, arguments: args } = params || {};
    try {
      const result = executeMcpTool(name, args || {});
      return res.json({
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
            }
          ]
        }
      });
    } catch (err: any) {
      return res.json({
        jsonrpc: '2.0',
        id,
        result: {
          isError: true,
          content: [{ type: 'text', text: `Error: ${err.message}` }]
        }
      });
    }
  }

  if (method === 'ping') {
    return res.json({ jsonrpc: '2.0', id, result: {} });
  }

  return res.json({
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Method '${method}' not found` }
  });
});

// MCP Discovery Info for Frontend
app.get('/api/mcp/info', (req, res) => {
  res.json({
    name: 'donetick-mcp',
    version: '1.0.0',
    description: 'Model Context Protocol (MCP) server for DoneTick tasks, chores, and household sensors.',
    tools: MCP_TOOLS,
    endpoints: {
      sse: '/mcp/sse',
      messages: '/mcp/messages',
      httpJsonRpc: '/api/mcp'
    }
  });
});

// Serve frontend with Vite in dev, static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 DoneTick server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
