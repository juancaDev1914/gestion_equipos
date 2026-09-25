import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', alert = false, onClick }) {
  const colorMap = {
    blue: 'from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/30',
    emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/30',
    amber: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/30',
    cyan: 'from-cyan-500/20 to-cyan-600/5 text-cyan-400 border-cyan-500/30',
    purple: 'from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/30',
    rose: 'from-rose-500/20 to-rose-600/5 text-rose-400 border-rose-500/30'
  };

  const selectedColor = colorMap[color] || colorMap.blue;

  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-gradient-to-br ${selectedColor} border bg-slate-900/60 backdrop-blur-sm shadow-lg transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.99]' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-white mt-1 tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 ${alert ? 'animate-bounce' : ''}`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>
    </div>
  );
}
