import React, { useState } from 'react';
import {
  Cpu,
  Copy,
  Check,
  Play,
  Terminal,
  Layers,
  Sparkles,
  CheckCircle2,
  ListTodo,
  PlusCircle,
  Sliders,
  BarChart2,
  Code2,
  ExternalLink
} from 'lucide-react';
import { McpTool } from '../types';

interface McpIntegrationViewProps {
  onRefreshData: () => void;
}

export const McpIntegrationView: React.FC<McpIntegrationViewProps> = ({ onRefreshData }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<string>('get_household_summary');
  const [toolArgs, setToolArgs] = useState<string>('{}');
  const [isExecuting, setIsExecuting] = useState(false);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://donetick.local';
  const sseUrl = `${origin}/mcp/sse`;
  const httpUrl = `${origin}/api/mcp`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const geminiSparkConfig = JSON.stringify(
    {
      mcpServers: {
        donetick: {
          url: sseUrl,
          transport: 'sse'
        }
      }
    },
    null,
    2
  );

  const toolsList: McpTool[] = [
    {
      name: 'list_chores',
      description: 'List household tasks and chores from DoneTick with optional filtering by status (pending/completed/all), priority (P1-P4), or circleId.',
      inputSchema: {
        type: 'object',
        properties: {
          status: { type: 'string', description: "'pending', 'completed', or 'all' (default: 'pending')" },
          priority: { type: 'string', description: "'P1', 'P2', 'P3', or 'P4'" },
          circleId: { type: 'string', description: "Household circle ID, e.g. 'c1'" }
        }
      }
    },
    {
      name: 'create_chore',
      description: 'Create a new household chore in DoneTick with scheduling, priority, reward points, and subtasks.',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Chore title (required)' },
          description: { type: 'string', description: 'Chore description / instructions' },
          priority: { type: 'string', description: "'P1' | 'P2' | 'P3' | 'P4'" },
          dueDate: { type: 'string', description: 'YYYY-MM-DD' },
          dueTime: { type: 'string', description: 'HH:MM' },
          recurrence: { type: 'string', description: "'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'" },
          points: { type: 'number', description: 'Reward points (default: 20)' },
          subtasks: { type: 'array', description: 'Array of checklist strings' }
        },
        required: ['title']
      }
    },
    {
      name: 'complete_chore',
      description: 'Mark a chore as completed in DoneTick. Awards points to the user, logs completion, and schedules next recurrence.',
      inputSchema: {
        type: 'object',
        properties: {
          choreId: { type: 'string', description: "Unique chore ID to complete, e.g. 'ch1' (required)" }
        },
        required: ['choreId']
      }
    },
    {
      name: 'get_things',
      description: "Get all household 'Things' tracked in DoneTick (water filter days, robot vacuum state, dog food stock).",
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'update_thing',
      description: 'Update the state or value of a household Thing. Can trigger automatic task completions if target value is reached.',
      inputSchema: {
        type: 'object',
        properties: {
          thingId: { type: 'string', description: "ID of Thing to update, e.g. 'th1' (required)" },
          value: { type: 'any', description: 'New value: number, boolean, or string (required)' }
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

  const defaultArgsMap: Record<string, string> = {
    get_household_summary: '{}',
    list_chores: JSON.stringify({ status: 'pending', priority: 'P1' }, null, 2),
    create_chore: JSON.stringify(
      {
        title: 'Check furnace air filter',
        priority: 'P2',
        points: 25,
        recurrence: 'monthly',
        subtasks: ['Inspect filter', 'Replace if dusty']
      },
      null,
      2
    ),
    complete_chore: JSON.stringify({ choreId: 'ch1' }, null, 2),
    get_things: '{}',
    update_thing: JSON.stringify({ thingId: 'th1', value: 5 }, null, 2)
  };

  const handleSelectTool = (name: string) => {
    setSelectedTool(name);
    setToolArgs(defaultArgsMap[name] || '{}');
    setTestResponse(null);
    setExecutionError(null);
  };

  const handleRunTool = async () => {
    setIsExecuting(true);
    setExecutionError(null);
    setTestResponse(null);

    try {
      let parsedArgs = {};
      if (toolArgs.trim()) {
        parsedArgs = JSON.parse(toolArgs);
      }

      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: {
            name: selectedTool,
            arguments: parsedArgs
          }
        })
      });

      const data = await res.json();
      setTestResponse(data);
      onRefreshData();
    } catch (err: any) {
      setExecutionError(err.message || 'Failed to execute tool');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 p-6 rounded-3xl relative overflow-hidden shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                <Cpu className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Gemini Spark & Model Context Protocol (MCP)
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-emerald-500/40">
                  Ready
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Yes! DoneTick provides built-in <strong>Model Context Protocol (MCP)</strong> server endpoints.
              AI agents like <strong>Gemini Spark</strong>, Claude, or custom LLM tools can connect to view chores,
              create tasks, mark chores complete, inspect household sensor Things, and retrieve household progress summaries.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-xs space-y-2 min-w-[240px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Server Status</span>
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>MCP Protocol 2024-11-05 Active</span>
            </div>
            <p className="text-[11px] text-slate-400">SSE Transport & JSON-RPC 2.0</p>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Connection Config & Tool Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Endpoints & Config */}
        <div className="space-y-6">
          {/* Endpoints Box */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Connection Endpoints</h3>
            </div>

            {/* SSE URL */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400">Server-Sent Events (SSE) Endpoint</span>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300">
                <span className="flex-1 truncate">{sseUrl}</span>
                <button
                  onClick={() => copyToClipboard(sseUrl, 'sse')}
                  className="p-1 hover:text-white transition"
                  title="Copy SSE URL"
                >
                  {copiedKey === 'sse' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400">Recommended for Gemini Spark, Claude Desktop, and Cursor</p>
            </div>

            {/* HTTP JSON-RPC */}
            <div className="space-y-1.5 pt-2 border-t border-slate-700/60">
              <span className="text-[11px] font-bold text-slate-400">Direct HTTP JSON-RPC 2.0 Endpoint</span>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-indigo-300">
                <span className="flex-1 truncate">{httpUrl}</span>
                <button
                  onClick={() => copyToClipboard(httpUrl, 'http')}
                  className="p-1 hover:text-white transition"
                  title="Copy HTTP URL"
                >
                  {copiedKey === 'http' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400">Supports direct POST requests with JSON-RPC methods</p>
            </div>
          </div>

          {/* Gemini Spark Configuration Snippet */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Client Configuration (JSON)</h3>
              </div>
              <button
                onClick={() => copyToClipboard(geminiSparkConfig, 'config')}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-[11px] text-slate-200 font-semibold transition"
              >
                {copiedKey === 'config' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Config</span>
                  </>
                )}
              </button>
            </div>

            <pre className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
              {geminiSparkConfig}
            </pre>
          </div>
        </div>

        {/* Right Column: Live MCP Playground / Tool Tester */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Live MCP Tool Tester</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Interactive Playground
              </span>
            </div>

            {/* Tool Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Select MCP Tool</label>
              <select
                value={selectedTool}
                onChange={(e) => handleSelectTool(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
              >
                {toolsList.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name} — {t.description.slice(0, 50)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Arguments Editor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Tool Arguments (JSON)</label>
                <button
                  onClick={() => setToolArgs(defaultArgsMap[selectedTool] || '{}')}
                  className="text-[10px] text-emerald-400 hover:underline"
                >
                  Reset Defaults
                </button>
              </div>
              <textarea
                rows={5}
                value={toolArgs}
                onChange={(e) => setToolArgs(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunTool}
              disabled={isExecuting}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isExecuting ? 'Calling MCP Tool...' : 'Execute MCP Tool'}</span>
            </button>
          </div>

          {/* Response Box */}
          <div className="mt-4 pt-3 border-t border-slate-700/60 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              MCP Response Output
            </span>

            {executionError && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300 font-medium">
                {executionError}
              </div>
            )}

            {testResponse ? (
              <pre className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 overflow-x-auto max-h-56 overflow-y-auto">
                {JSON.stringify(testResponse, null, 2)}
              </pre>
            ) : !executionError ? (
              <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-xl p-4 text-center text-xs text-slate-500">
                Click "Execute MCP Tool" above to test live execution.
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Full Tools Catalog */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-3xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Registered DoneTick MCP Tools Catalog</h3>
          <span className="text-xs text-slate-400">({toolsList.length} tools available)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {toolsList.map((tool) => (
            <div
              key={tool.name}
              className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-4 space-y-2.5 hover:border-emerald-500/40 transition"
            >
              <div className="flex items-center justify-between">
                <code className="text-xs font-bold text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {tool.name}
                </code>
                <button
                  onClick={() => handleSelectTool(tool.name)}
                  className="text-[10px] text-slate-400 hover:text-white bg-slate-700/60 px-2 py-0.5 rounded transition"
                >
                  Test
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{tool.description}</p>

              <div className="pt-2 border-t border-slate-700/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Parameters
                </span>
                <div className="space-y-1">
                  {Object.entries(tool.inputSchema.properties || {}).length === 0 ? (
                    <span className="text-[11px] text-slate-500 italic">None</span>
                  ) : (
                    Object.entries(tool.inputSchema.properties || {}).map(([param, prop]: [string, any]) => (
                      <div key={param} className="text-[11px] font-mono text-slate-400 flex items-start gap-1">
                        <span className="text-slate-200 font-semibold">{param}</span>:
                        <span className="text-slate-400 truncate">{prop.description || prop.type}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
