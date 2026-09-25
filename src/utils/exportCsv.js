// Utilidad para exportar datos a CSV con soporte de caracteres en español (BOM UTF-8)
export function descargarCSV(nombreArchivo, encabezados, filas) {
  const contenidoCSV = [
    encabezados.join(';'),
    ...filas.map(fila =>
      fila
        .map(val => {
          if (val === null || val === undefined) return '""';
          const texto = String(val).replace(/"/g, '""');
          return `"${texto}"`;
        })
        .join(';')
    )
  ].join('\r\n');

  // \uFEFF añade el Byte Order Mark (BOM) para que Excel reconozca tildes y caracteres latinos
  const blob = new Blob(['\uFEFF' + contenidoCSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${nombreArchivo}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Exportar base de datos completa a un archivo JSON para respaldo total
export async function exportarBaseDatosJSON(db) {
  const equipos = await db.equipos.toArray();
  const mantenimientos = await db.mantenimientos.toArray();
  const backups = await db.backups.toArray();
  const historialUsuarios = await db.historialUsuarios.toArray();
  const actividades = await db.actividades.toArray();

  const backupData = {
    version: '1.0',
    fechaExportacion: new Date().toISOString(),
    datos: {
      equipos,
      mantenimientos,
      backups,
      historialUsuarios,
      actividades
    }
  };

  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CopiaSeguridad_SistemaEquipos_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Importar base de datos completa desde un archivo JSON
export async function importarBaseDatosJSON(db, jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (!data.datos) {
      throw new Error('El archivo no contiene un formato de respaldo válido.');
    }

    await db.transaction('rw', [db.equipos, db.mantenimientos, db.backups, db.historialUsuarios, db.actividades], async () => {
      await db.equipos.clear();
      await db.mantenimientos.clear();
      await db.backups.clear();
      await db.historialUsuarios.clear();
      await db.actividades.clear();

      if (data.datos.equipos?.length) await db.equipos.bulkAdd(data.datos.equipos);
      if (data.datos.mantenimientos?.length) await db.mantenimientos.bulkAdd(data.datos.mantenimientos);
      if (data.datos.backups?.length) await db.backups.bulkAdd(data.datos.backups);
      if (data.datos.historialUsuarios?.length) await db.historialUsuarios.bulkAdd(data.datos.historialUsuarios);
      if (data.datos.actividades?.length) await db.actividades.bulkAdd(data.datos.actividades);
    });

    return { success: true, message: 'Base de datos restaurada correctamente.' };
  } catch (error) {
    console.error('Error al importar:', error);
    return { success: false, message: error.message };
  }
}
