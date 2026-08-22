import React from 'react';
import Link from 'next/link';
import { Bot, LayoutDashboard, ListTodo, Activity } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900/60 backdrop-blur-md border-b border-slate-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-violet-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            AI Browser Agent
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-violet-400 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/#tasks"
            className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-violet-400 transition-colors"
          >
            <ListTodo className="w-4 h-4" />
            <span>Tasks</span>
          </Link>
        </nav>

        {/* System Active Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>System Active</span>
        </div>
      </div>
    </header>
  );
}
