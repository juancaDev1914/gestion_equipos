import React from 'react';
import { 
  LayoutDashboard, 
  Laptop, 
  Wrench, 
  Database, 
  FileText 
} from 'lucide-react';

export default function BottomNav({ currentTab, setTab, counts = {} }) {
  const tabs = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'equipos', label: 'Equipos', icon: Laptop, count: counts.equipos },
    { id: 'mantenimientos', label: 'Mant.', icon: Wrench, count: counts.mantenimientosPendientes, alert: counts.mantenimientosPendientes > 0 },
    { id: 'backups', label: 'Backups', icon: Database },
    { id: 'reportes', label: 'Reportes', icon: FileText },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 safe-bottom">
      <div className="grid grid-cols-5 items-center justify-around h-16 max-w-md mx-auto px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`relative flex flex-col items-center justify-center w-full h-full transition-colors cursor-pointer ${
                isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-blue-400' : ''}`} />
                {tab.count !== undefined && tab.count > 0 && tab.alert && (
                  <span className="absolute -top-1.5 -right-2 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
