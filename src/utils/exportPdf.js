import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Utilidad para encabezado con membrete corporativo
function agregarEncabezado(doc, titulo, subtitulo = '') {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Barra superior decorativa
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setFillColor(37, 99, 235); // blue-600
  doc.rect(0, 26, pageWidth, 2.5, 'F');

  // Textos del encabezado
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('GESTOR DE EQUIPOS & MANTENIMIENTO', 14, 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Sistema de Gestión Offline PWA - Registro y Auditoría Técnica', 14, 21);

  // Fecha y hora
  const fechaGeneracion = new Date().toLocaleString('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  doc.setFontSize(8);
  doc.text(`Fecha de emisión: ${fechaGeneracion}`, pageWidth - 14, 21, { align: 'right' });

  // Título del reporte
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, 14, 38);

  if (subtitulo) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(subtitulo, 14, 44);
  }
}

// 1. Reporte General de Equipos
export function exportarReporteEquiposPDF(equipos, mantenimientos = [], usuarios = []) {
  const doc = new jsPDF('landscape');
  agregarEncabezado(doc, 'REPORTE GENERAL DE INVENTARIO DE EQUIPOS', 'Resumen integral de equipos activos, asignaciones y estado técnico');

  const rows = equipos.map(eq => {
    // Calcular cuántos usuarios han usado este equipo
    const totalUsuarios = usuarios.filter(u => u.equipoId === eq.id).length;
    // Mantenimientos
    const mantPend = mantenimientos.filter(m => m.equipoId === eq.id && m.estado === 'Pendiente').length;

    return [
      eq.codigo || `EQ-${eq.id}`,
      eq.nombre,
      eq.tipo,
      eq.marca || 'N/A',
      eq.estado,
      eq.ubicacion || 'Sin asignar',
      eq.usuarioActual || 'Disponible / Libre',
      `${totalUsuarios} pers.`,
      mantPend > 0 ? `${mantPend} Pendiente(s)` : 'Al día'
    ];
  });

  autoTable(doc, {
    startY: 50,
    head: [['Código', 'Nombre / Modelo', 'Tipo', 'Marca', 'Estado', 'Ubicación', 'Usuario Actual', 'Hist. Usuarios', 'Mantenimiento']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 8,
      cellPadding: 3
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  doc.save(`Inventario_Equipos_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// 2. Ficha Técnica Individual de un Equipo (con historial de personas y mantenimientos)
export function exportarFichaTecnicaEquipoPDF(equipo, mantenimientos = [], backups = [], usuarios = []) {
  const doc = new jsPDF('portrait');
  agregarEncabezado(doc, `FICHA TÉCNICA: ${equipo.codigo} - ${equipo.nombre}`, `Historial completo de usuarios, mantenimientos y copias de seguridad`);

  let currentY = 50;

  // Bloque: Datos Generales
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('1. ESPECIFICACIONES Y DATOS GENERALES', 14, currentY);
  currentY += 4;

  const datosGenerales = [
    ['Código:', equipo.codigo, 'Estado Actual:', equipo.estado],
    ['Marca / Modelo:', `${equipo.marca || ''} ${equipo.modelo || ''}`, 'Tipo:', equipo.tipo],
    ['Número de Serie:', equipo.serie || 'No registrado', 'Ubicación:', equipo.ubicacion || 'No asignada'],
    ['Usuario Asignado:', equipo.usuarioActual || 'Sin usuario actual (Libre)', 'Fecha Adquisición:', equipo.fechaAdquisicion || 'N/D'],
    ['Procesador:', equipo.procesador || 'N/A', 'Memoria RAM:', equipo.ram || 'N/A'],
    ['Almacenamiento:', equipo.almacenamiento || 'N/A', 'Sistema Operativo:', equipo.sistemaOperativo || 'N/A']
  ];

  autoTable(doc, {
    startY: currentY,
    body: datosGenerales,
    theme: 'plain',
    styles: { fontSize: 8.5, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [71, 85, 105], cellWidth: 35 },
      1: { cellWidth: 60 },
      2: { fontStyle: 'bold', textColor: [71, 85, 105], cellWidth: 35 },
      3: { cellWidth: 60 }
    }
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // Bloque: Historial de Usuarios
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`2. HISTORIAL DE USUARIOS QUE HAN USADO ESTE EQUIPO (${usuarios.length} personas)`, 14, currentY);
  currentY += 3;

  if (usuarios.length === 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(148, 163, 184);
    doc.text('No hay registros de asignaciones previas.', 14, currentY + 4);
    currentY += 10;
  } else {
    const userRows = usuarios.map(u => [
      u.usuario,
      u.cargo || 'N/A',
      u.departamento || 'N/A',
      u.fechaInicio || 'N/A',
      u.fechaFin ? u.fechaFin : (u.esActual ? 'Actual (En uso)' : 'Finalizado'),
      u.motivo || 'Asignación'
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Nombre Persona', 'Cargo', 'Departamento', 'Desde', 'Hasta', 'Motivo / Condición']],
      body: userRows,
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138], fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 2.5 }
    });
    currentY = doc.lastAutoTable.finalY + 8;
  }

  // Si queda poco espacio, añadir página
  if (currentY > 210) {
    doc.addPage();
    currentY = 20;
  }

  // Bloque: Mantenimientos
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`3. HISTORIAL DE MANTENIMIENTOS (${mantenimientos.length} registrados)`, 14, currentY);
  currentY += 3;

  if (mantenimientos.length === 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(148, 163, 184);
    doc.text('Sin mantenimientos registrados para este equipo.', 14, currentY + 4);
    currentY += 10;
  } else {
    const mantRows = mantenimientos.map(m => [
      m.fecha,
      m.tipo,
      m.tecnico || 'Técnico TI',
      m.estado,
      m.descripcion ? m.descripcion.substring(0, 45) + (m.descripcion.length > 45 ? '...' : '') : 'N/A',
      m.costo ? `$${m.costo}` : '$0'
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Fecha', 'Tipo', 'Técnico', 'Estado', 'Descripción Tareas', 'Costo']],
      body: mantRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 2 }
    });
    currentY = doc.lastAutoTable.finalY + 8;
  }

  // Si queda poco espacio, añadir página
  if (currentY > 220) {
    doc.addPage();
    currentY = 20;
  }

  // Bloque: Copias de Seguridad
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`4. HISTORIAL DE COPIAS DE SEGURIDAD (${backups.length} registradas)`, 14, currentY);
  currentY += 3;

  if (backups.length === 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(148, 163, 184);
    doc.text('No hay copias de seguridad registradas para este equipo.', 14, currentY + 4);
  } else {
    const backupRows = backups.map(b => [
      b.fecha ? b.fecha.replace('T', ' ') : 'N/A',
      b.tipo,
      b.destino || 'Local',
      b.tamano || 'N/D',
      b.estado,
      b.verificado ? 'Verificado' : 'Sin verificar'
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Fecha y Hora', 'Tipo Respaldo', 'Destino / Medio', 'Tamaño', 'Estado', 'Verificación']],
      body: backupRows,
      theme: 'grid',
      headStyles: { fillColor: [14, 116, 144], fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 2 }
    });
  }

  doc.save(`Ficha_${equipo.codigo}_${equipo.nombre.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}

// 3. Reporte de Mantenimientos
export function exportarReporteMantenimientosPDF(mantenimientos, equiposMap) {
  const doc = new jsPDF('landscape');
  agregarEncabezado(doc, 'REPORTE GENERAL DE MANTENIMIENTOS Y PLANIFICACIÓN', 'Registro de mantenimientos preventivos, correctivos y revisiones periódicas');

  const rows = mantenimientos.map(m => {
    const eq = equiposMap[m.equipoId] || {};
    return [
      m.fecha || 'N/A',
      eq.codigo ? `${eq.codigo} - ${eq.nombre}` : `ID ${m.equipoId}`,
      m.tipo,
      m.tecnico || 'No especificado',
      m.estado,
      m.fechaProxima || 'No programada',
      m.costo ? `$${m.costo}` : '$0',
      m.descripcion ? m.descripcion.substring(0, 50) + (m.descripcion.length > 50 ? '...' : '') : ''
    ];
  });

  autoTable(doc, {
    startY: 50,
    head: [['Fecha', 'Equipo', 'Tipo', 'Técnico Responsable', 'Estado', 'Próxima Fecha', 'Costo', 'Descripción / Observación']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold'
    },
    styles: { fontSize: 8, cellPadding: 2.5 }
  });

  doc.save(`Reporte_Mantenimientos_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// 4. Reporte de Backups
export function exportarReporteBackupsPDF(backups, equiposMap) {
  const doc = new jsPDF('landscape');
  agregarEncabezado(doc, 'REPORTE GENERAL DE COPIAS DE SEGURIDAD', 'Auditoría de respaldos, medios de almacenamiento y verificación');

  const rows = backups.map(b => {
    const eq = equiposMap[b.equipoId] || {};
    return [
      b.fecha ? b.fecha.replace('T', ' ') : 'N/A',
      eq.codigo ? `${eq.codigo} - ${eq.nombre}` : `ID ${b.equipoId}`,
      b.tipo,
      b.destino || 'Local',
      b.tamano || 'N/D',
      b.estado,
      b.verificado ? 'Sí (OK)' : 'No verificado',
      b.notas || ''
    ];
  });

  autoTable(doc, {
    startY: 50,
    head: [['Fecha / Hora', 'Equipo Asociado', 'Tipo de Copia', 'Destino / Medio', 'Tamaño', 'Estado', 'Verificado', 'Notas / Hash']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [14, 116, 144],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold'
    },
    styles: { fontSize: 8, cellPadding: 2.5 }
  });

  doc.save(`Reporte_Backups_${new Date().toISOString().slice(0, 10)}.pdf`);
}
