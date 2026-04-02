const escapeCell = (value) => {
  const raw = String(value ?? "");
  const escaped = raw.replace(/"/g, '""');
  return `"${escaped}"`;
};

export const downloadCsv = (filename, headers, rows) => {
  const headerLine = headers.map((header) => escapeCell(header)).join(",");
  const rowLines = rows.map((row) => row.map((value) => escapeCell(value)).join(","));
  const csvContent = [headerLine, ...rowLines].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
