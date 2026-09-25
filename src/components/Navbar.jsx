import React, { useState, useEffect } from 'react';
import { Laptop, Wifi, WifiOff, Plus, Database, Sparkles } from 'lucide-react';
import { inicializarDatosPrueba } from '../utils/seedData';

export default function Navbar({ onOpenNewEquipo, onDatosRestaurados }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cargandoDemo, setCargandoDemo] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleCargarDemo = async () => {
    if (confirm('¿Deseas recargar los datos de prueba de ejemplo? Esto reemplazará los datos actuales con 5 equipos completos.')) {
      setCargandoDemo(true);
      await inicializarDatosPrueba(true);
      setCargandoDemo(false);
      if (onDatosRestaurados) onDatosRestaurados();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 safe-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Marca */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">EquiposApp</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                PWA
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Gestión Offline & Mantenimiento</p>
          </div>
        </div>

        {/* Acciones y Estado */}
        <div className="flex items-center gap-2.5">
          {/* Badge Estado Offline / Online */}
          <div 
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            }`}
            title={isOnline ? 'Conexión a internet activa' : 'Trabajando 100% desconectado en IndexedDB'}
          >
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden xs:inline">En línea</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span>Modo Offline</span>
              </>
            )}
          </div>

          {/* Botón Cargar Datos Demo */}
          <button
            onClick={handleCargarDemo}
            disabled={cargandoDemo}
            title="Cargar datos de prueba de ejemplo"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{cargandoDemo ? 'Cargando...' : 'Datos Demo'}</span>
          </button>

          {/* Botón Nuevo Equipo */}
          <button
            onClick={onOpenNewEquipo}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Equipo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
