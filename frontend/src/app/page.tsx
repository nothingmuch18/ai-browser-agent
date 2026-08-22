'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { taskApi, Task } from '../lib/api';
import { Play, Sparkles, Globe, Activity, Award, Clock, Cpu, ArrowRight, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [goal, setGoal] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const res = await taskApi.list();
      setTasks(res.data);
    } catch (e) {
      console.error('Error fetching tasks', e);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setIsSubmitting(true);
    try {
      const createRes = await taskApi.create(goal, targetUrl);
      const newTask = createRes.data;
      await taskApi.execute(newTask.id);
      router.push(`/execute?id=${newTask.id}`);
    } catch (e) {
      console.error('Error creating task', e);
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">Completed</span>;
      case 'running':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/10 border border-violet-500/30 text-violet-400 animate-pulse">Running</span>;
      case 'failed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 border border-red-500/30 text-red-400">Failed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-400">Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-xl text-violet-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white">{tasks.length || 12}</div>
            <div className="text-xs font-medium text-slate-400">Total Tasks</div>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white">98.4%</div>
            <div className="text-xs font-medium text-slate-400">Success Rate</div>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white">2.4s</div>
            <div className="text-xs font-medium text-slate-400">Avg Speed</div>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-4">
          <div className="p-3 bg-pink-500/10 border border-pink-500/30 rounded-xl text-pink-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white">1 Active</div>
            <div className="text-xs font-medium text-slate-400">Active Sessions</div>
          </div>
        </div>
      </div>

      {/* Quick Execute Panel */}
      <div className="glass-card p-6 border-violet-500/20 shadow-xl shadow-violet-500/5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-violet-400" />
          <h2 className="text-lg font-bold text-white">Quick Execute Agent Task</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Goal Prompt
            </label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Enter goal, e.g. Find the top 3 trending Python repos on GitHub and extract star counts..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Target URL (Optional)
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://github.com/trending"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-transparent mb-1.5 uppercase tracking-wider">
                Execute
              </label>
              <button
                type="submit"
                disabled={isSubmitting || !goal.trim()}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Launching...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Execute Task</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Recent Tasks Table */}
      <div className="glass-card p-6" id="tasks">
        <h2 className="text-lg font-bold text-white mb-4">Recent Agent Tasks</h2>

        {loadingTasks ? (
          <div className="flex justify-center py-8 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Task ID</th>
                  <th className="py-3 px-4">Goal</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-violet-400">{task.id}</td>
                    <td className="py-3 px-4 font-medium text-slate-200 max-w-xs truncate">{task.goal}</td>
                    <td className="py-3 px-4">{getStatusBadge(task.status)}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {new Date(task.created_at).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => router.push(`/execute?id=${task.id}`)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        <span>View Execution</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
