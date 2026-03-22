
export function exportToCSV(data: any[]) {
  const csv = data.map(row => Object.values(row).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'resultados.csv');
  link.click();
}

export function exportToPDF(data: any[]) {
  alert("Funcionalidad de exportar a PDF aún no implementada.");
}
