import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Upload, 
  Database, 
  Table, 
  Laptop, 
  Wrench, 
  Users, 
  Sparkles, 
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  exportarReporteEquiposPDF, 
  exportarReporteMantenimientosPDF, 
  exportarReporteBackupsPDF,
  exportarFichaTecnicaEquipoPDF
} from '../utils/exportPdf';
import { descargarCSV, exportarBaseDatosJSON, importarBaseDatosJSON } from '../utils/exportCsv';
import { inicializarDatosPrueba } from '../utils/seedData';
import { db, registrarActividad } from '../db/db';

export default function ReportesView({ 
  equipos = [], 
  mantenimientos = [], 
  backups = [], 
  historialUsuarios = [],
  onDatosRestaurados
}) {
  const [equipoSeleccionadoId, setEquipoSeleccionadoId] = useState(equipos[0]?.id || '');
  const [mensajeEstado, setMensajeEstado] = useState({ tipo: '', texto: '' });
  const fileInputRef = useRef(null);

  const equiposMap = equipos.reduce((acc, eq) => {
    acc[eq.id] = eq;
    return acc;
  }, {});

  // 1. Exportar a CSV
  const handleExportarEquiposCSV = () => {
    const encabezados = ['Código', 'Nombre', 'Tipo', 'Marca', 'Modelo', 'Serie', 'Estado', 'Ubicación', 'Usuario Actual', 'Fecha Adquisición', 'Valor USD', 'Total Personas que lo usaron'];
    const filas = equipos.map(eq => {
      const personasCount = new Set(historialUsuarios.filter(u => u.equipoId === eq.id).map(u => u.usuario.trim().toLowerCase())).size;
      return [
        eq.codigo,
        eq.nombre,
        eq.tipo,
        eq.marca,
        eq.modelo,
        eq.serie,
        eq.estado,
        eq.ubicacion,
        eq.usuarioActual,
        eq.fechaAdquisicion,
        eq.valorEstimado || 0,
        personasCount
      ];
    });
    descargarCSV('Inventario_Equipos', encabezados, filas);
  };

  const handleExportarMantenimientosCSV = () => {
    const encabezados = ['ID', 'Equipo Código', 'Equipo Nombre', 'Tipo', 'Estado', 'Fecha', 'Próxima Fecha', 'Técnico', 'Costo USD', 'Descripción'];
    const filas = mantenimientos.map(m => {
      const eq = equiposMap[m.equipoId] || {};
      return [
        m.id,
        eq.codigo || 'N/A',
        eq.nombre || 'N/A',
        m.tipo,
        m.estado,
        m.fecha,
        m.fechaProxima || '',
        m.tecnico || '',
        m.costo || 0,
        m.descripcion || ''
      ];
    });
    descargarCSV('Registro_Mantenimientos', encabezados, filas);
  };

  const handleExportarBackupsCSV = () => {
    const encabezados = ['ID', 'Equipo Código', 'Equipo Nombre', 'Tipo', 'Estado', 'Fecha', 'Destino', 'Tamaño', 'Verificado', 'Notas'];
    const filas = backups.map(b => {
      const eq = equiposMap[b.equipoId] || {};
      return [
        b.id,
        eq.codigo || 'N/A',
        eq.nombre || 'N/A',
        b.tipo,
        b.estado,
        b.fecha,
        b.destino || '',
        b.tamano || '',
        b.verificado ? 'SÍ' : 'NO',
        b.notas || ''
      ];
    });
    descargarCSV('Registro_Copias_Seguridad', encabezados, filas);
  };

  const handleExportarUsuariosCSV = () => {
    const encabezados = ['ID', 'Equipo Código', 'Equipo Nombre', 'Persona / Colaborador', 'Cargo', 'Departamento', 'Fecha Inicio', 'Fecha Fin', 'Es Usuario Actual', 'Motivo'];
    const filas = historialUsuarios.map(u => {
      const eq = equiposMap[u.equipoId] || {};
      return [
        u.id,
        eq.codigo || 'N/A',
        eq.nombre || 'N/A',
        u.usuario,
        u.cargo || '',
        u.departamento || '',
        u.fechaInicio || '',
        u.fechaFin || '',
        u.esActual ? 'SÍ' : 'NO',
        u.motivo || ''
      ];
    });
    descargarCSV('Historial_Asignaciones_Usuarios', encabezados, filas);
  };

  // 2. Exportar Ficha Técnica Seleccionada
  const handleExportarFichaSeleccionada = () => {
    const eq = equipos.find(e => e.id === Number(equipoSeleccionadoId));
    if (!eq) {
      alert('Selecciona un equipo de la lista.');
      return;
    }
    const misMant = mantenimientos.filter(m => m.equipoId === eq.id);
    const misBack = backups.filter(b => b.equipoId === eq.id);
    const misUsers = historialUsuarios.filter(u => u.equipoId === eq.id);
    exportarFichaTecnicaEquipoPDF(eq, misMant, misBack, misUsers);
  };

  // 3. Respaldo y Restauración del Sistema en JSON
  const handleExportarBackupSistema = async () => {
    await exportarBaseDatosJSON(db);
    setMensajeEstado({
      tipo: 'exito',
      texto: 'Copia de seguridad del sistema descargada correctamente en formato JSON.'
    });
  };

  const handleImportarJSON = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonContent = event.target?.result;
        const res = await importarBaseDatosJSON(db, jsonContent);
        if (res.success) {
          setMensajeEstado({ tipo: 'exito', texto: '¡Base de datos restaurada con éxito!' });
          if (onDatosRestaurados) onDatosRestaurados();
        } else {
          setMensajeEstado({ tipo: 'error', texto: `Error: ${res.message}` });
        }
      } catch (err) {
        setMensajeEstado({ tipo: 'error', texto: 'El archivo seleccionado no es un JSON de respaldo válido.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLimpiarBaseDatos = async () => {
    if (confirm('ADVERTENCIA: ¿Estás seguro de vaciar toda la base de datos local? Esta acción no se puede deshacer a menos que tengas un respaldo en JSON.')) {
      await db.equipos.clear();
      await db.mantenimientos.clear();
      await db.backups.clear();
      await db.historialUsuarios.clear();
      await db.actividades.clear();
      setMensajeEstado({ tipo: 'exito', texto: 'Base de datos vaciada con éxito.' });
      if (onDatosRestaurados) onDatosRestaurados();
    }
  };

  const handleCargarDemo = async () => {
    await inicializarDatosPrueba(true);
    setMensajeEstado({ tipo: 'exito', texto: 'Datos de prueba de ejemplo cargados con éxito.' });
    if (onDatosRestaurados) onDatosRestaurados();
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Centro de Reportes y Respaldos</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Genera reportes imprimibles en PDF, exporta hojas de cálculo en Excel/CSV y gestiona copias del sistema
        </p>
      </div>

      {mensajeEstado.texto && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in ${
          mensajeEstado.tipo === 'exito'
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
        }`}>
          {mensajeEstado.tipo === 'exito' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="text-xs sm:text-sm font-medium">{mensajeEstado.texto}</span>
        </div>
      )}

      {/* SECCIÓN 1: REPORTES EN PDF (100% OFFLINE) */}
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-bold text-white">Reportes Oficiales en PDF (Sin Internet)</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Los documentos se crean instantáneamente en tu navegador sin enviar datos a servidores externos, listos para imprimir o adjuntar.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => exportarReporteEquiposPDF(equipos, mantenimientos, historialUsuarios)}
            className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-700/60 hover:border-blue-500/40 rounded-xl flex flex-col items-start gap-2 text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-blue-300">Reporte de Inventario</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Lista de todos los equipos, usuarios actuales y estado técnico</p>
            </div>
            <span className="text-[11px] text-blue-400 font-semibold flex items-center gap-1 mt-auto">
              <Download className="w-3.5 h-3.5" /> Descargar PDF
            </span>
          </button>

          <button
            onClick={() => exportarReporteMantenimientosPDF(mantenimientos, equiposMap)}
            className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-700/60 hover:border-blue-500/40 rounded-xl flex flex-col items-start gap-2 text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-amber-300">Reporte de Mantenimientos</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Historial preventivo/correctivo, técnicos, costos y próximas fechas</p>
            </div>
            <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 mt-auto">
              <Download className="w-3.5 h-3.5" /> Descargar PDF
            </span>
          </button>

          <button
            onClick={() => exportarReporteBackupsPDF(backups, equiposMap)}
            className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-700/60 hover:border-blue-500/40 rounded-xl flex flex-col items-start gap-2 text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-cyan-300">Reporte de Copias de Seguridad</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Auditoría de respaldos realizados, medios de destino y verificación</p>
            </div>
            <span className="text-[11px] text-cyan-400 font-semibold flex items-center gap-1 mt-auto">
              <Download className="w-3.5 h-3.5" /> Descargar PDF
            </span>
          </button>
        </div>

        {/* Ficha técnica individual */}
        <div className="pt-3 border-t border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-white">Ficha Técnica Individual de un Equipo</h4>
            <p className="text-[11px] text-slate-400">Incluye especificaciones, historial de usuarios, mantenimientos y backups del equipo seleccionado</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={equipoSeleccionadoId}
              onChange={(e) => setEquipoSeleccionadoId(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            >
              {equipos.map(eq => (
                <option key={eq.id} value={eq.id}>
                  {eq.codigo} - {eq.nombre}
                </option>
              ))}
            </select>
            <button
              onClick={handleExportarFichaSeleccionada}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Generar Ficha</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: EXPORTACIÓN EXCEL / CSV */}
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Table className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Exportar a Hojas de Cálculo (Excel / CSV)</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Descarga archivos CSV compatibles con Microsoft Excel, Google Sheets y LibreOffice con formato UTF-8 (soporte para tildes y caracteres especiales).
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={handleExportarEquiposCSV}
            className="p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-700 rounded-xl text-xs font-medium text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Equipos (.csv)</span>
          </button>
          <button
            onClick={handleExportarMantenimientosCSV}
            className="p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-700 rounded-xl text-xs font-medium text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Mantenimientos (.csv)</span>
          </button>
          <button
            onClick={handleExportarBackupsCSV}
            className="p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-700 rounded-xl text-xs font-medium text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Backups (.csv)</span>
          </button>
          <button
            onClick={handleExportarUsuariosCSV}
            className="p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-700 rounded-xl text-xs font-medium text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Historial Personas (.csv)</span>
          </button>
        </div>
      </div>

      {/* SECCIÓN 3: GESTIÓN DE COPIA DE SEGURIDAD TOTAL (JSON) */}
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-400" />
          <h3 className="text-base font-bold text-white">Copia de Seguridad y Migración del Sistema (JSON)</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Guarda una copia completa de toda la información (equipos, historial de usuarios, mantenimientos y backups) para transferirla a otro computador, celular o restaurarla cuando lo necesites.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportarBackupSistema}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Copia de Seguridad (.json)</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportarJSON}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Restaurar Copia de Seguridad (.json)</span>
          </button>

          <button
            onClick={handleCargarDemo}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Recargar Datos Demo</span>
          </button>

          <button
            onClick={handleLimpiarBaseDatos}
            className="px-4 py-2.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ml-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>Vaciar Base de Datos</span>
          </button>
        </div>
      </div>
    </div>
  );
}
