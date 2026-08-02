import React from 'react';
import { Loader2, Sparkles, BookOpen } from 'lucide-react';

export default function WorkspaceLoader() {
  return (
    <div className="fixed inset-0 z-[300] bg-slate-900/30 dark:bg-slate-950/70 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="glass-card p-8 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-center max-w-xs w-full space-y-5 shadow-2xl relative overflow-hidden">
        {/* Shimmer Ambient Glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Logo Icon & Spinner Ring */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-500 via-blue-500 to-amber-500 opacity-25 blur-md animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-xl shadow-indigo-500/30">
            <BookOpen size={30} />
          </div>
          <Loader2 size={80} className="absolute inset-0 -m-2 text-indigo-500/40 animate-spin" strokeWidth={1.5} />
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
            <span>SKY BAWAR CASHBOOK</span>
            <Sparkles size={15} className="text-amber-500 shrink-0" />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Loading secure workspace...
          </p>
        </div>

        {/* Animated Progress Strip */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 via-blue-500 to-amber-500 h-full w-3/4 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
