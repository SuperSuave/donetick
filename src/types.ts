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
  dueDate: string;
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
  completionHoursRestriction?: number;
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

export interface ActivityLog {
  id: string;
  timestamp: string;
  message: string;
  userId: string;
}

export interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

