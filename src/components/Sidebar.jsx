import React from 'react';
import { 
  LayoutDashboard, 
  Laptop, 
  Wrench, 
  Database, 
  Users, 
  FileText,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ currentTab, setTab, counts = {} }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'equipos', label: 'Equipos', icon: Laptop, count: counts.equipos },
    { id: 'mantenimientos', label: 'Mantenimientos', icon: Wrench, count: counts.mantenimientosPendientes, alert: counts.mantenimientosPendientes > 0 },
    { id: 'backups', label: 'Copias de Seguridad', icon: Database, count: counts.backups },
    { id: 'usuarios', label: 'Historial de Usuarios', icon: Users, count: counts.usuarios },
    { id: 'reportes', label: 'Reportes y Respaldos', icon: FileText },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900/60 border-r border-slate-800 p-4 shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1.5 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-2">
          Navegación Principal
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? 'bg-blue-700/80 text-white'
                      : item.alert
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tarjeta Informativa Offline en el Footer del Sidebar */}
      <div className="mt-auto pt-4 border-t border-slate-800">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-xs text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Almacenamiento Local</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            IndexedDB almacena todos tus registros de forma segura en este navegador.
          </p>
        </div>
      </div>
    </aside>
  );
}
